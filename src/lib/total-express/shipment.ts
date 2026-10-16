/** Pedido que deve nascer no contrato da Total Express, não no Melhor Envio. */
export function isTotalExpressShipment(
  shippingMethod?: string | null,
  carrier?: string | null
): boolean {
  return /\btotal\b/i.test(`${shippingMethod ?? ""} ${carrier ?? ""}`);
}

export const TOTAL_EXPRESS_LABEL_STATUS = "total_express";

export function totalExpressLabelPath(orderId: string): string {
  return `/admin/etiqueta/${orderId}`;
}
