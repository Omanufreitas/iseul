import { describe, expect, it } from "vitest";
import { parseTotalExpressQuote } from "./quote";

describe("parseTotalExpressQuote", () => {
  it("lê valor e prazo quando a cotação é aceita", () => {
    const xml = `<CodigoProc xsi:type="xsd:nonNegativeInteger">1</CodigoProc><Prazo xsi:type="xsd:nonNegativeInteger">9</Prazo><ValorServico xsi:type="xsd:decimal">14,52</ValorServico>`;
    expect(parseTotalExpressQuote(xml)).toEqual({ price: 14.52, deliveryDays: 9 });
  });

  it("ignora serviço que o contrato não usa", () => {
    const xml = `<CodigoProc>4</CodigoProc><ErroConsultaFrete>Tipo de Servico nao utilizado</ErroConsultaFrete>`;
    expect(parseTotalExpressQuote(xml)).toBeNull();
  });
});
