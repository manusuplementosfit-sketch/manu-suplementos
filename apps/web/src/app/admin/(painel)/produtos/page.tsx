"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import { PageLoader } from "@/components/ui/spinner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { adminApi } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { AdminProduct, Category, unitPrice } from "@/lib/types";
import { ProductForm } from "./product-form";

/** Um selo por destaque, um abaixo do outro; sem nenhum, "Sem destaque" evita a célula vazia. */
function Highlight({ launch, promo }: { launch: boolean; promo: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {launch && <Badge tone="attention">Lançamento</Badge>}
      {promo && <Badge tone="positive">Promoção</Badge>}
      {!launch && !promo && <Badge tone="neutral">Sem destaque</Badge>}
    </div>
  );
}

// Mesmas colunas no cabeçalho e nas linhas (a partir do desktop)
const COLUMNS =
  "lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_5.5rem] lg:items-center lg:gap-4";

function Stock({ stock }: { stock: number }) {
  if (stock === 0) return <Badge tone="danger">Esgotado</Badge>;
  if (stock <= 3) return <Badge tone="attention">{stock} restantes</Badge>;
  return <span className="font-medium tabular-nums">{stock} un.</span>;
}

function ProductRow({ product: p, onEdit, onRemove }: { product: AdminProduct; onEdit: () => void; onRemove: () => void }) {
  const selling = unitPrice(p);
  const profit = selling - p.costCents;
  const margin = selling > 0 ? Math.round((profit / selling) * 100) : 0;

  const price =
    p.promoPriceCents != null ? (
      <div className="flex flex-col">
        <span className="font-semibold tabular-nums">{formatBRL(p.promoPriceCents)}</span>
        <span className="text-xs text-zinc-400 line-through tabular-nums">{formatBRL(p.priceCents)}</span>
      </div>
    ) : (
      <span className="font-semibold tabular-nums">{formatBRL(p.priceCents)}</span>
    );
  const cost = (
    <div className="flex flex-col">
      <span className="tabular-nums">{formatBRL(p.costCents)}</span>
      <span className={`text-xs tabular-nums ${profit < 0 ? "font-semibold text-red-700" : "text-zinc-500"}`}>
        {profit < 0 ? "Prejuízo" : "Lucro"} {formatBRL(Math.abs(profit))} ({margin}%)
      </span>
    </div>
  );
  const actions = (
    <div className="flex gap-2">
      <IconButton label={`Editar ${p.name}`} onClick={onEdit}>
        <Pencil size={16} />
      </IconButton>
      <IconButton label={`Excluir ${p.name}`} danger onClick={onRemove}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  );

  return (
    <li className={`px-5 py-4 sm:px-6 ${p.active ? "" : "bg-paper/60"}`}>
      <div className={`flex flex-col gap-4 text-sm lg:grid ${COLUMNS}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper ring-1 ring-zinc-200/80">
            {p.imageUrl && <ProductImage src={p.imageUrl} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`truncate font-semibold ${p.active ? "" : "text-zinc-500"}`}>{p.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              {p.category?.name ?? "Sem categoria"}
              {!p.active && <Badge tone="neutral">Inativo</Badge>}
            </div>
          </div>
          <div className="lg:hidden">{actions}</div>
        </div>

        {/* No celular e tablet os dados viram uma grade com rótulos */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-paper p-3 sm:grid-cols-4 lg:contents">
          <div className="lg:contents">
            <dt className="mb-0.5 text-xs text-zinc-500 lg:hidden">Preço</dt>
            <dd>{price}</dd>
          </div>
          <div className="lg:contents">
            <dt className="mb-0.5 text-xs text-zinc-500 lg:hidden">Custo</dt>
            <dd>{cost}</dd>
          </div>
          <div className="lg:contents">
            <dt className="mb-0.5 text-xs text-zinc-500 lg:hidden">Estoque</dt>
            <dd>
              <Stock stock={p.stock} />
            </dd>
          </div>
          <div className="lg:contents">
            <dt className="mb-0.5 text-xs text-zinc-500 lg:hidden">Destaque</dt>
            <dd>
              <Highlight launch={p.isLaunch} promo={p.promoPriceCents != null} />
            </dd>
          </div>
        </dl>

        <div className="hidden lg:block">{actions}</div>
      </div>
    </li>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(() => {
    adminApi.get<AdminProduct[]>("/admin/products").then(setProducts).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    adminApi.get<Category[]>("/categories").then(setCategories);
  }, [load]);

  async function remove(p: AdminProduct) {
    const ok = await confirm({
      title: `Excluir ${p.name}?`,
      message: "Se o produto já tiver vendas, ele só será desativado, para manter o histórico dos pedidos.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    try {
      const { archived } = await adminApi.delete<{ archived: boolean }>(`/admin/products/${p.id}`);
      if (archived) toast.info(`${p.name} já tem vendas, então foi desativado em vez de excluído`);
      else toast.success(`${p.name} foi excluído`);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
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
    <div className="flex flex-col gap-4 lg:gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">Produtos</h1>
          <p className="mt-1 text-zinc-500">
            {products ? `${products.length} ${products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}` : "Carregando produtos"}
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>+ Novo produto</Button>
      </header>

      {error && <p className="text-red-700">{error}</p>}
      {!products && !error && <PageLoader label="Carregando produtos" />}
      {products && products.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-zinc-500 ring-1 ring-zinc-200/80">
          Nenhum produto cadastrado ainda. Use “+ Novo produto” para começar.
        </p>
      )}

      {products && products.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(2_49_75/0.04)] ring-1 ring-zinc-200/80">
          <div className={`hidden border-b border-zinc-100 px-6 py-3 text-xs font-medium text-zinc-500 lg:grid ${COLUMNS}`}>
            <span>Produto</span>
            <span>Preço</span>
            <span>Custo</span>
            <span>Estoque</span>
            <span>Destaque</span>
            <span aria-hidden />
          </div>
          <ul className="divide-y divide-zinc-100">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} onEdit={() => setEditing(p)} onRemove={() => remove(p)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
