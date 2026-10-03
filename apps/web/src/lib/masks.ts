import { formatBRL } from "./format";

const onlyDigits = (text: string) => text.replace(/\D/g, "");

/**
 * Máscara de real: os números entram pela direita, como em app de banco
 * ("1" → R$ 0,01, "1500" → R$ 15,00). Sem números, devolve "" (campo em branco).
 */
export function maskMoney(text: string): string {
  const digits = onlyDigits(text);
  if (digits === "") return "";
  // NBSP do Intl vira espaço comum, para o texto ficar igual ao que a pessoa vê e copia
  return formatBRL(Number(digits)).replace(/ /g, " ");
}

/** Máscara de telefone com DDD: (88) 99999-9999 para celular, (88) 9999-9999 para fixo. */
export function maskPhone(text: string): string {
  const d = onlyDigits(text).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  // Com 11 números é celular (5 + 4); até 10, fixo (4 + 4)
  const split = d.length === 11 ? 5 : 4;
  if (rest.length <= split) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
