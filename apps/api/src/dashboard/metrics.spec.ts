import {
  percentChange,
  rankProducts,
  revenueByWeekday,
  samePointLastMonthSP,
  startOfMonthSP,
  startOfWeekSP,
  summarizeOrders,
} from './metrics';

describe('períodos no fuso de São Paulo', () => {
  it('semana começa na segunda 00:00 (-03:00)', () => {
    // quarta, 2026-10-07 15:00 em SP
    const now = new Date('2026-10-07T18:00:00Z');
    expect(startOfWeekSP(now).toISOString()).toBe('2026-10-05T03:00:00.000Z');
  });

  it('domingo à noite ainda pertence à semana iniciada na segunda anterior', () => {
    // domingo, 2026-10-11 22:00 em SP = segunda 01:00 UTC
    const now = new Date('2026-10-12T01:00:00Z');
    expect(startOfWeekSP(now).toISOString()).toBe('2026-10-05T03:00:00.000Z');
  });

  it('mês começa no dia 1 00:00 (-03:00)', () => {
    const now = new Date('2026-11-01T01:00:00Z'); // ainda 31/10 em SP
    expect(startOfMonthSP(now).toISOString()).toBe('2026-10-01T03:00:00.000Z');
  });
});

describe('summarizeOrders', () => {
  it('soma vendas e lucro sem a taxa de entrega', () => {
    const s = summarizeOrders([
      { items: [{ unitPriceCents: 12000, unitCostCents: 9000, quantity: 2 }] },
      { items: [{ unitPriceCents: 8000, unitCostCents: 4000, quantity: 1 }] },
    ]);
    expect(s).toEqual({ count: 2, revenueCents: 32000, profitCents: 10000 });
  });
});

describe('samePointLastMonthSP', () => {
  it('mesmo momento do mês anterior', () => {
    const now = new Date('2026-10-15T18:00:00Z');
    expect(samePointLastMonthSP(now).toISOString()).toBe('2026-09-15T18:00:00.000Z');
  });

  it('limita ao último dia quando o mês anterior é mais curto', () => {
    const now = new Date('2026-03-31T15:00:00Z'); // 31/03 12:00 em SP
    expect(samePointLastMonthSP(now).toISOString()).toBe('2026-02-28T15:00:00.000Z');
  });
});

describe('revenueByWeekday', () => {
  it('distribui o faturamento de segunda (0) a domingo (6) no horário de SP', () => {
    const weekStart = new Date('2026-10-05T03:00:00Z'); // segunda
    const item = (cents: number) => [{ unitPriceCents: cents, unitCostCents: 0, quantity: 1 }];
    const days = revenueByWeekday(
      [
        { finalizedAt: new Date('2026-10-05T03:00:00Z'), items: item(1000) }, // seg 00:00
        { finalizedAt: new Date('2026-10-06T02:59:00Z'), items: item(500) }, // seg 23:59
        { finalizedAt: new Date('2026-10-12T02:00:00Z'), items: item(700) }, // dom 23:00
      ],
      weekStart,
    );
    expect(days).toEqual([1500, 0, 0, 0, 0, 0, 700]);
  });
});

describe('percentChange', () => {
  it('calcula a variação arredondada', () => {
    expect(percentChange(11200, 10000)).toBe(12);
    expect(percentChange(5000, 10000)).toBe(-50);
  });

  it('sem base de comparação devolve null', () => {
    expect(percentChange(5000, 0)).toBeNull();
  });
});

describe('rankProducts', () => {
  it('soma quantidades por produto e ordena do mais vendido', () => {
    const ranked = rankProducts(
      [
        { productId: 'a', productName: 'Creatina', quantity: 2, unitPriceCents: 1000 },
        { productId: 'b', productName: 'Whey', quantity: 5, unitPriceCents: 2000 },
        { productId: 'a', productName: 'Creatina', quantity: 4, unitPriceCents: 1000 },
        { productId: 'c', productName: 'Barra', quantity: 1, unitPriceCents: 500 },
      ],
      2,
    );
    expect(ranked).toEqual([
      { productId: 'a', productName: 'Creatina', quantity: 6, revenueCents: 6000 },
      { productId: 'b', productName: 'Whey', quantity: 5, revenueCents: 10000 },
    ]);
  });
});
