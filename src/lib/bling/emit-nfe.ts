import { blingFetch } from "@/lib/bling/client";

export type EmitNfeResult = {
  nfeId: number;
  numero: string | null;
  linkDanfe: string | null;
};

type NfeData = {
  id?: number;
  numero?: string | number;
  linkDanfe?: string;
  linkPDF?: string;
};

function pickNfeFields(data: NfeData | undefined): Omit<EmitNfeResult, "nfeId"> & { nfeId?: number } {
  return {
    nfeId: data?.id,
    numero: data?.numero != null ? String(data.numero) : null,
    linkDanfe: data?.linkDanfe ?? data?.linkPDF ?? null,
  };
}

async function fetchNfeById(nfeId: number): Promise<NfeData | null> {
  const result = await blingFetch<{ data?: NfeData }>(`/nfe/${nfeId}`);
  if (!result.ok) return null;
  return result.data.data ?? null;
}

/** Emite NF-e a partir de um pedido de venda já criado no Bling. */
export async function emitNfeForSaleOrder(pedidoVendaId: number): Promise<EmitNfeResult> {
  const natureza =
    process.env.BLING_NFE_NATUREZA_OPERACAO?.trim() || "Venda de mercadoria";

  const create = await blingFetch<{ data?: NfeData }>("/nfe", {
    method: "POST",
    body: JSON.stringify({
      pedidoVendaId,
      tipo: 1,
      naturezaOperacao: natureza,
    }),
  });

  if (!create.ok) {
    throw new Error(create.error);
  }

  const created = pickNfeFields(create.data.data);
  const nfeId = created.nfeId;
  if (!nfeId) {
    throw new Error("Bling não retornou ID ao criar NF-e.");
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

  if (!numero || !linkDanfe) {
    const fresh = await fetchNfeById(nfeId);
    if (fresh) {
      const parsed = pickNfeFields(fresh);
      numero = numero ?? parsed.numero;
      linkDanfe = linkDanfe ?? parsed.linkDanfe;
    }
  }

  return { nfeId, numero, linkDanfe };
}

export function isBlingNfeEnabled(): boolean {
  if (process.env.BLING_NFE_ENABLED === "false") return false;
  return true;
}
