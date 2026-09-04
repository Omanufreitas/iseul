"use server";

import { getProductById } from "@/lib/catalog";
import { getAvailableStock, stockErrorMessage } from "@/lib/inventory";
import type { CartItem } from "@/types";

export type CartValidationItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export async function validateCartItems(items: CartValidationItem[]) {
  const valid: CartValidationItem[] = [];
  const syncedItems: CartItem[] = [];
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
    let unitPrice = product.price;
    let listPrice = product.compare_at_price ?? product.price;
    let variantLabel: string | null = null;
    let name = product.name;
    let variantId: string | null = item.variantId ?? null;

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
      unitPrice = variant.price;
      listPrice = variant.compare_at_price ?? product.compare_at_price ?? variant.price;
      variantLabel = variant.label;
      name = `${product.name} — ${variant.label}`;
      variantId = variant.id;
    }

    const available = await getAvailableStock(product.id, variantId);
    if (available < item.quantity) {
      removed.push(variantId ? `${item.productId}:${variantId}` : item.productId);
      errors.push(stockErrorMessage(name, available, item.quantity));
      continue;
    }

    valid.push(item);
    syncedItems.push({
      productId: product.id,
      variantId,
      variantLabel,
      slug: product.slug,
      name,
      brand: product.brand,
      price: unitPrice,
      listPrice,
      image_url: product.image_url,
      image_fallback_url: product.image_fallback_url,
      quantity: item.quantity,
    });
  }

  return { valid, syncedItems, removed, errors: [...new Set(errors)] };
}
