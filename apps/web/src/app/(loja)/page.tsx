"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import { SectionLoader } from "@/components/ui/spinner";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";

type TabId = "lancamentos" | "promocoes" | "produtos";

const isPromo = (p: Product) => p.promoPriceCents != null && p.promoPriceCents < p.priceCents;

// O id de cada aba também é o endereço: loja/#promocoes abre direto em Promoções
const TABS: { id: TabId; label: string; shortLabel?: string; empty: string; match: (p: Product) => boolean }[] = [
  { id: "lancamentos", label: "Lançamentos", empty: "Nenhum lançamento no momento.", match: (p) => p.isLaunch },
  { id: "promocoes", label: "Promoções", empty: "Nenhuma promoção no momento.", match: isPromo },
  { id: "produtos", label: "Todos os produtos", shortLabel: "Todos", empty: "Nenhum produto por aqui ainda.", match: () => true },
];

const tabFromHash = (): TabId | null => {
  const hash = window.location.hash.slice(1);
  return TABS.some((t) => t.id === hash) ? (hash as TabId) : null;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<TabId>("lancamentos");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Product[]>("/products"), api.get<Category[]>("/categories")])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
        // Abre a aba do endereço (#promocoes); sem lançamentos, começa em Todos os produtos
        setTab(tabFromHash() ?? (p.some((x) => x.isLaunch) ? "lancamentos" : "produtos"));
      })
      .catch((e: Error) => setError(e.message));

    const onHash = () => {
      const fromHash = tabFromHash();
      if (fromHash) setTab(fromHash);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const current = TABS.find((t) => t.id === tab)!;
  const inTab = products?.filter(current.match) ?? [];
  const visible = inTab.filter((p) => !categoryId || p.category?.id === categoryId);

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:pb-14 sm:pt-3">
          <p className="font-display text-lg font-semibold uppercase tracking-widest text-brand">Emagrecimento com saúde</p>
          <h1 className="mt-2 max-w-3xl text-balance font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl">
            Mais leveza e disposição para o seu dia
          </h1>
          <p className="mt-4 max-w-xl text-zinc-300">
            Cada pequena escolha conta. Comece hoje e descubra a força que existe em cuidar de você.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        {error && <p className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
        {!products && !error && <SectionLoader label="Carregando produtos" />}

        {products && (
          <>
            <div className="flex flex-col gap-4">
              {/* Celular: seletor segmentado (nome + quantidade embaixo); a largura de cada parte acompanha o tamanho do nome,
                  para o destaque não ficar apertado em "Lançamentos". Tablet e desktop: abas grandes */}
              <div
                role="tablist"
                aria-label="Seções da loja"
                className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_minmax(0,0.85fr)] gap-1 rounded-2xl bg-white p-1 ring-1 ring-zinc-200 sm:flex sm:gap-2 sm:rounded-none sm:bg-transparent sm:p-0 sm:ring-0"
              >
                {TABS.map((t) => {
                  const selected = t.id === tab;
                  const count = products.filter(t.match).length;
                  return (
                    <button
                      key={t.id}
                      id={`aba-${t.id}`}
                      role="tab"
                      aria-selected={selected}
                      aria-controls="lista-produtos"
                      onClick={() => {
                        setTab(t.id);
                        history.replaceState(null, "", `#${t.id}`);
                      }}
                      className={`flex min-w-0 flex-col items-center justify-center rounded-xl px-1 py-2 transition sm:flex-row sm:gap-2 sm:px-6 sm:py-3 sm:font-display sm:text-lg sm:font-bold sm:uppercase sm:tracking-wide ${
                        selected ? "bg-ink text-white" : "text-ink hover:bg-zinc-100 sm:bg-white sm:ring-1 sm:ring-zinc-200"
                      }`}
                    >
                      <span className="truncate text-sm font-semibold sm:text-lg sm:font-bold">
                        {t.shortLabel ? (
                          <>
                            <span className="sm:hidden">{t.shortLabel}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                          </>
                        ) : (
                          t.label
                        )}
                      </span>
                      {/* Celular: "3 produtos" embaixo do nome; telas maiores: número no selo ao lado */}
                      <span className={`text-[11px] sm:hidden ${selected ? "text-white/70" : "text-zinc-500"}`}>
                        {count} {count === 1 ? "produto" : "produtos"}
                      </span>
                      <span
                        className={`hidden rounded-full px-2 font-sans text-xs font-semibold sm:inline ${
                          selected ? "bg-brand text-on-brand" : "bg-paper text-zinc-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Celular: lista suspensa (os botões ocupavam 3 linhas). Tablet e desktop: botões */}
              <div className="sm:hidden">
                <label htmlFor="categoria-celular" className="sr-only">
                  Categoria
                </label>
                <Select
                  id="categoria-celular"
                  value={categoryId}
                  onChange={setCategoryId}
                  options={[{ value: "", label: "Todas as categorias" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
              <div className="hidden flex-wrap gap-2 sm:flex" aria-label="Filtrar por categoria">
                {[{ id: "", name: "Todas as categorias" }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    aria-pressed={categoryId === c.id}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      categoryId === c.id ? "bg-ink text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <section id="lista-produtos" role="tabpanel" aria-labelledby={`aba-${tab}`}>
              {visible.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-zinc-500 ring-1 ring-zinc-200">
                  {inTab.length > 0 ? "Nenhum produto desta categoria nesta seção." : current.empty}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                  {visible.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
