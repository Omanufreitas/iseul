import { blingFetch } from "@/lib/bling/client";

export type EmitNfeResult = {
  nfeId: number;
  numero: string | null;
  linkDanfe: string | null;
  chaveAcesso: string | null;
};

type NfeData = {
  id?: number;
  numero?: string | number;
  linkDanfe?: string;
  linkPDF?: string;
  chaveAcesso?: string;
};

type GerarNfeResponse = {
  idNotaFiscal?: number;
};

function pickNfeFields(data: NfeData | undefined): Omit<EmitNfeResult, "nfeId"> & { nfeId?: number } {
  const chave = String(data?.chaveAcesso ?? "").replace(/\D/g, "");
  return {
    nfeId: data?.id,
    numero: data?.numero != null ? String(data.numero) : null,
    linkDanfe: data?.linkDanfe ?? data?.linkPDF ?? null,
    chaveAcesso: chave.length === 44 ? chave : null,
  };
}

async function fetchNfeById(nfeId: number): Promise<NfeData | null> {
  const result = await blingFetch<{ data?: NfeData }>(`/nfe/${nfeId}`);
  if (!result.ok) return null;
  return result.data.data ?? null;
}

/** Emite NF-e a partir de um pedido de venda já criado no Bling. */
export async function emitNfeForSaleOrder(pedidoVendaId: number): Promise<EmitNfeResult> {
  const create = await blingFetch<{ data?: GerarNfeResponse & NfeData }>(
    `/pedidos/vendas/${pedidoVendaId}/gerar-nfe`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  if (!create.ok) {
    throw new Error(create.error);
  }

  const created = pickNfeFields(create.data.data);
  const nfeId = create.data.data?.idNotaFiscal ?? created.nfeId;
  if (!nfeId) {
    throw new Error("Bling não retornou ID ao gerar NF-e.");
  }

  const send = await blingFetch<{ data?: NfeData }>(`/nfe/${nfeId}/enviar`, {
    method: "POST",
  });

  if (!send.ok) {
    throw new Error(send.error);
  }

  const sent = pickNfeFields(send.data.data);
  let numero = sent.numero ?? created.numero;
  let linkDanfe = sent.linkDanfe ?? created.linkDanfe;
  let chaveAcesso = sent.chaveAcesso ?? created.chaveAcesso;

  if (!numero || !linkDanfe || !chaveAcesso) {
    const fresh = await fetchNfeById(nfeId);
    if (fresh) {
      const parsed = pickNfeFields(fresh);
      numero = numero ?? parsed.numero;
      linkDanfe = linkDanfe ?? parsed.linkDanfe;
      chaveAcesso = chaveAcesso ?? parsed.chaveAcesso;
    }
  }

  return { nfeId, numero, linkDanfe, chaveAcesso };
}

export function isBlingNfeEnabled(): boolean {
  if (process.env.BLING_NFE_ENABLED === "false") return false;
  return true;
}
