import { createHash } from "crypto";
import { getAppUrl } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/client";

type MetaCapiUserData = {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  ct?: string[];
  st?: string[];
  zp?: string[];
  country?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
};

export type MetaCapiCustomData = {
  value?: number;
  currency?: "BRL";
  content_ids?: string[];
  content_type?: "product";
  content_name?: string;
  num_items?: number;
  order_id?: string;
};

export type MetaCapiPurchaseOrder = {
  id: string;
  total: number;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: Record<string, unknown> | null;
  items?: Array<{ product_id?: string | null; quantity?: number | null }>;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashMetaEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

export function hashMetaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const normalized =
    digits.startsWith("55") && digits.length >= 12
      ? digits
      : digits.length >= 10 && digits.length <= 11
        ? `55${digits}`
        : digits;
  return sha256(normalized);
}

function hashMetaNamePart(name: string): string {
  return sha256(name.trim().toLowerCase());
}

function splitFullName(fullName: string): { first?: string; last?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function addressField(addr: Record<string, unknown> | null | undefined, key: string): string {
  const value = addr?.[key];
  return typeof value === "string" ? value : value != null ? String(value) : "";
}

export function getMetaCapiConfig(): {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
} | null {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!pixelId || !accessToken) return null;
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  return { pixelId, accessToken, testEventCode: testEventCode || undefined };
}

export function buildMetaUserData(input: {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  fbc?: string | null;
  fbp?: string | null;
}): MetaCapiUserData {
  const userData: MetaCapiUserData = {};

  if (input.email) {
    const hashed = hashMetaEmail(input.email);
    if (hashed) userData.em = [hashed];
  }

  if (input.phone) {
    const hashed = hashMetaPhone(input.phone);
    if (hashed) userData.ph = [hashed];
  }

  if (input.fullName) {
    const { first, last } = splitFullName(input.fullName);
    if (first) userData.fn = [hashMetaNamePart(first)];
    if (last) userData.ln = [hashMetaNamePart(last)];
  }

  if (input.city) {
    const city = input.city.trim().toLowerCase().replace(/\s+/g, "");
    if (city) userData.ct = [sha256(city)];
  }

  if (input.state) {
    const state = input.state.trim().toLowerCase().slice(0, 2);
    if (state) userData.st = [sha256(state)];
  }

  if (input.zip) {
    const zip = input.zip.replace(/\D/g, "");
    if (zip) userData.zp = [sha256(zip)];
  }

  userData.country = [sha256("br")];

  if (input.fbc?.trim()) userData.fbc = input.fbc.trim();
  if (input.fbp?.trim()) userData.fbp = input.fbp.trim();

  return userData;
}

export function buildMetaPurchaseEvent(order: MetaCapiPurchaseOrder) {
  const value = Number(order.total);
  if (!order.id || !Number.isFinite(value) || value <= 0) return null;

  const addr = order.shipping_address ?? undefined;
  const contentIds = (order.items ?? [])
    .map((item) => (item.product_id ? String(item.product_id) : ""))
    .filter(Boolean);
  const numItems = (order.items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  const appUrl = getAppUrl().replace(/\/$/, "");

  return {
    eventName: "Purchase",
    eventId: `purchase_${order.id}`,
    eventSourceUrl: `${appUrl}/obrigado?order=${encodeURIComponent(order.id)}`,
    userData: buildMetaUserData({
      email: order.customer_email,
      phone: order.customer_phone,
      fullName: order.customer_name,
      city: addressField(addr, "city"),
      state: addressField(addr, "state"),
      zip: addressField(addr, "zip"),
    }),
    customData: {
      value,
      currency: "BRL" as const,
      content_ids: contentIds.length ? contentIds : undefined,
      content_type: contentIds.length ? ("product" as const) : undefined,
      num_items: numItems || undefined,
      order_id: order.id,
    } satisfies MetaCapiCustomData,
  };
}

export async function sendMetaCapiEvents(
  events: Array<{
    eventName: string;
    eventId: string;
    eventTime?: number;
    eventSourceUrl?: string;
    userData?: MetaCapiUserData;
    customData?: MetaCapiCustomData;
  }>,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const config = getMetaCapiConfig();
  if (!config) return { ok: true, skipped: true };

  const url = new URL(`https://graph.facebook.com/v21.0/${config.pixelId}/events`);
  url.searchParams.set("access_token", config.accessToken);

  const body: Record<string, unknown> = {
    data: events.map((event) => ({
      event_name: event.eventName,
      event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: "website",
      ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
      ...(event.userData ? { user_data: event.userData } : {}),
      ...(event.customData ? { custom_data: event.customData } : {}),
    })),
  };

  if (config.testEventCode) {
    body.test_event_code = config.testEventCode;
  }

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { error?: { message?: string } };
    if (!response.ok) {
      return { ok: false, error: payload.error?.message ?? `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao enviar CAPI",
    };
  }
}

/** Purchase no servidor depois do Asaas marcar o pedido pago. Deduplica com o pixel pelo event_id. */
export async function sendMetaPurchaseFromPaidOrder(
  orderId: string,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!getMetaCapiConfig()) return { ok: true, skipped: true };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, total, customer_email, customer_name, customer_phone, shipping_address")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: true, skipped: true };

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  const event = buildMetaPurchaseEvent({
    ...order,
    shipping_address: (order.shipping_address as Record<string, unknown> | null) ?? null,
    items: items ?? [],
  });
  if (!event) return { ok: true, skipped: true };

  return sendMetaCapiEvents([event]);
}
