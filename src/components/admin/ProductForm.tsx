"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProduct } from "@/actions/admin/products";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");

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
      sold_count: Number(fd.get("sold_count") || 0),
      rating: Number(fd.get("rating") || 0),
      review_count: Number(fd.get("review_count") || 0),
      stock: Number(fd.get("stock") || 0),
      active: fd.get("active") === "on",
      featured: fd.get("featured") === "on",
    };

    startTransition(async () => {
      const result = await saveProduct(payload, product?.id);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Produto atualizado" : "Produto criado");
      if (product) router.refresh();
      else if ("id" in result && result.id) {
        router.push(`/admin/produtos/${encodeURIComponent(result.id)}`);
      } else {
        router.push("/admin/produtos");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6 rounded-xl border bg-white p-4 sm:p-6">
          <Section title="Informações básicas">
            <Field label="Nome curto *" className="md:col-span-2">
              <input name="name" required defaultValue={product?.name} className={inputClass} />
            </Field>
            <Field label="Nome completo (descrição na loja)" className="md:col-span-2">
              <textarea
                name="full_name"
                rows={3}
                defaultValue={product?.full_name}
                className={inputClass}
              />
            </Field>
            <Field label="Pitch (destaque curto)">
              <textarea name="pitch" rows={2} defaultValue={product?.pitch} className={inputClass} />
            </Field>
            <Field label="Marca">
              <input name="brand" defaultValue={product?.brand} className={inputClass} />
            </Field>
            <Field label="Slug (URL)">
              <input
                name="slug"
                defaultValue={product?.slug}
                placeholder={product?.name ? slugify(product.name) : "auto se vazio"}
                className={inputClass}
              />
            </Field>
            <Field label="Categoria *">
              <select name="category_slug" required defaultValue={product?.category_slug ?? "serum"} className={inputClass}>
                {CATEGORIES.filter((c) => c.slug !== "all").map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Preço e estoque">
            <Field label="Preço (R$) *">
              <input name="price" type="number" step="0.01" min="0" required defaultValue={product?.price} className={inputClass} />
            </Field>
            <Field label='Preço "de" (opcional)'>
              <input name="compare_at_price" type="number" step="0.01" min="0" defaultValue={product?.compare_at_price ?? ""} className={inputClass} />
            </Field>
            <Field label="Estoque *">
              <input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 10} className={inputClass} />
            </Field>
            <Field label="Unidades vendidas">
              <input name="sold_count" type="number" min="0" defaultValue={product?.sold_count ?? 0} className={inputClass} />
            </Field>
          </Section>

          <Section title="Avaliações">
            <Field label="Nota (0 a 5)">
              <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product?.rating ?? 0} className={inputClass} />
            </Field>
            <Field label="Nº de avaliações">
              <input name="review_count" type="number" min="0" defaultValue={product?.review_count ?? 0} className={inputClass} />
            </Field>
          </Section>

          <Section title="Imagens">
            <Field label="URL da imagem principal" className="md:col-span-2">
              <input
                name="image_url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>
            <Field label="URL fallback" className="md:col-span-2">
              <input name="image_fallback_url" defaultValue={product?.image_fallback_url ?? ""} className={inputClass} />
            </Field>
          </Section>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="mb-3 text-sm font-semibold">Preview</div>
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                  Sem imagem
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 space-y-3">
            <div className="text-sm font-semibold">Publicação</div>
            <label className="flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
              Ativo na loja
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
              Produto em destaque
            </label>
          </div>

          {product && (
            <div className="rounded-xl border bg-white p-4 text-sm">
              <div className="font-semibold">Links</div>
              <Link
                href={`/produtos/${product.slug}`}
                target="_blank"
                className="mt-2 block text-iseul-accent hover:underline"
              >
                Ver na loja
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        {product ? <DeleteProductButton id={product.id} name={product.name} /> : <span />}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/produtos"
            className="rounded-lg border px-4 py-2.5 text-center text-sm font-medium hover:bg-neutral-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-iseul-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iseul-accent/30";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
