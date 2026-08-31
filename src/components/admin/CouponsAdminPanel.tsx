"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCoupon, saveCoupon } from "@/actions/admin/coupons";
import { AdminExportButton } from "@/components/admin/AdminExportButton";
import type { Coupon } from "@/types";

type Props = {
  coupons: Coupon[];
};

export function CouponsAdminPanel({ coupons: initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: "",
    name: "",
    discount_percent: 10,
    active: true,
    max_uses: "",
    first_purchase_only: false,
  });

  function resetForm() {
    setForm({
      code: "",
      name: "",
      discount_percent: 10,
      active: true,
      max_uses: "",
      first_purchase_only: false,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveCoupon({
        code: form.code,
        name: form.name,
        discount_percent: Number(form.discount_percent),
        active: form.active,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        first_purchase_only: form.first_purchase_only,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Cupom salvo");
      resetForm();
      window.location.reload();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    startTransition(async () => {
      const result = await deleteCoupon(id);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cupom excluído");
    });
  }

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Cupons de desconto</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Código usado no checkout. O desconto é aplicado sobre o subtotal dos produtos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminExportButton table="coupons" />
          <AdminExportButton table="customers" label="Exportar clientes" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Código *</span>
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="VERAO10"
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nome *</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Verão 10%"
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Desconto (%) *</span>
          <input
            required
            type="number"
            min="1"
            max="100"
            step="0.01"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Limite de usos (opcional)</span>
          <input
            type="number"
            min="1"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Cupom ativo
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.first_purchase_only}
            onChange={(e) => setForm({ ...form, first_purchase_only: e.target.checked })}
          />
          Válido apenas na primeira compra (por e-mail)
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-iseul-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Adicionar cupom"}
          </button>
        </div>
      </form>

      {coupons.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-neutral-500">
                <th className="py-2 pr-4">Código</th>
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Desconto</th>
                <th className="py-2 pr-4">Usos</th>
                <th className="py-2 pr-4">1ª compra</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono">{coupon.code}</td>
                  <td className="py-3 pr-4">{coupon.name}</td>
                  <td className="py-3 pr-4">{coupon.discount_percent}%</td>
                  <td className="py-3 pr-4">
                    {coupon.used_count}
                    {coupon.max_uses != null ? ` / ${coupon.max_uses}` : ""}
                  </td>
                  <td className="py-3 pr-4">{coupon.first_purchase_only ? "Sim" : "—"}</td>
                  <td className="py-3 pr-4">{coupon.active ? "Ativo" : "Inativo"}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
