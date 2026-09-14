"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackMetaPageView } from "@/lib/analytics/meta";
import { getPixelId } from "@/lib/meta-pixel";

/** PageView nas navegações internas. O hard-load sai no snippet beforeInteractive. */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const pixelId = getPixelId();

  useEffect(() => {
    if (!pixelId) return;
    trackMetaPageView(pathname);
  }, [pathname, pixelId]);

  return null;
}
