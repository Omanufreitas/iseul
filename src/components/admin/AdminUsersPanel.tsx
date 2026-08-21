"use client";

import { motion } from "framer-motion";
import { Crown, Shield, UserCircle } from "lucide-react";
import { adminUserRoleLabel, type AdminUserRole } from "@/lib/admin-access";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  role: AdminUserRole;
};

type Props = {
  users: AdminUserRow[];
  currentEmail: string;
};

function RoleBadge({ role }: { role: AdminUserRole }) {
  const isOwner = role === "owner";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isOwner ? "bg-amber-100 text-amber-900" : "bg-iseul-dew text-iseul-accent"
      )}
    >
      {isOwner ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
      {adminUserRoleLabel(role)}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-iseul-accent to-iseul-accent2 text-sm font-semibold text-white">
      {initial}
    </div>
  );
}

export function AdminUsersPanel({ users, currentEmail }: Props) {
  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.05)}
        className="grid gap-3 sm:grid-cols-2"
      >
        {[
          { label: "Total", value: users.length },
          {
            label: "Administradores",
            value: users.filter((u) => u.role === "admin").length,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="rounded-2xl border border-iseul-line/80 bg-white p-5 shadow-card"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-iseul-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-card"
      >
        <div className="border-b border-iseul-line/60 bg-gradient-to-r from-iseul-dew/40 to-white px-5 py-4">
          <h2 className="font-medium text-iseul-ink">Equipe admin</h2>
          <p className="mt-0.5 text-xs text-iseul-muted">Usuários com acesso ao painel da loja</p>
        </div>

        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Usuário</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Perfil</th>
                <th className="px-5 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const isYou = user.email === currentEmail;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-iseul-line/40 last:border-0 hover:bg-iseul-dew/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <div className="font-medium text-iseul-ink">
                          {user.name}
                          {isYou && (
                            <span className="ml-2 text-xs font-normal text-iseul-muted">
                              (você)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4 text-neutral-500">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {users.map((user) => {
            const isYou = user.email === currentEmail;
            return (
              <div
                key={user.id}
                className="flex gap-3 rounded-xl border border-iseul-line/60 bg-iseul-paper/50 p-4"
              >
                <Avatar name={user.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {isYou && <span className="text-xs text-iseul-muted">(você)</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <RoleBadge role={user.role} />
                    <span className="text-xs text-neutral-400">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex items-start gap-3 rounded-xl border border-iseul-line/60 bg-white/80 px-4 py-3 text-xs text-neutral-500">
        <UserCircle className="mt-0.5 h-4 w-4 shrink-0 text-iseul-accent" />
        <p>
          O perfil <strong>Proprietário</strong> vê integrações (Supabase, Asaas) e gerencia esta
          lista. Administradores acessam produtos, pedidos e configurações da loja normalmente.
        </p>
      </div>
    </div>
  );
}
