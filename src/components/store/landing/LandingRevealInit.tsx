"use client";

import { useEffect } from "react";

/** Revelação no scroll — observa .reveal estáticos e os que entram depois (Suspense/hidratação). */
export function LandingRevealInit() {
  useEffect(() => {
    const observed = new WeakSet<Element>();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("vis"));
      return;
    }

    let delayIndex = 0;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vis");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    function bindReveal(el: Element) {
      if (observed.has(el) || el.classList.contains("vis")) return;
      observed.add(el);
      (el as HTMLElement).style.transitionDelay = `${(delayIndex++ % 4) * 70}ms`;
      io.observe(el);

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("vis");
        io.unobserve(el);
      }
    }

    function scan() {
      document.querySelectorAll(".reveal:not(.vis)").forEach(bindReveal);
    }

    scan();
    const t1 = window.setTimeout(scan, 80);
    const t2 = window.setTimeout(scan, 400);
    const t3 = window.setTimeout(scan, 1200);

    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return null;
}
