import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  firstName,
  formatAddress,
  formatBrl,
  carrierTrackingCode,
  paymentMethodLabel,
  shippingLabel,
  trackingUrl,
} from "@/lib/email/format";

describe("order email format", () => {
  it("pega o primeiro nome", () => {
    expect(firstName("Marina Souza")).toBe("Marina");
    expect(firstName("ana")).toBe("Ana");
  });

  it("formata reais e método de pagamento", () => {
    expect(formatBrl(1735.2).replace(/\s/g, " ")).toBe("R$ 1.735,20");
    expect(paymentMethodLabel("asaas_pix")).toBe("Pix");
    expect(paymentMethodLabel("asaas_cartao")).toBe("Cartão");
  });

  it("monta endereço e rastreio", () => {
    expect(
      formatAddress({
        street: "Rua das Flores",
        number: "100",
        complement: "Apto 12",
        neighborhood: "Centro",
        city: "Campo Grande",
        state: "MS",
        zip: "79002000",
      }),
    ).toEqual({
      linha1: "Rua das Flores, 100 — Apto 12",
      linha2: "Centro · Campo Grande/MS",
      cep: "79002-000",
    });
    expect(shippingLabel({ shippingMethod: "Total Express" })).toBe("Total Express");
    expect(trackingUrl("AB123456789BR")).toBe("https://www.melhorrastreio.com.br/rastreio/AB123456789BR");
    expect(trackingUrl("ORD-202609144664151")).toBeNull();
    expect(carrierTrackingCode("ORD-202609144664151")).toBeNull();
    expect(carrierTrackingCode("TXAQ577791866tx")).toBe("TXAQ577791866tx");
  });

  it("escapa HTML", () => {
    expect(escapeHtml(`<b>x</b>`)).toBe("&lt;b&gt;x&lt;/b&gt;");
  });
});
