import { AnnounceBar, StoreFooter, StoreHeader } from "@/components/store/HeaderFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { getStoreSettings } from "@/lib/catalog";

export default async function CheckoutPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <AnnounceBar text={settings.announcement} />
      <StoreHeader settings={settings} />
      <CartDrawer settings={settings} />
      <CheckoutForm settings={settings} />
      <StoreFooter settings={settings} />
    </>
  );
}
