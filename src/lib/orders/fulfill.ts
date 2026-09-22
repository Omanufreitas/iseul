import { createAdminClient } from "@/lib/supabase/client";
import {
  findConfirmedPaymentForOrder,
  getAsaasPayment,
  isConfirmedAsaasPaymentStatus,
} from "@/lib/asaas";
import { syncOrderToBling } from "@/lib/bling/sync-order";
import { sendMetaPurchaseFromPaidOrder } from "@/lib/meta-capi";

export async function releaseExpiredReservations() {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin.from("stock_reservations").delete().lt("expires_at", now);
}

async function decrementStockForOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.product_id) continue;

    const { data: product } = await admin
      .from("products")
      .select("stock, sold_count")
      .eq("id", item.product_id)
      .maybeSingle();
    if (!product) continue;

    if (item.variant_id) {
      const { data: variant } = await admin
        .from("product_variants")
        .select("stock, product_id")
        .eq("id", item.variant_id)
        .maybeSingle();
      if (variant) {
        await admin
          .from("product_variants")
          .update({ stock: Math.max(0, Number(variant.stock) - item.quantity) })
          .eq("id", item.variant_id);

        const { data: variants } = await admin
          .from("product_variants")
          .select("stock, active, price")
          .eq("product_id", variant.product_id);

        const active = (variants ?? []).filter((v) => v.active);
        const stock = active.reduce((sum, v) => sum + Number(v.stock), 0);
        const price = active.length ? Math.min(...active.map((v) => Number(v.price))) : 0;

        await admin
          .from("products")
          .update({
            stock,
            price,
            sold_count: Number(product.sold_count) + item.quantity,
          })
          .eq("id", item.product_id);
      }
      continue;
    }

    await admin
      .from("products")
      .update({
        stock: Math.max(0, Number(product.stock) - item.quantity),
        sold_count: Number(product.sold_count) + item.quantity,
      })
      .eq("id", item.product_id);
  }
}

export async function markOrderPaid(orderId: string, paymentId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, coupon_code")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.payment_status === "aprovado") {
    return { alreadyPaid: true };
  }

  await admin
    .from("orders")
    .update({
      payment_status: "aprovado",
      status: "pago",
      asaas_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await admin.from("stock_reservations").delete().eq("order_id", orderId);
  await decrementStockForOrder(orderId);

  if (order.coupon_code) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("used_count")
      .eq("code", order.coupon_code)
      .maybeSingle();
    if (coupon) {
      await admin
        .from("coupons")
        .update({ used_count: Number(coupon.used_count) + 1 })
        .eq("code", order.coupon_code);
    }
  }

  try {
    await syncOrderToBling(orderId);
  } catch (e) {
    console.error("[bling]", e);
  }

  try {
    await sendMetaPurchaseFromPaidOrder(orderId);
  } catch (e) {
    console.error("[meta-capi]", e);
  }

  return { alreadyPaid: false };
}

async function markOrderFailed(orderId: string) {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ payment_status: "cancelado", status: "cancelado" })
    .eq("id", orderId)
    .eq("payment_status", "pendente");
  await admin.from("stock_reservations").delete().eq("order_id", orderId);
}

export async function syncOrderPaymentFromAsaas(
  paymentId: string,
  webhookHints?: {
    checkoutSession?: string | null;
    externalReference?: string | null;
  },
) {
  const payment = await getAsaasPayment(paymentId);
  if (!payment) {
    return { status: 200, body: { received: true, skipped: "payment_not_found" } };
  }

  let orderId = payment.externalReference ?? webhookHints?.externalReference ?? null;
  const checkoutSession = payment.checkoutSession ?? webhookHints?.checkoutSession ?? null;

  if (!orderId && checkoutSession) {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("asaas_checkout_id", checkoutSession)
      .maybeSingle();
    orderId = order?.id ?? null;
  }

  if (!orderId) {
    return { status: 200, body: { received: true, skipped: "no_reference" } };
  }

  if (isConfirmedAsaasPaymentStatus(payment.status)) {
    const result = await markOrderPaid(orderId, payment.id);
    return { status: 200, body: { ok: true, paid: true, ...result } };
  }

  if (
    payment.status === "OVERDUE" ||
    payment.status === "REFUNDED" ||
    payment.status === "RECEIVED_IN_CASH_UNDONE"
  ) {
    await markOrderFailed(orderId);
  }

  return { status: 200, body: { ok: true, status: payment.status } };
}

export async function syncOrderByReference(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, asaas_checkout_id, total, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.payment_status === "aprovado") {
    return { paid: order?.payment_status === "aprovado", alreadyPaid: true };
  }

  const approved = await findConfirmedPaymentForOrder({
    orderId: order.id,
    checkoutSessionId: order.asaas_checkout_id,
    total: Number(order.total),
    customerEmail: order.customer_email,
  });
  if (!approved) return { paid: false };
  await markOrderPaid(orderId, approved.id);
  return { paid: true };
}

export async function confirmOrderPaymentManually(orderId: string) {
  const syncResult = await syncOrderByReference(orderId);
  if (syncResult.paid) {
    return { ok: true as const, source: "asaas" as const };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false as const, error: "Pedido não encontrado." };
  }
  if (order.payment_status === "aprovado") {
    return { ok: true as const, source: "already_paid" as const };
  }

  await markOrderPaid(orderId, `manual-${orderId}`);
  return { ok: true as const, source: "manual" as const };
}
