"use client";

import { useEffect, useState } from "react";
import { SectionLoader } from "@/components/ui/spinner";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";

function Section({ id, title, products }: { id: string; title: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 font-display text-3xl font-bold uppercase">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Product[]>("/products"), api.get<Category[]>("/categories")])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const launches = products?.filter((p) => p.isLaunch) ?? [];
  const promos = products?.filter((p) => p.promoPriceCents != null && p.promoPriceCents < p.priceCents) ?? [];
  const filtered = products?.filter((p) => !categoryId || p.category?.id === categoryId) ?? [];

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:pt-16">
          <p className="font-display text-lg font-semibold uppercase tracking-widest text-brand">Emagrecimento com saúde</p>
          <h1 className="mt-2 max-w-3xl text-balance font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl">
            Mais leveza e disposição para o seu dia
          </h1>
          <p className="mt-4 max-w-xl text-zinc-300">
            Cada pequena escolha conta. Comece hoje e descubra a força que existe em cuidar de você.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#promocoes" className="btn-primary">Ver promoções</a>
            <a href="#produtos" className="inline-flex h-11 items-center rounded-lg border border-white/30 px-5 font-semibold hover:bg-white/10">
              Ver todos os produtos
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10">
        {error && <p className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
        {!products && !error && <SectionLoader label="Carregando produtos" />}

        <Section id="lancamentos" title="Lançamentos" products={launches} />
        <Section id="promocoes" title="Promoções" products={promos} />

        {products && (
          <section id="produtos" className="scroll-mt-20">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-bold uppercase">Produtos</h2>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", name: "Todos" }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      categoryId === c.id ? "bg-ink text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="text-zinc-500">Nenhum produto por aqui ainda.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
