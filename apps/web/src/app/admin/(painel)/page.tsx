"use client";

import { useEffect, useState } from "react";
import { CircleDollarSign, Clock, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { adminApi } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { Dashboard } from "./_components/dashboard-types";
import { GoalDonut } from "./_components/goal-donut";
import { RecentOrders, TopProducts } from "./_components/lists";
import { Change, MetricCard } from "./_components/metric-card";
import { WeekChart } from "./_components/week-chart";

// Um único espaçamento para a página inteira: entre seções e entre cards
const GAP = "gap-4 lg:gap-6";

/** Índice de hoje na semana (segunda = 0) no horário de São Paulo. */
function todayIndexSP(): number {
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Sao_Paulo" });
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get<Dashboard>("/admin/dashboard").then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <PageLoader />;

  const { month, pending } = data;
  const margin = month.revenueCents > 0 ? Math.round((month.profitCents / month.revenueCents) * 100) : null;

  return (
    <div className={`mx-auto flex w-full max-w-7xl flex-col ${GAP}`}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase sm:text-5xl">Dash da Manu</h1>
          <p className="mt-1 text-zinc-500">Suas vendas, seu lucro e os pedidos que esperam por você, tudo num só lugar.</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <ButtonLink href="/admin/pedidos" variant="ghost">
            Ver pedidos
          </ButtonLink>
          <ButtonLink href="/admin/produtos">Ir para produtos</ButtonLink>
        </div>
      </header>

      <div className={`grid ${GAP} sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          highlight
          label="Faturamento do mês"
          value={formatBRL(month.revenueCents)}
          icon={<TrendingUp size={18} />}
          detail={
            data.monthRevenueChange === null ? (
              "Sem vendas no mês passado para comparar"
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                <Change value={data.monthRevenueChange} onDark /> em relação ao mês passado
              </span>
            )
          }
        />
        <MetricCard
          label="Lucro do mês"
          value={formatBRL(month.profitCents)}
          icon={<CircleDollarSign size={18} />}
          detail={margin === null ? "Sem taxa de entrega" : `Margem de ${margin}% sobre o faturamento`}
        />
        <MetricCard
          label="Vendas finalizadas"
          value={String(month.count)}
          icon={<ShoppingBag size={18} />}
          detail={`${data.week.count} nesta semana`}
        />
        <MetricCard
          label="Aguardando você"
          value={String(pending.total)}
          icon={<Clock size={18} />}
          detail={
            pending.total === 0 ? (
              "Tudo em dia"
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone="positive">{pending.pix} Pix</Badge>
                <Badge tone="attention">{pending.cartao} cartão</Badge>
              </span>
            )
          }
        />
      </div>

      <WeekChart revenueByDay={data.weekRevenueByDay} today={todayIndexSP()} totalCents={data.week.revenueCents} />

      {/* Colunas de largura fixa (1/3 cada): o conteúdo não altera a largura dos cards */}
      <div className={`grid ${GAP} md:grid-cols-2 lg:grid-cols-3`}>
        <RecentOrders orders={data.recentOrders} />
        <TopProducts products={data.topProducts} />
        <div className="md:col-span-2 lg:col-span-1">
          <GoalDonut revenueCents={month.revenueCents} goalCents={data.monthGoalCents} />
        </div>
      </div>
    </div>
  );
}
