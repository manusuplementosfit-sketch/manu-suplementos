"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { PageLoader } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { STATUS_LABEL, STATUS_STYLE, TrackedOrder } from "@/lib/types";

function NextStep({ order }: { order: TrackedOrder }) {
  const place = order.deliveryType === "ENTREGA" ? "na entrega" : "na retirada";
  switch (order.status) {
    case "AGUARDANDO_COMPROVANTE":
      return <>Pague o Pix abaixo e envie o comprovante para confirmarmos seu pedido.</>;
    case "AGUARDANDO_CONFIRMACAO":
      return order.paymentMethod === "PIX" ? (
        <>Recebemos seu comprovante! Agora é só aguardar a confirmação da loja.</>
      ) : (
        <>Pedido recebido! O pagamento será feito no cartão, na maquininha, {place}.</>
      );
    case "FINALIZADO":
      return <>Compra confirmada. Obrigado por comprar com a gente! 💪</>;
    case "CANCELADO":
      return <>Este pedido foi cancelado. Em caso de dúvida, fale com a loja.</>;
  }
}

function PixPayment({ order, token, onSent }: { order: TrackedOrder; token: string; onSent: () => void }) {
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  async function send() {
    if (!file) return;
    setSending(true);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post(`/orders/${order.code}/receipt?token=${token}`, form);
      toast.success("Comprovante enviado! Agora é só aguardar a confirmação da loja.");
      onSent();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 sm:grid-cols-[220px_1fr]">
      {order.pix ? (
        <>
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.pix.qrCodeDataUrl} alt="QR Code Pix" className="h-52 w-52" />
            <p className="font-display text-2xl font-bold">{formatBRL(order.totalCents)}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-bold uppercase">1. Pague com Pix</h2>
              <p className="text-sm text-zinc-600">Escaneie o QR Code ou copie o código abaixo no app do seu banco.</p>
              <div className="mt-2 flex gap-2">
                <input readOnly value={order.pix.payload} className="input font-mono text-xs" onFocus={(e) => e.target.select()} />
                <button
                  type="button"
                  className="btn-dark shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(order.pix!.payload);
                    setCopied(true);
                    toast.success("Código Pix copiado. Cole no app do seu banco.");
                  }}
                >
                  {copied ? "Copiado ✓" : "Copiar"}
                </button>
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold uppercase">2. Envie o comprovante</h2>
              <p className="text-sm text-zinc-600">Foto ou PDF, até 4 MB.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:font-medium"
                />
                <button type="button" className="btn-primary" disabled={!file || sending} onClick={send}>
                  {sending ? "Enviando…" : "Enviar comprovante"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-zinc-600 sm:col-span-2">O Pix da loja não está configurado. Fale com a loja para combinar o pagamento.</p>
      )}
    </section>
  );
}

export function OrderTracking() {
  const { code } = useParams<{ code: string }>();
  const token = useSearchParams().get("t") ?? "";
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get<TrackedOrder>(`/orders/${code}?token=${token}`)
      .then(setOrder)
      .catch((e: Error) => setError(e.message));
  }, [code, token]);

  useEffect(load, [load]);

  if (error) return <p className="mx-auto max-w-3xl px-4 py-10 text-red-700">{error}</p>;
  if (!order) return <PageLoader label="Carregando pedido" />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-sm text-zinc-500">Pedido feito em {formatDateTime(order.createdAt)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-bold uppercase">Pedido {order.code}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="mt-2 text-zinc-700">
          <NextStep order={order} />
        </p>
        <p className="mt-2 text-sm text-zinc-500">Guarde o link desta página para acompanhar seu pedido.</p>
      </div>

      {order.status === "AGUARDANDO_COMPROVANTE" && <PixPayment order={order} token={token} onSent={load} />}

      <section className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="mb-3 font-display text-xl font-bold uppercase">Itens</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span>
                {i.quantity}× {i.productName}
              </span>
              <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-3 text-sm">
          <div className="flex justify-between">
            <span>Entrega</span>
            <span>{order.deliveryFeeCents ? formatBRL(order.deliveryFeeCents) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatBRL(order.totalCents)}</span>
          </div>
        </div>
        <div className="mt-4 grid gap-1 border-t border-zinc-200 pt-3 text-sm text-zinc-600">
          <p>
            <strong>{order.deliveryType === "ENTREGA" ? "Entrega" : "Retirada na loja"}</strong>
            {order.address && ` · ${order.address}`}
          </p>
          <p>Pagamento: {order.paymentMethod === "PIX" ? "Pix" : "Cartão (maquininha)"}</p>
        </div>
      </section>
    </div>
  );
}
