import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryType, OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { toDataURL } from 'qrcode';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { buildPixPayload } from '../pix/pix';
import { SettingsService } from '../settings/settings.module';
import { AdminOrdersQuery, CreateOrderDto } from './orders.dto';
import { OrderPricingError, priceOrder } from './pricing';

export const PENDING_STATUSES: OrderStatus[] = [
  OrderStatus.AGUARDANDO_COMPROVANTE,
  OrderStatus.AGUARDANDO_CONFIRMACAO,
];

// Sem caracteres ambíguos (0/O, 1/I) para o cliente ditar o código sem erro
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `MS-${code}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly settings: SettingsService,
  ) {}

  async create(dto: CreateOrderDto) {
    const settings = await this.settings.get();
    if (dto.paymentMethod === PaymentMethod.PIX && !settings.pixKey) {
      throw new BadRequestException('Pagamento via Pix indisponível no momento');
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });
    const deliveryFeeCents = dto.deliveryType === DeliveryType.ENTREGA ? settings.deliveryFeeCents : 0;

    let priced: ReturnType<typeof priceOrder>;
    try {
      priced = priceOrder(products, dto.items, deliveryFeeCents);
    } catch (e) {
      if (e instanceof OrderPricingError) throw new BadRequestException(e.message);
      throw e;
    }

    const data = {
      accessToken: randomBytes(16).toString('hex'),
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      deliveryType: dto.deliveryType,
      address: dto.deliveryType === DeliveryType.ENTREGA ? dto.address?.trim() : null,
      paymentMethod: dto.paymentMethod,
      status:
        dto.paymentMethod === PaymentMethod.PIX
          ? OrderStatus.AGUARDANDO_COMPROVANTE
          : OrderStatus.AGUARDANDO_CONFIRMACAO,
      subtotalCents: priced.subtotalCents,
      deliveryFeeCents,
      totalCents: priced.totalCents,
      items: { create: priced.lines },
    };

    // Repete em caso (raro) de código duplicado
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const order = await this.prisma.order.create({ data: { ...data, code: generateCode() } });
        return { code: order.code, accessToken: order.accessToken };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
        throw e;
      }
    }
    throw new ConflictException('Não foi possível gerar o pedido, tente novamente');
  }

  /** Visão do cliente: exige o token do link de acompanhamento. */
  async track(code: string, token: string) {
    const order = await this.findByCodeAndToken(code, token);
    let pix: { payload: string; qrCodeDataUrl: string } | null = null;
    if (order.paymentMethod === PaymentMethod.PIX && order.status === OrderStatus.AGUARDANDO_COMPROVANTE) {
      const settings = await this.settings.get();
      if (settings.pixKey) {
        const payload = buildPixPayload({
          key: settings.pixKey,
          merchantName: settings.pixMerchantName,
          city: settings.pixCity,
          amountCents: order.totalCents,
          txid: order.code,
        });
        pix = { payload, qrCodeDataUrl: await toDataURL(payload, { width: 320, margin: 1 }) };
      }
    }
    const { accessToken, items, ...rest } = order;
    return {
      ...rest,
      items: items.map(({ unitCostCents, ...item }) => item),
      pix,
    };
  }

  async attachReceipt(code: string, token: string, file?: Express.Multer.File) {
    const order = await this.findByCodeAndToken(code, token);
    if (order.paymentMethod !== PaymentMethod.PIX || !PENDING_STATUSES.includes(order.status)) {
      throw new BadRequestException('Este pedido não aceita comprovante');
    }
    const receiptUrl = await this.storage.save(file, 'receipts', true);
    await this.prisma.order.update({
      where: { id: order.id },
      data: { receiptUrl, status: OrderStatus.AGUARDANDO_CONFIRMACAO },
    });
    return { ok: true };
  }

  adminList(query: AdminOrdersQuery) {
    return this.prisma.order.findMany({
      where: { paymentMethod: query.paymentMethod, status: query.status },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  /** Confirma a venda e dá baixa no estoque, tudo ou nada. */
  async finalize(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new NotFoundException('Pedido não encontrado');
      if (!PENDING_STATUSES.includes(order.status)) {
        throw new BadRequestException('Este pedido já foi finalizado ou cancelado');
      }
      for (const item of order.items) {
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new ConflictException(`Estoque insuficiente de ${item.productName} para finalizar`);
        }
      }
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.FINALIZADO, finalizedAt: new Date() },
        include: { items: true },
      });
    });
  }

  async cancel(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (!PENDING_STATUSES.includes(order.status)) {
      throw new BadRequestException('Este pedido já foi finalizado ou cancelado');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELADO, canceledAt: new Date() },
      include: { items: true },
    });
  }

  private async findByCodeAndToken(code: string, token: string) {
    const order = await this.prisma.order.findUnique({ where: { code }, include: { items: true } });
    if (!order || !token || order.accessToken !== token) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }
}
