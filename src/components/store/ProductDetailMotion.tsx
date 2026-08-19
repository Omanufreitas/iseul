"use client";

import { m, useReducedMotion } from "framer-motion";
import { useClientReady } from "@/hooks/use-client-ready";
import { fadeUp, stagger } from "@/lib/motion";

export function ProductDetailMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  if (reduce) return <>{children}</>;

  return (
    <m.div
      initial={false}
      animate={ready ? "show" : false}
      variants={stagger(0.12, 0.05)}
    >
      {children}
    </m.div>
  );
}

export function ProductDetailColumn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return <m.div variants={fadeUp}>{children}</m.div>;
}
