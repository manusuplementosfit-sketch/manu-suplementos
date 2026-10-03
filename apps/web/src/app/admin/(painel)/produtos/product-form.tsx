"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, MoneyInput, RequiredNote, TextInput } from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
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
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const priceCents = parseBRL(price);
  const costCents = parseBRL(cost);
  const promoCents = onSale ? parseBRL(promoPrice) : null;
  const sellingAt = promoCents ?? priceCents;
  const margin = sellingAt != null && costCents != null ? sellingAt - costCents : null;
  const marginPercent = margin != null && sellingAt ? Math.round((margin / sellingAt) * 100) : null;

  // Prévia da foto escolhida (o endereço temporário é liberado ao trocar ou sair)
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  const shownImage = preview ?? product?.imageUrl ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceCents) return toast.error("Preço de venda inválido");
    if (costCents == null) return toast.error("Preço de custo inválido");
    if (onSale && (!promoCents || promoCents >= priceCents)) {
      return toast.error("O preço promocional precisa ser menor que o preço de venda");
    }
    const stockNumber = Number(stock);
    if (!Number.isInteger(stockNumber) || stockNumber < 0) return toast.error("Estoque inválido");

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
        try {
          await adminApi.post(`/admin/products/${saved.id}/image`, form);
        } catch (err) {
          // O produto já foi salvo: avisa da foto e volta para a lista em vez de duplicar o cadastro
          toast.error(`${saved.name} foi salvo, mas a foto não foi enviada: ${(err as Error).message}`);
          return onDone();
        }
      }
      toast.success(product ? `${saved.name} foi atualizado` : `${saved.name} foi criado`);
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  }

  const saveButton = (
    <Button disabled={saving}>{saving ? "Salvando…" : "Salvar produto"}</Button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 lg:gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">{product ? "Editar produto" : "Novo produto"}</h1>
          <p className="mt-1 text-zinc-500">
            {product ? "Altere os dados e salve para atualizar a loja." : "Preencha os dados para colocar o produto na loja."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button type="button" variant="ghost" onClick={onDone}>
            Voltar
          </Button>
          {saveButton}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div>
            <Card title="Informações">
              <Field label="Nome" required>
                <TextInput required minLength={2} placeholder="Ex.: Whey Protein 900g Chocolate" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Descrição" hint="Aparece na página do produto na loja.">
                <textarea className="input h-auto min-h-36 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoria" htmlFor="product-category">
                  <Select
                    id="product-category"
                    value={categoryId}
                    onChange={setCategoryId}
                    options={[{ value: "", label: "Sem categoria" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                  />
                </Field>
                <Field label="Estoque (unidades)" required>
                  <TextInput type="number" min={0} step={1} required value={stock} onChange={(e) => setStock(e.target.value)} />
                </Field>
              </div>
            </Card>
          </div>

          {/* Estica até o fim para as duas colunas terminarem juntas */}
          <div className="flex-1">
            <Card title="Na loja">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ink" checked={isLaunch} onChange={(e) => setIsLaunch(e.target.checked)} />
                <span>
                  <span className="font-medium">Mostrar em Lançamentos</span>
                  <span className="block text-zinc-500">Ganha o selo de lançamento na vitrine.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ink" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <span>
                  <span className="font-medium">Ativo</span>
                  <span className="block text-zinc-500">Desmarque para esconder o produto da loja sem apagar.</span>
                </span>
              </label>
            </Card>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div>
            <Card title="Preço">
              <Field label="Preço de venda (R$)" required>
                <MoneyInput className="w-full" required placeholder="R$ 149,90" value={price} onValueChange={setPrice} />
              </Field>
              <Field label="Preço de custo (R$)" required hint="Só você vê. Usado para calcular o lucro.">
                <MoneyInput className="w-full" required placeholder="R$ 90,00" value={cost} onValueChange={setCost} />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="h-4 w-4 accent-ink" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
                Colocar em promoção
              </label>
              {onSale && (
                <Field label="Preço promocional (R$)" required>
                  <MoneyInput className="w-full" required value={promoPrice} onValueChange={setPromoPrice} />
                </Field>
              )}
              {margin != null && (
                <div className={`flex items-baseline justify-between rounded-xl p-4 text-sm ${margin < 0 ? "bg-red-50 text-red-800" : "bg-paper"}`}>
                  <span>{margin < 0 ? "Prejuízo por unidade" : "Lucro por unidade"}</span>
                  <span>
                    <strong className="font-display text-2xl">{formatBRL(Math.abs(margin))}</strong>
                    {marginPercent != null && <span className="ml-1 text-zinc-500">({marginPercent}%)</span>}
                  </span>
                </div>
              )}
            </Card>
          </div>

          {/* A foto ocupa o espaço que sobra na coluna: grande sem promoção, compacta quando
              o campo de preço promocional aparece e a coluna de preço cresce */}
          <div className="flex-1">
            <Card title="Foto">
              <ImagePicker
                noun="foto"
                image={shownImage}
                fileName={image?.name}
                accept="image/jpeg,image/png,image/webp"
                formats="JPG, PNG ou WEBP, até 4 MB."
                compact={onSale}
                onFile={setImage}
              />
            </Card>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <RequiredNote />
        {saveButton}
      </div>
    </form>
  );
}
