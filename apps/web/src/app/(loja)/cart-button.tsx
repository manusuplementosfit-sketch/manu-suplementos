"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-context";

export function CartButton() {
  const { count } = useCart();
  const label = count === 0 ? "Carrinho vazio" : `Carrinho com ${count} ${count === 1 ? "item" : "itens"}`;
  return (
    <Link
      href="/carrinho"
      aria-label={label}
      title={label}
      className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-on-brand ring-2 ring-ink"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
