import "server-only";

import { listAllProductsAdmin } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/config";
import {
  addDays,
  parseDashboardRange,
  startOfDay,
  toDateInputValue,
  type DashboardRange,
} from "@/lib/dashboard-dates";
import { createAdminClient } from "@/lib/supabase/client";

export { parseDashboardRange, toDateInputValue, pctChange } from "@/lib/dashboard-dates";
export type { DashboardRange } from "@/lib/dashboard-dates";

export const STATUS_LABELS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

export type DashboardKpis = {
  revenue: number;
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  avgTicket: number;
  avgTicketPrev: number;
  pendingPayments: number;
  productsTotal: number;
  productsActive: number;
  productsOutOfStock: number;
  productsLowStock: number;
};

export type RevenuePoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type StatusSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type TopProductRow = {
  name: string;
  brand: string;
  quantity: number;
  revenue: number;
};

export type CategoryRow = {
  category: string;
  revenue: number;
  quantity: number;
};

export type LowStockRow = {
  id: string;
  slug: string;
  name: string;
  stock: number;
};

export type DashboardData = {
  range: DashboardRange;
  kpis: DashboardKpis;
  revenueSeries: RevenuePoint[];
  ordersByStatus: StatusSlice[];
  ordersByPayment: StatusSlice[];
  topProducts: TopProductRow[];
  categoryMix: CategoryRow[];
  lowStock: LowStockRow[];
};

const STATUS_COLORS: Record<string, string> = {
  aguardando_pagamento: "#C9A227",
  pago: "#3F5C4E",
  em_separacao: "#8FA89A",
  enviado: "#5B7A6E",
  entregue: "#2D4A3E",
  cancelado: "#9A3F32",
};

const PAYMENT_COLORS: Record<string, string> = {
  pendente: "#C9A227",
  aprovado: "#3F5C4E",
  recusado: "#9A3F32",
  cancelado: "#6E675C",
};

const CHART_PALETTE = ["#3F5C4E", "#8FA89A", "#5B7A6E", "#C9A227", "#9A3F32", "#6E675C", "#A8C4B8"];

function inRange(iso: string, from: string, to: string): boolean {
  const d = iso.slice(0, 10);
  return d >= from && d <= to;
}

function avgTicket(revenue: number, orders: number): number {
  return orders > 0 ? revenue / orders : 0;
}

function buildRevenueSeries(
  orders: { ordered_at: string; total: number; payment_status: string }[],
  from: string,
  to: string
): RevenuePoint[] {
  const map = new Map<string, { revenue: number; orders: number }>();
  let cursor = startOfDay(new Date(`${from}T12:00:00`));
  const end = startOfDay(new Date(`${to}T12:00:00`));

  while (cursor <= end) {
    const key = toDateInputValue(cursor);
    map.set(key, { revenue: 0, orders: 0 });
    cursor = addDays(cursor, 1);
  }

  for (const o of orders) {
    if (o.payment_status !== "aprovado") continue;
    const key = o.ordered_at.slice(0, 10);
    if (!map.has(key)) continue;
    const row = map.get(key)!;
    row.revenue += Number(o.total);
    row.orders += 1;
  }

  return [...map.entries()].map(([date, v]) => ({
    date,
    label: new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    revenue: Math.round(v.revenue * 100) / 100,
    orders: v.orders,
  }));
}

function emptyDashboard(range: DashboardRange, productsCount = 0): DashboardData {
  return {
    range,
    kpis: {
      revenue: 0,
      revenuePrev: 0,
      orders: 0,
      ordersPrev: 0,
      avgTicket: 0,
      avgTicketPrev: 0,
      pendingPayments: 0,
      productsTotal: productsCount,
      productsActive: productsCount,
      productsOutOfStock: 0,
      productsLowStock: 0,
    },
    revenueSeries: buildRevenueSeries([], range.from, range.to),
    ordersByStatus: [],
    ordersByPayment: [],
    topProducts: [],
    categoryMix: [],
    lowStock: [],
  };
}

export async function fetchDashboardData(
  fromParam?: string | null,
  toParam?: string | null
): Promise<DashboardData> {
  const range = parseDashboardRange(fromParam, toParam);
  const products = await listAllProductsAdmin();

  const productsActive = products.filter((p) => p.active).length;
  const productsOutOfStock = products.filter((p) => p.active && p.stock <= 0).length;
  const productsLowStock = products.filter((p) => p.active && p.stock > 0 && p.stock <= 5).length;
  const lowStock: LowStockRow[] = products
    .filter((p) => p.active && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name, stock: p.stock }));

  if (!isSupabaseConfigured()) {
    const data = emptyDashboard(range, products.length);
    data.kpis.productsActive = productsActive;
    data.kpis.productsOutOfStock = productsOutOfStock;
    data.kpis.productsLowStock = productsLowStock;
    data.lowStock = lowStock;
    return data;
  }

  const admin = createAdminClient();
  const fetchFrom = range.prevFrom;
  const fetchTo = range.to;

  const [{ data: orders }, { data: items }] = await Promise.all([
    admin
      .from("orders")
      .select("id, total, ordered_at, status, payment_status")
      .gte("ordered_at", `${fetchFrom}T00:00:00`)
      .lte("ordered_at", `${fetchTo}T23:59:59`)
      .order("ordered_at", { ascending: true }),
    admin
      .from("order_items")
      .select("product_id, product_name, product_brand, quantity, line_total, order_id")
      .limit(5000),
  ]);

  const orderList = orders ?? [];
  const currentOrders = orderList.filter((o) => inRange(o.ordered_at, range.from, range.to));
  const prevOrders = orderList.filter((o) => inRange(o.ordered_at, range.prevFrom, range.prevTo));

  const approvedCurrent = currentOrders.filter((o) => o.payment_status === "aprovado");
  const approvedPrev = prevOrders.filter((o) => o.payment_status === "aprovado");

  const revenue = approvedCurrent.reduce((s, o) => s + Number(o.total), 0);
  const revenuePrev = approvedPrev.reduce((s, o) => s + Number(o.total), 0);

  const pendingPayments = currentOrders.filter((o) => o.payment_status === "pendente").length;

  const statusCounts = new Map<string, number>();
  const paymentCounts = new Map<string, number>();
  for (const o of currentOrders) {
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
    paymentCounts.set(o.payment_status, (paymentCounts.get(o.payment_status) ?? 0) + 1);
  }

  const ordersByStatus: StatusSlice[] = [...statusCounts.entries()]
    .map(([key, value], i) => ({
      key,
      label: STATUS_LABELS[key] ?? key,
      value,
      color: STATUS_COLORS[key] ?? CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);

  const ordersByPayment: StatusSlice[] = [...paymentCounts.entries()]
    .map(([key, value], i) => ({
      key,
      label: PAYMENT_LABELS[key] ?? key,
      value,
      color: PAYMENT_COLORS[key] ?? CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);

  const approvedIds = new Set(approvedCurrent.map((o) => o.id));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topMap = new Map<string, TopProductRow>();
  const catMap = new Map<string, CategoryRow>();

  for (const item of items ?? []) {
    if (!approvedIds.has(item.order_id)) continue;
    const key = item.product_name;
    const existing = topMap.get(key) ?? {
      name: item.product_name,
      brand: item.product_brand ?? "",
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += item.quantity;
    existing.revenue += Number(item.line_total);
    topMap.set(key, existing);

    const product = item.product_id ? productMap.get(item.product_id) : undefined;
    const cat = product?.category_label ?? "Outros";
    const catRow = catMap.get(cat) ?? { category: cat, revenue: 0, quantity: 0 };
    catRow.revenue += Number(item.line_total);
    catRow.quantity += item.quantity;
    catMap.set(cat, catRow);
  }

  const topProducts = [...topMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const categoryMix = [...catMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return {
    range,
    kpis: {
      revenue,
      revenuePrev,
      orders: currentOrders.length,
      ordersPrev: prevOrders.length,
      avgTicket: avgTicket(revenue, approvedCurrent.length),
      avgTicketPrev: avgTicket(revenuePrev, approvedPrev.length),
      pendingPayments,
      productsTotal: products.length,
      productsActive,
      productsOutOfStock,
      productsLowStock,
    },
    revenueSeries: buildRevenueSeries(orderList, range.from, range.to),
    ordersByStatus,
    ordersByPayment,
    topProducts,
    categoryMix,
    lowStock,
  };
}