import { getProductById, getStoreSettings } from "@/lib/catalog";
import { getFreeShippingThreshold } from "@/lib/config";
import {
  calculateMelhorEnvioQuotes,
  DEFAULT_PRODUCT_SHIPPING,
  isMelhorEnvioConfigured,
  normalizePostalCode,
  pickCheapestQuote,
  type MelhorEnvioProductInput,
} from "@/lib/melhor-envio";
import { shippingForCep } from "@/lib/utils";

export type ShippingQuoteItem = {
  productId: string;
  quantity: number;
};

export type ShippingQuoteResult = {
  price: number;
  freeShipping: boolean;
  source: "free_threshold" | "melhor_envio" | "fallback";
  deliveryDays?: number;
  carrier?: string;
  service?: string;
};

function buildMelhorEnvioProducts(
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
): MelhorEnvioProductInput[] {
  return items.map((item) => ({
    id: item.productId,
    width: DEFAULT_PRODUCT_SHIPPING.width,
    height: DEFAULT_PRODUCT_SHIPPING.height,
    length: DEFAULT_PRODUCT_SHIPPING.length,
    weight: DEFAULT_PRODUCT_SHIPPING.weight,
    insurance_value: Math.max(0, Math.round(item.unitPrice * 100) / 100),
    quantity: item.quantity,
  }));
}

export async function quoteShippingForCheckout(
  destinationCep: string,
  items: ShippingQuoteItem[]
): Promise<ShippingQuoteResult | { error: string }> {
  const cep = normalizePostalCode(destinationCep);
  if (cep.length !== 8) return { error: "CEP inválido" };
  if (!items.length) return { error: "Sacola vazia" };

  const settings = await getStoreSettings();
  const freeThreshold = settings.free_shipping_threshold || getFreeShippingThreshold();

  const resolved: Array<{ productId: string; quantity: number; unitPrice: number }> = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      return { error: "Produto indisponível na sacola." };
    }
    if (product.stock < item.quantity) {
      return { error: `Estoque insuficiente: ${product.name}` };
    }
    resolved.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
    });
    subtotal += product.price * item.quantity;
  }

  if (subtotal >= freeThreshold) {
    return {
      price: 0,
      freeShipping: true,
      source: "free_threshold",
    };
  }

  if (isMelhorEnvioConfigured()) {
    const quotes = await calculateMelhorEnvioQuotes(cep, buildMelhorEnvioProducts(resolved));
    const best = pickCheapestQuote(quotes);
    if (best) {
      return {
        price: Math.round(best.price * 100) / 100,
        freeShipping: false,
        source: "melhor_envio",
        deliveryDays: best.deliveryDays,
        carrier: best.company,
        service: best.name,
      };
    }
  }

  return {
    price: shippingForCep(cep, subtotal, freeThreshold),
    freeShipping: false,
    source: "fallback",
  };
}

export function shippingPricesMatch(expected: number, received: number): boolean {
  return Math.abs(expected - received) < 0.02;
}
