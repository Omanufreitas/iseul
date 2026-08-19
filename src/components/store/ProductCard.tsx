"use client";

import Link from "next/link";
import { toast } from "sonner";
import { m, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatCurrency, discountPercent, stars } from "@/lib/utils";
import { getHotProductIds } from "@/lib/products";
import { EASE_OUT, imageZoom, popIn } from "@/lib/motion";
import type { Product } from "@/types";

export function ProductCard({
  product,
  allProducts,
  index = 0,
}: {
  product: Product;
  allProducts: Product[];
  index?: number;
}) {
  const { addItem } = useCart();
  const reduce = useReducedMotion();
  const hot = getHotProductIds(allProducts);
  const discount = discountPercent(product.price, product.compare_at_price);

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
  }

  return (
    <m.article
      layout
      initial={false}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: popIn.hidden,
        show: {
          ...popIn.show,
          transition: {
            ...(typeof popIn.show.transition === "object" ? popIn.show.transition : {}),
            delay: Math.min(index * 0.05, 0.35),
          },
        },
      }}
      whileHover={
        reduce
          ? undefined
          : { y: -6, boxShadow: "0 16px 40px rgba(28,26,22,.08)" }
      }
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="group flex flex-col overflow-hidden rounded-iseul border border-iseul-line bg-iseul-card hover:border-[#D8D0C4] hover:shadow-card"
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-iseul-paper2"
      >
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-iseul-sale px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          )}
          {hot.has(product.id) && (
            <span className="rounded-full bg-iseul-accent px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
              Mais vendido
            </span>
          )}
        </div>
        <m.div
          className="h-full w-full"
          variants={imageZoom}
          initial="rest"
          whileHover={reduce ? undefined : "hover"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              if (product.image_fallback_url) {
                (e.target as HTMLImageElement).src = product.image_fallback_url;
              }
            }}
          />
        </m.div>
      </Link>
      <m.div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-iseul-accent2">
          {product.brand}
        </div>
        <Link
          href={`/produtos/${product.slug}`}
          className="min-h-[39px] text-sm leading-snug transition-colors duration-200 hover:text-iseul-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-[11.5px] text-iseul-muted">
          {product.rating ? (
            <>
              <span className="text-iseul-gold tracking-tight">{stars(product.rating)}</span>
              <span>{product.review_count}</span>
            </>
          ) : (
            <span className="text-[#A49B8D]">Novo no catálogo</span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <div className="text-xs text-iseul-muted line-through">
                {formatCurrency(product.compare_at_price)}
              </div>
            )}
            <div className="font-serif text-lg sm:text-[22px] leading-none">{formatCurrency(product.price)}</div>
          </div>
          <m.button
            type="button"
            onClick={handleAdd}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="whitespace-nowrap rounded-full border border-iseul-ink px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-200 hover:bg-iseul-ink hover:text-iseul-paper"
          >
            Adicionar
          </m.button>
        </div>
      </m.div>
    </m.article>
  );
}
