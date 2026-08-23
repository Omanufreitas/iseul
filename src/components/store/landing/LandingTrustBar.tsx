export function LandingTrustBar() {
  const items = [
    { value: "4,98 ★", label: "na Shopee" },
    { value: "24h", label: "para enviar" },
    { value: "Brasil", label: "estoque local" },
  ] as const;

  return (
    <div className="tira border-y border-iseul-line bg-iseul-areia">
      <div className="wrap">
        <ul className="m-0 flex list-none flex-wrap justify-center gap-[clamp(24px,7vw,72px)] py-5 text-center">
          {items.map((item) => (
            <li key={item.label}>
              <span className="v block font-serif text-2xl leading-[1.15] tabular-nums">
                {item.value}
              </span>
              <span className="l mt-[3px] block text-[11px] uppercase tracking-[0.1em] text-iseul-muted">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
