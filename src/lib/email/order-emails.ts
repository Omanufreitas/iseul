import { createAdminClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";
import { productImagesFromRow } from "@/lib/product-image";
import {
  absoluteAssetUrl,
  carrierTrackingCode,
  firstName,
  formatAddress,
  formatBrl,
  formatOrderDate,
  paymentMethodLabel,
  shippingLabel,
  trackingUrl,
} from "@/lib/email/format";
import { sendTransactionalEmail } from "@/lib/email/mailer";
import { renderPedidoConfirmadoHtml, renderPedidoEnviadoHtml } from "@/lib/email/templates";

type LoadedOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  payment_method: string | null;
  shipping_method: string | null;
  shipping_address: Record<string, string> | null;
  tracking_code: string | null;
  nfe_number: string | null;
  paid_at: string | null;
  ordered_at: string | null;
  confirmation_email_sent_at?: string | null;
  shipped_email_sent_at?: string | null;
};

type LoadedItem = {
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_brand: string | null;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  image: string | null;
};

async function loadOrderForEmail(orderId: string): Promise<{ order: LoadedOrder; items: LoadedItem[] } | null> {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) return null;

  const { data: itemRows } = await admin
    .from("order_items")
    .select("product_id, variant_id, product_name, product_brand, variant_label, quantity, unit_price")
    .eq("order_id", orderId);

  const productIds = [...new Set((itemRows ?? []).map((row) => row.product_id).filter(Boolean))] as string[];
  const variantIds = [...new Set((itemRows ?? []).map((row) => row.variant_id).filter(Boolean))] as string[];

  const imageByProduct = new Map<string, string>();
  const imageByVariant = new Map<string, string>();

  if (productIds.length) {
    const { data: products } = await admin.from("products").select("id, image_url, image_urls").in("id", productIds);
    for (const product of products ?? []) {
      const urls = productImagesFromRow(product);
      const url = absoluteAssetUrl(urls[0] ?? product.image_url, SITE_URL);
      if (url) imageByProduct.set(String(product.id), url);
    }
  }

  if (variantIds.length) {
    const { data: variants } = await admin.from("product_variants").select("id, image_url").in("id", variantIds);
    for (const variant of variants ?? []) {
      const url = absoluteAssetUrl(variant.image_url, SITE_URL);
      if (url) imageByVariant.set(String(variant.id), url);
    }
  }

  return {
    order: {
      id: String(order.id),
      order_number: Number(order.order_number),
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      coupon_code: order.coupon_code ?? null,
      payment_method: order.payment_method ?? null,
      shipping_method: order.shipping_method ?? null,
      shipping_address: (order.shipping_address as Record<string, string> | null) ?? null,
      tracking_code: order.tracking_code ?? null,
      nfe_number: order.nfe_number ?? null,
      paid_at: order.paid_at ?? null,
      ordered_at: order.ordered_at ?? null,
      confirmation_email_sent_at: order.confirmation_email_sent_at ?? null,
      shipped_email_sent_at: order.shipped_email_sent_at ?? null,
    },
    items: (itemRows ?? []).map((row) => ({
      product_id: row.product_id ? String(row.product_id) : null,
      variant_id: row.variant_id ? String(row.variant_id) : null,
      product_name: row.product_name,
      product_brand: row.product_brand ?? null,
      variant_label: row.variant_label ?? null,
      quantity: Number(row.quantity),
      unit_price: Number(row.unit_price),
      image:
        (row.variant_id ? imageByVariant.get(String(row.variant_id)) : undefined) ??
        (row.product_id ? imageByProduct.get(String(row.product_id)) ?? null : null),
    })),
  };
}

async function markEmailSent(orderId: string, field: "confirmation_email_sent_at" | "shipped_email_sent_at") {
  try {
    await createAdminClient()
      .from("orders")
      .update({ [field]: new Date().toISOString() })
      .eq("id", orderId);
  } catch (err) {
    console.error("[email]", err);
  }
}

export async function sendOrderConfirmedEmail(
  orderId: string,
  options?: { force?: boolean },
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const loaded = await loadOrderForEmail(orderId);
  if (!loaded) return { ok: false, error: "Pedido não encontrado." };
  if (loaded.order.confirmation_email_sent_at && !options?.force) return { ok: true, skipped: true };

  const to = loaded.order.customer_email?.trim().toLowerCase();
  if (!to) return { ok: false, error: "Pedido sem e-mail da cliente." };

  const endereco = formatAddress(loaded.order.shipping_address);
  const transportadora = shippingLabel({
    shippingMethod: loaded.order.shipping_method,
    address: loaded.order.shipping_address,
  });

  const html = renderPedidoConfirmadoHtml({
    numero: String(loaded.order.order_number),
    primeiroNome: firstName(loaded.order.customer_name),
    itens: loaded.items.map((item) => ({
      name: item.product_name,
      brand: item.product_brand,
      variant: item.variant_label,
      quantity: item.quantity,
      price: formatBrl(item.unit_price * item.quantity),
      image: item.image,
    })),
    subtotal: formatBrl(loaded.order.subtotal),
    desconto:
      loaded.order.discount > 0
        ? { valor: formatBrl(loaded.order.discount), cupom: loaded.order.coupon_code }
        : null,
    frete: {
      transportadora,
      valor: loaded.order.shipping > 0 ? formatBrl(loaded.order.shipping) : "Grátis",
    },
    total: formatBrl(loaded.order.total),
    pagamento: { metodo: paymentMethodLabel(loaded.order.payment_method) },
    nfe: loaded.order.nfe_number,
    data: formatOrderDate(loaded.order.paid_at ?? loaded.order.ordered_at),
    endereco,
  });

  const result = await sendTransactionalEmail({
    to,
    subject: `Pedido #${loaded.order.order_number} confirmado · Iseul`,
    html,
  });
  if (result.ok) await markEmailSent(orderId, "confirmation_email_sent_at");
  if (!result.ok) console.error("[email:confirmado]", result.error);
  return result;
}

export async function sendOrderShippedEmail(
  orderId: string,
  options?: { force?: boolean },
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const loaded = await loadOrderForEmail(orderId);
  if (!loaded) return { ok: false, error: "Pedido não encontrado." };
  if (loaded.order.shipped_email_sent_at && !options?.force) return { ok: true, skipped: true };

  const to = loaded.order.customer_email?.trim().toLowerCase();
  if (!to) return { ok: false, error: "Pedido sem e-mail da cliente." };

  const endereco = formatAddress(loaded.order.shipping_address);
  const transportadora = shippingLabel({
    shippingMethod: loaded.order.shipping_method,
    address: loaded.order.shipping_address,
  });
  const tracking = carrierTrackingCode(loaded.order.tracking_code);
  const codigo = tracking || "Código em atualização";
  const rastreioUrl = tracking ? trackingUrl(tracking) : null;

  const html = renderPedidoEnviadoHtml({
    numero: String(loaded.order.order_number),
    primeiroNome: firstName(loaded.order.customer_name),
    frete: { transportadora },
    rastreio: {
      codigo,
      url: rastreioUrl || SITE_URL,
      instrucao: tracking
        ? null
        : "O código da transportadora ainda está sendo gerado. Assim que sair, você recebe outro e-mail com o link de rastreio.",
    },
    endereco,
    itens: loaded.items.map((item) => ({
      quantidade: item.quantity,
      nome: item.product_name,
      variante: item.variant_label,
    })),
  });

  const result = await sendTransactionalEmail({
    to,
    subject: `Seu pedido #${loaded.order.order_number} saiu · Iseul`,
    html,
  });
  if (result.ok) await markEmailSent(orderId, "shipped_email_sent_at");
  if (!result.ok) console.error("[email:enviado]", result.error);
  return result;
}
