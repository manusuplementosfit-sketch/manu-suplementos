"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product, unitPrice } from "@/lib/types";

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPriceCents: number;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (product: Product, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ms_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // O carrinho salvo só existe no navegador: carregar após montar evita divergência com o HTML do servidor
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const clamp = (q: number, stock: number) => Math.max(1, Math.min(q, stock));
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents: items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      add: (product, quantity) =>
        setItems((current) => {
          const existing = current.find((i) => i.productId === product.id);
          if (existing) {
            return current.map((i) =>
              i.productId === product.id ? { ...i, quantity: clamp(i.quantity + quantity, product.stock) } : i,
            );
          }
          return [
            ...current,
            {
              productId: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              unitPriceCents: unitPrice(product),
              stock: product.stock,
              quantity: clamp(quantity, product.stock),
            },
          ];
        }),
      setQuantity: (productId, quantity) =>
        setItems((current) =>
          current.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity, i.stock) } : i)),
        ),
      remove: (productId) => setItems((current) => current.filter((i) => i.productId !== productId)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider");
  return ctx;
}
