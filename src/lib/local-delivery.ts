/** ID negativo reservado — entrega local Campo Grande/MS (não usa Melhor Envio). */
export const LOCAL_MOTOBOY_OPTION_ID = -3;
export const LOCAL_MOTOBOY_PRICE = 15;

function normalizePostalCode(cep: string): string {
  return cep.replace(/\D/g, "").slice(0, 8);
}

function normalizeCityName(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function isCampoGrandeMsDelivery(input: {
  cep?: string;
  city?: string;
  state?: string;
}): boolean {
  const state = input.state?.trim().toUpperCase();
  const city = normalizeCityName(input.city ?? "");
  if (state === "MS" && city === "campo grande") return true;

  const cep = normalizePostalCode(input.cep ?? "");
  return cep.length === 8 && cep.startsWith("790");
}

export function isLocalMotoboyDelivery(
  shippingServiceId: unknown,
  shippingMethod?: string | null
): boolean {
  const parsed = Number.parseInt(String(shippingServiceId ?? ""), 10);
  if (parsed === LOCAL_MOTOBOY_OPTION_ID) return true;
  return /motoboy|entrega local/i.test(shippingMethod ?? "");
}

export function buildLocalMotoboyOption() {
  return {
    id: LOCAL_MOTOBOY_OPTION_ID,
    name: "Motoboy",
    company: "Entrega local",
    price: LOCAL_MOTOBOY_PRICE,
    deliveryDays: 1,
  };
}
