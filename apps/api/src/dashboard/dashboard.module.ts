import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';
import { PENDING_STATUSES } from '../orders/orders.service';
import { startOfMonthSP, startOfWeekSP, summarizeOrders } from './metrics';

@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    const now = new Date();
    const weekStart = startOfWeekSP(now);
    const monthStart = startOfMonthSP(now);
    const since = weekStart < monthStart ? weekStart : monthStart;

    const finalized = await this.prisma.order.findMany({
      where: { status: OrderStatus.FINALIZADO, finalizedAt: { gte: since } },
      select: { finalizedAt: true, items: true },
    });
    const pending = await this.prisma.order.groupBy({
      by: ['paymentMethod', 'status'],
      where: { status: { in: PENDING_STATUSES } },
      _count: true,
    });
    const countPending = (filter: (p: (typeof pending)[number]) => boolean) =>
      pending.filter(filter).reduce((sum, p) => sum + p._count, 0);

    return {
      week: summarizeOrders(finalized.filter((o) => o.finalizedAt! >= weekStart)),
      month: summarizeOrders(finalized.filter((o) => o.finalizedAt! >= monthStart)),
      pending: {
        total: countPending(() => true),
        pix: countPending((p) => p.paymentMethod === PaymentMethod.PIX),
        cartao: countPending((p) => p.paymentMethod === PaymentMethod.CARTAO),
        awaitingReceipt: countPending((p) => p.status === OrderStatus.AGUARDANDO_COMPROVANTE),
      },
    };
  }
}

@Module({ controllers: [DashboardController] })
export class DashboardModule {}
