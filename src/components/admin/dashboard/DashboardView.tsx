"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getDashboardData } from "@/actions/admin/dashboard";
import { CountUp } from "@/components/motion/CountUp";
import { DateRangePicker } from "@/components/admin/dashboard/DateRangePicker";
import type { DashboardData } from "@/lib/admin-dashboard";
import { pctChange } from "@/lib/dashboard-dates";
import { fadeUp, popIn, stagger } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  initialData: DashboardData;
};

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const change = pctChange(current, previous);
  if (change === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }
  const up = change >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {change}%
    </span>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={popIn}
      custom={delay}
      className={cn(
        "overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card",
        className
      )}
    >
      <div className="border-b border-iseul-line/60 bg-gradient-to-r from-iseul-dew/40 to-white px-5 py-4">
        <h3 className="font-medium text-iseul-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-iseul-muted">{subtitle}</p>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </motion.div>
  );
}

function EmptyChart({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-iseul-dew/60">
        <Icon className="h-6 w-6 text-iseul-accent" />
      </div>
      <p className="max-w-xs text-sm text-neutral-500">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-neutral-200/70" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-neutral-200/70" />
        <div className="h-80 rounded-2xl bg-neutral-200/70" />
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: unknown;
  label?: string;
  formatter?: (v: number) => string;
}) {
  const items = (payload ?? []) as { value?: number; name?: string; color?: string }[];
  if (!active || !items.length) return null;
  return (
    <div className="rounded-xl border border-iseul-line bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="mb-1 font-medium text-iseul-ink">{label}</p>
      {items.map((p) => (
        <p key={String(p.name)} style={{ color: p.color ?? "#3F5C4E" }}>
          {p.name}: {formatter ? formatter(Number(p.value ?? 0)) : p.value}
        </p>
      ))}
    </div>
  );
}

export function DashboardView({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [pending, startTransition] = useTransition();

  const applyRange = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", from);
      params.set("to", to);
      router.replace(`/admin?${params.toString()}`, { scroll: false });

      startTransition(async () => {
        const next = await getDashboardData(from, to);
        setData(next);
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const { kpis, range } = data;

  const kpisList = [
    {
      label: "Receita paga",
      value: kpis.revenue,
      prev: kpis.revenuePrev,
      format: "currency" as const,
      icon: Wallet,
      accent: "from-iseul-accent/15 to-iseul-dew/30",
    },
    {
      label: "Pedidos",
      value: kpis.orders,
      prev: kpis.ordersPrev,
      format: "number" as const,
      icon: ShoppingBag,
      accent: "from-amber-50 to-iseul-dew/20",
    },
    {
      label: "Ticket médio",
      value: kpis.avgTicket,
      prev: kpis.avgTicketPrev,
      format: "currency" as const,
      icon: TrendingUp,
      accent: "from-sky-50 to-iseul-dew/20",
    },
    {
      label: "Produtos ativos",
      value: kpis.productsActive,
      prev: kpis.productsActive,
      format: "number" as const,
      icon: Package,
      accent: "from-violet-50 to-iseul-dew/20",
      hideTrend: true,
      sub: kpis.productsOutOfStock > 0 ? `${kpis.productsOutOfStock} esgotados` : undefined,
    },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-iseul-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 top-40 h-40 w-40 rounded-full bg-iseul-accent2/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-iseul-accent" />
            <h1 className="text-2xl font-semibold text-iseul-ink">Dashboard</h1>
          </motion.div>
          <p className="mt-1 text-sm text-iseul-muted">
            Comparado ao período anterior ({range.prevFrom} → {range.prevTo})
          </p>
        </div>
        <DateRangePicker
          from={range.from}
          to={range.to}
          onApply={applyRange}
          disabled={pending}
        />
      </div>

      <AnimatePresence mode="wait">
        {pending ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
            <DashboardSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={`${range.from}-${range.to}`}
            initial="hidden"
            animate="show"
            variants={stagger(0.06)}
            className="mt-8 space-y-6"
          >
            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpisList.map((kpi) => (
                <motion.div
                  key={kpi.label}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-iseul-line/80 bg-gradient-to-br p-5 shadow-card",
                    kpi.accent
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 shadow-sm">
                      <kpi.icon className="h-5 w-5 text-iseul-accent" />
                    </div>
                    {!kpi.hideTrend && <TrendBadge current={kpi.value} previous={kpi.prev} />}
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-iseul-muted">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-iseul-ink">
                    {kpi.format === "currency" ? (
                      <CountUp
                        value={kpi.value}
                        prefix="R$ "
                        decimals={2}
                        duration={1.2}
                        active={!pending}
                      />
                    ) : (
                      <CountUp value={kpi.value} duration={1} active={!pending} />
                    )}
                  </p>
                  {kpi.sub && <p className="mt-1 text-xs text-amber-700">{kpi.sub}</p>}
                </motion.div>
              ))}
            </motion.div>

            {kpis.pendingPayments > 0 && (
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-white px-4 py-3 text-sm text-amber-900"
              >
                {kpis.pendingPayments} pedido(s) aguardando pagamento no período.{" "}
                <Link href="/admin/pedidos" className="font-medium underline">
                  Ver pedidos
                </Link>
              </motion.div>
            )}

            <div className="grid gap-4 lg:grid-cols-5">
              <ChartCard
                title="Receita diária"
                subtitle="Pedidos com pagamento aprovado"
                className="lg:col-span-3"
              >
                {data.revenueSeries.every((d) => d.revenue === 0) ? (
                  <EmptyChart
                    message="Nenhuma venda paga neste período. Os gráficos vão aparecer conforme os pedidos chegarem."
                    icon={TrendingUp}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3F5C4E" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#3F5C4E" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DED4" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#6E675C" }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6E675C" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${v}`}
                        width={56}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <CustomTooltip
                            active={active}
                            payload={payload}
                            label={String(label ?? "")}
                            formatter={(v) => formatCurrency(v)}
                          />
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Receita"
                        stroke="#3F5C4E"
                        strokeWidth={2.5}
                        fill="url(#revenueGrad)"
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Status dos pedidos" subtitle="Distribuição no período" className="lg:col-span-2">
                {data.ordersByStatus.length === 0 ? (
                  <EmptyChart message="Sem pedidos neste período." icon={ShoppingBag} />
                ) : (
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.ordersByStatus}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={3}
                          animationDuration={800}
                        >
                          {data.ordersByStatus.map((s) => (
                            <Cell key={s.key} fill={s.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="w-full space-y-2 text-xs sm:w-auto sm:min-w-[140px]">
                      {data.ordersByStatus.map((s) => (
                        <li key={s.key} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-neutral-600">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            {s.label}
                          </span>
                          <span className="font-medium tabular-nums">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Top produtos" subtitle="Por receita no período">
                {data.topProducts.length === 0 ? (
                  <EmptyChart message="Vendas por produto aparecem aqui." icon={Package} />
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(220, data.topProducts.length * 36)}>
                    <BarChart
                      data={data.topProducts}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DED4" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11, fill: "#6E675C" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v))}
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as { brand?: string; name: string };
                          return row?.brand ? `${row.name} · ${row.brand}` : row?.name;
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        name="Receita"
                        fill="#3F5C4E"
                        radius={[0, 8, 8, 0]}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Mix por categoria" subtitle="Receita por linha K-Beauty">
                {data.categoryMix.length === 0 ? (
                  <EmptyChart message="Categorias com vendas no período." icon={Sparkles} />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.categoryMix} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DED4" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10, fill: "#6E675C" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis hide />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Bar
                        dataKey="revenue"
                        name="Receita"
                        fill="#8FA89A"
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <ChartCard title="Estoque crítico" subtitle="Produtos ativos com ≤ 5 unidades">
              {data.lowStock.length === 0 ? (
                <EmptyChart message="Nenhum produto com estoque baixo. Tudo ok!" icon={Package} />
              ) : (
                <ul className="space-y-3">
                  {data.lowStock.map((p, i) => (
                    <motion.li
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          className="truncate text-sm font-medium hover:text-iseul-accent"
                        >
                          {p.name}
                        </Link>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (p.stock / 5) * 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className={cn(
                              "h-full rounded-full",
                              p.stock <= 0 ? "bg-red-500" : p.stock <= 2 ? "bg-amber-500" : "bg-iseul-accent2"
                            )}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
                          p.stock <= 0
                            ? "bg-red-100 text-red-800"
                            : p.stock <= 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-iseul-dew text-iseul-accent"
                        )}
                      >
                        {p.stock <= 0 ? "Esgotado" : `${p.stock} un.`}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </ChartCard>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admin/produtos/novo"
                className="rounded-xl bg-iseul-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-iseul-accent/90"
              >
                + Novo produto
              </Link>
              <Link
                href="/admin/produtos"
                className="rounded-xl border border-iseul-line bg-white px-4 py-2.5 text-sm font-medium transition hover:border-iseul-accent2"
              >
                Gerenciar produtos
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-iseul-line bg-white px-4 py-2.5 text-sm font-medium transition hover:border-iseul-accent2"
              >
                Ver loja
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
