"use client";

import { formatBRL } from "@/lib/format";
import { Product, unitPrice } from "@/lib/types";
import { useCart } from "./cart-context";
import { useToast } from "./ui/toast";
import { QuantityInput } from "./quantity-input";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const toast = useToast();
  // O número do card é a quantidade deste produto no carrinho (0 = fora do carrinho)
  const inCart = cart.items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const price = unitPrice(product);
  const onSale = price < product.priceCents;
  const soldOut = product.stock === 0;

  function changeQuantity(quantity: number) {
    if (quantity <= 0) return cart.remove(product.id);
    if (inCart === 0) {
      cart.add(product, quantity);
      // Aviso só na primeira unidade, para não aparecer a cada clique no +
      toast.success(`${product.name} adicionado ao carrinho`);
      return;
    }
    cart.setQuantity(product.id, quantity);
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
        <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-1.5">
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

      {/* No celular (2 colunas) o card fica enxuto: nome em até 2 linhas e sem descrição */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div>
          {product.category && (
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">{product.category.name}</p>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base" title={product.name}>
            {product.name}
          </h3>
          {product.description && <p className="mt-1 hidden text-sm text-zinc-600 sm:line-clamp-2">{product.description}</p>}
        </div>

        <div className="mt-auto">
          {onSale && <p className="text-xs text-zinc-500 line-through sm:text-sm">{formatBRL(product.priceCents)}</p>}
          <p className="font-display text-xl font-bold sm:text-2xl">{formatBRL(price)}</p>
        </div>

        {!soldOut && (
          <QuantityInput
            value={inCart}
            min={0}
            max={product.stock}
            onChange={changeQuantity}
            label={`Quantidade de ${product.name} no carrinho`}
            className={`w-full ${inCart > 0 ? "border-ink ring-1 ring-ink" : ""}`}
          />
        )}
      </div>
    </article>
  );
}
