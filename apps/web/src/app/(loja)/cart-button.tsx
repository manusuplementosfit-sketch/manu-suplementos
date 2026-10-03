"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/carrinho"
      className="relative inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
    >
      Carrinho
      {count > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1.5 text-xs font-bold text-ink">{count}</span>
      )}
    </Link>
  );
}
