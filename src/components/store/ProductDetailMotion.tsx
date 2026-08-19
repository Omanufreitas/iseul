"use client";

import { m, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

export function ProductDetailMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <m.div initial="hidden" animate="show" variants={stagger(0.12, 0.05)}>
      {children}
    </m.div>
  );
}

export function ProductDetailColumn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return <m.div variants={fadeUp}>{children}</m.div>;
}
