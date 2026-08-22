import { CONTACT_EMAIL } from "@/lib/site";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";
import { Reveal } from "@/components/store/landing/ScrollReveal";

const CHANNELS = [
  {
    label: "E-mail",
    href: `mailto:${CONTACT_EMAIL}`,
    value: CONTACT_EMAIL,
    external: false,
  },
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    value: INSTAGRAM_HANDLE,
    external: true,
  },
] as const;

export function LandingContactSection() {
  return (
    <section id="contato" className="contato landing-section border-t border-iseul-line">
      <div className="wrap">
        <Reveal className="cab">
          <p className="eyebrow">contato</p>
          <h2>
            Fala com a gente <em>antes de comprar.</em>
          </h2>
          <p className="mt-3 text-iseul-muted">
            Dúvida de rotina, de ativo ou de prazo. Respondemos em horário comercial.
          </p>
        </Reveal>

        <div className="canais flex flex-wrap justify-center gap-[clamp(22px,6vw,64px)] text-center">
          {CHANNELS.map((channel) => (
            <Reveal key={channel.label} className="canal">
              <span className="rot block text-[10px] font-medium uppercase tracking-[0.2em] text-iseul-sage">
                {channel.label}
              </span>
              <a
                href={channel.href}
                className="mt-[7px] block border-b border-iseul-line pb-0.5 text-[15px] no-underline text-iseul-ink hover:border-iseul-sage"
                {...(channel.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {channel.value}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
