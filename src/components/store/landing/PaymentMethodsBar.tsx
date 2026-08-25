function VisaIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-hidden>
      <text x="0" y="12" fill="#1A1F71" fontSize="11" fontWeight="700" fontFamily="Arial,sans-serif">
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-auto" aria-hidden>
      <circle cx="12" cy="10" r="8" fill="#EB001B" />
      <circle cx="20" cy="10" r="8" fill="#F79E1B" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-hidden>
      <rect width="48" height="16" rx="2" fill="#2E77BC" />
      <text x="4" y="11" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">
        AMEX
      </text>
    </svg>
  );
}

function EloIcon() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-auto" aria-hidden>
      <circle cx="10" cy="10" r="7" fill="#FFCB05" />
      <circle cx="16" cy="10" r="7" fill="#00A4E0" />
      <circle cx="22" cy="10" r="7" fill="#EF4123" />
    </svg>
  );
}

function HipercardIcon() {
  return (
    <svg viewBox="0 0 52 16" className="h-3.5 w-auto" aria-hidden>
      <rect width="52" height="16" rx="2" fill="#B3131B" />
      <text x="4" y="11" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">
        HIPERCARD
      </text>
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 52 16" className="h-3.5 w-auto" aria-hidden>
      <text x="0" y="12" fill="#F47216" fontSize="8" fontWeight="700" fontFamily="Arial,sans-serif">
        DISCOVER
      </text>
    </svg>
  );
}

function PixIcon() {
  return (
    <svg viewBox="0 0 40 16" className="h-4 w-auto" aria-hidden>
      <path d="M6 2 L14 8 L6 14 Z" fill="#32BCAD" />
      <path d="M18 2 L26 8 L18 14 Z" fill="#32BCAD" />
      <text x="28" y="12" fill="#32BCAD" fontSize="9" fontWeight="700" fontFamily="Arial,sans-serif">
        pix
      </text>
    </svg>
  );
}

const METHODS = [
  { id: "visa", label: "Visa", Icon: VisaIcon },
  { id: "mastercard", label: "Mastercard", Icon: MastercardIcon },
  { id: "amex", label: "American Express", Icon: AmexIcon },
  { id: "elo", label: "Elo", Icon: EloIcon },
  { id: "hipercard", label: "Hipercard", Icon: HipercardIcon },
  { id: "discover", label: "Discover", Icon: DiscoverIcon },
  { id: "pix", label: "Pix", Icon: PixIcon },
] as const;

/** Meios de pagamento aceitos (cartão + Pix via Asaas) */
export function PaymentMethodsBar({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#847D72]">
        Meios de pagamento
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {METHODS.map(({ id, label, Icon }) => (
          <span
            key={id}
            title={label}
            className="inline-flex h-9 min-w-[52px] items-center justify-center rounded-md border border-white/10 bg-white px-2.5"
          >
            <Icon />
          </span>
        ))}
      </div>
    </div>
  );
}
