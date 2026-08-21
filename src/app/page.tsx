import {
  LandingFooter,
  LandingHeader,
} from "@/components/store/landing/LandingHeaderFooter";
import { LandingHero } from "@/components/store/landing/LandingHero";
import { LandingAnnounceBar, LandingPageMotion } from "@/components/store/landing/LandingPageMotion";
import { LandingTrustBar } from "@/components/store/landing/LandingTrustBar";
import { SelectionSection } from "@/components/store/landing/SelectionSection";
import { LandingRoutineSection } from "@/components/store/landing/LandingRoutineSection";
import { LandingAboutSection } from "@/components/store/landing/LandingAboutSection";
import { LandingContactSection } from "@/components/store/landing/LandingContactSection";
import { getStoreSettings } from "@/lib/catalog";

export default async function HomePage() {
  const settings = await getStoreSettings();

  return (
    <LandingPageMotion>
      <LandingAnnounceBar text="Frete grátis acima de R$199 · Estoque no Brasil, envio em 24h úteis · Produtos originais e lacrados" />
      <LandingHeader />

      <main id="topo">
        <LandingHero />
        <LandingTrustBar settings={settings} />
        <SelectionSection />
        <LandingRoutineSection />
        <LandingAboutSection />
        <LandingContactSection />
      </main>

      <LandingFooter settings={settings} />
    </LandingPageMotion>
  );
}
