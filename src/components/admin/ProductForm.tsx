"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { saveProduct } from "@/actions/admin/products";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const categorySlug = String(fd.get("category_slug"));
    const category = CATEGORIES.find((c) => c.slug === categorySlug);

    const payload = {
      name: String(fd.get("name")),
      full_name: String(fd.get("full_name") || fd.get("name")),
      slug: String(fd.get("slug") || ""),
      brand: String(fd.get("brand") || ""),
      category_slug: categorySlug,
      category_label: category?.label ?? categorySlug,
      price: Number(fd.get("price")),
      compare_at_price: fd.get("compare_at_price") ? Number(fd.get("compare_at_price")) : null,
      pitch: String(fd.get("pitch") || ""),
      image_url: String(fd.get("image_url") || ""),
      image_fallback_url: String(fd.get("image_fallback_url") || ""),
      shopee_url: String(fd.get("shopee_url") || ""),
      shopee_id: fd.get("shopee_id") ? Number(fd.get("shopee_id")) : null,
      sold_count: Number(fd.get("sold_count") || 0),
      rating: Number(fd.get("rating") || 0),
      review_count: Number(fd.get("review_count") || 0),
      stock: Number(fd.get("stock") || 0),
      active: fd.get("active") === "on",
      featured: fd.get("featured") === "on",
    };

    startTransition(async () => {
      const result = await saveProduct(payload, product?.id);
      if ("error" in result && result.error) toast.error(result.error);
      else toast.success(product ? "Produto atualizado" : "Produto criado");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">Nome curto *</span>
          <input name="name" required defaultValue={product?.name} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">Nome completo (Shopee)</span>
          <input name="full_name" defaultValue={product?.full_name} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Slug</span>
          <input name="slug" defaultValue={product?.slug} placeholder="auto se vazio" className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Marca</span>
          <input name="brand" defaultValue={product?.brand} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Categoria *</span>
          <select name="category_slug" required defaultValue={product?.category_slug ?? "serum"} className="w-full rounded-lg border px-3 py-2">
            {CATEGORIES.filter((c) => c.slug !== "all").map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Preço (R$) *</span>
          <input name="price" type="number" step="0.01" required defaultValue={product?.price} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Preço &quot;de&quot;</span>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ""} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Estoque *</span>
          <input name="stock" type="number" required defaultValue={product?.stock ?? 10} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">URL da imagem</span>
          <input name="image_url" defaultValue={product?.image_url} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">URL fallback</span>
          <input name="image_fallback_url" defaultValue={product?.image_fallback_url ?? ""} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">Pitch (curadoria)</span>
          <textarea name="pitch" rows={3} defaultValue={product?.pitch} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-medium">Link Shopee</span>
          <input name="shopee_url" defaultValue={product?.shopee_url ?? ""} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">ID Shopee</span>
          <input name="shopee_id" type="number" defaultValue={product?.shopee_id ?? ""} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Vendidos</span>
          <input name="sold_count" type="number" defaultValue={product?.sold_count ?? 0} className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
          Ativo na loja
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
          Destaque
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-iseul-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
      </button>
    </form>
  );
}
