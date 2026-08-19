/** Curvas e variantes de motion — estilo orvalho: suave, sem bounce agressivo */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.45, 0, 0.15, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export const slideFromRight = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: { duration: 0.38, ease: EASE_IN_OUT },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.28, ease: EASE_IN_OUT },
  },
};

export const backdropFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function stagger(staggerChildren = 0.07, delayChildren = 0) {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(28,26,22,0)" },
  hover: {
    y: -4,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export const imageZoom = {
  rest: { scale: 1 },
  hover: {
    scale: 1.045,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};
