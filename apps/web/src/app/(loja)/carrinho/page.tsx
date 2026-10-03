"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { QuantityInput } from "@/components/quantity-input";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatBRL } from "@/lib/format";

function ContinueShopping({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-ink hover:underline ${className}`}>
      <ArrowLeft size={16} /> Continuar comprando
    </Link>
  );
}

export default function CartPage() {
  const cart = useCart();
  const toast = useToast();
  const itemsLabel = `${cart.count} ${cart.count === 1 ? "item" : "itens"}`;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <h1 className="mb-6 font-display text-4xl font-bold uppercase">Carrinho</h1>
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-zinc-200">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-paper text-ink">
            <ShoppingCart size={28} />
          </span>
          <div>
            <p className="text-lg font-semibold">Seu carrinho está vazio</p>
            <p className="text-sm text-zinc-500">Escolha seus produtos e eles aparecem aqui.</p>
          </div>
          <ButtonLink href="/" variant="dark">
            Ver produtos
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    // No celular sobra espaço embaixo para a barra fixa do total
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase">Carrinho</h1>
          <p className="text-sm text-zinc-500">{itemsLabel}</p>
        </div>
        <ContinueShopping />
      </header>

      {/* minmax(0,1fr): a coluna não cresce para caber o nome inteiro, que assim é abreviado */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <ul className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgb(2_49_75/0.04)] ring-1 ring-zinc-200/80 sm:gap-4 sm:p-4"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-paper sm:h-28 sm:w-28">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col py-0.5">
                {/* Nome com a lixeira discreta no canto */}
                <div className="flex items-start gap-1">
                  {/* Celular: nome numa linha só, abreviado com "…"; telas maiores: até 2 linhas */}
                  <p className="min-w-0 flex-1 truncate font-semibold leading-snug sm:line-clamp-2 sm:whitespace-normal" title={item.name}>
                    {item.name}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remover ${item.name} do carrinho`}
                    title="Remover do carrinho"
                    onClick={() => {
                      cart.remove(item.productId);
                      toast.info(`${item.name} saiu do carrinho`);
                    }}
                    className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {/* Embaixo do nome, só o preço de cada unidade (o total fica na barra do pagamento no celular) */}
                <p className="mt-0.5 text-sm text-zinc-500">{formatBRL(item.unitPriceCents)} cada</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
                  <QuantityInput
                    variant="pill"
                    value={item.quantity}
                    max={item.stock}
                    onChange={(q) => cart.setQuantity(item.productId, q)}
                    label={`Quantidade de ${item.name}`}
                  />
                  <p className="hidden font-display text-xl font-bold tabular-nums sm:block">{formatBRL(item.unitPriceCents * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Resumo: ao lado no desktop (acompanha a rolagem); no celular vira a barra fixa abaixo */}
        <aside className="hidden flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 lg:sticky lg:top-24 lg:flex">
          <h2 className="font-display text-xl font-bold uppercase">Resumo</h2>
          <div className="flex items-baseline justify-between">
            <span className="text-zinc-600">Subtotal ({itemsLabel})</span>
            <span className="font-display text-3xl font-bold tabular-nums">{formatBRL(cart.subtotalCents)}</span>
          </div>
          <p className="text-sm text-zinc-500">Entrega ou retirada, e a forma de pagamento, você escolhe na próxima etapa.</p>
          <ButtonLink href="/checkout" block>
            Continuar para pagamento
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" block>
            Continuar comprando
          </ButtonLink>
        </aside>
      </div>

      {/* Celular e tablet: total e botão sempre à mão */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Subtotal ({itemsLabel})</p>
            <p className="font-display text-2xl font-bold tabular-nums">{formatBRL(cart.subtotalCents)}</p>
          </div>
          <ButtonLink href="/checkout" className="shrink-0">
            Pagamento
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
