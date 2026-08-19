"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

type Props = {
  product: Product;
  onAdd: () => void;
};

/** CTA fixo no mobile — some quando o botão principal está visível */
export function MobileProductCta({ product, onAdd }: Props) {
  const { addItem } = useCart();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("product-add-btn");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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
    onAdd();
  }

  if (product.stock <= 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden",
        "transition-transform duration-300 ease-out",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div
        className="pointer-events-auto border-t border-iseul-line/80 bg-iseul-paper/95 px-4 pt-3 backdrop-blur-md"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-iseul-accent2">
              {product.brand}
            </div>
            <div className="truncate text-sm font-medium">{product.name}</div>
          </div>
          <div className="shrink-0 font-serif text-xl">{formatCurrency(product.price)}</div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full bg-iseul-ink py-3.5 text-sm font-medium text-iseul-paper shadow-[0_4px_20px_rgba(28,26,22,.18)] transition-colors active:bg-iseul-accent"
        >
          Adicionar à sacola
        </button>
      </div>
    </div>
  );
}
