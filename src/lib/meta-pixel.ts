type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq: FbqFn;
    _fbq?: FbqFn;
    __ISEUL_PIXEL_BOOT_PV?: boolean;
  }
}

export function getPixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
}

export function getMetaPixelSnippet(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');window.__ISEUL_PIXEL_BOOT_PV=true;`;
}

export type FbqTrackOptions = {
  eventID?: string;
};

let lastPageViewPath: string | null = null;
let consumedBootPageView = false;

export function isStorefrontPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !pathname.startsWith("/admin");
}

/** Stub oficial do Meta: enfileira em fbq.queue até o fbevents.js processar. */
export function ensureMetaPixelStub(): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") return;
  const pixelId = getPixelId();
  if (!pixelId) return;

  const n: FbqFn = function (...args: unknown[]) {
    if (n.callMethod) {
      n.callMethod(...args);
      return;
    }
    n.queue?.push(args);
  };
  n.queue = [];
  n.loaded = true;
  n.version = "2.0";
  n.push = n;
  window.fbq = n;
  window._fbq = n;

  if (!document.getElementById("facebook-jssdk")) {
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  n("init", pixelId);
}

export function fbq(
  action: string,
  event: string,
  params?: Record<string, unknown>,
  options?: FbqTrackOptions
): void {
  if (typeof window === "undefined") return;
  if (!getPixelId()) return;
  ensureMetaPixelStub();
  if (typeof window.fbq !== "function") return;

  const args: unknown[] = [action, event];
  if (params) args.push(params);
  if (options?.eventID) args.push({ eventID: options.eventID });
  window.fbq(...args);
}

/** SPA: PageView em troca de rota. Hard-load já sai no snippet (beforeInteractive). */
export function trackStorefrontPageView(pathname: string | null | undefined): void {
  if (!isStorefrontPath(pathname) || !pathname) return;
  if (typeof window !== "undefined" && window.__ISEUL_PIXEL_BOOT_PV && !consumedBootPageView) {
    consumedBootPageView = true;
    window.__ISEUL_PIXEL_BOOT_PV = false;
    lastPageViewPath = pathname;
    return;
  }
  if (lastPageViewPath === pathname) return;
  lastPageViewPath = pathname;
  fbq("track", "PageView");
}

export function resetMetaPixelForTests(): void {
  lastPageViewPath = null;
  consumedBootPageView = false;
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
