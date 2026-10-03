import { OrderStatus, PaymentMethod } from "@/lib/types";

export interface Summary {
  count: number;
  revenueCents: number;
  profitCents: number;
}

export interface DashboardOrder {
  code: string;
  customerName: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenueCents: number;
  imageUrl: string | null;
}

export interface Dashboard {
  week: Summary;
  month: Summary;
  /** Variação do faturamento contra o mês anterior até o mesmo dia; null sem base */
  monthRevenueChange: number | null;
  monthGoalCents: number | null;
  /** Faturamento de segunda (0) a domingo (6) */
  weekRevenueByDay: number[];
  pending: { total: number; pix: number; cartao: number; awaitingReceipt: number };
  recentOrders: DashboardOrder[];
  topProducts: TopProduct[];
}
