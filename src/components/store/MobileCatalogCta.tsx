"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MobileCatalogCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const catalog = document.getElementById("catalogo");
    if (!catalog) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(catalog);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden",
        "transition-transform duration-300 ease-out",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div
        className="pointer-events-auto border-t border-iseul-line/80 bg-iseul-paper/95 px-4 pt-3 backdrop-blur-md"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          href="#catalogo"
          className="flex w-full items-center justify-center rounded-full bg-iseul-ink py-3.5 text-sm font-medium text-iseul-paper shadow-[0_4px_20px_rgba(28,26,22,.18)] transition-colors active:bg-iseul-accent"
        >
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
