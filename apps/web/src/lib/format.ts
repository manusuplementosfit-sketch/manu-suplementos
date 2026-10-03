const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** Converte "1.299,90", "149,9", "5.000" ou "80" em centavos. Retorna null se inválido. */
export function parseBRL(text: string): number | null {
  let clean = text.replace(/[R$\s]/g, "");
  if (clean === "") return null;
  if (clean.includes(",")) clean = clean.replace(/\./g, "").replace(",", ".");
  // Sem vírgula, "5.000" e "1.250.000" são milhar (jeito brasileiro), não decimal
  else if (/^\d{1,3}(\.\d{3})+$/.test(clean)) clean = clean.replace(/\./g, "");
  const value = Number(clean);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}

export function centsToInput(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
