import { blingFetch } from "@/lib/bling/client";
import { emitNfeForSaleOrder, isBlingNfeEnabled } from "@/lib/bling/emit-nfe";
import { createAdminClient } from "@/lib/supabase/client";

export type OrderNfeInvoice = {
  key: string;
  number: string | null;
  /** valorNota da NF-e no Bling (subtotal + frete declarado na nota). */
  declaredValue: number | null;
};

type NfeRow = {
  numero?: string | number;
  chaveAcesso?: string;
  linkDanfe?: string;
  linkPDF?: string;
  valorNota?: number | string;
};

function parseDeclaredValue(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function pickNfeInvoice(data: NfeRow | undefined | null): OrderNfeInvoice | null {
  const key = String(data?.chaveAcesso ?? "").replace(/\D/g, "");
  if (key.length !== 44) return null;
  return {
    key,
    number: data?.numero != null ? String(data.numero) : null,
    declaredValue: parseDeclaredValue(data?.valorNota),
  };
}

async function fetchNfeInvoiceById(nfeId: number): Promise<OrderNfeInvoice | null> {
  const result = await blingFetch<{ data?: NfeRow }>(`/nfe/${nfeId}`);
  if (!result.ok) return null;
  return pickNfeInvoice(result.data.data);
}

async function fetchNfeIdFromPedido(pedidoVendaId: number): Promise<number | null> {
  const pedido = await blingFetch<{ data?: { notaFiscal?: { id?: number } } }>(
    `/pedidos/vendas/${pedidoVendaId}`
  );
  if (!pedido.ok) return null;
  const nfeId = pedido.data.data?.notaFiscal?.id;
  return nfeId ?? null;
}

/** Garante NF-e com chave de acesso para envio comercial (Total Express / CNPJ). */
export async function resolveOrderNfeInvoice(orderId: string): Promise<OrderNfeInvoice> {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, bling_order_id, nfe_key, nfe_number, nfe_url")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    throw new Error("Pedido não encontrado.");
  }

  const storedKey = String(order.nfe_key ?? "").replace(/\D/g, "");
  if (storedKey.length === 44) {
    const pedidoVendaId = order.bling_order_id
      ? Number.parseInt(String(order.bling_order_id), 10)
      : NaN;
    let declaredValue: number | null = null;
    if (Number.isFinite(pedidoVendaId)) {
      const nfeId = await fetchNfeIdFromPedido(pedidoVendaId);
      if (nfeId) {
        const fresh = await fetchNfeInvoiceById(nfeId);
        declaredValue = fresh?.declaredValue ?? null;
      }
    }
    return { key: storedKey, number: order.nfe_number ?? null, declaredValue };
  }

  const pedidoVendaId = order.bling_order_id ? Number.parseInt(String(order.bling_order_id), 10) : NaN;
  if (!Number.isFinite(pedidoVendaId)) {
    throw new Error(
      "Pedido ainda não está no Bling. Sincronize o pedido e emita a NF-e antes de gerar a etiqueta."
    );
  }

  let nfeId = await fetchNfeIdFromPedido(pedidoVendaId);

  if (!nfeId && isBlingNfeEnabled()) {
    const emitted = await emitNfeForSaleOrder(pedidoVendaId);
    nfeId = emitted.nfeId;
  }

  if (!nfeId) {
    throw new Error(
      "NF-e não encontrada no Bling. Emita a nota fiscal do pedido antes de gerar a etiqueta."
    );
  }

  const invoice = await fetchNfeInvoiceById(nfeId);
  if (!invoice) {
    throw new Error(
      "NF-e sem chave de acesso no Bling. Aguarde a autorização da SEFAZ ou reenvie a nota."
    );
  }

  await admin
    .from("orders")
    .update({
      nfe_key: invoice.key,
      nfe_number: invoice.number ?? order.nfe_number,
      bling_sync_error: null,
    })
    .eq("id", orderId);

  return invoice;
}
