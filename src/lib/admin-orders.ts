import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { endOfDay, startOfDay } from "@/lib/dashboard-dates";
import type { Order, OrderItem, OrderStatus } from "@/types";

export type AdminOrderDetail = {
  order: Order;
  items: OrderItem[];
};

export type OrderListFilters = {
  q?: string;
  productId?: string;
  from?: string;
  to?: string;
  paymentStatus?: string;
  orderStatus?: string;
  limit?: number;
};

export type AdminOrderListItem = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  status: string;
  payment_status: string;
  ordered_at: string;
  items: {
    product_id: string | null;
    product_name: string;
    product_brand: string | null;
    variant_label: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

type OrderRow = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  status: string;
  payment_status: string;
  ordered_at: string;
  order_items: {
    product_id: string | null;
    product_name: string;
    product_brand: string | null;
    variant_label: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[] | null;
};

function mapOrderRow(row: OrderRow): AdminOrderListItem {
  return {
    id: String(row.id),
    order_number: Number(row.order_number),
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    discount: Number(row.discount),
    total: Number(row.total),
    coupon_code: row.coupon_code ?? null,
    status: row.status,
    payment_status: row.payment_status,
    ordered_at: row.ordered_at,
    items: (row.order_items ?? []).map((item) => ({
      product_id: item.product_id ? String(item.product_id) : null,
      product_name: item.product_name,
      product_brand: item.product_brand ?? null,
      variant_label: item.variant_label ?? null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    })),
  };
}

export async function listOrderFilterProducts(): Promise<{ id: string; name: string }[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data } = await admin.from("products").select("id, name").order("name");
  return (data ?? []).map((p) => ({ id: String(p.id), name: p.name }));
}

export async function listOrdersAdmin(filters: OrderListFilters = {}): Promise<AdminOrderListItem[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const limit = filters.limit ?? 200;
  const productId = filters.productId?.trim();

  let orderIdsForProduct: string[] | null = null;
  if (productId) {
    const { data: itemRows, error: itemsError } = await admin
      .from("order_items")
      .select("order_id")
      .eq("product_id", productId);
    if (itemsError) throw new Error(itemsError.message);
    orderIdsForProduct = [...new Set((itemRows ?? []).map((row) => String(row.order_id)))];
    if (!orderIdsForProduct.length) return [];
  }

  let query = admin
    .from("orders")
    .select(
      `id, order_number, customer_name, customer_email, subtotal, shipping, discount, total, coupon_code, status, payment_status, ordered_at,
       order_items ( product_id, product_name, product_brand, variant_label, quantity, unit_price, line_total )`,
    )
    .order("ordered_at", { ascending: false })
    .limit(limit);

  if (orderIdsForProduct) {
    query = query.in("id", orderIdsForProduct);
  }

  if (filters.from) {
    const from = startOfDay(new Date(`${filters.from}T12:00:00`));
    if (!Number.isNaN(from.getTime())) {
      query = query.gte("ordered_at", from.toISOString());
    }
  }

  if (filters.to) {
    const to = endOfDay(new Date(`${filters.to}T12:00:00`));
    if (!Number.isNaN(to.getTime())) {
      query = query.lte("ordered_at", to.toISOString());
    }
  }

  if (filters.orderStatus) {
    query = query.eq("status", filters.orderStatus);
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  const q = filters.q?.trim();
  if (q) {
    const safe = q.replace(/[%_,]/g, " ").trim();
    if (/^\d+$/.test(safe)) {
      query = query.or(
        `customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%,order_number.eq.${safe}`,
      );
    } else if (safe) {
      query = query.or(`customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

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
      nfe_key: order.nfe_key ?? null,
      nfe_url: order.nfe_url ?? null,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      coupon_code: order.coupon_code ?? null,
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
