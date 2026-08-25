"use client";

import type { ProductVariant } from "@/types";

export type ProductVariantInput = {
  id?: string;
  label: string;
  sku?: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  image_url?: string | null;
  active: boolean;
};

type Props = {
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
};

const emptyVariant = (): ProductVariantInput => ({
  label: "",
  sku: "",
  price: 0,
  compare_at_price: null,
  stock: 0,
  image_url: "",
  active: true,
});

export function ProductVariantsEditor({ variants, onChange }: Props) {
  function update(index: number, patch: Partial<ProductVariantInput>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...variants, emptyVariant()]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Variações
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Cor, tamanho ou versão com preço e estoque próprios. Na loja aparece um único produto.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          + Variação
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-neutral-500">
          Nenhuma variação. O produto usa preço e estoque únicos.
        </p>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="grid gap-3 rounded-xl border bg-neutral-50/80 p-4 md:grid-cols-2"
            >
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium">Nome da variação *</span>
                <input
                  required
                  value={variant.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                  placeholder="Ex.: Rosa Médio, 50 ml"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Preço (R$) *</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.price || ""}
                  onChange={(e) => update(index, { price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Preço &quot;de&quot;</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.compare_at_price ?? ""}
                  onChange={(e) =>
                    update(index, {
                      compare_at_price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Estoque *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => update(index, { stock: Number(e.target.value) })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">SKU (opcional)</span>
                <input
                  value={variant.sku ?? ""}
                  onChange={(e) => update(index, { sku: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium">URL da foto (opcional)</span>
                <input
                  value={variant.image_url ?? ""}
                  onChange={(e) => update(index, { image_url: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex items-center justify-between md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={variant.active}
                    onChange={(e) => update(index, { active: e.target.checked })}
                  />
                  Ativa na loja
                </label>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function variantsFromProduct(variants: ProductVariant[] = []): ProductVariantInput[] {
  return variants.map((v) => ({
    id: v.id,
    label: v.label,
    sku: v.sku ?? "",
    price: v.price,
    compare_at_price: v.compare_at_price,
    stock: v.stock,
    image_url: v.image_url,
    active: v.active,
  }));
}
