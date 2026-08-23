"use client";

import { useCallback, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import type { Product } from "@/types";

const ZOOM_SCALE = 2.25;

type Props = {
  product: Pick<Product, "name" | "image_url" | "image_urls" | "image_fallback_url">;
};

export function ProductDetailGallery({ product }: Props) {
  const images = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lensOn, setLensOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] ?? product.image_url;

  const updateOrigin = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
  }, []);

  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    if (product.image_fallback_url) {
      (e.target as HTMLImageElement).src = product.image_fallback_url;
    }
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-square min-h-[420px] items-center justify-center rounded-iseul border border-iseul-line bg-iseul-paper2 lg:min-h-[560px]">
        <p className="text-sm text-iseul-muted">Sem foto</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={[
          "group relative aspect-square min-h-[420px] overflow-hidden rounded-iseul border border-iseul-line bg-white lg:min-h-[560px]",
          lensOn ? "cursor-zoom-out" : "cursor-zoom-in",
        ].join(" ")}
        onMouseEnter={() => setLensOn(true)}
        onMouseLeave={() => {
          setLensOn(false);
          setOrigin({ x: 50, y: 50 });
        }}
        onMouseMove={(e) => {
          if (lensOn) updateOrigin(e.clientX, e.clientY);
        }}
        onClick={() => setLensOn((v) => !v)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={product.name}
          draggable={false}
          onError={handleImageError}
          className="h-full w-full select-none object-contain p-3 transition-transform duration-150 ease-out sm:p-5 md:p-6"
          style={{
            transform: lensOn ? `scale(${ZOOM_SCALE})` : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        />

        <div
          className={[
            "pointer-events-none absolute inset-0 transition-opacity duration-200",
            lensOn ? "opacity-0" : "opacity-100",
          ].join(" ")}
          aria-hidden
        />

        <div
          className={[
            "pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-iseul-ink shadow-sm ring-1 ring-iseul-line/70 backdrop-blur-sm transition-opacity duration-200",
            lensOn ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          <ZoomIn className="h-3.5 w-3.5 text-iseul-pine" strokeWidth={2} />
          <span className="hidden sm:inline">Passe o mouse para ampliar</span>
          <span className="sm:hidden">Toque para ampliar</span>
        </div>

        {lensOn && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-iseul-ink/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <ZoomOut className="h-3.5 w-3.5" strokeWidth={2} />
            {ZOOM_SCALE}x
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setLensOn(false);
                setOrigin({ x: 50, y: 50 });
              }}
              className={[
                "h-[72px] w-[72px] overflow-hidden rounded-lg border-2 bg-white transition-all sm:h-20 sm:w-20",
                index === activeIndex
                  ? "border-iseul-pine ring-2 ring-iseul-pine/15"
                  : "border-iseul-line hover:border-iseul-sage",
              ].join(" ")}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
