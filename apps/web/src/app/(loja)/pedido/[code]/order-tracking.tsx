"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, FileUp } from "lucide-react";
import { Badge, BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { OrderStatus, PAYMENT_LABEL, STATUS_LABEL, TrackedOrder } from "@/lib/types";

// Selo do status nas cores da loja (a página do cliente usa os nomes completos)
const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  AGUARDANDO_COMPROVANTE: "attention",
  AGUARDANDO_CONFIRMACAO: "subtle",
  FINALIZADO: "positive",
  CANCELADO: "neutral",
};

function NextStep({ order }: { order: TrackedOrder }) {
  const place = order.deliveryType === "ENTREGA" ? "na entrega" : "na retirada";
  switch (order.status) {
    case "AGUARDANDO_COMPROVANTE":
      return <>Pague o Pix abaixo e envie o comprovante para confirmarmos seu pedido.</>;
    case "AGUARDANDO_CONFIRMACAO":
      if (order.paymentMethod === "PIX") return <>Recebemos seu comprovante! Agora é só aguardar a confirmação da loja.</>;
      if (order.paymentMethod === "DINHEIRO") {
        return (
          <>
            Pedido recebido! O pagamento será em dinheiro, {place}
            {order.changeForCents ? `. Vamos levar troco para ${formatBRL(order.changeForCents)}.` : "."}
          </>
        );
      }
      return <>Pedido recebido! O pagamento será feito no cartão, na maquininha, {place}.</>;
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

  if (!order.pix) {
    return (
      <section className="rounded-2xl bg-white p-4 text-zinc-600 ring-1 ring-zinc-200 sm:p-6">
        O Pix da loja não está configurado. Fale com a loja para combinar o pagamento.
      </section>
    );
  }

  const pix = order.pix;
  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 sm:grid sm:grid-cols-[220px_minmax(0,1fr)] sm:p-6">
      {/* QR Code e valor */}
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pix.qrCodeDataUrl} alt="QR Code Pix" className="h-48 w-48 sm:h-52 sm:w-52" />
        <p className="text-sm text-zinc-500">Valor a pagar</p>
        <p className="-mt-1 font-display text-3xl font-bold">{formatBRL(order.totalCents)}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold uppercase">1. Pague com Pix</h2>
          <p className="text-sm text-zinc-600">
            No celular, toque em <strong>Copiar código Pix</strong> e cole no app do seu banco (Pix copia e cola). No computador, escaneie
            o QR Code.
          </p>
          <code className="block break-all rounded-lg bg-paper p-3 font-mono text-xs text-zinc-600">{pix.payload}</code>
          <Button
            type="button"
            variant="dark"
            block
            className="gap-2"
            onClick={() => {
              navigator.clipboard.writeText(pix.payload);
              setCopied(true);
              toast.success("Código Pix copiado. Cole no app do seu banco.");
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Código copiado" : "Copiar código Pix"}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold uppercase">2. Envie o comprovante</h2>
          <p className="text-sm text-zinc-600">Depois de pagar, envie a foto ou o PDF do comprovante (até 4 MB).</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 p-3 transition hover:border-ink/30 hover:bg-paper focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-brand">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-ink">
              <FileUp size={18} />
            </span>
            <span className="min-w-0 text-sm">
              <span className="block font-semibold">{file ? "Trocar arquivo" : "Escolher comprovante"}</span>
              <span className="block truncate text-zinc-500">{file ? file.name : "Toque para escolher a foto ou o PDF"}</span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button type="button" block disabled={!file || sending} onClick={send}>
            {sending ? "Enviando…" : "Enviar comprovante"}
          </Button>
        </div>
      </div>
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div>
        <p className="text-sm text-zinc-500">Pedido feito em {formatDateTime(order.createdAt)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-3xl font-bold uppercase sm:text-4xl">Pedido {order.code}</h1>
          <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
        </div>
        <p className="mt-3 text-zinc-700">
          <NextStep order={order} />
        </p>
        <p className="mt-2 text-sm text-zinc-500">Guarde o link desta página para acompanhar seu pedido.</p>
      </div>

      {order.status === "AGUARDANDO_COMPROVANTE" && <PixPayment order={order} token={token} onSent={load} />}

      <section className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 sm:p-6">
        <h2 className="mb-3 font-display text-xl font-bold uppercase">Itens</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span className="min-w-0">
                {i.quantity}× {i.productName}
              </span>
              <span className="shrink-0 tabular-nums">{formatBRL(i.unitPriceCents * i.quantity)}</span>
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
            {order.address && `: ${order.address}`}
          </p>
          <p>
            Pagamento: {PAYMENT_LABEL[order.paymentMethod]}
            {order.paymentMethod === "CARTAO" && " (maquininha)"}
            {order.paymentMethod === "DINHEIRO" && order.changeForCents ? `, troco para ${formatBRL(order.changeForCents)}` : ""}
          </p>
        </div>
      </section>
    </div>
  );
}
