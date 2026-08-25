import type { Metadata } from "next";
import { LandingFooter, PolicyHeader } from "@/components/store/landing/LandingHeaderFooter";
import { SITE_URL } from "@/lib/site";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function PolicyPageShell({ title, children }: Props) {
  return (
    <>
      <PolicyHeader />
      <main>
        <div className="capa border-b border-iseul-line bg-iseul-areia py-[52px] pb-11">
          <div className="doc mx-auto max-w-[720px] px-6">
            <h1 className="m-0 font-serif text-[clamp(26px,4vw,34px)] font-normal">{title}</h1>
          </div>
        </div>
        <div className="doc mx-auto max-w-[720px] px-6 py-10">{children}</div>
      </main>
      <LandingFooter />
    </>
  );
}

export function policyMetadata(path: string, title: string, description: string): Metadata {
  return {
    title: `${title} | Iseul`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Iseul`,
      description,
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}

export function PolicyDoc({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3.5 text-iseul-muted [&_b]:font-medium [&_b]:text-iseul-ink [&_h2]:mb-0 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-iseul-ink [&_h3]:mb-2.5 [&_h3]:mt-[34px] [&_h3]:text-[16.5px] [&_h3]:font-medium [&_h3]:leading-snug [&_h3]:text-iseul-ink [&_li]:leading-[1.68] [&_p]:m-0 [&_p]:leading-[1.68] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}
