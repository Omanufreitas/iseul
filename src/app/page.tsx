import { Suspense } from "react";
import { CartDrawer } from "@/components/store/CartDrawer";
import { LandingFooter, LandingHeader } from "@/components/store/landing/LandingHeaderFooter";
import { BrandMarquee } from "@/components/store/landing/BrandMarquee";
import { LandingAnnounceBar, LandingPageMotion } from "@/components/store/landing/LandingPageMotion";
import { LandingHero } from "@/components/store/landing/LandingHero";
import { LandingTrustBar } from "@/components/store/landing/LandingTrustBar";
import { LandingCatalogSection } from "@/components/store/landing/LandingCatalogSection";
import { LandingRoutineSection } from "@/components/store/landing/LandingRoutineSection";
import { LandingAboutSection } from "@/components/store/landing/LandingAboutSection";
import { WaitlistSection } from "@/components/store/landing/WaitlistSection";
import { LandingContactSection } from "@/components/store/landing/LandingContactSection";
import { DewDivider } from "@/components/store/landing/DewDivider";
import { listProducts, getStoreSettings } from "@/lib/catalog";
import { listProductCategories } from "@/lib/categories";
import { buildAnnounceBarText } from "@/lib/store-announcement";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export default async function HomePage() {
  const [products, settings, categories] = await Promise.all([
    listProducts(),
    getStoreSettings(),
    listProductCategories(),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    sameAs: ["https://www.instagram.com/iseul.br/"],
    description: SITE_DESCRIPTION,
  };

  return (
    <LandingPageMotion>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <LandingAnnounceBar text={buildAnnounceBarText(settings)} />
      <BrandMarquee />
      <LandingHeader />

      <main id="topo">
        <LandingHero />
        <LandingTrustBar />
        <DewDivider />
        <Suspense fallback={null}>
          <LandingCatalogSection products={products} categories={categories} />
        </Suspense>
        <LandingRoutineSection />
        <LandingAboutSection />
        <DewDivider />
        <WaitlistSection />
        <LandingContactSection />
      </main>

      <LandingFooter />
      <CartDrawer settings={settings} />
    </LandingPageMotion>
  );
}
