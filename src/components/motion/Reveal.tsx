"use client";

import { m, useReducedMotion } from "framer-motion";
import { fadeUpBlur, popIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = m[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={cn(className)}
      initial={false}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: fadeUpBlur.hidden,
        show: {
          ...fadeUpBlur.show,
          transition: { ...fadeUpBlur.show.transition, delay },
        },
      }}
    >
      {children}
    </Tag>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
};

export function Stagger({ children, className, stagger = 0.07 }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <m.div
      className={className}
      initial={false}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <m.div
      className={className}
      variants={popIn}
      whileHover={reduce ? undefined : { y: -5, scale: 1.015 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </m.div>
  );
}
