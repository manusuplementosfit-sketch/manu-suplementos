"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatBRL } from "@/lib/format";

interface Summary {
  count: number;
  revenueCents: number;
  profitCents: number;
}

interface Dashboard {
  week: Summary;
  month: Summary;
  pending: { total: number; pix: number; cartao: number; awaitingReceipt: number };
}

function Tile({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ring-1 ${highlight ? "bg-ink text-white ring-ink" : "bg-white ring-zinc-200"}`}>
      <p className={`text-sm ${highlight ? "text-zinc-300" : "text-zinc-500"}`}>{label}</p>
      <p className={`mt-1 font-display text-4xl font-bold ${highlight ? "text-brand" : ""}`}>{value}</p>
      {hint && <p className={`mt-1 text-sm ${highlight ? "text-zinc-300" : "text-zinc-500"}`}>{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get<Dashboard>("/admin/dashboard").then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className="text-zinc-500">Carregando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-bold uppercase">Dashboard</h1>

      <section>
        <h2 className="mb-3 font-semibold text-zinc-600">Pedidos pendentes</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile
            highlight
            label="Aguardando você"
            value={String(data.pending.total)}
            hint={`${data.pending.pix} Pix · ${data.pending.cartao} cartão`}
          />
          <Tile label="Pix aguardando comprovante" value={String(data.pending.awaitingReceipt)} hint="O cliente ainda não enviou" />
          <div className="flex items-center rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
            <Link href="/admin/pedidos" className="btn-primary w-full">Ver pedidos</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-zinc-600">Esta semana (segunda a domingo)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Vendas finalizadas" value={String(data.week.count)} />
          <Tile label="Faturamento" value={formatBRL(data.week.revenueCents)} hint="Sem taxa de entrega" />
          <Tile label="Lucro semanal" value={formatBRL(data.week.profitCents)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-zinc-600">Este mês</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Vendas finalizadas" value={String(data.month.count)} />
          <Tile label="Faturamento" value={formatBRL(data.month.revenueCents)} hint="Sem taxa de entrega" />
          <Tile label="Lucro mensal" value={formatBRL(data.month.profitCents)} />
        </div>
      </section>
    </div>
  );
}
