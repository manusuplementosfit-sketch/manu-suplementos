"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { AdminProduct, Category } from "@/lib/types";
import { ProductForm } from "./product-form";

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    adminApi.get<AdminProduct[]>("/admin/products").then(setProducts).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    adminApi.get<Category[]>("/categories").then(setCategories);
  }, [load]);

  async function remove(p: AdminProduct) {
    if (!confirm(`Excluir ${p.name}?`)) return;
    const { archived } = await adminApi.delete<{ archived: boolean }>(`/admin/products/${p.id}`);
    if (archived) alert("Este produto já tem vendas, então foi apenas desativado para manter o histórico.");
    load();
  }

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={categories}
        onDone={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold uppercase">Produtos</h1>
        <button className="btn-primary" onClick={() => setEditing("new")}>
          + Novo produto
        </button>
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {products && products.length === 0 && <p className="text-zinc-500">Nenhum produto cadastrado ainda.</p>}

      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-zinc-200">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Custo</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Destaques</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products?.map((p) => (
              <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-zinc-500">
                        {p.category?.name ?? "Sem categoria"}
                        {!p.active && " · Inativo"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {p.promoPriceCents != null ? (
                    <>
                      <span className="text-zinc-400 line-through">{formatBRL(p.priceCents)}</span>{" "}
                      <strong>{formatBRL(p.promoPriceCents)}</strong>
                    </>
                  ) : (
                    formatBRL(p.priceCents)
                  )}
                </td>
                <td className="p-3">{formatBRL(p.costCents)}</td>
                <td className={`p-3 font-medium ${p.stock === 0 ? "text-red-700" : ""}`}>{p.stock === 0 ? "Esgotado" : p.stock}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {p.isLaunch && <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">Lançamento</span>}
                    {p.promoPriceCents != null && <span className="rounded-full bg-brand px-2 py-0.5 text-xs">Promoção</span>}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setEditing(p)}>
                      Editar
                    </button>
                    <button className="btn-ghost text-red-700" onClick={() => remove(p)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
