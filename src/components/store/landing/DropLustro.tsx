export function DropLustro({ className }: { className?: string }) {
  return (
    <span className={`drop-lustro relative mx-auto mb-[26px] block w-[52px] ${className ?? ""}`}>
      <svg viewBox="0 0 200 200" className="block w-full" aria-hidden>
        <path
          d="M94.92,36.70 Q100.00,28.00 105.08,36.70 L141.67,99.46 A48.24,48.24 0 1 1 58.33,99.46 Z"
          fill="var(--sage)"
        />
      </svg>
      <span
        aria-hidden
        className="pointer-events-none absolute left-[34%] top-[26%] h-[16%] w-[22%] rotate-[-18deg] rounded-full bg-white/75"
      />
    </span>
  );
}
