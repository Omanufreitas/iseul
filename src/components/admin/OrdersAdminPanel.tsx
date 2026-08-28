"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarRange,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { DateRangePicker } from "@/components/admin/dashboard/DateRangePicker";
import { OrderListActions } from "@/components/admin/OrderListActions";
import { DATE_PRESETS } from "@/components/admin/dashboard/DateRangePicker";
import type { AdminOrderListItem, OrderListFilters } from "@/lib/admin-orders";
import { cn, formatCurrency } from "@/lib/utils";

type ProductOption = { id: string; name: string };

type Props = {
  orders: AdminOrderListItem[];
  products: ProductOption[];
  filters: OrderListFilters;
};

function formatItemsPreview(items: AdminOrderListItem["items"]): string {
  if (!items.length) return "—";
  const names = items.map((i) => i.product_name);
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

function defaultDateRange() {
  return DATE_PRESETS.find((p) => p.id === "all")!.getRange();
}

export function OrdersAdminPanel({ orders, products, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const defaults = defaultDateRange();
  const [query, setQuery] = useState(filters.q ?? "");
  const [productId, setProductId] = useState(filters.productId ?? "");
  const [from, setFrom] = useState(filters.from ?? defaults.from);
  const [to, setTo] = useState(filters.to ?? defaults.to);

  useEffect(() => {
    setQuery(filters.q ?? "");
    setProductId(filters.productId ?? "");
    setFrom(filters.from ?? defaults.from);
    setTo(filters.to ?? defaults.to);
  }, [filters.q, filters.productId, filters.from, filters.to, defaults.from, defaults.to]);

  const pushFilters = useCallback(
    (next: Partial<OrderListFilters & { from: string; to: string }>) => {
      const params = new URLSearchParams(searchParams.toString());

      const values = {
        q: "q" in next ? next.q : filters.q,
        productId: "productId" in next ? next.productId : filters.productId,
        from: "from" in next ? next.from : filters.from ?? defaults.from,
        to: "to" in next ? next.to : filters.to ?? defaults.to,
      };

      if (values.q?.trim()) params.set("q", values.q.trim());
      else params.delete("q");

      if (values.productId) params.set("product", values.productId);
      else params.delete("product");

      const allRange = defaultDateRange();
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
    filters.q?.trim() || filters.productId || filters.from || filters.to,
  );

  function clearFilters() {
    const range = defaultDateRange();
    setQuery("");
    setProductId("");
    setFrom(range.from);
    setTo(range.to);
    startTransition(() => router.replace("/admin/pedidos"));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pedidos", value: stats.total, icon: ShoppingBag },
          { label: "Pagos", value: stats.paid, icon: User },
          { label: "Pendentes", value: stats.pending, icon: CalendarRange },
          { label: "Receita (pagos)", value: formatCurrency(stats.revenue), icon: Package },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-iseul-accent" />
            </div>
            <div className="mt-1 text-xl font-semibold text-neutral-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="border-b bg-gradient-to-r from-iseul-dew/60 via-white to-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-iseul-accent/10 text-iseul-accent">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Filtros</h2>
                <p className="text-xs text-neutral-500">Nome, produto e período</p>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-iseul-accent2 hover:text-iseul-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Search className="h-3.5 w-3.5" />
              Cliente ou pedido
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, e-mail ou nº do pedido…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
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
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            >
              <option value="">Todos os produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="lg:justify-self-end">
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
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
                Busca: {filters.q.trim()}
              </span>
            )}
            {filters.productId && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
                Produto: {products.find((p) => p.id === filters.productId)?.name ?? "—"}
              </span>
            )}
            {(filters.from || filters.to) && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
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

      <p className="text-sm text-neutral-500">
        {orders.length === 0
          ? "Nenhum pedido encontrado com os filtros atuais."
          : `${orders.length} pedido${orders.length === 1 ? "" : "s"} · até ${orders.length} exibidos`}
      </p>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-3 font-medium text-neutral-700">Nenhum pedido por aqui</p>
          <p className="mt-1 text-sm text-neutral-500">Tente ampliar o período ou limpar os filtros.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-neutral-500">#{o.order_number}</div>
                    <div className="mt-1 font-medium">{o.customer_name}</div>
                    <div className="truncate text-xs text-neutral-500">{o.customer_email}</div>
                    <div className="mt-2 truncate text-xs text-iseul-accent">{formatItemsPreview(o.items)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-medium">{formatCurrency(o.total)}</div>
                    <div className="mt-1 text-xs capitalize text-neutral-500">
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
                <OrderListActions
                  orderId={o.id}
                  orderNumber={o.order_number}
                  customerName={o.customer_name}
                  layout="stack"
                />
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b bg-neutral-50/90 text-neutral-500">
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
                    <tr key={o.id} className="border-b last:border-0 hover:bg-neutral-50/80">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-neutral-500">{o.customer_email}</div>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <div className="truncate text-xs text-neutral-600" title={formatItemsPreview(o.items)}>
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
                      <td className="px-4 py-3 text-xs text-neutral-500">
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
