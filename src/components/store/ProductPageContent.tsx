"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductDetailGallery } from "@/components/store/ProductDetailGallery";
import { ProductDetailInfo } from "@/components/store/ProductDetailInfo";
import { MobileProductCta } from "@/components/store/MobileProductCta";
import { useCart } from "@/context/cart-context";
import { cn, discountPercent, formatCurrency, stars } from "@/lib/utils";
import type { Product, ProductVariant, StoreSettings } from "@/types";

type Props = {
  product: Product;
  variants: ProductVariant[];
  settings: StoreSettings;
};

function buildDisplayProduct(product: Product, variant: ProductVariant | null): Product {
  if (!variant) return product;

  const image_urls = variant.image_url
    ? [variant.image_url, ...product.image_urls.filter((url) => url !== variant.image_url)]
    : product.image_urls;

  return {
    ...product,
    price: variant.price,
    compare_at_price: variant.compare_at_price ?? product.compare_at_price,
    stock: variant.stock,
    image_url: variant.image_url || product.image_url,
    image_urls,
  };
}

export function ProductPageContent({ product, variants, settings }: Props) {
  const activeVariants = variants.filter((v) => v.active);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    activeVariants[0]?.id ?? null
  );
  const { addItem, openCart } = useCart();

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0] ?? null;

  const displayProduct = useMemo(
    () => buildDisplayProduct(product, selectedVariant),
    [product, selectedVariant]
  );

  const discount = discountPercent(displayProduct.price, displayProduct.compare_at_price);
  const inStock = displayProduct.stock > 0;
  const maxQty = Math.min(displayProduct.stock, 20);

  function handleAdd() {
    if (!inStock) return;

    const name =
      selectedVariant != null
        ? `${product.name} — ${selectedVariant.label}`
        : product.name;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        variantLabel: selectedVariant?.label ?? null,
        slug: product.slug,
        name,
        brand: product.brand,
        price: displayProduct.price,
        image_url: displayProduct.image_url,
        image_fallback_url: product.image_fallback_url,
      },
      1
    );
    toast.success("Adicionado à sacola");
    openCart();
  }

  return (
    <>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductDetailGallery
            key={selectedVariant?.id ?? "default"}
            product={displayProduct}
          />
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted">
            {product.brand}, {product.category_label}
          </div>
          <h1 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-iseul-muted">
            {product.rating > 0 ? (
              <>
                <span className="text-iseul-gold">{stars(product.rating)}</span>
                <span>
                  {product.review_count}{" "}
                  {product.review_count === 1 ? "avaliação" : "avaliações"}
                </span>
                {product.sold_count > 0 && (
                  <>
                    <span className="text-iseul-line">|</span>
                    <span>{product.sold_count} vendidos</span>
                  </>
                )}
              </>
            ) : (
              <span>Recém-chegado ao catálogo</span>
            )}
          </div>

          <p className="mt-5 rounded-iseul border border-iseul-accent/10 bg-iseul-dew/35 px-4 py-3 text-[15px] leading-relaxed text-iseul-ink/80">
            {product.pitch}
          </p>

          <div className="mt-6">
            {discount > 0 && displayProduct.compare_at_price && (
              <div className="text-sm text-iseul-muted line-through">
                {formatCurrency(displayProduct.compare_at_price)}
              </div>
            )}
            <div className="font-serif text-4xl text-[#C0392B]">
              {formatCurrency(displayProduct.price)}
            </div>
            {settings.pix_discount_percent > 0 && (
              <p className="mt-1 text-sm font-medium text-[#C0392B]">
                no Pix com cupom &gt;
              </p>
            )}
            <p className="mt-2 text-sm text-iseul-muted">
              ou {formatCurrency(displayProduct.compare_at_price ?? displayProduct.price)} sem cupom
              em outros métodos · 3x de {formatCurrency(displayProduct.price / 3)} sem juros
            </p>
            <p className="mt-2 text-sm text-iseul-muted">
              Estoque: {displayProduct.stock}
            </p>
          </div>

          {activeVariants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-iseul-muted">
                {activeVariants.length}{" "}
                {activeVariants.length === 1 ? "Variação disponível" : "Variações disponíveis"}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((variant) => {
                  const thumb = variant.image_url || product.image_url;
                  const selected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "flex min-w-[88px] items-center gap-2 rounded-lg border-2 bg-white px-2 py-1.5 text-left transition-colors",
                        selected
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]/20"
                          : "border-iseul-line hover:border-iseul-sage"
                      )}
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-iseul-paper2 text-xs">
                          ◦
                        </span>
                      )}
                      <span className="text-xs font-medium leading-tight">{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {inStock ? (
            <div id="product-add-btn">
              <button
                type="button"
                onClick={handleAdd}
                className="mt-6 w-full rounded-full bg-iseul-ink py-4 text-sm font-medium text-iseul-paper transition-colors hover:bg-iseul-accent sm:w-auto sm:px-10"
              >
                Adicionar à sacola
              </button>
            </div>
          ) : (
            <p className="mt-6 rounded-full border border-iseul-line bg-iseul-card px-6 py-4 text-center text-sm text-iseul-muted">
              Produto temporariamente indisponível
            </p>
          )}

          <ProductDetailInfo product={displayProduct} settings={settings} />
        </div>
      </div>

      <MobileProductCta
        product={displayProduct}
        variantId={selectedVariant?.id ?? null}
        variantLabel={selectedVariant?.label ?? null}
        baseProduct={product}
        maxQuantity={maxQty}
        onAdd={openCart}
      />
    </>
  );
}
