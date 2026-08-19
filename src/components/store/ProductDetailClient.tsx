"use client";

import { toast } from "sonner";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image_url: product.image_url,
      image_fallback_url: product.image_fallback_url,
    });
    toast.success("Adicionado à sacola");
    openCart();
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="mt-6 w-full rounded-full bg-iseul-ink py-4 text-sm font-medium text-iseul-paper hover:bg-iseul-accent transition-colors sm:w-auto sm:px-10"
    >
      Adicionar à sacola
    </button>
  );
}
