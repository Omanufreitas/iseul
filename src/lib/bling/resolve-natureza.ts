import { blingFetch } from "@/lib/bling/client";

type NaturezaOperacao = {
  id: number;
  descricao?: string;
  padrao?: number;
  situacao?: number;
};

let cachedNaturezaId: number | null | undefined;

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

function pickNaturezaId(
  items: NaturezaOperacao[],
  preferredLabel: string,
): number | null {
  const target = normalizeLabel(preferredLabel);

  const exact = items.find((n) => normalizeLabel(n.descricao ?? "") === target);
  if (exact?.id) return exact.id;

  const partial = items.find((n) => normalizeLabel(n.descricao ?? "").includes(target));
  if (partial?.id) return partial.id;

  const venda = items.find((n) => {
    const label = normalizeLabel(n.descricao ?? "");
    return label.includes("venda") && label.includes("mercadoria") && !label.includes("st");
  });
  if (venda?.id) return venda.id;

  const active = items.find((n) => n.situacao === 1);
  return active?.id ?? items[0]?.id ?? null;
}

/** Resolve ID da natureza de operação para pedidos/NF-e (cache em memória + env opcional). */
export async function resolveBlingNaturezaOperacaoId(): Promise<number> {
  const fromEnv = process.env.BLING_NFE_NATUREZA_ID?.trim();
  if (fromEnv) {
    const id = Number(fromEnv);
    if (Number.isFinite(id) && id > 0) return id;
  }

  if (cachedNaturezaId) return cachedNaturezaId;

  const preferred =
    process.env.BLING_NFE_NATUREZA_OPERACAO?.trim() || "Venda de mercadoria";

  const result = await blingFetch<{ data?: NaturezaOperacao[] }>(
    "/naturezas-operacoes?limite=100",
  );

  if (!result.ok) {
    throw new Error(`Não foi possível listar naturezas de operação no Bling: ${result.error}`);
  }

  const id = pickNaturezaId(result.data.data ?? [], preferred);
  if (!id) {
    throw new Error(
      `Natureza de operação "${preferred}" não encontrada no Bling. Cadastre-a ou defina BLING_NFE_NATUREZA_ID.`,
    );
  }

  cachedNaturezaId = id;
  return id;
}
