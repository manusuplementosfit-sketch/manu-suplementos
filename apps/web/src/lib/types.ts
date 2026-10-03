export type PaymentMethod = "PIX" | "CARTAO";
export type DeliveryType = "ENTREGA" | "RETIRADA";
export type OrderStatus = "AGUARDANDO_COMPROVANTE" | "AGUARDANDO_CONFIRMACAO" | "FINALIZADO" | "CANCELADO";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  promoPriceCents: number | null;
  isLaunch: boolean;
  stock: number;
  category: Category | null;
}

export interface AdminProduct extends Product {
  categoryId: string | null;
  costCents: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  unitCostCents?: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  receiptUrl: string | null;
  createdAt: string;
  finalizedAt: string | null;
  items: OrderItem[];
}

export interface TrackedOrder extends Order {
  pix: { payload: string; qrCodeDataUrl: string } | null;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_COMPROVANTE: "Aguardando comprovante",
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  AGUARDANDO_COMPROVANTE: "bg-amber-100 text-amber-900",
  AGUARDANDO_CONFIRMACAO: "bg-sky-100 text-sky-900",
  FINALIZADO: "bg-emerald-100 text-emerald-900",
  CANCELADO: "bg-zinc-200 text-zinc-700",
};

export function unitPrice(p: Pick<Product, "priceCents" | "promoPriceCents">): number {
  return p.promoPriceCents != null && p.promoPriceCents < p.priceCents ? p.promoPriceCents : p.priceCents;
}
