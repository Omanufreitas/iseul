import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnounceBar, StoreFooter, StoreHeader } from "@/components/store/HeaderFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { ProductDetailInfo } from "@/components/store/ProductDetailInfo";
import { ProductDetailMotion } from "@/components/store/ProductDetailMotion";
import { ProductPageMobileCta } from "@/components/store/ProductPageMobileCta";
import { getProductBySlug, getStoreSettings } from "@/lib/catalog";
import { formatCurrency, discountPercent, stars } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) notFound();

  const discount = discountPercent(product.price, product.compare_at_price);
  const inStock = product.stock > 0;

  return (
    <>
      <AnnounceBar text={settings.announcement} />
      <StoreHeader settings={settings} />
      <CartDrawer settings={settings} />

      <div className="mx-auto max-w-store px-6 py-12">
        <Link href="/#catalogo" className="text-sm text-iseul-muted hover:text-iseul-ink">
          Voltar ao catálogo
        </Link>

        <ProductDetailMotion>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="aspect-square overflow-hidden rounded-iseul border border-iseul-line bg-iseul-paper2 lg:sticky lg:top-24 lg:self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
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
                      {product.review_count} {product.review_count === 1 ? "avaliação" : "avaliações"}
                    </span>
                    {product.sold_count > 0 && (
                      <span className="text-iseul-line">|</span>
                    )}
                    {product.sold_count > 0 && <span>{product.sold_count} vendidos</span>}
                  </>
                ) : (
                  <span>Recém-chegado ao catálogo</span>
                )}
              </div>

              <p className="mt-5 rounded-iseul border border-iseul-accent/10 bg-iseul-dew/35 px-4 py-3 text-[15px] leading-relaxed text-iseul-ink/80">
                {product.pitch}
              </p>

              <div className="mt-6">
                {discount > 0 && product.compare_at_price && (
                  <div className="text-sm text-iseul-muted line-through">
                    {formatCurrency(product.compare_at_price)}
                  </div>
                )}
                <div className="font-serif text-4xl">{formatCurrency(product.price)}</div>
                <p className="mt-2 text-sm text-iseul-muted">
                  ou 3x de {formatCurrency(product.price / 3)} sem juros. Frete grátis acima de{" "}
                  {formatCurrency(settings.free_shipping_threshold)}
                </p>
              </div>

              {inStock ? (
                <ProductDetailClient product={product} />
              ) : (
                <p className="mt-6 rounded-full border border-iseul-line bg-iseul-card px-6 py-4 text-center text-sm text-iseul-muted">
                  Produto temporariamente indisponível
                </p>
              )}

              <ProductDetailInfo product={product} settings={settings} />
            </div>
          </div>
        </ProductDetailMotion>
      </div>

      <StoreFooter settings={settings} />
      <ProductPageMobileCta product={product} />
      <div className="h-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
    </>
  );
}
