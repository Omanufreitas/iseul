"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  active?: boolean;
};

function formatValue(v: number, decimals: number, prefix: string, suffix: string) {
  const n = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
  return `${prefix}${n}${suffix}`;
}

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 2.5,
  delay = 0,
  className,
  active = true,
}: Props) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => formatValue(0, decimals, prefix, suffix));

  useEffect(() => {
    if (reduce) {
      setDisplay(formatValue(value, decimals, prefix, suffix));
      return;
    }

    if (!active) {
      setDisplay(formatValue(0, decimals, prefix, suffix));
      return;
    }

    setDisplay(formatValue(0, decimals, prefix, suffix));

    const controls = animate(0, value, {
      duration,
      delay,
      ease: "linear",
      onUpdate: (v) => setDisplay(formatValue(v, decimals, prefix, suffix)),
    });

    return () => controls.stop();
  }, [active, decimals, delay, duration, prefix, reduce, suffix, value]);

  return <span className={className}>{display}</span>;
}
