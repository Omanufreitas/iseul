import { formatCurrency } from "@/lib/utils";
import type { StoreSettings } from "@/types";

const FREE_SHIPPING_PATTERN = /(frete grátis acima de)\s*r\$?\s*[\d.,]+/i;

const DEFAULT_SUFFIX =
  " · Estoque no Brasil, envio em 24h úteis · Originais e lacrados";

/** Texto da faixa do topo — sempre reflete `free_shipping_threshold` das configurações. */
export function buildAnnounceBarText(
  settings: Pick<StoreSettings, "announcement" | "free_shipping_threshold">
): string {
  const threshold = formatCurrency(settings.free_shipping_threshold);
  const announcement = settings.announcement?.trim();

  if (announcement && FREE_SHIPPING_PATTERN.test(announcement)) {
    return announcement.replace(FREE_SHIPPING_PATTERN, `$1 ${threshold}`);
  }

  if (announcement) {
    return `Frete grátis acima de ${threshold}${DEFAULT_SUFFIX}`;
  }

  return `Frete grátis acima de ${threshold}${DEFAULT_SUFFIX}`;
}
