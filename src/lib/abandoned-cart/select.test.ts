import { describe, expect, it } from "vitest";
import { abandonedCouponCode } from "./coupon";
import { normalizarTelefone, samePhone } from "./phone";
import { selectAbandonedCarts, type AbandonedCheckoutRow } from "./select";

function row(partial: Partial<AbandonedCheckoutRow> & Pick<AbandonedCheckoutRow, "id" | "telefone">): AbandonedCheckoutRow {
  return {
    nome: "Carla Souza",
    email: "carla@example.com",
    itens: [],
    total: 189,
    criado_em: "2026-10-16T12:00:00.000Z",
    cupom_codigo: "CARLA10ABC",
    cupom_expira_em: "2026-10-18T12:00:00.000Z",
    ...partial,
  };
}

describe("normalizarTelefone", () => {
  it("coloca o 55 quando o número vem com DDD", () => {
    expect(normalizarTelefone("(67) 99999-8888")).toBe("5567999998888");
    expect(normalizarTelefone("5567999998888")).toBe("5567999998888");
  });
});

describe("selectAbandonedCarts", () => {
  it("manda só o checkout mais recente e pula quem pagou ou já recebeu", () => {
    const result = selectAbandonedCarts(
      [
        row({ id: "novo", telefone: "5567999998888", criado_em: "2026-10-16T14:00:00.000Z" }),
        row({ id: "velho", telefone: "5567999998888", criado_em: "2026-10-16T12:00:00.000Z" }),
        row({ id: "pago", telefone: "5567988887777", email: "pago@example.com" }),
        row({ id: "recente", telefone: "5567977776666" }),
      ],
      ["67977776666"],
      [{ phone: "67988887777", email: null, orderedAt: "2026-10-16T13:00:00.000Z" }]
    );
    expect(result.pending.map((item) => item.id)).toEqual(["novo"]);
    expect(result.paidIds).toEqual(["pago"]);
  });

  it("reconhece o mesmo telefone com e sem 55", () => {
    expect(samePhone("5567999998888", "67999998888")).toBe(true);
  });
});

describe("abandonedCouponCode", () => {
  it("monta um código de 10% a partir do nome", () => {
    const code = abandonedCouponCode("Carla");
    expect(code.startsWith("CARLA10")).toBe(true);
    expect(code).toMatch(/^CARLA10[A-Z0-9]{3}$/);
  });
});
