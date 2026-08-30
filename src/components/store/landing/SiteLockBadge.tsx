const SITELOCK_VERIFY_URL = "https://www.sitelock.com/verify.php?site=iseul.com.br";
const SITELOCK_SHIELD_URL = "https://shield.sitelock.com/shield/iseul.com.br";

/** Small (98×56) — exibido menor que o Medium nativo da SiteLock. */
const SHIELD_WIDTH = 98;
const SHIELD_HEIGHT = 56;

export function SiteLockBadge() {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#847D72]">
        Segurança
      </p>
      <a
        href={SITELOCK_VERIFY_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Verificar o certificado SiteLock da Iseul"
        className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white p-1"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- escudo externo, status ao vivo */}
        <img
          src={SITELOCK_SHIELD_URL}
          alt="SiteLock — site verificado"
          width={SHIELD_WIDTH}
          height={SHIELD_HEIGHT}
          loading="lazy"
          className="block h-auto w-[98px]"
        />
      </a>
    </div>
  );
}
