export const ROTINA_WHATSAPP = "5567992249519";
export const ROTINA_BOTAO = "Montar minha rotina";
export const ROTINA_MAX_QUEIXAS = 3;
export const ROTINA_CONVITE_MS = 4000;
export const ROTINA_CONVITE_KEY = "isr-convite-visto";

export const PELE_TIPOS = ["Oleosa", "Mista", "Normal", "Seca", "Não sei"] as const;
export const PELE_SENSIVEL = ["Sim", "Às vezes", "Não"] as const;
export const QUEIXAS = [
  "Poros aparentes",
  "Manchas e tom irregular",
  "Acne e cravos",
  "Oleosidade",
  "Ressecamento",
  "Linhas e flacidez",
  "Olheiras",
  "Vermelhidão",
  "Falta de viço",
] as const;
export const ROTINAS_HOJE = ["Não faço nada", "Faço o básico", "Tenho uma rotina"] as const;
export const PASSOS_ROTINA = [
  "Sabonete facial",
  "Tônico",
  "Esfoliante",
  "Sérum / ampola",
  "Hidratante",
  "Protetor solar",
  "Contorno dos olhos",
  "Máscara",
] as const;

export type RotinaAnswers = {
  nome: string;
  tipoPele: string;
  sensivel: string;
  queixas: string[];
  queixaLivre: string;
  rotinaHoje: string;
  passos: string[];
  produtos: string;
};

export function emptyRotinaAnswers(): RotinaAnswers {
  return {
    nome: "",
    tipoPele: "",
    sensivel: "",
    queixas: [],
    queixaLivre: "",
    rotinaHoje: "",
    passos: [],
    produtos: "",
  };
}

export function rotinaPedeDetalhes(rotinaHoje: string) {
  return rotinaHoje === "Faço o básico" || rotinaHoje === "Tenho uma rotina";
}

export function queixasTexto(answers: Pick<RotinaAnswers, "queixas" | "queixaLivre">) {
  const extra = answers.queixaLivre.trim();
  const parts = [...answers.queixas];
  if (extra) parts.push(extra);
  return parts.join(", ");
}

export function buildRotinaWhatsAppMessage(answers: RotinaAnswers) {
  const nome = answers.nome.trim();
  const lines = [
    `Olá! Meu nome é ${nome} e quero ajuda para montar a rotina certa para a minha pele.`,
    "",
    `*Tipo de pele:* ${answers.tipoPele}`,
    `*Pele sensível:* ${answers.sensivel}`,
    `*O que mais me incomoda:* ${queixasTexto(answers)}`,
    `*Minha rotina hoje:* ${answers.rotinaHoje}`,
  ];

  if (rotinaPedeDetalhes(answers.rotinaHoje)) {
    if (answers.passos.length) lines.push(`*O que uso:* ${answers.passos.join(", ")}`);
    const produtos = answers.produtos.trim();
    if (produtos) lines.push(`*Produtos e marcas:* ${produtos}`);
  }

  lines.push("", "_Enviado pelo questionário do site iseul.com.br_");
  return lines.join("\n");
}

export function rotinaWhatsAppUrl(answers: RotinaAnswers) {
  return `https://wa.me/${ROTINA_WHATSAPP}?text=${encodeURIComponent(buildRotinaWhatsAppMessage(answers))}`;
}

export function isRotinaTriggerHref(href: string | null | undefined) {
  const value = (href ?? "").trim();
  if (!value || !value.includes("#")) return value === "#rotina" || value === "#montar-rotina";
  const hash = `#${value.split("#").pop()}`;
  return hash === "#rotina" || hash === "#montar-rotina";
}
