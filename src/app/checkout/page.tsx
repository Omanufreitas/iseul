import { AnnounceBar, StoreHeader } from "@/components/store/HeaderFooter";
import { LandingFooter } from "@/components/store/landing/LandingHeaderFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { loadAbandonedCheckout } from "@/lib/abandoned-cart/recovery";
import { getStoreSettings } from "@/lib/catalog";
import { buildAnnounceBarText } from "@/lib/store-announcement";

type Props = { searchParams: Promise<{ recuperar?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const settings = await getStoreSettings();
  const { recuperar } = await searchParams;
  const recovery = recuperar ? await loadAbandonedCheckout(recuperar) : null;

  return (
    <>
      <AnnounceBar text={buildAnnounceBarText(settings)} />
      <StoreHeader settings={settings} />
      <CartDrawer settings={settings} />
      <CheckoutForm settings={settings} recovery={recovery} />
      <LandingFooter />
    </>
  );
}
