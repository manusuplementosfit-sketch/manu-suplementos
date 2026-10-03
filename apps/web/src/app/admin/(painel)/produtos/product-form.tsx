"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api";
import { centsToInput, formatBRL, parseBRL } from "@/lib/format";
import { AdminProduct, Category } from "@/lib/types";

export function ProductForm({
  product,
  categories,
  onDone,
}: {
  product: AdminProduct | null;
  categories: Category[];
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(centsToInput(product?.priceCents));
  const [cost, setCost] = useState(centsToInput(product?.costCents));
  const [onSale, setOnSale] = useState(product?.promoPriceCents != null);
  const [promoPrice, setPromoPrice] = useState(centsToInput(product?.promoPriceCents));
  const [isLaunch, setIsLaunch] = useState(product?.isLaunch ?? false);
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [active, setActive] = useState(product?.active ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const priceCents = parseBRL(price);
  const costCents = parseBRL(cost);
  const promoCents = onSale ? parseBRL(promoPrice) : null;
  const sellingAt = promoCents ?? priceCents;
  const margin = sellingAt != null && costCents != null ? sellingAt - costCents : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!priceCents) return setError("Preço de venda inválido");
    if (costCents == null) return setError("Preço de custo inválido");
    if (onSale && (!promoCents || promoCents >= priceCents)) {
      return setError("O preço promocional precisa ser menor que o preço de venda");
    }
    const stockNumber = Number(stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) return setError("Estoque inválido");

    setSaving(true);
    try {
      const body = {
        name,
        description,
        categoryId: categoryId || null,
        priceCents,
        costCents,
        promoPriceCents: onSale ? promoCents : null,
        isLaunch,
        stock: stockNumber,
        active,
      };
      const saved = product
        ? await adminApi.put<AdminProduct>(`/admin/products/${product.id}`, body)
        : await adminApi.post<AdminProduct>("/admin/products", body);
      if (image) {
        const form = new FormData();
        form.append("file", image);
        await adminApi.post(`/admin/products/${saved.id}/image`, form);
      }
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold uppercase">{product ? "Editar produto" : "Novo produto"}</h1>
        <button type="button" className="btn-ghost" onClick={onDone}>
          Voltar
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nome
          <input className="input" required minLength={2} placeholder="Ex.: Whey Protein 900g Chocolate" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Descrição
          <textarea className="input h-auto min-h-24 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Categoria
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Estoque (unidades)
            <input className="input" type="number" min={0} step={1} required value={stock} onChange={(e) => setStock(e.target.value)} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Foto
          {product?.imageUrl && !image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:font-medium"
          />
        </label>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Preço de venda (R$)
            <input className="input" inputMode="decimal" required placeholder="149,90" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Preço de custo (R$)
            <input className="input" inputMode="decimal" required placeholder="90,00" value={cost} onChange={(e) => setCost(e.target.value)} />
            <span className="font-normal text-zinc-500">Só você vê. Usado para calcular o lucro.</span>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-ink" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
          Colocar em promoção
        </label>
        {onSale && (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Preço promocional (R$)
            <input className="input sm:w-1/2" inputMode="decimal" required value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} />
          </label>
        )}
        {margin != null && (
          <p className={`text-sm ${margin < 0 ? "text-red-700" : "text-zinc-600"}`}>
            Lucro por unidade: <strong>{formatBRL(margin)}</strong>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-ink" checked={isLaunch} onChange={(e) => setIsLaunch(e.target.checked)} />
          Mostrar em Lançamentos
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-ink" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Ativo (visível na loja)
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn-primary w-fit" disabled={saving}>
        {saving ? "Salvando…" : "Salvar produto"}
      </button>
    </form>
  );
}
