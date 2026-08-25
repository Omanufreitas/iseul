import { blingFetch } from "@/lib/bling/client";

/** Gera variações de SKU para bater com o código cadastrado no Bling. */
export function expandSkuCandidates(sku: string): string[] {
  const raw = sku.trim();
  if (!raw) return [];

  const out = new Set<string>([raw, raw.toUpperCase()]);
  for (const part of raw.split("|").map((s) => s.trim()).filter(Boolean)) {
    out.add(part);
    out.add(part.toUpperCase());
  }
  return [...out];
}

export async function findBlingProductId(candidates: string[]): Promise<number | null> {
  const tried = new Set<string>();

  for (const code of candidates) {
    const key = code.trim();
    if (!key || tried.has(key)) continue;
    tried.add(key);

    const result = await blingFetch<{ data?: { id?: number; codigo?: string }[] }>(
      `/produtos?codigo=${encodeURIComponent(key)}&limite=5&criterio=1`,
    );
    if (!result.ok) continue;

    const items = result.data.data ?? [];
    const normalized = key.toUpperCase();
    const exact = items.find((p) => (p.codigo ?? "").trim().toUpperCase() === normalized);
    if (exact?.id) return exact.id;
    if (items.length === 1 && items[0]?.id) return items[0].id;
  }

  return null;
}

type BlingContact = {
  id: number;
  numeroDocumento?: string;
};

async function searchBlingContacts(path: string, cpf: string): Promise<number | null> {
  const result = await blingFetch<{ data?: BlingContact[] }>(path);
  if (!result.ok) return null;

  const items = result.data.data ?? [];
  const match = items.find((c) => (c.numeroDocumento ?? "").replace(/\D/g, "") === cpf);
  return match?.id ?? (items.length === 1 ? (items[0]?.id ?? null) : null);
}

type BlingContactAddressInput = {
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
};

function buildBlingContactEndereco(endereco?: BlingContactAddressInput) {
  if (!endereco?.cep && !endereco?.endereco) return undefined;

  return {
    geral: {
      cep: endereco.cep?.replace(/\D/g, "") ?? "",
      endereco: endereco.endereco ?? "",
      numero: endereco.numero?.trim() || "S/N",
      bairro: endereco.bairro ?? "",
      municipio: endereco.municipio ?? "",
      uf: endereco.uf ?? "",
      complemento: "",
    },
  };
}

async function upsertBlingContact(input: {
  nome: string;
  cpf: string;
  email?: string;
  tipoPessoa: "F" | "J";
  endereco?: BlingContactAddressInput;
  existingId?: number;
}): Promise<number> {
  const body: Record<string, unknown> = {
    nome: input.nome,
    tipo: input.tipoPessoa,
    numeroDocumento: input.cpf,
    email: input.email ?? undefined,
    situacao: "A",
    endereco: buildBlingContactEndereco(input.endereco),
  };

  // PF no e-commerce = consumidor final / não contribuinte de ICMS (CSOSN 102 na NF-e).
  if (input.tipoPessoa === "F") {
    body.indicadorIe = 9;
  }

  if (input.existingId) {
    const update = await blingFetch(`/contatos/${input.existingId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!update.ok) {
      throw new Error(update.error);
    }
    return input.existingId;
  }

  const create = await blingFetch<{ data?: { id?: number } }>("/contatos", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!create.ok) {
    throw new Error(create.error);
  }

  const id = create.data.data?.id;
  if (!id) {
    throw new Error("Bling não retornou ID ao criar contato.");
  }

  return id;
}

export async function findOrCreateBlingContact(input: {
  nome: string;
  cpf: string;
  email?: string;
  tipoPessoa: "F" | "J";
  endereco?: BlingContactAddressInput;
}): Promise<number> {
  const cpf = input.cpf.replace(/\D/g, "");
  if (!cpf) {
    throw new Error("CPF/CNPJ do cliente ausente — necessário para o Bling.");
  }

  const existing =
    (await searchBlingContacts(
      `/contatos?numeroDocumento=${encodeURIComponent(cpf)}&limite=5`,
      cpf,
    )) ??
    (await searchBlingContacts(`/contatos?pesquisa=${encodeURIComponent(cpf)}&limite=10`, cpf));

  return upsertBlingContact({ ...input, cpf, existingId: existing ?? undefined });
}

export function isBlingDuplicateOrderNumberError(error: string): boolean {
  return (
    error.includes('"code":36') ||
    error.includes("Já foi lançado um pedido de venda com este número")
  );
}

export async function findBlingSaleIdByNumber(
  numero: number,
  contatoId?: number,
): Promise<number | null> {
  const contactFilter = contatoId ? `&idContato=${contatoId}` : "";
  const result = await blingFetch<{ data?: { id?: number; numero?: number }[] }>(
    `/pedidos/vendas?numero=${numero}${contactFilter}&limite=5`,
  );
  if (!result.ok) return null;

  const items = result.data.data ?? [];
  const exact = items.find((o) => o.numero === numero);
  return exact?.id ?? items[0]?.id ?? null;
}
