import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import type { Order, OrderItem, OrderStatus } from "@/types";

export type AdminOrderDetail = {
  order: Order;
  items: OrderItem[];
};

export async function getOrderById(id: string): Promise<AdminOrderDetail | null> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return null;

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const { data: items } = await admin.from("order_items").select("*").eq("order_id", id);

  return {
    order: {
      id: String(order.id),
      order_number: Number(order.order_number),
      customer_id: order.customer_id ? String(order.customer_id) : null,
      status: order.status as OrderStatus,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      mercadopago_payment_id: order.mercadopago_payment_id,
      asaas_payment_id: order.asaas_payment_id ?? null,
      asaas_checkout_id: order.asaas_checkout_id ?? null,
      bling_order_id: order.bling_order_id ?? null,
      bling_sync_status: order.bling_sync_status ?? null,
      bling_sync_error: order.bling_sync_error ?? null,
      nfe_number: order.nfe_number ?? null,
      nfe_url: order.nfe_url ?? null,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      shipping_method: order.shipping_method ?? null,
      shipping_service_id: order.shipping_service_id ?? null,
      tracking_code: order.tracking_code ?? null,
      notes: order.notes ?? null,
      melhor_envio_cart_id: order.melhor_envio_cart_id ?? null,
      melhor_envio_order_id: order.melhor_envio_order_id ?? null,
      melhor_envio_label_url: order.melhor_envio_label_url ?? null,
      melhor_envio_status: order.melhor_envio_status ?? null,
      melhor_envio_error: order.melhor_envio_error ?? null,
      shipping_address: order.shipping_address as Record<string, string> | null,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_cpf: order.customer_cpf,
      ordered_at: order.ordered_at,
      paid_at: order.paid_at,
    },
    items: (items ?? []).map((item) => ({
      id: String(item.id),
      order_id: String(item.order_id),
      product_id: item.product_id ? String(item.product_id) : null,
      product_name: item.product_name,
      product_brand: item.product_brand,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    })),
  };
}
