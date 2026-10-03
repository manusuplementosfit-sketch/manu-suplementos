"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { Field, MoneyInput, PhoneInput, RequiredNote, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatBRL, parseBRL } from "@/lib/format";
import { DeliveryType, PaymentMethod } from "@/lib/types";

function Choice<T extends string>({
  value,
  current,
  onSelect,
  title,
  hint,
  disabled,
}: {
  value: T;
  current: T;
  onSelect: (v: T) => void;
  title: string;
  hint: string;
  disabled?: boolean;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={`rounded-xl p-4 text-left ring-2 transition disabled:opacity-40 ${
        active ? "bg-ink text-white ring-ink" : "bg-white ring-zinc-200 hover:ring-zinc-400"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className={`text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}>{hint}</p>
    </button>
  );
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState<{ deliveryFeeCents: number; pixEnabled: boolean } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<DeliveryType>("RETIRADA");
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [changeFor, setChangeFor] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api
      .get<{ deliveryFeeCents: number; pixEnabled: boolean }>("/settings/public")
      .then((s) => {
        setSettings(s);
        if (!s.pixEnabled) setPayment("CARTAO");
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const fee = delivery === "ENTREGA" ? (settings?.deliveryFeeCents ?? 0) : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Troco: opcional, só no dinheiro, e maior que o total
    const changeForCents = payment === "DINHEIRO" && changeFor.trim() !== "" ? parseBRL(changeFor) : null;
    if (changeForCents != null && changeForCents <= cart.subtotalCents + fee) {
      return toast.error("O valor para troco precisa ser maior que o total do pedido");
    }
    setSending(true);
    try {
      const order = await api.post<{ code: string; accessToken: string }>("/orders", {
        customerName: name,
        customerPhone: phone,
        deliveryType: delivery,
        address: delivery === "ENTREGA" ? address : undefined,
        paymentMethod: payment,
        changeForCents,
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      cart.clear();
      toast.success(`Pedido ${order.code} enviado! Acompanhe tudo por esta página.`);
      router.push(`/pedido/${order.code}?t=${order.accessToken}`);
    } catch (err) {
      toast.error((err as Error).message);
      setSending(false);
    }
  }

  if (cart.items.length === 0 && !sending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-zinc-600">Seu carrinho está vazio.</p>
        <Link href="/" className="btn-dark mt-4">Ver produtos</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-8">
        <h1 className="font-display text-4xl font-bold uppercase">Finalizar compra</h1>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-display text-xl font-bold uppercase">Seus dados</legend>
          <Field label="Nome" required>
            <TextInput required minLength={3} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telefone / WhatsApp" required>
            <PhoneInput required minLength={14} value={phone} onValueChange={setPhone} />
          </Field>
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-xl font-bold uppercase">Como quer receber?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice value="RETIRADA" current={delivery} onSelect={setDelivery} title="Retirar na loja" hint="Sem taxa" />
            <Choice
              value="ENTREGA"
              current={delivery}
              onSelect={setDelivery}
              title="Entrega"
              hint={settings?.deliveryFeeCents ? `Taxa de ${formatBRL(settings.deliveryFeeCents)}` : "Entrega grátis"}
            />
          </div>
          {delivery === "ENTREGA" && (
            <Field label="Endereço completo" required className="mt-3">
              <textarea
                className="input h-auto min-h-20 py-2"
                required
                minLength={8}
                placeholder="Rua, número, complemento, bairro"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-xl font-bold uppercase">Pagamento</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Choice
              value="PIX"
              current={payment}
              onSelect={setPayment}
              title="Pix"
              hint={settings && !settings.pixEnabled ? "Indisponível no momento" : "QR Code + envio do comprovante"}
              disabled={settings ? !settings.pixEnabled : false}
            />
            <Choice
              value="CARTAO"
              current={payment}
              onSelect={setPayment}
              title="Cartão"
              hint={delivery === "ENTREGA" ? "Na maquininha, na entrega" : "Na maquininha, na retirada"}
            />
            <Choice
              value="DINHEIRO"
              current={payment}
              onSelect={setPayment}
              title="Dinheiro"
              hint={delivery === "ENTREGA" ? "Em espécie, na entrega" : "Em espécie, na retirada"}
            />
          </div>
          {payment === "DINHEIRO" && (
            <Field
              label="Precisa de troco? Para quanto?"
              className="mt-3"
              hint={`Deixe em branco se for pagar o valor exato (${formatBRL(cart.subtotalCents + fee)}).`}
            >
              <MoneyInput placeholder="R$ 100,00" value={changeFor} onValueChange={setChangeFor} />
            </Field>
          )}
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-zinc-200 lg:sticky lg:top-24">
        <h2 className="mb-3 font-display text-xl font-bold uppercase">Resumo</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {cart.items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span className="tabular-nums">{formatBRL(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-zinc-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(cart.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Entrega</span>
            <span>{fee ? formatBRL(fee) : "—"}</span>
          </div>
          <div className="mt-2 flex justify-between font-display text-2xl font-bold">
            <span>Total</span>
            <span>{formatBRL(cart.subtotalCents + fee)}</span>
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <RequiredNote className="mt-4" />
        <button type="submit" disabled={sending || !settings} className="btn-primary mt-4 w-full">
          {sending ? "Enviando…" : "Confirmar pedido"}
        </button>
      </aside>
    </form>
  );
}
