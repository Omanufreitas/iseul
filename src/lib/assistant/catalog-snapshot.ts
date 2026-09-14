import { formatCurrency } from "@/lib/utils";
import type { Product, StoreSettings } from "@/types";

export type AssistantProductLine = {
  name: string;
  brand: string;
  slug: string;
  category: string;
  price: string;
  stock: string;
  skin: string;
  pitch: string;
};

export function toAssistantProductLine(product: Product): AssistantProductLine {
  const available = product.has_variants
    ? (product.variants ?? []).some((v) => v.active && v.stock > 0)
    : product.stock > 0;

  return {
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    category: product.category_label,
    price: formatCurrency(product.price),
    stock: available ? "em estoque" : "esgotado",
    skin: product.skin_types?.length ? product.skin_types.join(", ") : "todos",
    pitch: product.pitch.replace(/\s+/g, " ").trim(),
  };
}

export function formatCatalogSnapshot(products: Product[]): string {
  if (!products.length) return "(catálogo vazio no momento)";

  return products
    .map((product) => {
      const line = toAssistantProductLine(product);
      return `- ${line.name} (${line.brand}) | ${line.category} | ${line.price} | ${line.stock} | pele: ${line.skin} | slug: ${line.slug} | ${line.pitch}`;
    })
    .join("\n");
}

export function formatStoreFacts(settings: StoreSettings): string {
  return [
    `Frete grátis acima de ${formatCurrency(settings.free_shipping_threshold)}.`,
    `Pix com cerca de ${settings.pix_discount_percent}% de desconto no checkout.`,
    "Estoque no Brasil, envio em até 24h úteis.",
  ].join(" ");
}
