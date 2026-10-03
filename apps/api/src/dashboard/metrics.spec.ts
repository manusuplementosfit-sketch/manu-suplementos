import { startOfMonthSP, startOfWeekSP, summarizeOrders } from './metrics';

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
