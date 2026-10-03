"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CreditCard, FileText, MapPin, QrCode, Store } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconBubble } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { adminApi } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Order, PAYMENT_LABEL } from "@/lib/types";

const isPending = (o: Order) => o.status === "AGUARDANDO_COMPROVANTE" || o.status === "AGUARDANDO_CONFIRMACAO";

// Pix e Cartão mostram só o que ainda espera aprovação; o histórico fica nos outros filtros
const FILTERS: { value: string; label: string; match: (o: Order) => boolean }[] = [
  { value: "pix", label: "Pix", match: (o) => o.paymentMethod === "PIX" && isPending(o) },
  { value: "cartao", label: "Cartão", match: (o) => o.paymentMethod === "CARTAO" && isPending(o) },
  { value: "dinheiro", label: "Dinheiro", match: (o) => o.paymentMethod === "DINHEIRO" && isPending(o) },
  { value: "aprovados", label: "Aprovados", match: (o) => o.status === "FINALIZADO" },
  { value: "cancelados", label: "Cancelados", match: (o) => o.status === "CANCELADO" },
  { value: "todos", label: "Todos", match: () => true },
];

const EMPTY: Record<string, string> = {
  pix: "Nenhum pedido no Pix esperando aprovação.",
  cartao: "Nenhum pedido no cartão esperando aprovação.",
  dinheiro: "Nenhum pedido em dinheiro esperando aprovação.",
  aprovados: "Nenhum pedido aprovado ainda.",
  cancelados: "Nenhum pedido cancelado.",
  todos: "Nenhum pedido feito na loja ainda.",
};

function OrderRow({ order, onChange }: { order: Order; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const pending = isPending(order);
  const isPix = order.paymentMethod === "PIX";

  async function act(action: "finalize" | "cancel") {
    const ok = await confirm(
      action === "finalize"
        ? {
            title: `Aprovar o pedido ${order.code}?`,
            message: `Confirme que o pagamento de ${formatBRL(order.totalCents)} foi recebido. O estoque dos produtos será baixado.`,
            confirmLabel: "Aprovar",
          }
        : {
            title: `Cancelar o pedido ${order.code}?`,
            message: `O pedido de ${order.customerName} vai para Cancelados e não pode ser aprovado depois.`,
            confirmLabel: "Cancelar pedido",
            cancelLabel: "Manter pedido",
            danger: true,
          },
    );
    if (!ok) return;
    setBusy(true);
    try {
      await adminApi.post(`/admin/orders/${order.id}/${action}`);
      toast.success(action === "finalize" ? `Pedido ${order.code} aprovado` : `Pedido ${order.code} cancelado`);
      onChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(2_49_75/0.04)] ring-1 ring-zinc-200/80">
      {/* Topo: identificação do pedido e total */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
        {/* No celular o ícone some: a forma de pagamento já aparece escrita ao lado */}
        <span className="hidden sm:block">
          <IconBubble>
            {isPix ? <QrCode size={18} /> : order.paymentMethod === "DINHEIRO" ? <Banknote size={18} /> : <CreditCard size={18} />}
          </IconBubble>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-2xl font-bold leading-none">{order.code}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {PAYMENT_LABEL[order.paymentMethod]}, {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex w-full items-baseline justify-between sm:block sm:w-auto sm:text-right">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="font-display text-3xl font-bold leading-none">{formatBRL(order.totalCents)}</p>
        </div>
      </header>

      {/* Meio: cliente e itens */}
      <div className="grid gap-5 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-8">
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-xs font-medium text-zinc-500">Cliente</p>
          <p className="font-semibold">{order.customerName}</p>
          <a
            className="w-fit text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-ink"
            href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            {order.customerPhone}
          </a>
          <p className="mt-1 flex items-start gap-2 text-zinc-600">
            {order.deliveryType === "ENTREGA" ? (
              <>
                <MapPin size={16} className="mt-0.5 shrink-0" /> {order.address}
              </>
            ) : (
              <>
                <Store size={16} className="mt-0.5 shrink-0" /> Retirada na loja
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p className="text-xs font-medium text-zinc-500">Itens</p>
          <ul className="flex flex-col gap-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {i.quantity}× {i.productName}
                </span>
                <span className="shrink-0 tabular-nums">{formatBRL(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
            {order.deliveryFeeCents > 0 && (
              <li className="flex justify-between text-zinc-500">
                <span>Entrega</span>
                <span className="tabular-nums">{formatBRL(order.deliveryFeeCents)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Rodapé: comprovante e decisão, só enquanto o pedido está pendente */}
      {pending && (
        <footer className="flex flex-col gap-3 border-t border-zinc-100 bg-paper/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm">
            {order.paymentMethod === "DINHEIRO" ? (
              <p className="text-zinc-500">
                {order.changeForCents
                  ? `Troco para ${formatBRL(order.changeForCents)}: levar ${formatBRL(order.changeForCents - order.totalCents)} de troco.`
                  : "Receba em dinheiro (sem troco) e aprove o pedido."}
              </p>
            ) : !isPix ? (
              <p className="text-zinc-500">Receba na maquininha e aprove o pedido.</p>
            ) : order.receiptUrl ? (
              <ButtonLink href={order.receiptUrl} target="_blank" rel="noreferrer" variant="ghost" className="w-full gap-2 sm:w-auto">
                <FileText size={16} /> Ver comprovante
              </ButtonLink>
            ) : (
              <p className="text-zinc-500">O cliente ainda não enviou o comprovante.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="ghost" disabled={busy} onClick={() => act("cancel")}>
              Cancelar
            </Button>
            <Button disabled={busy} onClick={() => act("finalize")}>
              Aprovar
            </Button>
          </div>
        </footer>
      )}
      {!pending && isPix && order.receiptUrl && (
        <footer className="border-t border-zinc-100 px-4 py-3 text-sm sm:px-6">
          <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-zinc-600 hover:text-ink">
            <FileText size={16} /> Ver comprovante
          </a>
        </footer>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const [filter, setFilter] = useState(FILTERS[0].value);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  // Busca todos de uma vez e filtra aqui: assim cada filtro mostra sua contagem
  const load = useCallback(() => {
    adminApi
      .get<Order[]>("/admin/orders")
      .then(setOrders)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const active = FILTERS.find((f) => f.value === filter)!;
  const visible = orders?.filter(active.match) ?? [];

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <header>
        <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">Pedidos</h1>
        <p className="mt-1 text-zinc-500">Confira os pagamentos e aprove ou cancele cada pedido.</p>
      </header>

      {/* Celular: uma opção por linha, com a quantidade à direita */}
      <div role="tablist" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {FILTERS.map((f) => {
          const selected = f.value === filter;
          const count = orders?.filter(f.match).length;
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f.value)}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition sm:justify-center sm:py-2 ${
                selected ? "bg-ink text-white" : "bg-white ring-1 ring-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {f.label}
              {count !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-xs ${selected ? "bg-white/15 text-white" : "bg-paper text-zinc-500"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {!orders && !error && <PageLoader label="Carregando pedidos" />}
      {orders && visible.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-zinc-500 ring-1 ring-zinc-200/80">{EMPTY[filter]}</p>
      )}
      <div className="flex flex-col gap-4 lg:gap-6">
        {visible.map((o) => (
          <OrderRow key={o.id} order={o} onChange={load} />
        ))}
      </div>
    </div>
  );
}
