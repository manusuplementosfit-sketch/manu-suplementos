"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { centsToInput, parseBRL } from "@/lib/format";
import { Category } from "@/lib/types";

interface Settings {
  pixKey: string;
  pixMerchantName: string;
  pixCity: string;
  deliveryFeeCents: number;
}

function CategoriesEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = () => adminApi.get<Category[]>("/categories").then(setCategories);
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await adminApi.post("/admin/categories", { name });
      setName("");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
      <h2 className="font-display text-xl font-bold uppercase">Categorias</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 py-1 pl-3 pr-1 text-sm">
            {c.name}
            <button
              aria-label={`Remover ${c.name}`}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-zinc-300"
              onClick={async () => {
                if (confirm(`Remover a categoria ${c.name}? Os produtos ficarão sem categoria.`)) {
                  await adminApi.delete(`/admin/categories/${c.id}`);
                  load();
                }
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={add} className="flex gap-2">
        <input className="input" placeholder="Nova categoria" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="btn-dark shrink-0">Adicionar</button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [fee, setFee] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get<Settings>("/admin/settings").then((s) => {
      setForm(s);
      setFee(centsToInput(s.deliveryFeeCents));
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setMessage("");
    setError("");
    const deliveryFeeCents = fee.trim() === "" ? 0 : parseBRL(fee);
    if (deliveryFeeCents == null) return setError("Taxa de entrega inválida");
    try {
      await adminApi.put("/admin/settings", { ...form, deliveryFeeCents });
      setMessage("Configurações salvas.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!form) return <p className="text-zinc-500">Carregando…</p>;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-4xl font-bold uppercase">Configurações</h1>

      <form onSubmit={save} className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="font-display text-xl font-bold uppercase">Pix e entrega</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Chave Pix
          <input
            className="input"
            placeholder="CPF, CNPJ, e-mail, telefone (+55...) ou chave aleatória"
            value={form.pixKey}
            onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
          />
          <span className="font-normal text-zinc-500">Sem chave, a opção Pix fica indisponível na loja.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nome do recebedor
            <input className="input" maxLength={25} value={form.pixMerchantName} onChange={(e) => setForm({ ...form, pixMerchantName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Cidade
            <input className="input" maxLength={15} value={form.pixCity} onChange={(e) => setForm({ ...form, pixCity: e.target.value })} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Taxa de entrega (R$)
          <input className="input w-40" inputMode="decimal" placeholder="0,00" value={fee} onChange={(e) => setFee(e.target.value)} />
        </label>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-fit">Salvar</button>
      </form>

      <CategoriesEditor />
    </div>
  );
}
