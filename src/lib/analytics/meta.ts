import { mirrorMetaEventToCapi } from "@/lib/analytics/meta-capi-mirror";
import { fbq, trackStorefrontPageView } from "@/lib/meta-pixel";

export type MetaContentParams = {
  contentIds?: string[];
  contentName?: string;
  value?: number;
  currency?: string;
  numItems?: number;
  orderId?: string;
  eventId?: string;
};

function baseContentParams({
  contentIds,
  contentName,
  value,
  currency = "BRL",
  numItems,
  orderId,
}: MetaContentParams): Record<string, unknown> {
  const params: Record<string, unknown> = { currency };
  if (contentIds?.length) {
    params.content_ids = contentIds.map((id) => String(id));
    params.content_type = "product";
  }
  if (contentName) params.content_name = contentName;
  if (value != null && Number.isFinite(value) && value > 0) {
    params.value = Number(value.toFixed(2));
  }
  if (numItems != null && numItems > 0) params.num_items = numItems;
  if (orderId) params.order_id = String(orderId);
  return params;
}

function trackMetaStandard(event: string, { eventId, ...params }: MetaContentParams) {
  const payload = baseContentParams(params);
  const resolvedId = eventId || `${event.toLowerCase()}_${Date.now()}`;
  fbq("track", event, payload, { eventID: resolvedId });
  if (event === "ViewContent" || event === "InitiateCheckout" || event === "Purchase") {
    mirrorMetaEventToCapi(event, resolvedId, params);
  }
}

let lastInitiateCheckoutKey = "";
let lastInitiateCheckoutAt = 0;
const INITIATE_CHECKOUT_DEDUP_MS = 10_000;

export function resetMetaInitiateCheckoutForTests() {
  lastInitiateCheckoutKey = "";
  lastInitiateCheckoutAt = 0;
}

export function trackMetaPageView(pathname: string | null | undefined) {
  trackStorefrontPageView(pathname);
}

export function trackMetaViewContent(params: MetaContentParams) {
  trackMetaStandard("ViewContent", params);
}

export function trackMetaAddToCart(params: MetaContentParams) {
  trackMetaStandard("AddToCart", params);
}

export function trackMetaInitiateCheckout(params: MetaContentParams) {
  const key = `${(params.contentIds ?? []).map(String).sort().join(",")}|${params.value ?? 0}|${params.numItems ?? 0}`;
  const now = Date.now();
  if (key === lastInitiateCheckoutKey && now - lastInitiateCheckoutAt < INITIATE_CHECKOUT_DEDUP_MS) {
    return;
  }
  lastInitiateCheckoutKey = key;
  lastInitiateCheckoutAt = now;
  trackMetaStandard("InitiateCheckout", params);
}

export function trackMetaPurchase(params: MetaContentParams) {
  trackMetaStandard("Purchase", params);
}
