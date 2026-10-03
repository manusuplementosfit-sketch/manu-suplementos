import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';
import { PENDING_STATUSES } from '../orders/orders.service';
import { SettingsModule, SettingsService } from '../settings/settings.module';
import {
  percentChange,
  rankProducts,
  revenueByWeekday,
  samePointLastMonthSP,
  startOfMonthSP,
  startOfWeekSP,
  summarizeOrders,
} from './metrics';

@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  @Get()
  async get() {
    const now = new Date();
    const weekStart = startOfWeekSP(now);
    const monthStart = startOfMonthSP(now);
    // O mês atual é comparado com o mês anterior até o mesmo dia e hora
    const lastMonthSamePoint = samePointLastMonthSP(now);
    const lastMonthStart = startOfMonthSP(lastMonthSamePoint);

    const finalized = await this.prisma.order.findMany({
      where: { status: OrderStatus.FINALIZADO, finalizedAt: { gte: lastMonthStart } },
      select: { finalizedAt: true, items: true },
    });
    const pending = await this.prisma.order.groupBy({
      by: ['paymentMethod', 'status'],
      where: { status: { in: PENDING_STATUSES } },
      _count: true,
    });
    const countPending = (filter: (p: (typeof pending)[number]) => boolean) =>
      pending.filter(filter).reduce((sum, p) => sum + p._count, 0);

    const recentOrders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { code: true, customerName: true, totalCents: true, paymentMethod: true, status: true, createdAt: true },
    });
    const settings = await this.settings.get();

    const since = (start: Date, end = now) =>
      finalized.filter((o) => o.finalizedAt! >= start && o.finalizedAt! < end);
    const thisMonth = since(monthStart);
    const month = summarizeOrders(thisMonth);
    const lastMonthSoFar = summarizeOrders(since(lastMonthStart, lastMonthSamePoint));

    const top = rankProducts(thisMonth.flatMap((o) => o.items), 5);
    const topImages = await this.prisma.product.findMany({
      where: { id: { in: top.map((p) => p.productId) } },
      select: { id: true, imageUrl: true },
    });

    return {
      week: summarizeOrders(since(weekStart)),
      month,
      monthRevenueChange: percentChange(month.revenueCents, lastMonthSoFar.revenueCents),
      monthGoalCents: settings.monthlyGoalCents,
      weekRevenueByDay: revenueByWeekday(since(weekStart), weekStart),
      pending: {
        total: countPending(() => true),
        pix: countPending((p) => p.paymentMethod === PaymentMethod.PIX),
        cartao: countPending((p) => p.paymentMethod === PaymentMethod.CARTAO),
        dinheiro: countPending((p) => p.paymentMethod === PaymentMethod.DINHEIRO),
        awaitingReceipt: countPending((p) => p.status === OrderStatus.AGUARDANDO_COMPROVANTE),
      },
      recentOrders,
      topProducts: top.map((p) => ({
        ...p,
        imageUrl: topImages.find((i) => i.id === p.productId)?.imageUrl ?? null,
      })),
    };
  }
}

@Module({ imports: [SettingsModule], controllers: [DashboardController] })
export class DashboardModule {}
