declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: typeof window.fbq;
  }
}

export function getPixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
}

export type FbqTrackOptions = {
  eventID?: string;
};

type PendingFbq = {
  action: string;
  event: string;
  params?: Record<string, unknown>;
  options?: FbqTrackOptions;
};

const pending: PendingFbq[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let lastPageViewPath: string | null = null;

export function isStorefrontPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !pathname.startsWith("/admin");
}

function pixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function invoke(call: PendingFbq): void {
  if (!pixelReady()) return;
  if (call.params && call.options?.eventID) {
    window.fbq(call.action, call.event, call.params, { eventID: call.options.eventID });
    return;
  }
  if (call.params) {
    window.fbq(call.action, call.event, call.params);
    return;
  }
  window.fbq(call.action, call.event);
}

export function flushMetaPixelQueue(): void {
  if (!pixelReady()) return;
  while (pending.length) {
    invoke(pending.shift()!);
  }
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

function scheduleFlush(): void {
  if (flushTimer != null) return;
  const started = Date.now();
  const tick = () => {
    if (pixelReady()) {
      flushTimer = null;
      flushMetaPixelQueue();
      return;
    }
    if (Date.now() - started > 15000) {
      flushTimer = null;
      return;
    }
    flushTimer = setTimeout(tick, 50);
  };
  flushTimer = setTimeout(tick, 0);
}

export function fbq(
  action: string,
  event: string,
  params?: Record<string, unknown>,
  options?: FbqTrackOptions
): void {
  if (typeof window === "undefined") return;
  if (!getPixelId()) return;
  const call: PendingFbq = { action, event, params, options };
  if (pixelReady()) {
    invoke(call);
    return;
  }
  pending.push(call);
  scheduleFlush();
}

/** PageView em toda rota da loja. Sobrevive a remount do layout e espera o fbq. */
export function trackStorefrontPageView(pathname: string | null | undefined): void {
  if (!isStorefrontPath(pathname) || !pathname) return;
  if (lastPageViewPath === pathname) return;
  lastPageViewPath = pathname;
  fbq("track", "PageView");
}

export function resetMetaPixelForTests(): void {
  pending.length = 0;
  lastPageViewPath = null;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

export interface PixelPurchaseData {
  orderId?: string;
  value: number;
  num_items: number;
  content_ids: string[];
}

const PURCHASE_STORAGE_KEY = "iseul_pixel_purchase";
const PURCHASE_SENT_PREFIX = "iseul_pixel_purchase_sent_";

export function storePurchaseData(data: PixelPurchaseData): void {
  try {
    sessionStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* sessionStorage indisponível */
  }
}

export function popPurchaseData(): PixelPurchaseData | null {
  try {
    const raw = sessionStorage.getItem(PURCHASE_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PURCHASE_STORAGE_KEY);
    return JSON.parse(raw) as PixelPurchaseData;
  } catch {
    return null;
  }
}

export function wasPurchaseTracked(orderId: string): boolean {
  try {
    return sessionStorage.getItem(`${PURCHASE_SENT_PREFIX}${orderId}`) === "1";
  } catch {
    return false;
  }
}

export function markPurchaseTracked(orderId: string): void {
  try {
    sessionStorage.setItem(`${PURCHASE_SENT_PREFIX}${orderId}`, "1");
  } catch {
    /* sessionStorage indisponível */
  }
}

export function getMetaPurchaseEventId(orderId: string): string {
  return `purchase_${orderId}`;
}
