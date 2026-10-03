import Link from "next/link";
import { Target } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { Card, IconBubble } from "@/components/ui/card";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GoalDonut({ revenueCents, goalCents }: { revenueCents: number; goalCents: number | null }) {
  if (!goalCents) {
    return (
      <Card title="Meta do mês">
        <div className="flex items-start gap-3 text-sm">
          <IconBubble>
            <Target size={18} />
          </IconBubble>
          <p className="text-zinc-500">
            Defina quanto quer faturar no mês para acompanhar o progresso aqui.{" "}
            <Link href="/admin/configuracoes" className="font-medium text-ink underline">
              Definir meta
            </Link>
          </p>
        </div>
      </Card>
    );
  }

  const percent = Math.round((revenueCents / goalCents) * 100);
  const filled = Math.min(percent, 100) / 100;
  const missing = goalCents - revenueCents;

  return (
    <Card title="Meta do mês">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="64" cy="64" r={RADIUS} fill="none" strokeWidth="14" className="stroke-zinc-100" />
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${filled * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            className="stroke-brand transition-[stroke-dasharray] duration-700 motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <p className="font-display text-5xl font-bold leading-none">{percent}%</p>
          <p className="mt-1 text-xs text-zinc-500">da meta</p>
        </div>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2 text-zinc-500">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Faturado
          </dt>
          <dd className="font-semibold">{formatBRL(revenueCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-2 text-zinc-500">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /> {missing > 0 ? "Falta" : "Meta"}
          </dt>
          <dd className="font-semibold">{formatBRL(missing > 0 ? missing : goalCents)}</dd>
        </div>
      </dl>
      {missing <= 0 && <p className="rounded-lg bg-brand/20 px-3 py-2 text-sm font-medium text-brand-dark">Meta batida!</p>}
    </Card>
  );
}
