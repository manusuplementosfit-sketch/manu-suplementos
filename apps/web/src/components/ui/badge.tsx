// Tons derivados da paleta do site: verde (brand) para positivo, azul (ink) para o que pede atenção
export type BadgeTone = "positive" | "attention" | "subtle" | "neutral" | "danger";

const TONE: Record<BadgeTone, string> = {
  positive: "bg-brand/20 text-brand-dark",
  attention: "bg-ink/10 text-ink",
  subtle: "bg-ink/5 text-ink/70",
  neutral: "bg-zinc-100 text-zinc-500",
  // Só para problemas (esgotado, prejuízo): o vermelho fica fora da paleta de propósito
  danger: "bg-red-50 text-red-700",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[tone]}`}>
      {children}
    </span>
  );
}
