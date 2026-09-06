import { describe, expect, it } from "vitest";
import { isPendingPayment, resolvePaymentStatus } from "@/lib/order-payment";

describe("order payment helpers", () => {
  it("pedido cancelado não conta como pagamento pendente", () => {
    expect(
      isPendingPayment({ status: "cancelado", payment_status: "pendente" })
    ).toBe(false);
  });

  it("resolve pagamento legado cancelado+pendente como cancelado", () => {
    expect(
      resolvePaymentStatus({ status: "cancelado", payment_status: "pendente" })
    ).toBe("cancelado");
  });
});
