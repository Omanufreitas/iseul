import { createAdminClient } from "@/lib/supabase/client";
import { getPaymentDetails, searchApprovedPaymentByReference } from "@/lib/mercadopago";

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
      mercadopago_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await admin.from("stock_reservations").delete().eq("order_id", orderId);
  await decrementStockForOrder(orderId);

  return { alreadyPaid: false };
}

export async function syncOrderPaymentFromMercadoPago(paymentId: string) {
  const payment = await getPaymentDetails(paymentId);
  if (!payment?.external_reference) {
    return { status: 200, body: { received: true, skipped: "no_reference" } };
  }

  if (payment.status === "approved") {
    const result = await markOrderPaid(payment.external_reference, String(payment.id));
    return { status: 200, body: { ok: true, paid: true, ...result } };
  }

  if (payment.status === "rejected" || payment.status === "cancelled") {
    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ payment_status: "recusado", status: "cancelado" })
      .eq("id", payment.external_reference)
      .eq("payment_status", "pendente");
    await admin.from("stock_reservations").delete().eq("order_id", payment.external_reference);
  }

  return { status: 200, body: { ok: true, status: payment.status } };
}

export async function syncOrderByReference(orderId: string) {
  const approved = await searchApprovedPaymentByReference(orderId);
  if (!approved) return { paid: false };
  await markOrderPaid(orderId, String(approved.id));
  return { paid: true };
}
