import { Badge } from "@/components/ui/badge";
import { IconBubble } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  icon,
  detail,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  detail?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl p-5 sm:p-6 ${
        highlight
          ? "bg-ink text-white"
          : "bg-white shadow-[0_1px_2px_rgb(2_49_75/0.04)] ring-1 ring-zinc-200/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${highlight ? "text-white/70" : "text-zinc-500"}`}>{label}</p>
        <IconBubble tone={highlight ? "dark" : "light"}>{icon}</IconBubble>
      </div>
      <p className="font-display text-4xl font-bold leading-none tracking-tight sm:text-[2.75rem]">{value}</p>
      {detail && <div className={`text-sm ${highlight ? "text-white/70" : "text-zinc-500"}`}>{detail}</div>}
    </article>
  );
}

/** Seta e percentual de variação; o tom muda conforme o fundo do card. */
export function Change({ value, onDark }: { value: number; onDark?: boolean }) {
  const up = value >= 0;
  const text = `${up ? "↑" : "↓"} ${Math.abs(value)}%`;
  if (!onDark) return <Badge tone={up ? "positive" : "neutral"}>{text}</Badge>;
  // Sobre o azul-marinho os tons claros somem, então o selo usa cores cheias
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-brand text-on-brand" : "bg-white/15 text-white"
      }`}
    >
      {text}
    </span>
  );
}
