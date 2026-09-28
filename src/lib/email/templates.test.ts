import { describe, expect, it } from "vitest";
import { renderPedidoConfirmadoHtml, renderPedidoEnviadoHtml } from "@/lib/email/templates";

describe("order email templates", () => {
  it("monta o e-mail de pedido confirmado no visual Iseul", () => {
    const html = renderPedidoConfirmadoHtml({
      numero: "123",
      primeiroNome: "Marina",
      itens: [
        {
          name: "AGE-R Booster Pro X2",
          brand: "medicube",
          variant: "Rosa",
          quantity: 1,
          price: "R$ 1.699,00",
          image: "https://iseul.com.br/email/exemplo-produto.png",
        },
      ],
      subtotal: "R$ 1.699,00",
      desconto: { valor: "R$ 169,90", cupom: "ORVALHO10" },
      frete: { transportadora: "Total Express", valor: "Grátis" },
      total: "R$ 1.529,10",
      pagamento: { metodo: "Pix" },
      nfe: "000056",
      data: "25/09/2026",
      endereco: {
        linha1: "Rua das Flores, 100 — Apto 12",
        linha2: "Centro · Campo Grande/MS",
        cep: "79002-000",
      },
    });

    expect(html).toContain("Recebi seu pedido, Marina.");
    expect(html).toContain("Pedido #123 · pagamento aprovado");
    expect(html).toContain("AGE-R Booster Pro X2");
    expect(html).toContain("cupom ORVALHO10");
    expect(html).toContain("Brendon Lanen");
    expect(html).toContain("#FAF8F4");
  });

  it("monta o e-mail de pedido enviado com rastreio", () => {
    const html = renderPedidoEnviadoHtml({
      numero: "124",
      primeiroNome: "Ana",
      frete: { transportadora: "Correios PAC" },
      rastreio: {
        codigo: "AB123456789BR",
        url: "https://www.melhorrastreio.com.br/rastreio/AB123456789BR",
      },
      endereco: {
        linha1: "Av. Paulista, 1000",
        linha2: "Bela Vista · São Paulo/SP",
        cep: "01310-100",
      },
      itens: [{ quantidade: 2, nome: "Laneige Water Sleeping Mask · 70 ml" }],
    });

    expect(html).toContain("Seu pedido saiu, Ana.");
    expect(html).toContain("AB123456789BR");
    expect(html).toContain("Acompanhar a entrega");
    expect(html).toContain("2× Laneige Water Sleeping Mask · 70 ml");
  });
});
