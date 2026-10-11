import { Suspense } from "react";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CatalogBrowser } from "@/components/store/catalog/CatalogBrowser";
import { LandingFooter, LandingHeader } from "@/components/store/landing/LandingHeaderFooter";
import { BrandMarquee } from "@/components/store/landing/BrandMarquee";
import { LandingAnnounceBar, LandingPageMotion } from "@/components/store/landing/LandingPageMotion";
import { listProducts, getStoreSettings } from "@/lib/catalog";
import { listProductCategories } from "@/lib/categories";
import { listSkinTypes } from "@/lib/skin-types";
import { buildAnnounceBarText } from "@/lib/store-announcement";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Produtos | ${SITE_NAME}`,
  description:
    "Catálogo Iseul: skincare coreano com busca por produto, marca e ativo. Filtre por categoria, marca e tipo de pele.",
  alternates: { canonical: `${SITE_URL}/produtos` },
};

export default async function ProductsIndexPage() {
  const [products, settings, categories, skinTypes] = await Promise.all([
    listProducts(),
    getStoreSettings(),
    listProductCategories(),
    listSkinTypes(),
  ]);

  return (
    <LandingPageMotion>
      <LandingAnnounceBar text={buildAnnounceBarText(settings)} />
      <BrandMarquee />
      <LandingHeader products={products} />

      <main>
        <Suspense
          fallback={
            <section className="landing-section bg-iseul-areia/50">
              <div className="wrap py-20 text-center text-iseul-muted">Carregando catálogo…</div>
            </section>
          }
        >
          <CatalogBrowser
            products={products}
            categories={categories}
            skinTypes={skinTypes}
            heading={{
              eyebrow: "catálogo",
              title: (
                <>
                  Encontre o produto <em>certo.</em>
                </>
              ),
              subtitle: `${products.length} produtos · busque por nome, marca ou ativo`,
            }}
          />
        </Suspense>
      </main>

      <LandingFooter />
      <CartDrawer settings={settings} />
    </LandingPageMotion>
  );
}
