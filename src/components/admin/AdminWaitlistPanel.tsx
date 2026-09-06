"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Package, Search } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminExportButton } from "@/components/admin/AdminExportButton";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { StatCard } from "@/components/admin/ui/StatCard";
import { fadeUp, stagger } from "@/lib/motion";
import type { WaitlistSubscriber } from "@/lib/waitlist";

type Props = {
  subscribers: WaitlistSubscriber[];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value.trim() || "—";
}

function displayValue(value: string) {
  return value.trim() || "—";
}

export function AdminWaitlistPanel({ subscribers }: Props) {
  const [query, setQuery] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const productOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const s of subscribers) {
      if (s.product_id && s.product_name) {
        names.set(s.product_id, s.product_name);
      }
    }
    return [...names.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [subscribers]);

  const productInterests = subscribers.filter((s) => s.product_id);
  const landingSubscribers = subscribers.filter((s) => !s.product_id);

  const filtered = useMemo(() => {
    let list = subscribers;
    if (productFilter === "__landing__") {
      list = list.filter((s) => !s.product_id);
    } else if (productFilter) {
      list = list.filter((s) => s.product_id === productFilter);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q.replace(/\D/g, "")) ||
        (s.product_name ?? "").toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q),
    );
  }, [subscribers, query, productFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.05)}
          className="grid flex-1 gap-3 sm:grid-cols-3"
        >
          <motion.div variants={fadeUp}>
            <StatCard label="Total interessados" value={subscribers.length} icon={Mail} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              label="Avise-me (produtos)"
              value={productInterests.length}
              icon={Package}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard label="Landing / geral" value={landingSubscribers.length} icon={Mail} />
          </motion.div>
        </motion.div>
        <AdminExportButton table="subscribers" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card">
        <div className="grid gap-3 border-b px-4 py-4 sm:grid-cols-[1fr_220px] sm:px-5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Search className="h-3.5 w-3.5" />
              Buscar
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, e-mail, telefone, produto…"
              className="w-full rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Produto</span>
            <AdminSelect value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="__landing__">Landing / sem produto</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </AdminSelect>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Mail}
              title={subscribers.length === 0 ? "Ninguém cadastrado ainda" : "Nenhum resultado"}
              description={
                subscribers.length === 0
                  ? "Interessados da landing e do Avise-me quando chegar aparecem aqui."
                  : "Tente outro termo de busca ou filtro."
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-iseul-line bg-iseul-paper/60 text-xs uppercase tracking-wide text-iseul-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Produto</th>
                    <th className="px-5 py-3 font-medium">Nome</th>
                    <th className="px-5 py-3 font-medium">E-mail</th>
                    <th className="px-5 py-3 font-medium">WhatsApp</th>
                    <th className="px-5 py-3 font-medium">Origem</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-iseul-line/70 last:border-0 hover:bg-iseul-dew/20">
                      <td className="px-5 py-4 text-iseul-ink">
                        {row.product_name ? row.product_name : "—"}
                      </td>
                      <td className="px-5 py-4 font-medium text-iseul-ink">{displayValue(row.name)}</td>
                      <td className="px-5 py-4 text-iseul-ink">{row.email}</td>
                      <td className="px-5 py-4 text-iseul-muted">{formatPhone(row.phone)}</td>
                      <td className="px-5 py-4 capitalize text-iseul-muted">{row.source.replaceAll("_", " ")}</td>
                      <td className="px-5 py-4 text-iseul-muted">{formatDate(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-iseul-line md:hidden">
              {filtered.map((row) => (
                <div key={row.id} className="flex items-start gap-3 px-4 py-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-iseul-dew text-iseul-accent">
                    {row.product_id ? <Package className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-iseul-ink">
                      {row.name.trim() ? row.name : row.email}
                    </p>
                    {row.product_name ? (
                      <p className="mt-0.5 truncate text-xs font-medium text-iseul-accent">
                        {row.product_name}
                      </p>
                    ) : null}
                    {row.name.trim() ? (
                      <p className="mt-0.5 truncate text-xs text-iseul-muted">{row.email}</p>
                    ) : null}
                    <p className="mt-0.5 text-xs text-iseul-muted">
                      {formatPhone(row.phone)} · {formatDate(row.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
