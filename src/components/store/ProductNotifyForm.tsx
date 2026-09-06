"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { joinProductInterest } from "@/actions/product-interest";

type Props = {
  productId: string;
  productName: string;
};

export function ProductNotifyForm({ productId, productName }: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await joinProductInterest({
        productId,
        productName,
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      setDone(true);
      toast.success("Cadastro realizado! Avisaremos quando chegar.");
    });
  }

  if (done) {
    return (
      <div className="mt-6 rounded-iseul border border-iseul-accent/20 bg-iseul-dew/40 px-5 py-4 text-center text-sm text-iseul-ink">
        Obrigada! Você será avisada quando <strong>{productName}</strong> voltar ao estoque.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-iseul border border-iseul-line bg-iseul-card p-5 shadow-card">
      <h2 className="font-serif text-xl text-iseul-ink">Avise-me quando chegar</h2>
      <p className="mt-1 text-sm text-iseul-muted">
        Produto esgotado. Deixe seus dados e avisamos quando {productName} estiver disponível.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-iseul-muted">Nome</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-iseul-line px-3 py-2.5 focus:border-iseul-accent focus:outline-none focus:ring-2 focus:ring-iseul-dew"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-iseul-muted">WhatsApp</span>
          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(67) 99999-9999"
            className="w-full rounded-lg border border-iseul-line px-3 py-2.5 focus:border-iseul-accent focus:outline-none focus:ring-2 focus:ring-iseul-dew"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-iseul-muted">E-mail</span>
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-iseul-line px-3 py-2.5 focus:border-iseul-accent focus:outline-none focus:ring-2 focus:ring-iseul-dew"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-iseul-ink py-3.5 text-sm font-medium text-iseul-paper transition-colors hover:bg-iseul-accent disabled:opacity-60"
        >
          {pending ? "Cadastrando..." : "Quero ser avisada"}
        </button>
      </form>
    </div>
  );
}
