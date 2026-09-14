"use client";

import { useEffect } from "react";
import { trackMetaPurchase } from "@/lib/analytics/meta";
import {
  getMetaPurchaseEventId,
  markPurchaseTracked,
  popPurchaseData,
  wasPurchaseTracked,
} from "@/lib/meta-pixel";
import type { OrderPixelPayload } from "@/lib/orders/pixel";

type Props = {
  orderId?: string;
  fallback?: OrderPixelPayload | null;
};

export function ObrigadoPixel({ orderId, fallback }: Props) {
  useEffect(() => {
    const stored = popPurchaseData();
    const id = stored?.orderId || fallback?.orderId || orderId;
    if (!id) return;
    if (wasPurchaseTracked(id)) return;

    const value = stored?.value ?? fallback?.value;
    if (value == null || value <= 0) return;

    markPurchaseTracked(id);
    trackMetaPurchase({
      contentIds: stored?.content_ids ?? fallback?.contentIds,
      value,
      numItems: stored?.num_items ?? fallback?.numItems,
      orderId: id,
      eventId: getMetaPurchaseEventId(id),
    });
  }, [fallback, orderId]);

  return null;
}
