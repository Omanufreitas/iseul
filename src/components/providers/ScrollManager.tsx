"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Garante que a página abre no topo (sem restaurar scroll anterior) */
export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
      return;
    }

    const scrollTop = () => window.scrollTo(0, 0);
    scrollTop();
    requestAnimationFrame(scrollTop);
  }, [pathname]);

  return null;
}
