"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct, toggleProductActive } from "@/actions/admin/products";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  demoMode: boolean;
};

export function ProductsAdminPanel({ products, demoMode }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category_slug !== category) return false;
      if (status === "active" && !p.active) return false;
      if (status === "inactive" && p.active) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category_label.toLowerCase().includes(q)
      );
    });
  }, [products, query, category, status]);

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleProductActive(id, active);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success(active ? "Produto ativado" : "Produto desativado");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(id);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success("Produto excluído");
        router.refresh();
      }
    });
  }

  const stats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
  };

  return (
    <div className="space-y-6">
      {demoMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo local: alterações são salvas em <code className="text-xs">data/products.local.json</code>.
          Conecte o Supabase em produção para persistência definitiva.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Ativos", value: stats.active },
          { label: "Estoque baixo", value: stats.lowStock },
          { label: "Esgotados", value: stats.outOfStock },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-white px-4 py-3">
            <div className="text-xs text-neutral-500">{s.label}</div>
            <div className="text-xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 lg:flex-row lg:items-center">
        <input
          type="search"
          placeholder="Buscar por nome, marca ou categoria..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm lg:max-w-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">Todas categorias</option>
          {CATEGORIES.filter((c) => c.slug !== "all").map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <div className="text-sm text-neutral-500 lg:ml-auto">
          {filtered.length} de {products.length} produtos
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            pending={pending}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border bg-white p-8 text-center text-neutral-500">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt=""
                        className="h-11 w-11 rounded-lg bg-neutral-100 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-500">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.category_label}</td>
                  <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.stock <= 0
                          ? "font-medium text-red-600"
                          : p.stock <= 5
                            ? "font-medium text-amber-700"
                            : ""
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleToggle(p.id, !p.active)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        p.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <ProductActions
                      product={p}
                      pending={pending}
                      onDelete={() => handleDelete(p.id, p.name)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-neutral-500">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}

function ProductActions({
  product,
  pending,
  onDelete,
}: {
  product: Product;
  pending: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/produtos/${encodeURIComponent(product.id)}`}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-100"
      >
        Editar
      </Link>
      <Link
        href={`/produtos/${product.slug}`}
        target="_blank"
        className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-100"
      >
        Ver loja
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={onDelete}
        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        Excluir
      </button>
    </div>
  );
}

function ProductCard({
  product,
  pending,
  onToggle,
  onDelete,
}: {
  product: Product;
  pending: boolean;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-neutral-500">{product.brand}</div>
          <div className="mt-1 text-sm">
            {formatCurrency(product.price)} · Estoque: {product.stock}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggle(product.id, !product.active)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            product.active ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {product.active ? "Ativo" : "Inativo"}
        </button>
        <ProductActions product={product} pending={pending} onDelete={() => onDelete(product.id, product.name)} />
      </div>
    </div>
  );
}
