import { describe, expect, it } from "vitest";
import { hasPixAdvantage, pixUnitPrice, cardUnitPrice } from "@/lib/pricing";

describe("hasPixAdvantage", () => {
  it("retorna true quando Pix é menor que cartão", () => {
    expect(hasPixAdvantage(100, 120, 5)).toBe(true);
    expect(pixUnitPrice(100, 120, 5)).toBe(100);
    expect(cardUnitPrice(100, 120)).toBe(120);
  });

  it("retorna false quando preço Pix = preço normal", () => {
    expect(hasPixAdvantage(100, null, 0)).toBe(false);
    expect(hasPixAdvantage(100, 100, 0)).toBe(false);
  });

  it("retorna true com desconto Pix ou compare_at", () => {
    expect(hasPixAdvantage(100, null, 5)).toBe(true);
    expect(hasPixAdvantage(100, 120, 0)).toBe(true);
  });
});
