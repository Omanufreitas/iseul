"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  visible = false,
  compact = false,
}: {
  product: Product;
  allProducts: Product[];
  index?: number;
  /** Sem animação de entrada — catálogo na landing precisa aparecer sempre */
  visible?: boolean;
  /** Cards menores para grade densa do catálogo */
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const reduce = useReducedMotion();
  const hot = getHotProductIds(allProducts);
  const discount = discountPercent(product.price, product.compare_at_price);

  function handleAdd() {
    if (product.has_variants) {
      toast.info("Selecione uma variação na página do produto");
      router.push(`/produtos/${product.slug}`);
      return;
    }

    if (product.stock <= 0) {
      toast.error("Produto esgotado");
      router.push(`/produtos/${product.slug}`);
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      listPrice: product.compare_at_price ?? product.price,
      image_url: product.image_url,
      image_fallback_url: product.image_fallback_url,
    });
    toast.success("Adicionado à sacola");
  }

  return (
    <m.article
      layout
      initial={visible || reduce ? "show" : false}
      whileInView={visible || reduce ? undefined : "show"}
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
        <div
          className={[
            "absolute z-10 flex flex-col items-start gap-1",
            compact ? "left-2 top-2" : "left-2.5 top-2.5 gap-1.5",
          ].join(" ")}
        >
          {product.stock <= 0 && (
            <span className="inline-flex w-fit rounded-full bg-neutral-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Esgotado
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex w-fit rounded-full bg-iseul-sale px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          )}
          {hot.has(product.id) && (
            <span className="inline-flex w-fit rounded-full bg-iseul-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
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
      <m.div
        className={[
          "flex flex-1 flex-col",
          compact ? "gap-1 p-3" : "gap-1.5 p-4",
        ].join(" ")}
      >
        <div
          className={[
            "font-semibold uppercase tracking-[0.14em] text-iseul-accent2",
            compact ? "text-[9.5px]" : "text-[10.5px]",
          ].join(" ")}
        >
          {product.brand}
        </div>
        <Link
          href={`/produtos/${product.slug}`}
          className={[
            "leading-snug transition-colors duration-200 hover:text-iseul-accent",
            compact ? "min-h-[34px] text-[13px]" : "min-h-[39px] text-sm",
          ].join(" ")}
        >
          {product.name}
        </Link>
        {!compact && (
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
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <div className={compact ? "text-[11px] text-iseul-muted line-through" : "text-xs text-iseul-muted line-through"}>
                {formatCurrency(product.compare_at_price)}
              </div>
            )}
            <div
              className={[
                "font-serif leading-none",
                compact ? "text-base sm:text-lg" : "text-lg sm:text-[22px]",
              ].join(" ")}
            >
              {formatCurrency(product.price)}
            </div>
          </div>
          <m.button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className={[
              "whitespace-nowrap rounded-full border border-iseul-ink font-medium transition-colors duration-200 hover:bg-iseul-ink hover:text-iseul-paper disabled:cursor-not-allowed disabled:border-iseul-line disabled:text-iseul-muted disabled:hover:bg-transparent",
              compact ? "px-2.5 py-1.5 text-[11.5px]" : "px-3.5 py-2 text-[12.5px]",
            ].join(" ")}
          >
            {product.stock <= 0 ? "Esgotado" : "Adicionar"}
          </m.button>
        </div>
      </m.div>
    </m.article>
  );
}
