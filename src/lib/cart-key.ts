import type { CartItem } from "@/types";

export function cartItemKey(item: Pick<CartItem, "productId" | "variantId">) {
  return item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
}
