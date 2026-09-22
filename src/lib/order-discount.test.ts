import { describe, expect, it } from "vitest";
import {
  applyOrderDiscountToUnitPrices,
  chargedMerchandiseTotal,
  itemsMerchandiseTotal,
} from "./order-discount";

describe("applyOrderDiscountToUnitPrices", () => {
  it("aplica 20% num item de R$ 180", () => {
    const prices = applyOrderDiscountToUnitPrices([{ unit_price: 180, quantity: 1 }], 36);
    expect(prices).toEqual([144]);
  });

  it("rateia o cupom em dois itens e fecha o total pago", () => {
    const items = [
      { unit_price: 100, quantity: 1 },
      { unit_price: 80, quantity: 1 },
    ];
    const prices = applyOrderDiscountToUnitPrices(items, 36);
    const charged = prices[0] + prices[1];
    expect(charged).toBe(144);
    expect(prices[0]).toBe(80);
    expect(prices[1]).toBe(64);
  });

  it("não mexe no preço sem cupom", () => {
    expect(applyOrderDiscountToUnitPrices([{ unit_price: 180, quantity: 1 }], 0)).toEqual([180]);
  });

  it("fecha centavos no último item", () => {
    const items = [
      { unit_price: 99.9, quantity: 1 },
      { unit_price: 49.9, quantity: 1 },
    ];
    const discount = 29.96;
    const prices = applyOrderDiscountToUnitPrices(items, discount);
    const charged = Math.round((prices[0] + prices[1]) * 100) / 100;
    expect(charged).toBe(itemsMerchandiseTotal(items) - discount);
  });
});

describe("chargedMerchandiseTotal", () => {
  it("tira o frete do total pago", () => {
    expect(chargedMerchandiseTotal(164, 20)).toBe(144);
  });
});
