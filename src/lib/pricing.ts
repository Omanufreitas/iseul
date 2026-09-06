export type CheckoutPaymentMethod = "pix" | "credit_card";

export function cardUnitPrice(
  salePrice: number,
  compareAtPrice: number | null | undefined
): number {
  if (compareAtPrice != null && compareAtPrice > salePrice) {
    return compareAtPrice;
  }
  return salePrice;
}

export function pixUnitPrice(
  salePrice: number,
  compareAtPrice: number | null | undefined,
  pixDiscountPercent: number
): number {
  if (compareAtPrice != null && compareAtPrice > salePrice) {
    return salePrice;
  }
  if (pixDiscountPercent > 0) {
    return Math.round(salePrice * (1 - pixDiscountPercent / 100) * 100) / 100;
  }
  return salePrice;
}

/** Exibe linha "no Pix com cupom" apenas quando o Pix é de fato mais barato. */
export function hasPixAdvantage(
  salePrice: number,
  compareAtPrice: number | null | undefined,
  pixDiscountPercent: number
): boolean {
  const cardPrice = cardUnitPrice(salePrice, compareAtPrice);
  const pixPrice = pixUnitPrice(salePrice, compareAtPrice, pixDiscountPercent);
  return pixPrice < cardPrice;
}

export function asaasBillingTypes(
  method: CheckoutPaymentMethod
): Array<"PIX" | "CREDIT_CARD"> {
  return method === "pix" ? ["PIX"] : ["CREDIT_CARD"];
}
