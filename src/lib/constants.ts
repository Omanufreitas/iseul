export const CATEGORIES = [
  { slug: "all", label: "Tudo" },
  { slug: "solar", label: "Protetor solar" },
  { slug: "serum", label: "Sérum & ampola" },
  { slug: "hidratante", label: "Hidratante & creme" },
  { slug: "limpeza", label: "Limpeza" },
  { slug: "pads", label: "Pads & esfoliante" },
  { slug: "olhos", label: "Área dos olhos" },
  { slug: "dispositivo", label: "Dispositivo" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const SKIN_TYPES = [
  { slug: "oleosa", label: "Pele oleosa" },
  { slug: "seca", label: "Pele seca" },
  { slug: "mista", label: "Pele mista" },
  { slug: "normal", label: "Pele normal" },
  { slug: "sensivel", label: "Pele sensível" },
] as const;

export type SkinTypeSlug = (typeof SKIN_TYPES)[number]["slug"];

export const ROUTINE_STEPS = [
  {
    n: "01",
    title: "Limpar",
    text: "Óleo ou gel de limpeza. Retira filtro solar e oleosidade sem tirar a barreira junto.",
    category: "limpeza" as const,
    cta: "Ver limpeza",
  },
  {
    n: "02",
    title: "Tratar",
    text: "Sérum, ampola ou essence. É aqui que retinal, peptídeo e vitamina C fazem o trabalho.",
    category: "serum" as const,
    cta: "Ver séruns",
  },
  {
    n: "03",
    title: "Selar",
    text: "Creme ou balm. Segura a água que os passos anteriores entregaram à pele.",
    category: "hidratante" as const,
    cta: "Ver hidratantes",
  },
  {
    n: "04",
    title: "Proteger",
    text: "Protetor solar, todo santo dia. Sem ele, os passos 2 e 3 viram desperdício de dinheiro.",
    category: "solar" as const,
    cta: "Ver protetores",
  },
] as const;

export const DEFAULT_STORE_SETTINGS = {
  store_name: "Iseul",
  tagline: "이슬 K-BEAUTY",
  announcement:
    "Frete grátis acima de R$199. Estoque no Brasil, envio em até 24h. Produtos originais importados.",
  free_shipping_threshold: 199,
  pix_discount_percent: 5,
  trust_rating: 4.98,
  trust_rating_label: "Nota média na nossa loja da Shopee",
};

export const RESERVATION_MINUTES = 30;

export const INSTAGRAM_URL = "https://instagram.com/iseul.br";
export const INSTAGRAM_HANDLE = "@iseul.br";
