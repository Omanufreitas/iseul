/** Origem do produto na NF-e (campo origem do Bling). */
export const BLING_TAX_ORIGINS = [
  { value: 0, label: "0 — Nacional" },
  { value: 1, label: "1 — Estrangeira (importação direta)" },
  { value: 2, label: "2 — Estrangeira (adquirida no mercado interno)" },
  { value: 3, label: "3 — Nacional (> 40% conteúdo importado)" },
  { value: 4, label: "4 — Nacional (conforme processos produtivos)" },
  { value: 5, label: "5 — Nacional (< 40% conteúdo importado)" },
  { value: 6, label: "6 — Estrangeira (importação direta, sem similar)" },
  { value: 7, label: "7 — Estrangeira (mercado interno, sem similar)" },
  { value: 8, label: "8 — Nacional (> 70% conteúdo importado)" },
] as const;

export const BLING_PRODUCT_UNITS = ["UN", "PÇ", "CX", "KG", "ML", "G"] as const;

/** NCM padrão sugerido para cosméticos K-Beauty importados. */
export const BLING_DEFAULT_NCM = "33049990";

export function normalizeNcm(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return digits;
}

export function formatNcmDisplay(value: string | null | undefined): string {
  const digits = normalizeNcm(value);
  if (!digits) return "";
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

export function blingProductSyncLabel(status: string | null | undefined): string {
  switch (status) {
    case "synced":
      return "No Bling";
    case "pending":
      return "Enviando…";
    case "error":
      return "Erro Bling";
    default:
      return "Não enviado";
  }
}
