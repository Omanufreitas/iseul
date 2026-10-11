"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { saveProduct } from "@/actions/admin/products";
import { uploadProductImage } from "@/actions/admin/upload-product-image";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { CATEGORIES, SKIN_TYPES } from "@/lib/constants";
import { fallbackSkinTypes, type SkinTypeOption } from "@/lib/skin-types";
import { HOME_BESTSELLERS_LIMIT } from "@/lib/catalog-filter";
import type { ProductCategory } from "@/lib/categories";
import {
  BLING_DEFAULT_NCM,
  BLING_PRODUCT_UNITS,
  BLING_TAX_ORIGINS,
  formatNcmDisplay,
} from "@/lib/bling/product-fiscal";
import { BlingProductBadge } from "@/components/admin/BlingProductBadge";
import { ProductImageGallery } from "@/components/admin/ProductImageGallery";
import {
  ProductVariantsEditor,
  variantsFromProduct,
  type ProductVariantInput,
} from "@/components/admin/ProductVariantsEditor";
import { PRODUCT_IMAGE_MAX_BYTES, productImageSpecLabel } from "@/lib/product-image";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

type Props = {
  product?: Product;
  categories?: ProductCategory[];
  skinTypeOptions?: SkinTypeOption[];
  /** Quantos outros produtos já estão em “Mais vendidos” (exclui o atual). */
  otherFeaturedCount?: number;
};

function buildSkinOptions(catalog: SkinTypeOption[], selected: string[]): SkinTypeOption[] {
  const source = catalog.length ? catalog : fallbackSkinTypes();
  const bySlug = new Map(source.map((skin) => [skin.slug, skin]));
  let order = source.reduce((max, skin) => Math.max(max, skin.sort_order), 0);
  for (const slug of selected) {
    if (!slug || bySlug.has(slug)) continue;
    order += 1;
    const known = SKIN_TYPES.find((skin) => skin.slug === slug);
    bySlug.set(slug, { slug, label: known?.label ?? slug, sort_order: order });
  }
  return [...bySlug.values()].sort(
    (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, "pt-BR")
  );
}

export function ProductForm({
  product,
  categories = [],
  skinTypeOptions = [],
  otherFeaturedCount = 0,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialImages = product
    ? product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : []
    : [];

  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    variantsFromProduct(product?.variants)
  );
  const [categoryLabel, setCategoryLabel] = useState(
    product?.category_label ?? CATEGORIES.find((c) => c.slug === (product?.category_slug ?? "serum"))?.label ?? "Sérum & ampola"
  );
  const [categorySlug, setCategorySlug] = useState(product?.category_slug ?? "serum");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [skinTypes, setSkinTypes] = useState<string[]>(product?.skin_types ?? []);
  const [skinOptions, setSkinOptions] = useState<SkinTypeOption[]>(() =>
    buildSkinOptions(skinTypeOptions, product?.skin_types ?? [])
  );
  const [creatingSkin, setCreatingSkin] = useState(false);
  const [newSkinName, setNewSkinName] = useState("");
  const [editingSkinSlug, setEditingSkinSlug] = useState("");
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const categoryOptions =
    categories.length > 0
      ? categories
      : CATEGORIES.filter((c) => c.slug !== "all").map((c) => ({
          slug: c.slug,
          label: c.label,
          sort_order: 0,
        }));
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const next =
      product && product.image_urls.length > 0
        ? product.image_urls
        : product?.image_url
          ? [product.image_url]
          : [];
    setImageUrls(next);
    setSelectedIndex(0);
    setVariants(variantsFromProduct(product?.variants));
    setCategoryLabel(
      product?.category_label ??
        CATEGORIES.find((c) => c.slug === (product?.category_slug ?? "serum"))?.label ??
        "Sérum & ampola"
    );
    setCategorySlug(product?.category_slug ?? "serum");
    setCreatingCategory(false);
    setNewCategoryName("");
    setSkinTypes(product?.skin_types ?? []);
    setSkinOptions(buildSkinOptions(skinTypeOptions, product?.skin_types ?? []));
    setCreatingSkin(false);
    setNewSkinName("");
    setEditingSkinSlug("");
    setFeatured(Boolean(product?.featured));
  }, [
    product?.id,
    product?.image_url,
    product?.image_urls?.join("|"),
    product?.variants?.map((v) => v.id).join("|"),
    product?.featured,
  ]);

  const featuredSlotsUsed = otherFeaturedCount + (featured ? 1 : 0);

  function toggleFeatured() {
    if (featured) {
      setFeatured(false);
      return;
    }
    if (otherFeaturedCount >= HOME_BESTSELLERS_LIMIT) {
      toast.error(
        `Já tem ${HOME_BESTSELLERS_LIMIT} selecionados para os mais vendidos. Desative um antes de ativar outro.`
      );
      return;
    }
    setFeatured(true);
  }

  useEffect(() => {
    return () => {
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
      blobUrlsRef.current = [];
    };
  }, []);

  function trackBlob(url: string) {
    blobUrlsRef.current.push(url);
  }

  function revokeBlob(url: string) {
    if (!url.startsWith("blob:")) return;
    URL.revokeObjectURL(url);
    blobUrlsRef.current = blobUrlsRef.current.filter((u) => u !== url);
  }

  async function uploadImageFile(file: File): Promise<string | null> {
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      toast.error("Imagem muito grande. Máximo 2 MB.");
      return null;
    }

    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadProductImage(fd);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return null;
    }
    if ("url" in result && result.url) {
      return result.url;
    }
    return null;
  }

  async function handleAddFiles(files: File[]) {
    if (!files.length) return;
    setUploadingImage(true);
    let added = 0;
    try {
      for (const file of files) {
        const blob = URL.createObjectURL(file);
        trackBlob(blob);
        setImageUrls((prev) => [...prev, blob]);
        const url = await uploadImageFile(file);
        if (!url) {
          setImageUrls((prev) => prev.filter((u) => u !== blob));
          revokeBlob(blob);
          continue;
        }
        revokeBlob(blob);
        setImageUrls((prev) => prev.map((u) => (u === blob ? url : u)));
        added++;
      }
      if (added > 0) {
        toast.success(added === 1 ? "Foto adicionada" : `${added} fotos adicionadas`);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast.error("URL inválida.");
      return;
    }
    if (imageUrls.includes(trimmed)) {
      toast.error("Essa foto já está na galeria.");
      return;
    }
    setImageUrls((prev) => [...prev, trimmed]);
    setSelectedIndex(imageUrls.length);
    toast.success("Foto adicionada");
  }

  function handleRemove(index: number) {
    setImageUrls((prev) => {
      const removed = prev[index];
      if (removed) revokeBlob(removed);
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    setSelectedIndex((prev) => {
      if (index < prev) return prev - 1;
      if (prev >= imageUrls.length - 1) return Math.max(0, imageUrls.length - 2);
      return prev;
    });
  }

  function handleSetCover(index: number) {
    if (index <= 0) return;
    setImageUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setSelectedIndex(0);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const remoteImages = imageUrls.filter(
        (url) => url.trim() && !url.startsWith("blob:")
      );

      if (remoteImages.length === 0) {
        toast.error("Adicione ao menos uma foto do produto.");
        return;
      }

      const fd = new FormData(e.currentTarget);
      const resolvedCategorySlug = creatingCategory
        ? slugify(newCategoryName.trim())
        : categorySlug;
      const resolvedCategoryLabel = creatingCategory
        ? newCategoryName.trim()
        : String(fd.get("category_label") || categoryLabel).trim();
      const category = categoryOptions.find((c) => c.slug === resolvedCategorySlug);

      if (creatingCategory && !newCategoryName.trim()) {
        toast.error("Informe o nome da nova categoria.");
        return;
      }

      let resolvedSkinTypes = skinTypes;
      let resolvedSkinOptions = skinOptions;

      if (creatingSkin) {
        const label = newSkinName.trim();
        if (!label) {
          toast.error("Informe o nome do novo tipo de pele.");
          return;
        }
        const slug = slugify(label);
        if (!slug) {
          toast.error("Informe o nome do novo tipo de pele.");
          return;
        }
        const existing = resolvedSkinOptions.find((skin) => skin.slug === slug);
        resolvedSkinOptions = existing
          ? resolvedSkinOptions.map((skin) => (skin.slug === slug ? { ...skin, label } : skin))
          : [
              ...resolvedSkinOptions,
              {
                slug,
                label,
                sort_order:
                  resolvedSkinOptions.reduce((max, skin) => Math.max(max, skin.sort_order), 0) + 1,
              },
            ];
        if (!resolvedSkinTypes.includes(slug)) resolvedSkinTypes = [...resolvedSkinTypes, slug];
      }

      if (resolvedSkinOptions.some((skin) => !skin.label.trim())) {
        toast.error("Informe o nome do tipo de pele.");
        return;
      }

      const payload = {
        name: String(fd.get("name")),
        full_name: String(fd.get("full_name") || fd.get("name")),
        slug: String(fd.get("slug") || ""),
        sku: String(fd.get("sku") || ""),
        ncm: String(fd.get("ncm") || ""),
        tax_origin: Number(fd.get("tax_origin") ?? 1),
        unit: String(fd.get("unit") || "UN"),
        brand: String(fd.get("brand") || ""),
        category_slug: resolvedCategorySlug,
        category_label: resolvedCategoryLabel || category?.label || resolvedCategorySlug,
        skin_types: resolvedSkinTypes,
        skin_type_catalog: resolvedSkinOptions.map((skin) => ({
          slug: skin.slug,
          label: skin.label.trim(),
        })),
        price: Number(fd.get("price")),
        compare_at_price: fd.get("compare_at_price") ? Number(fd.get("compare_at_price")) : null,
        pitch: String(fd.get("pitch") || ""),
        image_url: remoteImages[0],
        image_urls: remoteImages,
        image_fallback_url: String(fd.get("image_fallback_url") || ""),
        sold_count: Number(fd.get("sold_count") || 0),
        rating: Number(fd.get("rating") || 0),
        review_count: Number(fd.get("review_count") || 0),
        stock: Number(fd.get("stock") || 0),
        active: fd.get("active") === "on",
        featured,
        variants: variants.filter((v) => v.label.trim()),
      };

      const result = await saveProduct(payload, product?.id);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setSkinOptions(resolvedSkinOptions);
      setSkinTypes(resolvedSkinTypes);
      setCreatingSkin(false);
      setNewSkinName("");
      setEditingSkinSlug("");
      toast.success(product ? "Produto atualizado" : "Produto criado");
      if ("blingWarning" in result && result.blingWarning) {
        toast.warning(`Salvo na loja, mas Bling: ${result.blingWarning}`);
      }
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
            <Field label="SKU (código Bling) *">
              <input
                name="sku"
                required
                defaultValue={product?.sku ?? product?.slug ?? ""}
                placeholder="Ex.: ISEUL-SERUM-01"
                className={inputClass}
              />
            </Field>
            <Field label="Categoria *">
              {!creatingCategory ? (
                <AdminSelect
                  name="category_slug"
                  required
                  value={categorySlug}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setCreatingCategory(true);
                      return;
                    }
                    const selected = categoryOptions.find((c) => c.slug === e.target.value);
                    setCategorySlug(e.target.value);
                    if (selected) setCategoryLabel(selected.label);
                  }}
                >
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                  <option value="__new__">+ Adicionar categoria</option>
                </AdminSelect>
              ) : (
                <div className="space-y-2">
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex.: Cabelo / Capilar"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Usar categoria existente
                  </button>
                </div>
              )}
            </Field>
            <Field label="Nome da categoria (editável)" className="md:col-span-2">
              <input
                name="category_label"
                required
                value={creatingCategory ? newCategoryName : categoryLabel}
                onChange={(e) => {
                  if (creatingCategory) setNewCategoryName(e.target.value);
                  else setCategoryLabel(e.target.value);
                }}
                placeholder="Ex.: Sérum & ampola"
                className={inputClass}
              />
            </Field>
            <Field label="Tipo de pele" className="md:col-span-2">
              {!creatingSkin ? (
                <AdminSelect
                  value={editingSkinSlug}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setCreatingSkin(true);
                      setEditingSkinSlug("");
                      return;
                    }
                    setEditingSkinSlug(e.target.value);
                  }}
                >
                  <option value="">Selecione para editar</option>
                  {skinOptions.map((skin) => (
                    <option key={skin.slug} value={skin.slug}>
                      {skin.label}
                    </option>
                  ))}
                  <option value="__new__">+ Adicionar tipo de pele</option>
                </AdminSelect>
              ) : (
                <div className="space-y-2">
                  <input
                    value={newSkinName}
                    onChange={(e) => setNewSkinName(e.target.value)}
                    placeholder="Ex.: Pele acneica"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingSkin(false);
                      setNewSkinName("");
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Usar tipo existente
                  </button>
                </div>
              )}
            </Field>
            <Field label="Nome do tipo de pele (editável)" className="md:col-span-2">
              <input
                value={
                  creatingSkin
                    ? newSkinName
                    : (skinOptions.find((skin) => skin.slug === editingSkinSlug)?.label ?? "")
                }
                onChange={(e) => {
                  const next = e.target.value;
                  if (creatingSkin) {
                    setNewSkinName(next);
                    return;
                  }
                  if (!editingSkinSlug) return;
                  setSkinOptions((prev) =>
                    prev.map((skin) =>
                      skin.slug === editingSkinSlug ? { ...skin, label: next } : skin
                    )
                  );
                }}
                placeholder={
                  creatingSkin || editingSkinSlug
                    ? "Ex.: Pele oleosa"
                    : "Selecione um tipo acima para renomear"
                }
                disabled={!creatingSkin && !editingSkinSlug}
                className={inputClass}
              />
            </Field>
            <Field label="Marque os tipos deste produto" className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {skinOptions.map((skin) => {
                  const checked = skinTypes.includes(skin.slug);
                  return (
                    <label
                      key={skin.slug}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm has-[:checked]:border-iseul-pine has-[:checked]:bg-iseul-dew/50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSkinTypes((prev) =>
                            checked
                              ? prev.filter((s) => s !== skin.slug)
                              : [...prev, skin.slug]
                          );
                        }}
                        className="rounded border-neutral-300"
                      />
                      {skin.label || skin.slug}
                    </label>
                  );
                })}
              </div>
            </Field>
          </Section>

          <Section title="Fiscal / Bling">
            <p className="md:col-span-2 text-xs leading-relaxed text-neutral-500">
              Obrigatório para enviar o produto ao Bling e emitir NF-e. Ao salvar, sincronizamos
              automaticamente com o ERP (se o Bling estiver conectado).
            </p>
            <Field label="NCM *">
              <input
                name="ncm"
                required
                defaultValue={formatNcmDisplay(product?.ncm) || BLING_DEFAULT_NCM}
                placeholder="3304.99.90"
                className={inputClass}
              />
            </Field>
            <Field label="Origem fiscal *">
              <AdminSelect
                name="tax_origin"
                required
                defaultValue={String(product?.tax_origin ?? 1)}
              >
                {BLING_TAX_ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </AdminSelect>
            </Field>
            <Field label="Unidade *">
              <AdminSelect name="unit" required defaultValue={product?.unit ?? "UN"}>
                {BLING_PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </AdminSelect>
            </Field>
            {product && (
              <div className="md:col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-neutral-600">Status Bling:</span>
                  <BlingProductBadge status={product.bling_sync_status} title={product.bling_sync_error} />
                  {product.bling_product_id && (
                    <span className="font-mono text-xs text-neutral-500">ID {product.bling_product_id}</span>
                  )}
                </div>
                {product.bling_sync_error && (
                  <p className="mt-2 text-xs text-red-700">{product.bling_sync_error}</p>
                )}
              </div>
            )}
          </Section>

          <Section title="Preço e estoque">
            {variants.length > 0 && (
              <p className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Este produto tem variações. Preço e estoque da loja serão sincronizados automaticamente
                a partir das variações ao salvar.
              </p>
            )}
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

          <div className="rounded-xl border bg-white p-4 sm:p-6">
            <ProductVariantsEditor variants={variants} onChange={setVariants} />
          </div>

          <Section title="Avaliações">
            <Field label="Nota (0 a 5)">
              <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product?.rating ?? 0} className={inputClass} />
            </Field>
            <Field label="Nº de avaliações">
              <input name="review_count" type="number" min="0" defaultValue={product?.review_count ?? 0} className={inputClass} />
            </Field>
          </Section>

          <Section title="Imagens">
            <ProductImageGallery
              images={imageUrls}
              uploading={uploadingImage}
              disabled={pending}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onAddFiles={(files) => void handleAddFiles(files)}
              onAddUrl={handleAddUrl}
              onRemove={handleRemove}
              onSetCover={handleSetCover}
            />
            <Field label="URL fallback (opcional)" className="md:col-span-2">
              <input name="image_fallback_url" defaultValue={product?.image_fallback_url ?? ""} className={inputClass} />
              <p className="mt-1 text-xs text-neutral-500">
                Reserva caso a imagem principal falhe ao carregar na loja.
              </p>
            </Field>
          </Section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-iseul-line bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-iseul-ink">Mais vendidos na home</p>
                <p className="mt-0.5 text-xs leading-relaxed text-iseul-muted">
                  Aparece no bloco da página inicial. Máximo {HOME_BESTSELLERS_LIMIT} produtos.
                </p>
                <p className="mt-1.5 text-[11px] font-medium tabular-nums text-iseul-muted">
                  {featuredSlotsUsed}/{HOME_BESTSELLERS_LIMIT} selecionados
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={featured}
                aria-label="Mais vendidos na home"
                onClick={toggleFeatured}
                className={[
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iseul-sage/40",
                  featured ? "bg-iseul-sage" : "bg-neutral-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                    featured ? "translate-x-5" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-iseul-line bg-iseul-paper shadow-sm">
            <div className="border-b border-iseul-line/80 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-iseul-muted">Preview na loja</p>
            </div>
            <div className="p-4">
              <article className="overflow-hidden rounded-xl border border-iseul-line/80 bg-white shadow-sm">
                <div className="relative aspect-square overflow-hidden bg-iseul-areia/40">
                  {imageUrls[0] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrls[0]}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-iseul-ink/30">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-iseul-ink">
                            Enviando…
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                      <div className="h-10 w-10 rounded-full bg-iseul-dew" />
                      <p className="text-xs text-iseul-muted">Sem foto ainda</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-1 font-serif text-sm text-iseul-ink">
                    {product?.name || "Nome do produto"}
                  </p>
                  <p className="text-xs text-iseul-muted">{product?.brand || "Marca"}</p>
                  <p className="pt-1 text-sm font-medium text-iseul-pine">
                    {product?.price != null
                      ? product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "R$ 0,00"}
                  </p>
                </div>
              </article>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-iseul-muted">
                {productImageSpecLabel()}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 space-y-3">
            <div className="text-sm font-semibold">Publicação</div>
            <label className="flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
              Ativo na loja
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
            disabled={pending || uploadingImage}
            className="rounded-lg bg-iseul-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Salvando..." : uploadingImage ? "Enviando foto…" : product ? "Salvar alterações" : "Criar produto"}
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
