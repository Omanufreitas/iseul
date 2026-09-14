import { describe, expect, it } from "vitest";
import { parseAssistantBlocks } from "./format";

describe("parseAssistantBlocks", () => {
  it("lê blocos ::produto em cards", () => {
    const blocks = parseAssistantBlocks(`Aqui vão alguns destaques.

::produto celimax-the-vita-a-retinal-shot-tightening-booster | Retinal Shot Tightening Booster | R$ 189,00
0,1% de retinal para quem quer ir além do básico.

::produto protetor-solar-serum-fps50-skin1004-hyalucica-water-fit-sun | Skin1004 FPS50 | R$ 159,00
Protetor leve, boa para o dia.
`);
    expect(blocks[0]).toEqual({ type: "text", text: "Aqui vão alguns destaques." });
    expect(blocks[1]).toMatchObject({
      type: "product",
      slug: "celimax-the-vita-a-retinal-shot-tightening-booster",
      name: "Retinal Shot Tightening Booster",
      price: "R$ 189,00",
    });
    expect(blocks.filter((block) => block.type === "product")).toHaveLength(2);
  });

  it("quebra lista colada com slug entre parênteses", () => {
    const blocks = parseAssistantBlocks(
      "Temos uma seleção incrível! Aqui estão alguns destaques: - Sérum Celimax The Vita A Retinal Shot Tightening Booster por R$ 189,00 (/produtos/celimax-the-vita-a-retinal-shot-tightening-booster). - Hidratante Retinal Shot Tightening Dual Cream por R$ 210,00 (/produtos/celimax-retinal-shot-tightening-dual-cream)."
    );
    const products = blocks.filter((block) => block.type === "product");
    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({
      slug: "celimax-the-vita-a-retinal-shot-tightening-booster",
      price: "R$ 189,00",
    });
    expect(blocks.some((block) => block.type === "text" && block.text.includes("seleção incrível"))).toBe(
      true
    );
  });

  it("separa passos de rotina numerados", () => {
    const blocks = parseAssistantBlocks(
      "Para pele seca, aqui vai uma rotina simples: 1. Limpeza: Comece com o SKIN1004 Madagascar Centella Light Cleansing Oil para retirar impurezas (/produtos/skin1004-madagascar-centella-light-cleansing-oil-200ml). 2. Tratamento: Use a ampola SKIN1004 Madagascar Centella Probio-Cica Intensive Ampoule (/produtos/skin1004-probio-cica)."
    );
    expect(blocks.some((block) => block.type === "step" && block.title === "Limpeza")).toBe(true);
    expect(blocks.filter((block) => block.type === "product").length).toBeGreaterThanOrEqual(1);
  });
});
