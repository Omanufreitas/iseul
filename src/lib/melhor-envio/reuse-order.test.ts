import { describe, expect, it } from "vitest";
import { findReusableMelhorEnvioOrder, matchesMeOrderRecipient } from "./reuse-order";

const NFE_KEY = "50260963829102000134550010000000351805552957";

describe("findReusableMelhorEnvioOrder", () => {
  it("encontra envio gerado com mesma NF-e e destinatário", () => {
    const match = findReusableMelhorEnvioOrder(
      [
        {
          id: "me-1",
          protocol: "ORD-123",
          status: "released",
          generated_at: "2026-09-04 16:52:25",
          invoice: { key: NFE_KEY },
          to: { postal_code: "29164632", document: "01973158523" },
        },
        {
          id: "me-2",
          protocol: "ORD-456",
          status: "released",
          generated_at: "2026-09-04 16:00:00",
          invoice: { key: NFE_KEY },
          to: { postal_code: "01001000", document: "01973158523" },
        },
      ],
      NFE_KEY,
      "29164-632",
      "019.731.585-23"
    );

    expect(match?.id).toBe("me-1");
  });

  it("ignora envios cancelados", () => {
    const match = findReusableMelhorEnvioOrder(
      [
        {
          id: "me-1",
          status: "released",
          generated_at: "2026-09-04 16:52:25",
          canceled_at: "2026-09-04 17:00:00",
          invoice: { key: NFE_KEY },
          to: { postal_code: "29164632", document: "01973158523" },
        },
      ],
      NFE_KEY,
      "29164632",
      "01973158523"
    );

    expect(match).toBeNull();
  });

  it("compara CEP e documento com máscara", () => {
    expect(
      matchesMeOrderRecipient(
        { id: "me-1", to: { postal_code: "29164632", document: "01973158523" } },
        "29164-632",
        "019.731.585-23"
      )
    ).toBe(true);
  });
});
