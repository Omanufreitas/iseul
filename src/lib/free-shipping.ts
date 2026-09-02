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

export function isTotalExpressShippingOption(option: MelhorEnvioQuoteOption): boolean {
  return shippingLabel(option).includes("total");
}

/** Transportadoras elegíveis para frete grátis (nunca SEDEX). */
export function isFreeShippingEligibleOption(option: MelhorEnvioQuoteOption): boolean {
  return isPacShippingOption(option) || isTotalExpressShippingOption(option);
}

export function pickCheapestFreeShippingOption(
  options: MelhorEnvioQuoteOption[]
): MelhorEnvioQuoteOption | null {
  const eligible = options.filter(isFreeShippingEligibleOption);
  if (eligible.length === 0) return null;
  return [...eligible].sort((a, b) => a.price - b.price)[0] ?? null;
}

/** Zera só a opção mais barata elegível; demais permanecem pagas. */
export function applyFreeShipping(
  options: MelhorEnvioQuoteOption[],
  subtotal: number,
  freeThreshold: number
): MelhorEnvioQuoteOption[] {
  if (subtotal < freeThreshold || options.length === 0) return options;

  const cheapest =
    pickCheapestFreeShippingOption(options) ??
    options.find(isPacShippingOption) ??
    options.find((o) => !isSedexOption(o)) ??
    [...options].sort((a, b) => a.price - b.price)[0] ??
    null;

  if (!cheapest) return options;

  return options.map((opt) =>
    opt.id === cheapest.id ? { ...opt, price: 0 } : opt
  );
}

export function pickDefaultShippingOption(
  options: MelhorEnvioQuoteOption[]
): MelhorEnvioQuoteOption | null {
  if (!options.length) return null;
  return options.reduce((best, current) => (current.price < best.price ? current : best));
}
