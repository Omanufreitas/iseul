import type { MelhorEnvioQuoteOption } from "@/lib/melhor-envio";

function shippingLabel(option: MelhorEnvioQuoteOption): string {
  return `${option.company} ${option.name} ${option.id}`.toLowerCase();
}

function isSedexOption(option: MelhorEnvioQuoteOption): boolean {
  return /\bsedex\b/.test(shippingLabel(option));
}

export function isPacShippingOption(option: MelhorEnvioQuoteOption): boolean {
  if (isSedexOption(option)) return false;
  const label = shippingLabel(option);
  return /\bpac\b/.test(label) || option.id === 1;
}

export function isMiniEnviosShippingOption(option: MelhorEnvioQuoteOption): boolean {
  if (isSedexOption(option)) return false;
  const label = shippingLabel(option);
  return /\bmini\b/.test(label);
}

export function isTotalExpressShippingOption(option: MelhorEnvioQuoteOption): boolean {
  return shippingLabel(option).includes("total");
}

/** Transportadoras elegíveis para frete grátis (economia; nunca SEDEX). */
export function isFreeShippingEligibleOption(option: MelhorEnvioQuoteOption): boolean {
  return (
    isPacShippingOption(option) ||
    isMiniEnviosShippingOption(option) ||
    isTotalExpressShippingOption(option)
  );
}

/** Zera todas as opções econômicas elegíveis; SEDEX continua pago. */
export function applyFreeShipping(
  options: MelhorEnvioQuoteOption[],
  subtotal: number,
  freeThreshold: number
): MelhorEnvioQuoteOption[] {
  if (subtotal < freeThreshold || options.length === 0) return options;

  const hasEligible = options.some(isFreeShippingEligibleOption);
  if (!hasEligible) {
    const fallback = options.find((o) => !isSedexOption(o));
    if (!fallback) return options;
    return options.map((opt) => (opt.id === fallback.id ? { ...opt, price: 0 } : opt));
  }

  return options.map((opt) =>
    isFreeShippingEligibleOption(opt) ? { ...opt, price: 0 } : opt
  );
}

export function pickDefaultShippingOption(
  options: MelhorEnvioQuoteOption[]
): MelhorEnvioQuoteOption | null {
  if (!options.length) return null;

  const freeOptions = options.filter((o) => o.price === 0);
  if (freeOptions.length > 0) {
    return [...freeOptions].sort((a, b) => a.deliveryDays - b.deliveryDays)[0] ?? freeOptions[0];
  }

  return options.reduce((best, current) => (current.price < best.price ? current : best));
}
