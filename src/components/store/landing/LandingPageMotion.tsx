"use client";

import { m, useReducedMotion } from "framer-motion";
import { fadeUpBlur } from "@/lib/motion";

export function LandingPageMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

export function LandingAnnounceBar({ text }: { text: string }) {
  const reduce = useReducedMotion();

  return (
    <m.div
      initial={reduce ? false : fadeUpBlur.hidden}
      animate={reduce ? undefined : fadeUpBlur.show}
      className="bg-iseul-accent px-4 py-2.5 text-center text-[12.5px] tracking-wide text-[#F2F6F3]"
    >
      {text}
    </m.div>
  );
}
