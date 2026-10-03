import Link from "next/link";
import { Banknote, CreditCard, Package, QrCode } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, IconBubble } from "@/components/ui/card";
import { DashboardOrder, TopProduct } from "./dashboard-types";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function RecentOrders({ orders }: { orders: DashboardOrder[] }) {
  return (
    <Card
      title="Pedidos recentes"
      aside={
        <Link href="/admin/pedidos" className="whitespace-nowrap text-sm font-medium text-zinc-500 hover:text-ink">
          Ver todos
        </Link>
      }
    >
      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500">Os pedidos feitos na loja aparecem aqui.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.code} className="flex items-center gap-3">
              <IconBubble>
                {o.paymentMethod === "PIX" ? <QrCode size={18} /> : o.paymentMethod === "DINHEIRO" ? <Banknote size={18} /> : <CreditCard size={18} />}
              </IconBubble>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{o.customerName}</p>
                <p className="text-xs text-zinc-500">
                  {o.code}, {shortDate(o.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-sm font-semibold">{formatBRL(o.totalCents)}</p>
                <OrderStatusBadge status={o.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((p) => p.quantity), 1);
  return (
    <Card title="Mais vendidos do mês">
      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">Os produtos das vendas finalizadas neste mês aparecem aqui.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {products.map((p) => (
            <li key={p.productId} className="flex items-center gap-3">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-zinc-200" />
              ) : (
                <IconBubble>
                  <Package size={18} />
                </IconBubble>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium">{p.productName}</p>
                  <p className="shrink-0 text-xs text-zinc-500">{p.quantity} un.</p>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-ink/70" style={{ width: `${(p.quantity / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
