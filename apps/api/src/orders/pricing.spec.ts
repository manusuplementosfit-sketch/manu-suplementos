import { OrderPricingError, effectivePrice, priceOrder, PricedProduct } from './pricing';

const whey: PricedProduct = {
  id: 'whey', name: 'Whey', priceCents: 15000, costCents: 9000,
  promoPriceCents: 12000, stock: 5, active: true,
};
const creatina: PricedProduct = {
  id: 'creat', name: 'Creatina', priceCents: 8000, costCents: 4000,
  promoPriceCents: null, stock: 2, active: true,
};

describe('effectivePrice', () => {
  it('usa o preço promocional quando menor', () => {
    expect(effectivePrice(whey)).toBe(12000);
    expect(effectivePrice(creatina)).toBe(8000);
    expect(effectivePrice({ ...creatina, promoPriceCents: 9000 })).toBe(8000);
  });
});

describe('priceOrder', () => {
  it('calcula linhas, subtotal e total com taxa', () => {
    const r = priceOrder([whey, creatina], [
      { productId: 'whey', quantity: 2 },
      { productId: 'creat', quantity: 1 },
    ], 1000);
    expect(r.lines).toEqual([
      { productId: 'whey', productName: 'Whey', unitPriceCents: 12000, unitCostCents: 9000, quantity: 2 },
      { productId: 'creat', productName: 'Creatina', unitPriceCents: 8000, unitCostCents: 4000, quantity: 1 },
    ]);
    expect(r.subtotalCents).toBe(32000);
    expect(r.totalCents).toBe(33000);
  });

  it('junta itens repetidos', () => {
    const r = priceOrder([creatina], [
      { productId: 'creat', quantity: 1 },
      { productId: 'creat', quantity: 1 },
    ], 0);
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].quantity).toBe(2);
  });

  it('rejeita carrinho vazio, produto inexistente, inativo e sem estoque', () => {
    expect(() => priceOrder([whey], [], 0)).toThrow(OrderPricingError);
    expect(() => priceOrder([whey], [{ productId: 'x', quantity: 1 }], 0)).toThrow(OrderPricingError);
    expect(() => priceOrder([{ ...whey, active: false }], [{ productId: 'whey', quantity: 1 }], 0)).toThrow(OrderPricingError);
    expect(() => priceOrder([creatina], [{ productId: 'creat', quantity: 3 }], 0)).toThrow(/Creatina/);
  });
});
