import { Badge, BadgeTone } from "@/components/ui/badge";
import { OrderStatus } from "@/lib/types";

// Rótulos curtos do painel do vendedor (a página do cliente usa STATUS_LABEL)
const STATUS: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  FINALIZADO: { label: "Aprovado", tone: "positive" },
  AGUARDANDO_CONFIRMACAO: { label: "A confirmar", tone: "attention" },
  AGUARDANDO_COMPROVANTE: { label: "Sem comprovante", tone: "subtle" },
  CANCELADO: { label: "Cancelado", tone: "neutral" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>;
}
