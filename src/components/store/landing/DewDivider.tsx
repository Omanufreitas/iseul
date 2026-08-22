export function DewDivider() {
  return (
    <div className="wrap">
      <span className="fio block h-[22px] w-full text-iseul-line" aria-hidden>
        <svg viewBox="0 0 1000 22" preserveAspectRatio="none" className="block h-full w-full">
          <line x1="0" y1="11" x2="470" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="530" y1="11" x2="1000" y2="11" stroke="currentColor" strokeWidth="1" />
          <path
            d="M500 3 C505 9 509 12 509 15 a9 9 0 0 1-18 0 c0-3 4-6 9-12 Z"
            fill="var(--sage)"
            opacity="0.55"
          />
        </svg>
      </span>
    </div>
  );
}
