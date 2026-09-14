import { describe, expect, it } from "vitest";
import { trimAssistantResponse } from "./trim";
import { buildAssistantSystemPrompt, intentInstruction } from "@/lib/prompts/assistant";

describe("trimAssistantResponse", () => {
  it("remove fechamento genérico", () => {
    expect(trimAssistantResponse("Pode usar de manhã. Estou aqui para ajudar!")).toBe(
      "Pode usar de manhã."
    );
  });
});

describe("assistant prompt", () => {
  it("manda a IA recusar produto fora do catálogo", () => {
    const prompt = buildAssistantSystemPrompt({
      catalog: "- Relief Sun | slug: relief-sun",
      storeFacts: "Frete grátis acima de R$ 199,00.",
    });
    expect(prompt).toContain("Só fale de produtos que estão no catálogo");
    expect(prompt).toContain("assistente virtual da loja Iseul");
    expect(prompt).toContain("Não invente marca, preço, promoção, estoque, desconto, prazo ou ativo.");
    expect(prompt).toContain("contato@iseul.com.br");
  });

  it("instrui o chip de produtos a listar no máximo 4", () => {
    expect(intentInstruction("products")).toContain("no máximo 4");
  });
});
