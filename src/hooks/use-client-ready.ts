"use client";

import { useEffect, useState } from "react";

/** Evita animações com opacity:0 presas no SSR/hidratação do Next.js */
export function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
