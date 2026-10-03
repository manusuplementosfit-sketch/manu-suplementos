import { formatBRL } from "@/lib/format";
import { Card } from "@/components/ui/card";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Barras de segunda a domingo; hoje em verde, dias passados em azul suave, futuros quase apagados. */
export function WeekChart({ revenueByDay, today, totalCents }: { revenueByDay: number[]; today: number; totalCents: number }) {
  const max = Math.max(...revenueByDay, 1);

  return (
    <Card
      title="Vendas da semana"
      aside={
        <p className="text-right text-sm text-zinc-500">
          Total <strong className="font-display text-xl font-bold text-ink">{formatBRL(totalCents)}</strong>
        </p>
      }
    >
      <div className="grid h-56 grid-cols-7 items-end gap-1.5 sm:gap-3">
        {revenueByDay.map((cents, i) => {
          const isToday = i === today;
          const isFuture = i > today;
          // Mesmo sem vendas a barra aparece, para o dia não sumir do gráfico
          const height = Math.max((cents / max) * 100, 6);
          return (
            <div key={DAYS[i]} className="group flex h-full flex-col items-center justify-end gap-2">
              <span
                className={`whitespace-nowrap text-xs font-semibold transition-opacity ${
                  isToday ? "text-ink" : "text-zinc-500 opacity-0 group-hover:opacity-100"
                } ${cents === 0 ? "invisible" : ""}`}
              >
                {formatBRL(cents).replace(",00", "")}
              </span>
              <div
                className={`w-full max-w-14 rounded-xl transition-colors ${
                  isToday ? "bg-brand" : isFuture ? "bg-ink/5" : "bg-ink/15 group-hover:bg-ink/30"
                }`}
                style={{ height: `${height}%` }}
                title={`${DAYS[i]}: ${formatBRL(cents)}`}
              />
              <span className={`text-xs ${isToday ? "font-semibold text-ink" : "text-zinc-500"}`}>{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
