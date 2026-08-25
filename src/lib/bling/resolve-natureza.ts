import { blingFetch } from "@/lib/bling/client";

type NaturezaOperacao = {
  id: number;
  descricao?: string;
  padrao?: number;
  situacao?: number;
};

const naturezaCache = new Map<string, number>();

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

function pickNaturezaId(items: NaturezaOperacao[], preferredLabel: string): number | null {
  const target = normalizeLabel(preferredLabel);

  const exact = items.find((n) => normalizeLabel(n.descricao ?? "") === target);
  if (exact?.id) return exact.id;

  const partial = items.find((n) => normalizeLabel(n.descricao ?? "").includes(target));
  if (partial?.id) return partial.id;

  return null;
}

async function listNaturezasOperacao(): Promise<NaturezaOperacao[]> {
  const result = await blingFetch<{ data?: NaturezaOperacao[] }>(
    "/naturezas-operacoes?limite=100",
  );

  if (!result.ok) {
    throw new Error(`Não foi possível listar naturezas de operação no Bling: ${result.error}`);
  }

  return result.data.data ?? [];
}

async function resolveNaturezaByLabel(preferredLabel: string, cacheKey: string): Promise<number> {
  const cached = naturezaCache.get(cacheKey);
  if (cached) return cached;

  const id = pickNaturezaId(await listNaturezasOperacao(), preferredLabel);
  if (!id) {
    throw new Error(
      `Natureza de operação "${preferredLabel}" não encontrada no Bling. Cadastre-a ou defina o ID via env.`,
    );
  }

  naturezaCache.set(cacheKey, id);
  return id;
}

export type BlingCustomerKind = "b2c" | "b2b";

/** PF / consumidor final / não contribuinte — vendas do site Iseul. */
export function resolveBlingCustomerKind(input: {
  document: string;
  tipoPessoa?: "F" | "J";
}): BlingCustomerKind {
  const digits = input.document.replace(/\D/g, "");
  if (input.tipoPessoa === "J" || digits.length > 11) return "b2b";
  return "b2c";
}

/**
 * B2C → natureza com CSOSN 102 (ex.: "Venda de mercadoria a não contribuinte").
 * B2B → natureza com CSOSN 101 para contribuinte de ICMS.
 */
export async function resolveBlingNaturezaOperacaoIdForCustomer(input: {
  document: string;
  tipoPessoa?: "F" | "J";
}): Promise<number> {
  const kind = resolveBlingCustomerKind(input);

  if (kind === "b2c") {
    const fromEnv = process.env.BLING_NFE_NATUREZA_B2C_ID?.trim();
    if (fromEnv) {
      const id = Number(fromEnv);
      if (Number.isFinite(id) && id > 0) return id;
    }
    const label =
      process.env.BLING_NFE_NATUREZA_B2C?.trim() || "Venda de mercadoria a não contribuinte";
    return resolveNaturezaByLabel(label, "b2c");
  }

  const fromEnv = process.env.BLING_NFE_NATUREZA_B2B_ID?.trim();
  if (fromEnv) {
    const id = Number(fromEnv);
    if (Number.isFinite(id) && id > 0) return id;
  }
  const label = process.env.BLING_NFE_NATUREZA_B2B?.trim() || "Venda de mercadoria";
  return resolveNaturezaByLabel(label, "b2b");
}

/** @deprecated Use resolveBlingNaturezaOperacaoIdForCustomer. Mantido para compatibilidade. */
export async function resolveBlingNaturezaOperacaoId(): Promise<number> {
  const fromEnv = process.env.BLING_NFE_NATUREZA_ID?.trim();
  if (fromEnv) {
    const id = Number(fromEnv);
    if (Number.isFinite(id) && id > 0) return id;
  }

  const preferred =
    process.env.BLING_NFE_NATUREZA_OPERACAO?.trim() || "Venda de mercadoria a não contribuinte";
  return resolveNaturezaByLabel(preferred, "legacy");
}
