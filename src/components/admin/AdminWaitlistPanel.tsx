"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.05)}
        className="grid gap-3 sm:grid-cols-2"
      >
        <motion.div variants={fadeUp} className="rounded-2xl border border-iseul-line/80 bg-white p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-iseul-muted">Total inscritos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{subscribers.length}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl border border-iseul-line/80 bg-white p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-iseul-muted">Última inscrição</p>
          <p className="mt-1 text-sm font-medium text-iseul-ink">
            {subscribers[0] ? formatDate(subscribers[0].created_at) : "—"}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card"
      >
        {subscribers.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-iseul-muted">
            Ninguém se inscreveu ainda. Os e-mails da landing aparecem aqui.
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
                  {subscribers.map((row) => (
                    <tr key={row.id} className="border-b border-iseul-line/70 last:border-0">
                      <td className="px-5 py-4 font-medium text-iseul-ink">{row.email}</td>
                      <td className="px-5 py-4 capitalize text-iseul-muted">{row.source}</td>
                      <td className="px-5 py-4 text-iseul-muted">{formatDate(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-iseul-line md:hidden">
              {subscribers.map((row) => (
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
      </motion.div>
    </div>
  );
}
