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
      return `- ${line.name} (${line.brand}) | ${line.category} | ${line.price} | ${line.stock} | pele: ${line.skin} | /produtos/${line.slug} | ${line.pitch}`;
    })
    .join("\n");
}

export function formatStoreFacts(settings: StoreSettings): string {
  return [
    `Frete grátis somente acima de ${formatCurrency(settings.free_shipping_threshold)}, calculado no checkout pelo CEP.`,
    "Pedidos com estoque no Brasil saem em até 24 horas úteis após o pagamento, com rastreio por e-mail.",
    "Pix e cartão são formas de pagamento. Não existe desconto automático de Pix nas páginas da loja.",
    "Não invente cupom, percentual de desconto, prazo extra nem frete grátis abaixo do valor mínimo.",
  ].join(" ");
}
