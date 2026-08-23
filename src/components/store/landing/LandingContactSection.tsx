import { CONTACT_EMAIL } from "@/lib/site";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

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
    <div id="contato" className="contato border-t border-iseul-line">
      <section className="py-[52px]">
        <div className="wrap">
          <div className="canais flex flex-wrap justify-center gap-[clamp(22px,6vw,64px)] text-center">
            {CHANNELS.map((channel) => (
              <div key={channel.label} className="canal reveal">
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
