import { describe, expect, it } from "vitest";
import {
  applyFreeShipping,
  isFreeShippingEligibleOption,
  pickDefaultShippingOption,
} from "./free-shipping";
import type { MelhorEnvioQuoteOption } from "./melhor-envio";

const sampleOptions: MelhorEnvioQuoteOption[] = [
  { id: 1, name: "PAC", company: "Correios", price: 35.42, deliveryDays: 8 },
  { id: 2, name: "SEDEX", company: "Correios", price: 59.77, deliveryDays: 3 },
  { id: 35, name: "Standard", company: "Total Express", price: 25.21, deliveryDays: 10 },
];

describe("applyFreeShipping", () => {
  it("não altera opções abaixo do threshold", () => {
    const result = applyFreeShipping(sampleOptions, 350, 399);
    expect(result).toEqual(sampleOptions);
  });

  it("acima do mínimo zera só a Total Express e mantém PAC e SEDEX", () => {
    const result = applyFreeShipping(sampleOptions, 450, 399);
    expect(result.map((option) => option.id)).toEqual([1, 2, 35]);
    expect(result.find((option) => option.id === 35)?.price).toBe(0);
    expect(result.find((option) => option.id === 1)?.price).toBe(35.42);
    expect(result.find((option) => option.id === 2)?.price).toBe(59.77);
  });

  it("seleciona a Total Express grátis", () => {
    const result = applyFreeShipping(sampleOptions, 450, 399);
    const selected = pickDefaultShippingOption(result);
    expect(selected?.price).toBe(0);
    expect(selected?.id).toBe(35);
  });

  it("não transforma motoboy em frete grátis", () => {
    const motoboy: MelhorEnvioQuoteOption = {
      id: -3,
      name: "Motoboy",
      company: "Entrega local",
      price: 15,
      deliveryDays: 1,
    };
    expect(applyFreeShipping([motoboy], 428, 399)[0]?.price).toBe(15);
    expect(applyFreeShipping([motoboy], 350, 399)[0]?.price).toBe(15);
  });
});

describe("isFreeShippingEligibleOption", () => {
  it("aceita só Total Express", () => {
    expect(isFreeShippingEligibleOption(sampleOptions[0])).toBe(false);
    expect(
      isFreeShippingEligibleOption({
        id: 17,
        name: "Mini Envios",
        company: "Correios",
        price: 18,
        deliveryDays: 6,
      })
    ).toBe(false);
    expect(isFreeShippingEligibleOption(sampleOptions[2])).toBe(true);
    expect(isFreeShippingEligibleOption(sampleOptions[1])).toBe(false);
  });
});
