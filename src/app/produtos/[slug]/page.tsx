import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnnounceBar, StoreHeader } from "@/components/store/HeaderFooter";
import { LandingFooter } from "@/components/store/landing/LandingHeaderFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ProductDetailMotion } from "@/components/store/ProductDetailMotion";
import { ProductPageContent } from "@/components/store/ProductPageContent";
import { getProductBySlug, getStoreSettings } from "@/lib/catalog";
import { buildProductJsonLd, productMetadata } from "@/lib/metadata";
import { buildAnnounceBarText } from "@/lib/store-announcement";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Produto não encontrado | Iseul" };
  }
  return productMetadata(product);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) notFound();

  const variants = product.variants ?? [];
  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnnounceBar text={buildAnnounceBarText(settings)} />
      <StoreHeader settings={settings} />
      <CartDrawer settings={settings} />

      <div className="mx-auto max-w-[1120px] px-6 py-12">
        <Link href="/#catalogo" className="text-sm text-iseul-muted hover:text-iseul-ink">
          Voltar ao catálogo
        </Link>

        <ProductDetailMotion>
          <ProductPageContent product={product} variants={variants} settings={settings} />
        </ProductDetailMotion>
      </div>

      <LandingFooter />
      <div className="h-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
    </>
  );
}
