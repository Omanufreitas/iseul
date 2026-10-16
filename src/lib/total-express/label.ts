import { onlyDigits } from "@/lib/br-document";
import { resolveOrderNfeInvoice } from "@/lib/bling/nfe-invoice";
import { sendOrderShippedEmail } from "@/lib/email/order-emails";
import { MelhorEnvioError } from "@/lib/melhor-envio/client";
import { createAdminClient } from "@/lib/supabase/client";
import { getTotalExpressCredentials } from "./config";
import { buildSmartLabelPayload, registerSmartLabel, TotalExpressError } from "./register";
import { TOTAL_EXPRESS_LABEL_STATUS, totalExpressLabelPath } from "./shipment";

export type TotalExpressLabelResult = {
  labelUrl: string;
  trackingCode: string | null;
  melhorEnvioOrderId: null;
  status: "generated";
  message: string;
};

function fail(message: string): never {
  throw new MelhorEnvioError(message);
}

export async function generateTotalExpressLabelForOrder(
  orderId: string
): Promise<TotalExpressLabelResult> {
  const credentials = getTotalExpressCredentials();
  if (!credentials) fail("Contrato da Total Express não configurado.");

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select(
      `id, order_number, status, tracking_code, shipped_email_sent_at, subtotal, shipping,
       shipping_address, customer_cpf, customer_phone, customer_email, customer_name,
       melhor_envio_status,
       items:order_items(product_name, quantity, variant_id)`
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) fail("Pedido não encontrado");

  const labelUrl = totalExpressLabelPath(orderId);
  const existingTracking = String(order.tracking_code ?? "").trim();
  if (order.melhor_envio_status === TOTAL_EXPRESS_LABEL_STATUS && existingTracking) {
    return {
      labelUrl,
      trackingCode: existingTracking,
      melhorEnvioOrderId: null,
      status: "generated",
      message: "Envio já registrado na Total Express.",
    };
  }

  const addr = (order.shipping_address ?? {}) as Record<string, string>;
  if (!addr.zip || !addr.street || !addr.city || !addr.state || !addr.neighborhood) {
    fail("Pedido sem endereço de entrega completo");
  }

  const { data: storeRow } = await admin.from("store_settings").select("shipper_document").eq("id", 1).maybeSingle();
  const shipperDocument = String(
    (storeRow as { shipper_document?: string } | null)?.shipper_document ?? "63829102000134"
  );

  const recipientDoc = onlyDigits(addr.cpf ?? "") || onlyDigits(order.customer_cpf ?? "");
  const items = (order.items ?? []) as Array<{
    product_name: string;
    quantity: number;
    variant_id: string | null;
  }>;

  let invoice;
  try {
    invoice = await resolveOrderNfeInvoice(orderId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "NF-e indisponível para este pedido.";
    await admin
      .from("orders")
      .update({ melhor_envio_status: "error", melhor_envio_error: message })
      .eq("id", orderId);
    fail(message);
  }

  const issuedOn = invoice.issuedOn;
  const series = invoice.series;
  const number = invoice.number;
  if (!issuedOn || !series || !number) {
    const message = "NF-e sem número, série ou data de emissão no Bling.";
    await admin
      .from("orders")
      .update({ melhor_envio_status: "error", melhor_envio_error: message })
      .eq("id", orderId);
    fail(message);
  }

  const variantIds = items.map((item) => item.variant_id).filter(Boolean) as string[];
  const weights = new Map<string, number>();
  if (variantIds.length) {
    const { data: variants } = await admin
      .from("product_variants")
      .select("id, weight_grams")
      .in("id", variantIds);
    for (const variant of variants ?? []) {
      weights.set(variant.id, variant.weight_grams ?? 250);
    }
  }
  const weightKg = items.reduce((sum, item) => {
    const grams = item.variant_id ? (weights.get(item.variant_id) ?? 250) : 250;
    return sum + (grams / 1000) * Math.max(1, item.quantity);
  }, 0);

  const noteTotal = invoice.declaredValue ?? Number(order.subtotal ?? 0) + Number(order.shipping ?? 0);
  const productTotal = invoice.productValue ?? Number(order.subtotal ?? 0);

  let payload;
  try {
    payload = buildSmartLabelPayload({
      reid: credentials.reid,
      shipperDocument,
      orderNumber: String(order.order_number),
      productName: items[0]?.product_name ?? "COSMETICOS",
      weightKg,
      recipient: {
        name: addr.full_name ?? order.customer_name ?? "Cliente",
        document: recipientDoc,
        email: addr.email ?? order.customer_email ?? "",
        phone: addr.phone ?? order.customer_phone ?? "",
        street: addr.street,
        number: addr.number ?? "S/N",
        complement: addr.complement ?? "",
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
      },
      invoice: {
        number,
        series,
        issuedOn,
        total: noteTotal,
        products: productTotal,
        key: invoice.key,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dados insuficientes para a Total Express.";
    await admin
      .from("orders")
      .update({ melhor_envio_status: "error", melhor_envio_error: message })
      .eq("id", orderId);
    fail(message);
  }

  try {
    const registered = await registerSmartLabel(payload);
    const updates: Record<string, unknown> = {
      tracking_code: registered.awb,
      melhor_envio_status: TOTAL_EXPRESS_LABEL_STATUS,
      melhor_envio_label_url: labelUrl,
      melhor_envio_error: null,
      melhor_envio_cart_id: registered.rota || null,
      melhor_envio_order_id: null,
    };
    if (order.status !== "enviado" && order.status !== "entregue") {
      updates.status = "enviado";
    }
    await admin.from("orders").update(updates).eq("id", orderId);

    if (!order.shipped_email_sent_at) {
      try {
        await sendOrderShippedEmail(orderId);
      } catch (e) {
        console.error("[email:enviado]", e);
      }
    }

    return {
      labelUrl,
      trackingCode: registered.awb,
      melhorEnvioOrderId: null,
      status: "generated",
      message: "Envio registrado na Total Express. O valor entra na fatura mensal.",
    };
  } catch (e) {
    const message =
      e instanceof TotalExpressError || e instanceof MelhorEnvioError
        ? e.message
        : "Erro ao registrar o envio na Total Express.";
    await admin
      .from("orders")
      .update({ melhor_envio_status: "error", melhor_envio_error: message })
      .eq("id", orderId);
    fail(message);
  }
}
