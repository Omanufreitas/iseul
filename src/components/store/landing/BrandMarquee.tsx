const BRANDS = [
  { src: "/brands/brendon1.svg", alt: "Beauty of Joseon" },
  { src: "/brands/brendon2.svg", alt: "Celimax" },
  { src: "/brands/brendon3.svg", alt: "COSRX" },
  { src: "/brands/brendon4.svg", alt: "House of Hur" },
  { src: "/brands/brendon5.svg", alt: "K-Secret" },
  { src: "/brands/brendon6.svg", alt: "Medicube" },
  { src: "/brands/brendon7.svg", alt: "Numbuzin" },
  { src: "/brands/brendon8.svg", alt: "SKIN1004" },
] as const;

function BrandLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={160}
      height={48}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="brand-marquee-logo h-9 w-auto max-w-[148px] shrink-0 object-contain object-center opacity-[0.72] transition-opacity duration-300 hover:opacity-100 sm:h-10 sm:max-w-[168px]"
    />
  );
}

export function BrandMarquee() {
  const loop = [...BRANDS, ...BRANDS];

  return (
    <div
      className="brand-marquee relative z-[3] overflow-hidden border-b border-iseul-line bg-[color-mix(in_srgb,var(--paper)_88%,var(--areia))] py-3.5"
      aria-label="Marcas disponíveis na loja"
    >
      <div className="brand-marquee-fade pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-[color-mix(in_srgb,var(--paper)_88%,var(--areia))] to-transparent sm:w-16" />
      <div className="brand-marquee-fade pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[color-mix(in_srgb,var(--paper)_88%,var(--areia))] to-transparent sm:w-16" />

      <div className="brand-marquee-track flex w-max items-center gap-10 px-6 sm:gap-14 sm:px-10">
        {loop.map((brand, i) => (
          <BrandLogo key={`${brand.src}-${i}`} src={brand.src} alt={brand.alt} />
        ))}
      </div>
    </div>
  );
}
