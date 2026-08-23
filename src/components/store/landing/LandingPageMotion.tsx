import { LandingRevealInit } from "@/components/store/landing/LandingRevealInit";

export function LandingPageMotion({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingRevealInit />
      {children}
    </>
  );
}

export function LandingAnnounceBar({ text }: { text: string }) {
  return (
    <div className="faixa relative z-[3] bg-iseul-pine px-4 py-[9px] text-center text-xs tracking-[0.06em] text-[#E9F0EC]">
      {text}
    </div>
  );
}
