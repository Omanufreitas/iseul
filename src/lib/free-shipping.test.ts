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

  it("zera PAC e Total Express acima do threshold, mantém SEDEX pago", () => {
    const result = applyFreeShipping(sampleOptions, 450, 399);
    expect(result.find((o) => o.id === 1)?.price).toBe(0);
    expect(result.find((o) => o.id === 35)?.price).toBe(0);
    expect(result.find((o) => o.id === 2)?.price).toBe(59.77);
  });

  it("seleciona opção grátis mais rápida por padrão", () => {
    const result = applyFreeShipping(sampleOptions, 450, 399);
    const selected = pickDefaultShippingOption(result);
    expect(selected?.price).toBe(0);
    expect(selected?.id).toBe(1);
  });

  it("zera motoboy local acima do threshold", () => {
    const motoboy: MelhorEnvioQuoteOption = {
      id: -3,
      name: "Motoboy",
      company: "Entrega local",
      price: 15,
      deliveryDays: 1,
    };
    expect(applyFreeShipping([motoboy], 428, 399)[0]?.price).toBe(0);
    expect(applyFreeShipping([motoboy], 350, 399)[0]?.price).toBe(15);
  });
});

describe("isFreeShippingEligibleOption", () => {
  it("aceita PAC, Mini Envios e Total Express", () => {
    expect(isFreeShippingEligibleOption(sampleOptions[0])).toBe(true);
    expect(
      isFreeShippingEligibleOption({
        id: 17,
        name: "Mini Envios",
        company: "Correios",
        price: 18,
        deliveryDays: 6,
      })
    ).toBe(true);
    expect(isFreeShippingEligibleOption(sampleOptions[2])).toBe(true);
    expect(isFreeShippingEligibleOption(sampleOptions[1])).toBe(false);
  });
});
