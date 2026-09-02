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

export function asaasBillingTypes(
  method: CheckoutPaymentMethod
): Array<"PIX" | "CREDIT_CARD"> {
  return method === "pix" ? ["PIX"] : ["CREDIT_CARD"];
}
