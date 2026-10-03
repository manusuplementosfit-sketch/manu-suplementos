"use client";

export function QuantityInput({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const button = "h-9 w-9 grid place-items-center text-lg font-semibold disabled:opacity-30 hover:bg-zinc-100";
  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white">
      <button type="button" className={button} aria-label="Diminuir" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="w-8 text-center tabular-nums">{value}</span>
      <button type="button" className={button} aria-label="Aumentar" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
