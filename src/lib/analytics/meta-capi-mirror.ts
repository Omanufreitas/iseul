type MirrorEventName = "ViewContent" | "InitiateCheckout" | "Purchase";

type MirrorParams = {
  contentIds?: string[];
  contentName?: string;
  value?: number;
  numItems?: number;
  orderId?: string;
};

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const parts = document.cookie.split(";").map((part) => part.trim());
  const hit = parts.find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

/** Espelha o evento do browser via CAPI. Deduplica pelo mesmo event_id. */
export function mirrorMetaEventToCapi(
  eventName: MirrorEventName,
  eventId: string,
  params: MirrorParams,
): void {
  if (typeof window === "undefined" || !window.location) return;
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;
  if (typeof fetch !== "function") return;

  void fetch("/api/meta/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: `${window.location.origin}${window.location.pathname}${window.location.search}`,
      fbc: readCookie("_fbc"),
      fbp: readCookie("_fbp"),
      customData: {
        contentIds: params.contentIds,
        contentName: params.contentName,
        value: params.value,
        numItems: params.numItems,
        orderId: params.orderId,
      },
    }),
    keepalive: true,
  }).catch(() => {
    /* pixel browser continua valendo */
  });
}
