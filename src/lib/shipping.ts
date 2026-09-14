import { getProductById, getStoreSettings, getVariantById } from "@/lib/catalog";
import { getFreeShippingThreshold } from "@/lib/config";
import {
  applyFreeShipping,
  pickDefaultShippingOption,
} from "@/lib/free-shipping";
import {
  calculateMelhorEnvioQuotes,
  DEFAULT_PRODUCT_SHIPPING,
  isMelhorEnvioConfigured,
  normalizePostalCode,
  type MelhorEnvioQuoteOption,
} from "@/lib/melhor-envio";
import { getAvailableStock } from "@/lib/inventory";
import {
  buildLocalMotoboyOption,
  isCampoGrandeMsDelivery,
} from "@/lib/local-delivery";
import { shippingForCep } from "@/lib/utils";

export type ShippingQuoteItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type ShippingQuoteOption = MelhorEnvioQuoteOption;

export type ShippingQuoteResult = {
  price: number;
  freeShipping: boolean;
  source: "melhor_envio" | "fallback";
  options: ShippingQuoteOption[];
  selectedOptionId: number;
  deliveryDays?: number;
  carrier?: string;
  service?: string;
};

function buildMelhorEnvioProducts(
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
) {
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

function buildFallbackOptions(cep: string, subtotal: number, freeThreshold: number): MelhorEnvioQuoteOption[] {
  const paidPac = shippingForCep(cep, subtotal, freeThreshold);
  const pacPrice = subtotal >= freeThreshold ? 0 : paidPac;
  const sedexPrice = Math.round((paidPac + 15) * 100) / 100;
  return [
    { id: 1, name: "PAC", company: "Correios", price: pacPrice, deliveryDays: 8 },
    { id: 2, name: "SEDEX", company: "Correios", price: sedexPrice, deliveryDays: 3 },
  ];
}

async function resolveCartSubtotal(items: ShippingQuoteItem[]) {
  const resolved: Array<{ productId: string; quantity: number; unitPrice: number }> = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      return { error: "Produto indisponível na sacola." as const };
    }

    const variants = product.variants ?? [];
    let unitPrice = product.price;
    let variantId: string | null = item.variantId ?? null;

    if (variants.length > 0) {
      if (!item.variantId) {
        return { error: `Selecione uma variação: ${product.name}` as const };
      }
      const variant = variants.find((v) => v.id === item.variantId) ?? (await getVariantById(item.variantId));
      if (!variant || !variant.active || variant.product_id !== product.id) {
        return { error: `Variação indisponível: ${product.name}` as const };
      }
      unitPrice = variant.price;
      variantId = variant.id;
    }

    const availableStock = await getAvailableStock(product.id, variantId);
    if (availableStock < item.quantity) {
      return {
        error:
          availableStock <= 0
            ? (`${product.name} está esgotado.` as const)
            : (`Estoque insuficiente: ${product.name}` as const),
      };
    }

    resolved.push({ productId: product.id, quantity: item.quantity, unitPrice });
    subtotal += unitPrice * item.quantity;
  }

  return { resolved, subtotal };
}

export async function quoteShippingForCheckout(
  destinationCep: string,
  items: ShippingQuoteItem[],
  selectedOptionId?: number | null,
  destination?: { city?: string; state?: string }
): Promise<ShippingQuoteResult | { error: string }> {
  const cep = normalizePostalCode(destinationCep);
  if (cep.length !== 8) return { error: "CEP inválido" };
  if (!items.length) return { error: "Sacola vazia" };

  const settings = await getStoreSettings();
  const freeThreshold = settings.free_shipping_threshold || getFreeShippingThreshold();

  const cart = await resolveCartSubtotal(items);
  if ("error" in cart && cart.error) {
    return { error: cart.error };
  }

  const { resolved, subtotal } = cart;
  const qualifiesForFree = subtotal >= freeThreshold;

  if (
    isCampoGrandeMsDelivery({
      cep,
      city: destination?.city,
      state: destination?.state,
    })
  ) {
    const motoboy = buildLocalMotoboyOption();
    return {
      price: motoboy.price,
      freeShipping: false,
      source: "fallback",
      options: [motoboy],
      selectedOptionId: motoboy.id,
      deliveryDays: motoboy.deliveryDays,
      carrier: motoboy.company,
      service: motoboy.name,
    };
  }

  let options: MelhorEnvioQuoteOption[] = [];
  let source: ShippingQuoteResult["source"] = "fallback";

  if (isMelhorEnvioConfigured()) {
    const quotes = await calculateMelhorEnvioQuotes(cep, buildMelhorEnvioProducts(resolved));
    if (quotes.length > 0) {
      options = quotes;
      source = "melhor_envio";
    }
  }

  if (options.length === 0) {
    options = buildFallbackOptions(cep, subtotal, freeThreshold);
  }

  options = applyFreeShipping(options, subtotal, freeThreshold);

  const selected =
    (selectedOptionId != null ? options.find((o) => o.id === selectedOptionId) : null) ??
    pickDefaultShippingOption(options);

  if (!selected) {
    return { error: "Nenhuma opção de frete disponível para este CEP." };
  }

  return {
    price: Math.round(selected.price * 100) / 100,
    freeShipping: qualifiesForFree && selected.price === 0,
    source,
    options,
    selectedOptionId: selected.id,
    deliveryDays: selected.deliveryDays,
    carrier: selected.company,
    service: selected.name,
  };
}

export function shippingPricesMatch(expected: number, received: number): boolean {
  return Math.abs(expected - received) < 0.02;
}
