"use client";

export function QuantityInput({
  value,
  max,
  onChange,
  min = 1,
  label = "Quantidade",
  variant = "box",
  className = "",
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** Menor valor aceito (0 no card da loja, onde 0 = fora do carrinho) */
  min?: number;
  /** Nome lido por leitores de tela, ex.: "Quantidade de Creatina no carrinho" */
  label?: string;
  /** "box": com borda (cards da loja); "pill": compacto e arredondado (carrinho) */
  variant?: "box" | "pill";
  className?: string;
}) {
  const pill = variant === "pill";
  const button = pill
    ? "h-8 w-8 grid place-items-center rounded-full text-base font-semibold disabled:opacity-30 hover:bg-white"
    : "h-9 w-9 grid place-items-center text-lg font-semibold disabled:opacity-30 hover:bg-zinc-100";
  const box = pill ? "rounded-full bg-paper p-0.5" : "rounded-lg border border-zinc-300 bg-white";
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center justify-between ${box} ${className}`}>
      <button type="button" className={button} aria-label="Diminuir" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className={`text-center font-semibold tabular-nums ${pill ? "w-7 text-sm" : "w-8"}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={button} aria-label="Aumentar" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
