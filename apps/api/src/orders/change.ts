/**
 * Regra do "troco para quanto?": opcional, só no pagamento em dinheiro e maior que o total.
 * Devolve a mensagem de erro, ou null se estiver tudo certo.
 */
export function changeProblem(paymentMethod: string, changeForCents: number | null | undefined, totalCents: number): string | null {
  if (changeForCents == null) return null;
  if (paymentMethod !== 'DINHEIRO') return 'Troco só vale para pagamento em dinheiro';
  if (changeForCents <= totalCents) return 'O valor para troco precisa ser maior que o total do pedido';
  return null;
}
