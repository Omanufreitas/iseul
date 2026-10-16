import { blingFetch } from "@/lib/bling/client";
import { emitNfeForSaleOrder, isBlingNfeEnabled } from "@/lib/bling/emit-nfe";
import { createAdminClient } from "@/lib/supabase/client";

export type OrderNfeInvoice = {
  key: string;
  number: string | null;
  /** valorNota da NF-e no Bling (subtotal + frete declarado na nota). */
  declaredValue: number | null;
  series: string | null;
  /** Data de emissão no formato YYYY-MM-DD. */
  issuedOn: string | null;
  productValue: number | null;
};

type NfeRow = {
  numero?: string | number;
  serie?: string | number;
  dataEmissao?: string;
  chaveAcesso?: string;
  linkDanfe?: string;
  linkPDF?: string;
  valorNota?: number | string;
  valorProdutos?: number | string;
};

function parseDeclaredValue(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseNfeIssuedOn(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return null;
}

export function nfeIdentityFromKey(key: string): { series: string; number: string } | null {
  const digits = key.replace(/\D/g, "");
  if (digits.length !== 44) return null;
  return {
    series: String(Number(digits.slice(22, 25))),
    number: String(Number(digits.slice(25, 34))),
  };
}

function pickNfeInvoice(data: NfeRow | undefined | null): OrderNfeInvoice | null {
  const key = String(data?.chaveAcesso ?? "").replace(/\D/g, "");
  if (key.length !== 44) return null;
  const fromKey = nfeIdentityFromKey(key);
  return {
    key,
    number: data?.numero != null ? String(data.numero) : (fromKey?.number ?? null),
    declaredValue: parseDeclaredValue(data?.valorNota),
    series: data?.serie != null ? String(data.serie) : (fromKey?.series ?? null),
    issuedOn: parseNfeIssuedOn(data?.dataEmissao),
    productValue: parseDeclaredValue(data?.valorProdutos),
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
    const fromKey = nfeIdentityFromKey(storedKey);
    const pedidoVendaId = order.bling_order_id
      ? Number.parseInt(String(order.bling_order_id), 10)
      : NaN;
    let fresh: OrderNfeInvoice | null = null;
    if (Number.isFinite(pedidoVendaId)) {
      const nfeId = await fetchNfeIdFromPedido(pedidoVendaId);
      if (nfeId) fresh = await fetchNfeInvoiceById(nfeId);
    }
    return {
      key: storedKey,
      number: fresh?.number ?? order.nfe_number ?? fromKey?.number ?? null,
      declaredValue: fresh?.declaredValue ?? null,
      series: fresh?.series ?? fromKey?.series ?? null,
      issuedOn: fresh?.issuedOn ?? null,
      productValue: fresh?.productValue ?? null,
    };
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
