"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarRange,
  Clock,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { DateRangePicker } from "@/components/admin/dashboard/DateRangePicker";
import { OrderListActions } from "@/components/admin/OrderListActions";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { StatCard } from "@/components/admin/ui/StatCard";
import { getAllDateRange } from "@/lib/date-presets";
import type { AdminOrderListItem, OrderListFilters } from "@/lib/admin-orders";
import { cn, formatCurrency } from "@/lib/utils";

type ProductOption = { id: string; name: string };

type Props = {
  orders: AdminOrderListItem[];
  products: ProductOption[];
  filters: OrderListFilters;
};

const PAYMENT_OPTIONS = [
  { value: "", label: "Todos pagamentos" },
  { value: "aprovado", label: "Aprovado" },
  { value: "pendente", label: "Pendente" },
  { value: "recusado", label: "Recusado" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos status" },
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "pago", label: "Pago" },
  { value: "separando", label: "Separando" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

function formatItemsPreview(items: AdminOrderListItem["items"]): string {
  if (!items.length) return "—";
  const names = items.map((i) => i.product_name);
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

export function OrdersAdminPanel({ orders, products, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const defaults = getAllDateRange();
  const [query, setQuery] = useState(filters.q ?? "");
  const [productId, setProductId] = useState(filters.productId ?? "");
  const [paymentStatus, setPaymentStatus] = useState(filters.paymentStatus ?? "");
  const [orderStatus, setOrderStatus] = useState(filters.orderStatus ?? "");
  const [from, setFrom] = useState(filters.from ?? defaults.from);
  const [to, setTo] = useState(filters.to ?? defaults.to);

  useEffect(() => {
    setQuery(filters.q ?? "");
    setProductId(filters.productId ?? "");
    setPaymentStatus(filters.paymentStatus ?? "");
    setOrderStatus(filters.orderStatus ?? "");
    setFrom(filters.from ?? defaults.from);
    setTo(filters.to ?? defaults.to);
  }, [
    filters.q,
    filters.productId,
    filters.paymentStatus,
    filters.orderStatus,
    filters.from,
    filters.to,
    defaults.from,
    defaults.to,
  ]);

  const pushFilters = useCallback(
    (next: Partial<OrderListFilters & { from: string; to: string }>) => {
      const params = new URLSearchParams(searchParams.toString());

      const values = {
        q: "q" in next ? next.q : filters.q,
        productId: "productId" in next ? next.productId : filters.productId,
        paymentStatus: "paymentStatus" in next ? next.paymentStatus : filters.paymentStatus,
        orderStatus: "orderStatus" in next ? next.orderStatus : filters.orderStatus,
        from: "from" in next ? next.from : filters.from ?? defaults.from,
        to: "to" in next ? next.to : filters.to ?? defaults.to,
      };

      if (values.q?.trim()) params.set("q", values.q.trim());
      else params.delete("q");

      if (values.productId) params.set("product", values.productId);
      else params.delete("product");

      if (values.paymentStatus) params.set("payment", values.paymentStatus);
      else params.delete("payment");

      if (values.orderStatus) params.set("status", values.orderStatus);
      else params.delete("status");

      const allRange = getAllDateRange();
      if (values.from && values.from !== allRange.from) params.set("from", values.from);
      else params.delete("from");
      if (values.to && values.to !== allRange.to) params.set("to", values.to);
      else params.delete("to");

      startTransition(() => {
        router.replace(`/admin/pedidos${params.size ? `?${params.toString()}` : ""}`);
      });
    },
    [searchParams, filters, defaults.from, defaults.to, router],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.q ?? "") === query.trim()) return;
      pushFilters({ q: query.trim() || undefined });
    }, 350);
    return () => clearTimeout(t);
  }, [query, filters.q, pushFilters]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      paid: orders.filter((o) => o.payment_status === "aprovado").length,
      pending: orders.filter((o) => o.payment_status !== "aprovado").length,
      revenue: orders
        .filter((o) => o.payment_status === "aprovado")
        .reduce((sum, o) => sum + o.total, 0),
    }),
    [orders],
  );

  const hasActiveFilters = Boolean(
    filters.q?.trim() ||
      filters.productId ||
      filters.paymentStatus ||
      filters.orderStatus ||
      filters.from ||
      filters.to,
  );

  function clearFilters() {
    const range = getAllDateRange();
    setQuery("");
    setProductId("");
    setPaymentStatus("");
    setOrderStatus("");
    setFrom(range.from);
    setTo(range.to);
    startTransition(() => router.replace("/admin/pedidos"));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pedidos" value={stats.total} icon={ShoppingBag} />
        <StatCard label="Pagos" value={stats.paid} icon={User} />
        <StatCard label="Pendentes" value={stats.pending} icon={Clock} />
        <StatCard label="Receita (pagos)" value={formatCurrency(stats.revenue)} icon={Package} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card">
        <div className="border-b bg-gradient-to-r from-iseul-dew/60 via-white to-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-iseul-accent/10 text-iseul-accent">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-iseul-ink">Filtros</h2>
                <p className="text-xs text-iseul-muted">Nome, produto, status e período</p>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-iseul-line bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-iseul-accent2 hover:text-iseul-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 xl:grid-cols-3">
          <label className="block xl:col-span-1">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Search className="h-3.5 w-3.5" />
              Cliente ou pedido
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, e-mail ou nº do pedido…"
              className="w-full rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Package className="h-3.5 w-3.5" />
              Produto
            </span>
            <select
              value={productId}
              onChange={(e) => {
                const value = e.target.value;
                setProductId(value);
                pushFilters({ productId: value || undefined });
              }}
              className="w-full rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            >
              <option value="">Todos os produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 text-xs font-medium text-neutral-600">Pagamento</span>
            <select
              value={paymentStatus}
              onChange={(e) => {
                const value = e.target.value;
                setPaymentStatus(value);
                pushFilters({ paymentStatus: value || undefined });
              }}
              className="w-full rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            >
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 text-xs font-medium text-neutral-600">Status do pedido</span>
            <select
              value={orderStatus}
              onChange={(e) => {
                const value = e.target.value;
                setOrderStatus(value);
                pushFilters({ orderStatus: value || undefined });
              }}
              className="w-full rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="xl:col-span-2">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <CalendarRange className="h-3.5 w-3.5" />
              Período
            </span>
            <DateRangePicker
              from={from}
              to={to}
              onApply={(nextFrom, nextTo) => {
                setFrom(nextFrom);
                setTo(nextTo);
                pushFilters({ from: nextFrom, to: nextTo });
              }}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 border-t bg-neutral-50/80 px-4 py-3 sm:px-5">
            {filters.q?.trim() && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-iseul-line">
                Busca: {filters.q.trim()}
              </span>
            )}
            {filters.productId && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-iseul-line">
                Produto: {products.find((p) => p.id === filters.productId)?.name ?? "—"}
              </span>
            )}
            {filters.paymentStatus && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-iseul-line">
                Pagamento: {filters.paymentStatus}
              </span>
            )}
            {filters.orderStatus && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-iseul-line">
                Status: {STATUS_OPTIONS.find((o) => o.value === filters.orderStatus)?.label}
              </span>
            )}
            {(filters.from || filters.to) && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-iseul-line">
                {filters.from
                  ? new Date(`${filters.from}T12:00:00`).toLocaleDateString("pt-BR")
                  : "…"}
                {" — "}
                {filters.to
                  ? new Date(`${filters.to}T12:00:00`).toLocaleDateString("pt-BR")
                  : "…"}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-iseul-muted">
        {orders.length === 0
          ? "Nenhum pedido encontrado com os filtros atuais."
          : `${orders.length} pedido${orders.length === 1 ? "" : "s"} exibidos`}
      </p>

      {orders.length === 0 ? (
        <AdminEmptyState
          icon={ShoppingBag}
          title="Nenhum pedido por aqui"
          description="Tente ampliar o período ou limpar os filtros."
        />
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/pedidos/${encodeURIComponent(o.id)}`}
                className="block rounded-2xl border border-iseul-line/80 bg-white p-4 shadow-card transition hover:border-iseul-accent2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-iseul-muted">#{o.order_number}</div>
                    <div className="mt-1 font-medium">{o.customer_name}</div>
                    <div className="truncate text-xs text-iseul-muted">{o.customer_email}</div>
                    <div className="mt-2 truncate text-xs text-iseul-accent">
                      {formatItemsPreview(o.items)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-medium">{formatCurrency(o.total)}</div>
                    <div className="mt-1 text-xs capitalize text-iseul-muted">
                      {o.status.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      o.payment_status === "aprovado"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {o.payment_status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(o.ordered_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b bg-iseul-paper/60 text-xs uppercase tracking-wide text-iseul-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Produtos</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Pagamento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="group border-b last:border-0 hover:bg-iseul-dew/20"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pedidos/${encodeURIComponent(o.id)}`}
                          className="font-mono text-xs text-iseul-accent hover:underline"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/pedidos/${encodeURIComponent(o.id)}`} className="block">
                          <div className="font-medium group-hover:text-iseul-accent">{o.customer_name}</div>
                          <div className="text-xs text-iseul-muted">{o.customer_email}</div>
                        </Link>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <div
                          className="truncate text-xs text-neutral-600"
                          title={formatItemsPreview(o.items)}
                        >
                          {formatItemsPreview(o.items)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            o.payment_status === "aprovado"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-xs text-iseul-muted">
                        {new Date(o.ordered_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <OrderListActions
                          orderId={o.id}
                          orderNumber={o.order_number}
                          customerName={o.customer_name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
