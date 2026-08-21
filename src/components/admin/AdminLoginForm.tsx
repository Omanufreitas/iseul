"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/actions/admin/auth";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iseul-paper px-6">
      <div className="w-full max-w-md rounded-2xl border border-iseul-line bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="font-serif text-3xl tracking-[0.2em]">ISEUL</div>
          <p className="mt-2 text-sm text-iseul-muted">Painel administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-iseul-line px-3 py-2.5"
              placeholder="seu@email.com"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Senha</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-iseul-line px-3 py-2.5"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-iseul-accent py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
