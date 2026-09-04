import { describe, expect, it } from "vitest";
import { stockErrorMessage } from "@/lib/inventory";

describe("stockErrorMessage", () => {
  it("returns out-of-stock message when available is zero", () => {
    expect(stockErrorMessage("Celimax Cream", 0, 1)).toBe(
      "Celimax Cream está esgotado e foi removido da sacola."
    );
  });

  it("returns insufficient stock message when some units remain", () => {
    expect(stockErrorMessage("Serum TXA", 2, 5)).toBe(
      "Estoque insuficiente para Serum TXA: restam 2 unidade(s), você pediu 5."
    );
  });
});
