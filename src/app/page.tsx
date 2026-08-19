import { AnnounceBar, StoreFooter, StoreHeader } from "@/components/store/HeaderFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CatalogSection, RoutineSection } from "@/components/store/CatalogSection";
import { HomeHero } from "@/components/store/HomeHero";
import { TrustBar } from "@/components/store/TrustBar";
import { AboutSection } from "@/components/store/AboutSection";
import { MobileCatalogCta } from "@/components/store/MobileCatalogCta";
import { listProducts, getStoreSettings, countProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [products, settings, total] = await Promise.all([
    listProducts(),
    getStoreSettings(),
    countProducts(),
  ]);

  return (
    <>
      <AnnounceBar text={settings.announcement} />
      <StoreHeader settings={settings} />
      <CartDrawer settings={settings} />

      <HomeHero />
      <TrustBar settings={settings} total={total} />
      <CatalogSection products={products} />
      <RoutineSection />
      <AboutSection total={total} />
      <StoreFooter settings={settings} />

      <div className="h-[calc(4.75rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileCatalogCta />
    </>
  );
}
