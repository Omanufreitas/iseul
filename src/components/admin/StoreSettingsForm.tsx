"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateStoreSettings } from "@/actions/admin/products";
import type { StoreSettings } from "@/types";

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateStoreSettings({
        announcement: String(fd.get("announcement")),
        free_shipping_threshold: Number(fd.get("free_shipping_threshold")),
        pix_discount_percent: Number(fd.get("pix_discount_percent")),
      });
      if ("error" in result && result.error) toast.error(result.error);
      else toast.success("Configurações salvas");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-2xl border border-iseul-line/80 bg-white p-6 shadow-card">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Barra de anúncio</span>
        <input
          name="announcement"
          defaultValue={settings.announcement}
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Frete grátis acima de (R$)</span>
        <input
          name="free_shipping_threshold"
          type="number"
          step="0.01"
          defaultValue={settings.free_shipping_threshold}
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Desconto PIX (%)</span>
        <input
          name="pix_discount_percent"
          type="number"
          step="0.1"
          defaultValue={settings.pix_discount_percent}
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-iseul-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
