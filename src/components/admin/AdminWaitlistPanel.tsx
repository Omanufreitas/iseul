"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Search } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
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

export function AdminWaitlistPanel({ subscribers }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) => s.email.toLowerCase().includes(q) || s.source.toLowerCase().includes(q),
    );
  }, [subscribers, query]);

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.05)}
        className="grid gap-3 sm:grid-cols-2"
      >
        <motion.div variants={fadeUp}>
          <StatCard label="Total inscritos" value={subscribers.length} icon={Mail} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Última inscrição"
            value={subscribers[0] ? formatDate(subscribers[0].created_at) : "—"}
          />
        </motion.div>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card">
        <div className="border-b px-4 py-4 sm:px-5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Search className="h-3.5 w-3.5" />
              Buscar inscrito
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-mail ou origem…"
              className="w-full max-w-md rounded-xl border border-iseul-line bg-neutral-50/50 px-3.5 py-2.5 text-sm focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Mail}
              title={subscribers.length === 0 ? "Ninguém se inscreveu ainda" : "Nenhum resultado"}
              description={
                subscribers.length === 0
                  ? "Os e-mails da landing aparecem aqui."
                  : "Tente outro termo de busca."
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-iseul-line bg-iseul-paper/60 text-xs uppercase tracking-wide text-iseul-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">E-mail</th>
                    <th className="px-5 py-3 font-medium">Origem</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-iseul-line/70 last:border-0 hover:bg-iseul-dew/20">
                      <td className="px-5 py-4 font-medium text-iseul-ink">{row.email}</td>
                      <td className="px-5 py-4 capitalize text-iseul-muted">{row.source}</td>
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
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-iseul-ink">{row.email}</p>
                    <p className="mt-0.5 text-xs text-iseul-muted">
                      {formatDate(row.created_at)} · {row.source}
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
