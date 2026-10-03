// Brasil não tem horário de verão desde 2019: São Paulo é sempre UTC-3.
const SP_OFFSET_MS = 3 * 60 * 60 * 1000;

function toSP(now: Date): Date {
  return new Date(now.getTime() - SP_OFFSET_MS);
}

/** Segunda-feira 00:00 (horário de São Paulo) da semana atual. */
export function startOfWeekSP(now: Date): Date {
  const sp = toSP(now);
  const daysSinceMonday = (sp.getUTCDay() + 6) % 7;
  return new Date(
    Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), sp.getUTCDate() - daysSinceMonday) + SP_OFFSET_MS,
  );
}

/** Dia 1 00:00 (horário de São Paulo) do mês atual. */
export function startOfMonthSP(now: Date): Date {
  const sp = toSP(now);
  return new Date(Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), 1) + SP_OFFSET_MS);
}

interface SummarizableOrder {
  items: { unitPriceCents: number; unitCostCents: number; quantity: number }[];
}

/** Vendas e lucro dos itens (a taxa de entrega fica de fora). */
export function summarizeOrders(orders: SummarizableOrder[]) {
  let revenueCents = 0;
  let profitCents = 0;
  for (const order of orders) {
    for (const item of order.items) {
      revenueCents += item.unitPriceCents * item.quantity;
      profitCents += (item.unitPriceCents - item.unitCostCents) * item.quantity;
    }
  }
  return { count: orders.length, revenueCents, profitCents };
}
