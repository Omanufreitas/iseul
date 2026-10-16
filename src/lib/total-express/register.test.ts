import { describe, expect, it } from "vitest";
import { code128Values } from "./barcode";
import { buildSmartLabelPayload, parseSmartLabelResponse, TotalExpressError } from "./register";
import { isTotalExpressShipment } from "./shipment";

const payloadInput = {
  reid: "90706",
  shipperDocument: "63.829.102/0001-34",
  orderNumber: "1842",
  productName: "Sérum facial de vitamina C com textura leve",
  weightKg: 0.304,
  recipient: {
    name: "Ana",
    document: "123.456.789-09",
    email: "ana@example.com",
    phone: "5567999998888",
    street: "Rua das Flores",
    number: "10",
    complement: "",
    neighborhood: "Centro",
    city: "Campo Grande",
    state: "ms",
    zip: "79002-070",
  },
  invoice: {
    number: "000123",
    series: "1",
    issuedOn: "2026-10-16",
    total: 120.5,
    products: 100,
    key: "5".repeat(44),
  },
};

describe("isTotalExpressShipment", () => {
  it("reconhece o contrato e ignora Correios", () => {
    expect(isTotalExpressShipment("Total Express Expresso")).toBe(true);
    expect(isTotalExpressShipment("Correios PAC")).toBe(false);
    expect(isTotalExpressShipment("Correios SEDEX")).toBe(false);
  });
});

describe("buildSmartLabelPayload", () => {
  it("monta o Expresso no contrato, com frete CIF", () => {
    const payload = buildSmartLabelPayload(payloadInput);
    expect(payload.remetenteId).toBe(90706);
    expect(payload.cnpj).toBe("63829102000134");
    expect(payload.encomendas[0]?.servicoTipo).toBe(1);
    expect(payload.encomendas[0]?.condFrete).toBe("CIF");
    expect(payload.encomendas[0]?.pedido).toBe("1842");
    expect(payload.encomendas[0]?.natureza).toHaveLength(25);
    expect(payload.encomendas[0]?.destinatario.endereco.cep).toBe("79002070");
    expect(payload.encomendas[0]?.destinatario.endereco.estado).toBe("MS");
    expect(payload.encomendas[0]?.destinatario.telefone1).toBe(67999998888);
    expect(payload.encomendas[0]?.docFiscal.nfe[0]?.nfeData).toBe("2026-10-16");
    expect(payload.encomendas[0]?.peso).toBe(0.3);
  });
});

describe("parseSmartLabelResponse", () => {
  it("lê o AWB da resposta", () => {
    const volume = parseSmartLabelResponse(200, {
      retorno: {
        encomendas: [
          { volumes: [{ awb: "ABCD123456789tx", rota: "(A)99-SAO", codigoBarras: "ABCD123456789tx" }] },
        ],
      },
    });
    expect(volume).toEqual({
      awb: "ABCD123456789tx",
      rota: "(A)99-SAO",
      barcode: "ABCD123456789tx",
    });
  });

  it("mostra o erro quando a Total Express não grava o envio", () => {
    expect(() =>
      parseSmartLabelResponse(400, {
        retorno: { erros: [{ pedido: "1842", erro: "CPF/CNPJ do Destinatário" }] },
      })
    ).toThrow(TotalExpressError);
  });
});

describe("code128Values", () => {
  it("calcula o dígito do Code 128 B", () => {
    expect(code128Values("A")).toEqual([104, 33, 34, 106]);
  });
});
