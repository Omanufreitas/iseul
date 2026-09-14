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
  const pixRule =
    settings.pix_discount_percent > 0
      ? `No checkout, Pix tem ${settings.pix_discount_percent}% de desconto sobre o preço do produto. Isso já aparece na página do produto e no resumo do checkout. Não é cupom e não pode ser aplicado em cima de outro desconto. Não ofereça percentual diferente, desconto extra nem cupom que não exista.`
      : "Pix e cartão são formas de pagamento. Só cite desconto de Pix se estiver definido nestas regras.";

  return [
    `Frete grátis somente acima de ${formatCurrency(settings.free_shipping_threshold)}, calculado no checkout pelo CEP.`,
    "Pedidos com estoque no Brasil saem em até 24 horas úteis após o pagamento, com rastreio por e-mail.",
    pixRule,
    "Não invente cupom, percentual extra, prazo extra nem frete grátis abaixo do valor mínimo.",
  ].join(" ");
}
