import { createAdminClient } from "@/lib/supabase/client";
import { blingFetch, isBlingConfigured } from "@/lib/bling/client";
import { emitNfeForSaleOrder, isBlingNfeEnabled } from "@/lib/bling/emit-nfe";
import {
  expandSkuCandidates,
  findBlingProductId,
  findBlingSaleIdByNumber,
  findOrCreateBlingContact,
  isBlingDuplicateOrderNumberError,
} from "@/lib/bling/resolve-entities";

type BlingSalePayload = {
  contato: { id: number };
  data: string;
  observacoes?: string;
  itens: Array<{
    produto: { id: number };
    quantidade: number;
    valor: number;
  }>;
};

async function resolveProductSkuCandidates(
  admin: ReturnType<typeof createAdminClient>,
  productId: string | null,
): Promise<string[]> {
  if (!productId) return [];

  const { data: product } = await admin
    .from("products")
    .select("sku, slug, shopee_id")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return [];

  const merged = new Set<string>();
  if (product.sku) {
    for (const c of expandSkuCandidates(String(product.sku))) merged.add(c);
  }
  if (product.slug) {
    for (const c of expandSkuCandidates(String(product.slug))) merged.add(c);
  }
  if (product.shopee_id != null) {
    merged.add(String(product.shopee_id));
  }

  return [...merged];
}

async function tryEmitNfeForOrder(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  pedidoVendaId: number,
): Promise<void> {
  if (!isBlingNfeEnabled()) return;

  try {
    const nfe = await emitNfeForSaleOrder(pedidoVendaId);
    await admin
      .from("orders")
      .update({
        nfe_number: nfe.numero,
        nfe_url: nfe.linkDanfe,
        bling_sync_error: null,
      })
      .eq("id", orderId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao emitir NF-e no Bling";
    await admin
      .from("orders")
      .update({ bling_sync_error: `Pedido no Bling OK; NF-e: ${message}` })
      .eq("id", orderId);
  }
}

/** Envia pedido pago ao Bling e emite NF-e via API (sem gatilho automático do painel). */
export async function syncOrderToBling(orderId: string): Promise<void> {
  if (!isBlingConfigured()) return;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      `id, order_number, total, shipping, bling_order_id, bling_sync_status, nfe_number,
       shipping_address, customer_name, customer_email, customer_cpf,
       items:order_items(id, product_id, product_name, quantity, unit_price)`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return;

  if (order.bling_order_id && order.nfe_number) return;
  if (order.bling_sync_status === "synced" && order.nfe_number) return;

  if (order.bling_order_id && !order.nfe_number) {
    await tryEmitNfeForOrder(admin, orderId, Number(order.bling_order_id));
    return;
  }

  if (order.bling_order_id) return;
  if (order.bling_sync_status === "synced") return;

  await admin
    .from("orders")
    .update({ bling_sync_status: "pending", bling_sync_error: null })
    .eq("id", orderId);

  const addr = order.shipping_address as Record<string, string> | null;
  const items = (order.items ?? []) as {
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];

  if (!items.length) {
    await admin
      .from("orders")
      .update({
        bling_sync_status: "error",
        bling_sync_error: "Pedido sem itens — impossível enviar ao Bling.",
      })
      .eq("id", orderId);
    return;
  }

  const cpf = (order.customer_cpf ?? addr?.cpf ?? "").replace(/\D/g, "");
  const nome = order.customer_name ?? addr?.full_name ?? "Cliente";
  const email = order.customer_email ?? addr?.email ?? undefined;

  let contatoId: number;
  try {
    contatoId = await findOrCreateBlingContact({
      nome,
      cpf,
      email,
      tipoPessoa: cpf.length > 11 ? "J" : "F",
      endereco: addr
        ? {
            cep: addr.zip?.replace(/\D/g, ""),
            endereco: addr.street,
            numero: addr.number,
            bairro: addr.neighborhood,
            municipio: addr.city,
            uf: addr.state,
          }
        : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao resolver contato no Bling";
    await admin
      .from("orders")
      .update({ bling_sync_status: "error", bling_sync_error: message })
      .eq("id", orderId);
    return;
  }

  const blingItens: BlingSalePayload["itens"] = [];
  const missingSkus: string[] = [];

  for (const item of items) {
    const candidates = await resolveProductSkuCandidates(admin, item.product_id);
    const productId = candidates.length ? await findBlingProductId(candidates) : null;

    if (!productId) {
      missingSkus.push(candidates[0] ?? item.product_name);
      continue;
    }

    blingItens.push({
      produto: { id: productId },
      quantidade: item.quantity,
      valor: Number(item.unit_price),
    });
  }

  if (!blingItens.length) {
    const message =
      missingSkus.length > 0
        ? `Produto(s) não encontrado(s) no Bling: ${missingSkus.join(", ")}. Cadastre com o mesmo SKU/slug ou preencha o campo SKU no admin.`
        : "Nenhum item válido para enviar ao Bling.";
    await admin
      .from("orders")
      .update({ bling_sync_status: "error", bling_sync_error: message })
      .eq("id", orderId);
    return;
  }

  const orderNumber = Number(order.order_number ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const payload: BlingSalePayload = {
    contato: { id: contatoId },
    data: new Date().toISOString().slice(0, 10),
    itens: blingItens,
    observacoes: `Pedido Iseul online${orderNumber ? ` #${orderNumber}` : ""}${shipping > 0 ? `. Frete: R$ ${shipping.toFixed(2)}` : ""}`,
  };

  const result = await blingFetch<{ data?: { id?: number } }>("/pedidos/vendas", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  let blingId = result.ok ? result.data.data?.id : undefined;

  if (!result.ok) {
    if (orderNumber > 0 && isBlingDuplicateOrderNumberError(result.error)) {
      const existingId = await findBlingSaleIdByNumber(orderNumber, contatoId);
      if (existingId) blingId = existingId;
    }

    if (!blingId) {
      await admin
        .from("orders")
        .update({ bling_sync_status: "error", bling_sync_error: result.error })
        .eq("id", orderId);
      return;
    }
  }

  await admin
    .from("orders")
    .update({
      bling_order_id: blingId ? String(blingId) : null,
      bling_sync_status: "synced",
      bling_sync_error: null,
    })
    .eq("id", orderId);

  if (blingId) {
    await tryEmitNfeForOrder(admin, orderId, blingId);
  }
}
