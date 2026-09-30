import { describe, expect, it } from "vitest";
import {
  buildRotinaWhatsAppMessage,
  emptyRotinaAnswers,
  isRotinaTriggerHref,
  rotinaPedeDetalhes,
  rotinaWhatsAppUrl,
} from "./rotina-quiz";

describe("buildRotinaWhatsAppMessage", () => {
  it("monta a mensagem no formato do piloto", () => {
    const text = buildRotinaWhatsAppMessage({
      nome: "Mariana Souza",
      tipoPele: "Mista",
      sensivel: "Às vezes",
      queixas: ["Poros aparentes", "Manchas e tom irregular"],
      queixaLivre: "",
      rotinaHoje: "Faço o básico",
      passos: ["Sabonete facial", "Hidratante"],
      produtos: "Sabonete Cetaphil, hidratante Neutrogena Hydro Boost",
    });

    expect(text).toBe(
      [
        "Olá! Meu nome é Mariana Souza e quero ajuda para montar a rotina certa para a minha pele.",
        "",
        "*Tipo de pele:* Mista",
        "*Pele sensível:* Às vezes",
        "*O que mais me incomoda:* Poros aparentes, Manchas e tom irregular",
        "*Minha rotina hoje:* Faço o básico",
        "*O que uso:* Sabonete facial, Hidratante",
        "*Produtos e marcas:* Sabonete Cetaphil, hidratante Neutrogena Hydro Boost",
        "",
        "_Enviado pelo questionário do site iseul.com.br_",
      ].join("\n")
    );
  });

  it("omite passos quando a pessoa não faz rotina", () => {
    const text = buildRotinaWhatsAppMessage({
      ...emptyRotinaAnswers(),
      nome: "Ana",
      tipoPele: "Seca",
      sensivel: "Não",
      queixas: ["Ressecamento"],
      rotinaHoje: "Não faço nada",
      passos: ["Hidratante"],
      produtos: "CeraVe",
    });
    expect(text).not.toContain("*O que uso:*");
    expect(text).not.toContain("*Produtos e marcas:*");
  });
});

describe("rotina helpers", () => {
  it("pede detalhes só no básico e na rotina completa", () => {
    expect(rotinaPedeDetalhes("Não faço nada")).toBe(false);
    expect(rotinaPedeDetalhes("Faço o básico")).toBe(true);
    expect(rotinaPedeDetalhes("Tenho uma rotina")).toBe(true);
  });

  it("abre o WhatsApp com o número da Iseul", () => {
    const url = rotinaWhatsAppUrl({
      ...emptyRotinaAnswers(),
      nome: "Ana",
      tipoPele: "Normal",
      sensivel: "Não",
      queixas: ["Falta de viço"],
      rotinaHoje: "Não faço nada",
    });
    expect(url.startsWith("https://wa.me/5567992249519?text=")).toBe(true);
  });

  it("abre o quiz por #montar-rotina e #rotina", () => {
    expect(isRotinaTriggerHref("#montar-rotina")).toBe(true);
    expect(isRotinaTriggerHref("/#montar-rotina")).toBe(true);
    expect(isRotinaTriggerHref("/#rotina")).toBe(true);
    expect(isRotinaTriggerHref("#catalogo")).toBe(false);
  });
});
