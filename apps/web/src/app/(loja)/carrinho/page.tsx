"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { QuantityInput } from "@/components/quantity-input";
import { formatBRL } from "@/lib/format";

export default function CartPage() {
  const cart = useCart();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-4xl font-bold uppercase">Carrinho</h1>

      {cart.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-zinc-200">
          <p className="text-zinc-600">Seu carrinho está vazio.</p>
          <Link href="/" className="btn-dark mt-4">Ver produtos</Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-zinc-200 rounded-2xl bg-white ring-1 ring-zinc-200">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-zinc-500">{formatBRL(item.unitPriceCents)} cada</p>
                  <div className="mt-2 flex items-center gap-3">
                    <QuantityInput value={item.quantity} max={item.stock} onChange={(q) => cart.setQuantity(item.productId, q)} />
                    <button onClick={() => cart.remove(item.productId)} className="text-sm text-zinc-500 underline hover:text-red-700">
                      Remover
                    </button>
                  </div>
                </div>
                <p className="font-semibold tabular-nums">{formatBRL(item.unitPriceCents * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
            <div>
              <p className="text-sm text-zinc-500">Subtotal</p>
              <p className="font-display text-3xl font-bold">{formatBRL(cart.subtotalCents)}</p>
            </div>
            <Link href="/checkout" className="btn-primary">Continuar para pagamento</Link>
          </div>
        </>
      )}
    </div>
  );
}
