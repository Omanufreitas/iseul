"use client";

import { m, useReducedMotion } from "framer-motion";
import { stagger, wordReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  wordClassName?: string;
  highlightLast?: boolean;
  highlightClassName?: string;
};

export function SplitWords({
  text,
  className,
  wordClassName,
  highlightLast = false,
  highlightClassName,
}: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <m.span
      className={cn("inline", className)}
      variants={stagger(0.06)}
      style={{ perspective: 600 }}
    >
      {words.map((word, i) => {
        const isLast = highlightLast && i === words.length - 1;
        return (
          <span key={`${word}-${i}`} className="mr-[0.28em] inline-block overflow-hidden pb-[0.08em]">
            <m.span
              variants={wordReveal}
              className={cn("inline-block", wordClassName, isLast && highlightClassName)}
            >
              {word}
            </m.span>
          </span>
        );
      })}
    </m.span>
  );
}
