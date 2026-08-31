"use server";

import { getProductById } from "@/lib/catalog";

export type CartValidationItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export async function validateCartItems(items: CartValidationItem[]) {
  const valid: CartValidationItem[] = [];
  const removed: string[] = [];
  const errors: string[] = [];

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      removed.push(item.productId);
      errors.push("Um produto da sacola não está mais disponível.");
      continue;
    }

    const variants = (product.variants ?? []).filter((v) => v.active);
    if (variants.length > 0) {
      if (!item.variantId) {
        removed.push(item.productId);
        errors.push(`Selecione uma variação: ${product.name}`);
        continue;
      }
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        removed.push(`${item.productId}:${item.variantId}`);
        errors.push(`Variação indisponível: ${product.name}`);
        continue;
      }
      if (variant.stock < item.quantity) {
        errors.push(`Estoque insuficiente: ${product.name} — ${variant.label}`);
      }
    } else if (product.stock < item.quantity) {
      errors.push(`Estoque insuficiente: ${product.name}`);
    }

    valid.push(item);
  }

  return { valid, removed, errors: [...new Set(errors)] };
}
