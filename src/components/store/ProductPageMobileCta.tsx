"use client";

import { useCart } from "@/context/cart-context";
import { MobileProductCta } from "@/components/store/MobileProductCta";
import type { Product } from "@/types";

export function ProductPageMobileCta({ product }: { product: Product }) {
  const { openCart } = useCart();
  return <MobileProductCta product={product} onAdd={openCart} />;
}
