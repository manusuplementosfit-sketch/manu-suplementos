"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { Product, unitPrice } from "@/lib/types";
import { useCart } from "./cart-context";
import { useToast } from "./ui/toast";
import { QuantityInput } from "./quantity-input";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const toast = useToast();
  const price = unitPrice(product);
  const onSale = price < product.priceCents;
  const soldOut = product.stock === 0;

  function add() {
    cart.add(product, quantity);
    toast.success(quantity > 1 ? `${quantity} unidades de ${product.name} no carrinho` : `${product.name} adicionado ao carrinho`);
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 transition hover:shadow-lg">
      <div className="relative aspect-square bg-zinc-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-display text-4xl font-bold text-zinc-300">MS</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.isLaunch && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand">Lançamento</span>
          )}
          {onSale && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-on-brand">
              -{Math.round((1 - price / product.priceCents) * 100)}%
            </span>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-bold uppercase text-white">Esgotado</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {product.category && <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{product.category.name}</p>}
          <h3 className="font-semibold leading-snug">{product.name}</h3>
          {product.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{product.description}</p>}
        </div>

        <div className="mt-auto">
          {onSale && <p className="text-sm text-zinc-500 line-through">{formatBRL(product.priceCents)}</p>}
          <p className="font-display text-2xl font-bold">{formatBRL(price)}</p>
        </div>

        {!soldOut && (
          <div className="flex items-center gap-2">
            <QuantityInput value={quantity} max={product.stock} onChange={setQuantity} />
            <button
              onClick={add}
              className="h-9 flex-1 rounded-lg bg-ink text-sm font-semibold text-white transition hover:bg-ink-dark"
            >
              {added ? "Adicionado ✓" : "Adicionar"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
