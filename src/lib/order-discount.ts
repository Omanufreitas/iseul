export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

type PricedItem = {
  unit_price: number;
  quantity: number;
};

/** Soma dos itens (preço cheio da linha, sem cupom). */
export function itemsMerchandiseTotal(items: PricedItem[]) {
  return roundMoney(
    items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0),
  );
}

/**
 * Rateia o cupom nos itens pra NF-e/Asaas bater com o que o cliente pagou.
 * O último item absorve o centavo de arredondamento.
 */
export function applyOrderDiscountToUnitPrices(items: PricedItem[], discount: number): number[] {
  if (items.length === 0) return [];

  const listed = itemsMerchandiseTotal(items);
  const off = roundMoney(Math.max(0, Number(discount) || 0));
  if (off <= 0 || listed <= 0) {
    return items.map((item) => roundMoney(Number(item.unit_price)));
  }

  const target = roundMoney(Math.max(0, listed - off));
  const prices: number[] = [];
  let allocated = 0;

  for (let i = 0; i < items.length; i++) {
    const qty = Math.max(1, Number(items[i].quantity) || 1);
    if (i === items.length - 1) {
      const remaining = roundMoney(target - allocated);
      prices.push(roundMoney(remaining / qty));
      continue;
    }

    const lineShare = (Number(items[i].unit_price) * qty) / listed;
    const line = roundMoney(target * lineShare);
    allocated = roundMoney(allocated + line);
    prices.push(roundMoney(line / qty));
  }

  return prices;
}

/** Valor dos produtos que o cliente pagou de verdade (total do pedido menos frete). */
export function chargedMerchandiseTotal(orderTotal: number, shipping: number) {
  return roundMoney(Math.max(0, Number(orderTotal) - Number(shipping || 0)));
}
