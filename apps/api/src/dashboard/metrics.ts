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

const DAY_MS = 24 * 60 * 60 * 1000;

/** O mesmo dia e hora no mês anterior (ou o último dia dele, se for mais curto). */
export function samePointLastMonthSP(now: Date): Date {
  const sp = toSP(now);
  const year = sp.getUTCFullYear();
  const month = sp.getUTCMonth() - 1;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(sp.getUTCDate(), lastDay);
  const timeOfDay = sp.getTime() - Date.UTC(year, sp.getUTCMonth(), sp.getUTCDate());
  return new Date(Date.UTC(year, month, day) + timeOfDay + SP_OFFSET_MS);
}

/** Faturamento de cada dia da semana, de segunda (0) a domingo (6). */
export function revenueByWeekday(
  orders: (SummarizableOrder & { finalizedAt: Date | null })[],
  weekStart: Date,
): number[] {
  const days = [0, 0, 0, 0, 0, 0, 0];
  for (const order of orders) {
    const index = Math.floor((order.finalizedAt!.getTime() - weekStart.getTime()) / DAY_MS);
    if (index < 0 || index > 6) continue;
    days[index] += summarizeOrders([order]).revenueCents;
  }
  return days;
}

/** Variação percentual arredondada; null quando não há base para comparar. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

interface RankableItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

/** Produtos mais vendidos (por quantidade) entre os itens informados. */
export function rankProducts(items: RankableItem[], limit: number) {
  const byProduct = new Map<string, { productId: string; productName: string; quantity: number; revenueCents: number }>();
  for (const item of items) {
    const entry = byProduct.get(item.productId) ?? {
      productId: item.productId,
      productName: item.productName,
      quantity: 0,
      revenueCents: 0,
    };
    entry.quantity += item.quantity;
    entry.revenueCents += item.unitPriceCents * item.quantity;
    byProduct.set(item.productId, entry);
  }
  return [...byProduct.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}
