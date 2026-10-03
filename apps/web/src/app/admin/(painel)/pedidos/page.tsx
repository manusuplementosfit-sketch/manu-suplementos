"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Order, OrderStatus, PaymentMethod, STATUS_LABEL, STATUS_STYLE } from "@/lib/types";

const TABS: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "Pix (com comprovante)" },
  { value: "CARTAO", label: "Cartão (maquininha)" },
];

const FILTERS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "AGUARDANDO_CONFIRMACAO", label: "Aguardando confirmação" },
  { value: "AGUARDANDO_COMPROVANTE", label: "Aguardando comprovante" },
  { value: "FINALIZADO", label: "Finalizados" },
  { value: "CANCELADO", label: "Cancelados" },
];

function OrderCard({ order, onChange }: { order: Order; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = order.status === "AGUARDANDO_COMPROVANTE" || order.status === "AGUARDANDO_CONFIRMACAO";

  async function act(action: "finalize" | "cancel") {
    const question =
      action === "finalize"
        ? `Confirmar que o pedido ${order.code} foi pago e finalizado? O estoque será baixado.`
        : `Cancelar o pedido ${order.code}?`;
    if (!confirm(question)) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.post(`/admin/orders/${order.id}/${action}`);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl font-bold">{order.code}</p>
          <p className="text-sm text-zinc-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="grid gap-1 text-sm">
        <p>
          <strong>{order.customerName}</strong> ·{" "}
          <a className="underline" href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            {order.customerPhone}
          </a>
        </p>
        <p className="text-zinc-600">
          {order.deliveryType === "ENTREGA" ? `Entrega · ${order.address}` : "Retirada na loja"}
        </p>
      </div>

      <ul className="rounded-lg bg-zinc-50 p-3 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between">
            <span>
              {i.quantity}× {i.productName}
            </span>
            <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
          </li>
        ))}
        {order.deliveryFeeCents > 0 && (
          <li className="flex justify-between text-zinc-500">
            <span>Entrega</span>
            <span>{formatBRL(order.deliveryFeeCents)}</span>
          </li>
        )}
        <li className="mt-1 flex justify-between border-t border-zinc-200 pt-1 font-bold">
          <span>Total</span>
          <span>{formatBRL(order.totalCents)}</span>
        </li>
      </ul>

      {order.paymentMethod === "PIX" &&
        (order.receiptUrl ? (
          <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="btn-ghost w-fit">
            Ver comprovante
          </a>
        ) : (
          <p className="text-sm text-amber-800">O cliente ainda não enviou o comprovante.</p>
        ))}

      {error && <p className="text-sm text-red-700">{error}</p>}

      {pending && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" disabled={busy} onClick={() => act("finalize")}>
            Confirmar compra finalizada
          </button>
          <button className="btn-ghost h-11" disabled={busy} onClick={() => act("cancel")}>
            Cancelar pedido
          </button>
        </div>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<PaymentMethod>("PIX");
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams({ paymentMethod: tab });
    if (status) params.set("status", status);
    adminApi
      .get<Order[]>(`/admin/orders?${params}`)
      .then(setOrders)
      .catch((e: Error) => setError(e.message));
  }, [tab, status]);

  useEffect(load, [load]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-4xl font-bold uppercase">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              tab === t.value ? "bg-ink text-white" : "bg-white ring-1 ring-zinc-200 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <select className="input w-fit" value={status} onChange={(e) => setStatus(e.target.value as "" | OrderStatus)}>
        {FILTERS.filter((f) => tab === "PIX" || f.value !== "AGUARDANDO_COMPROVANTE").map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-700">{error}</p>}
      {orders && orders.length === 0 && <p className="text-zinc-500">Nenhum pedido encontrado.</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {orders?.map((o) => (
          <OrderCard key={o.id} order={o} onChange={load} />
        ))}
      </div>
    </div>
  );
}
