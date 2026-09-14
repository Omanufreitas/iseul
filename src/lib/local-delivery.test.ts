import { describe, expect, it } from "vitest";
import {
  buildLocalMotoboyOption,
  isCampoGrandeMsDelivery,
  isLocalMotoboyDelivery,
  LOCAL_MOTOBOY_OPTION_ID,
  LOCAL_MOTOBOY_PRICE,
} from "./local-delivery";

describe("isCampoGrandeMsDelivery", () => {
  it("reconhece Campo Grande/MS pelo nome da cidade", () => {
    expect(
      isCampoGrandeMsDelivery({ city: "Campo Grande", state: "MS" })
    ).toBe(true);
  });

  it("reconhece CEP 790 de Campo Grande", () => {
    expect(isCampoGrandeMsDelivery({ cep: "79072-266" })).toBe(true);
  });

  it("não marca outra cidade de MS", () => {
    expect(isCampoGrandeMsDelivery({ city: "Dourados", state: "MS" })).toBe(false);
  });

  it("não marca CEP de outro estado", () => {
    expect(isCampoGrandeMsDelivery({ cep: "01311-000", city: "São Paulo", state: "SP" })).toBe(
      false
    );
  });
});

describe("motoboy option", () => {
  it("cobra R$ 15 e usa id reservado", () => {
    const option = buildLocalMotoboyOption();
    expect(option.id).toBe(LOCAL_MOTOBOY_OPTION_ID);
    expect(option.price).toBe(LOCAL_MOTOBOY_PRICE);
    expect(option.company).toBe("Entrega local");
  });

  it("identifica pedido de motoboy pelo service id", () => {
    expect(isLocalMotoboyDelivery(LOCAL_MOTOBOY_OPTION_ID)).toBe(true);
    expect(isLocalMotoboyDelivery(1, "PAC")).toBe(false);
  });
});
