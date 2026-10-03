export interface PricedProduct {
  id: string;
  name: string;
  priceCents: number;
  costCents: number;
  promoPriceCents: number | null;
  stock: number;
  active: boolean;
}

export interface RequestedItem {
  productId: string;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  productName: string;
  unitPriceCents: number;
  unitCostCents: number;
  quantity: number;
}

export class OrderPricingError extends Error {}

export function effectivePrice(p: Pick<PricedProduct, 'priceCents' | 'promoPriceCents'>): number {
  return p.promoPriceCents != null && p.promoPriceCents < p.priceCents ? p.promoPriceCents : p.priceCents;
}

export function priceOrder(products: PricedProduct[], items: RequestedItem[], deliveryFeeCents: number) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new OrderPricingError('Quantidade inválida');
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  if (quantities.size === 0) throw new OrderPricingError('O carrinho está vazio');

  const lines: PricedLine[] = [];
  for (const [productId, quantity] of quantities) {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.active) {
      throw new OrderPricingError('Um dos produtos do carrinho não está mais disponível');
    }
    if (quantity > product.stock) {
      throw new OrderPricingError(
        product.stock === 0
          ? `${product.name} está esgotado`
          : `${product.name}: só temos ${product.stock} em estoque`,
      );
    }
    lines.push({
      productId,
      productName: product.name,
      unitPriceCents: effectivePrice(product),
      unitCostCents: product.costCents,
      quantity,
    });
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  return { lines, subtotalCents, totalCents: subtotalCents + deliveryFeeCents };
}
