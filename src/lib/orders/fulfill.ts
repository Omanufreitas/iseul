import { createAdminClient } from "@/lib/supabase/client";
import {
  findConfirmedPaymentForReference,
  getAsaasPayment,
  isConfirmedAsaasPaymentStatus,
} from "@/lib/asaas";
import { syncOrderToBling } from "@/lib/bling/sync-order";

export async function releaseExpiredReservations() {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin.from("stock_reservations").delete().lt("expires_at", now);
}

async function decrementStockForOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await admin
      .from("products")
      .select("stock, sold_count")
      .eq("id", item.product_id)
      .maybeSingle();
    if (!product) continue;
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
    .select("id, payment_status")
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

  try {
    await syncOrderToBling(orderId);
  } catch (e) {
    console.error("[bling]", e);
  }

  return { alreadyPaid: false };
}

async function markOrderFailed(orderId: string) {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ payment_status: "recusado", status: "cancelado" })
    .eq("id", orderId)
    .eq("payment_status", "pendente");
  await admin.from("stock_reservations").delete().eq("order_id", orderId);
}

export async function syncOrderPaymentFromAsaas(paymentId: string) {
  const payment = await getAsaasPayment(paymentId);
  if (!payment?.externalReference) {
    return { status: 200, body: { received: true, skipped: "no_reference" } };
  }

  if (isConfirmedAsaasPaymentStatus(payment.status)) {
    const result = await markOrderPaid(payment.externalReference, payment.id);
    return { status: 200, body: { ok: true, paid: true, ...result } };
  }

  if (
    payment.status === "OVERDUE" ||
    payment.status === "REFUNDED" ||
    payment.status === "RECEIVED_IN_CASH_UNDONE"
  ) {
    await markOrderFailed(payment.externalReference);
  }

  return { status: 200, body: { ok: true, status: payment.status } };
}

export async function syncOrderByReference(orderId: string) {
  const approved = await findConfirmedPaymentForReference(orderId);
  if (!approved) return { paid: false };
  await markOrderPaid(orderId, approved.id);
  return { paid: true };
}
