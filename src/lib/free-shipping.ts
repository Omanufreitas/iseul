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

/** Frete grátis é só o contrato da Total Express. */
export function isFreeShippingEligibleOption(option: MelhorEnvioQuoteOption): boolean {
  return isTotalExpressShippingOption(option);
}

/** Acima do mínimo, só a Total Express fica grátis. PAC, SEDEX e as demais continuam na lista, pagas. */
export function applyFreeShipping(
  options: MelhorEnvioQuoteOption[],
  subtotal: number,
  freeThreshold: number
): MelhorEnvioQuoteOption[] {
  if (subtotal < freeThreshold || options.length === 0) return options;
  if (!options.some(isTotalExpressShippingOption)) return options;

  return options.map((option) =>
    isTotalExpressShippingOption(option) ? { ...option, price: 0 } : option
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
