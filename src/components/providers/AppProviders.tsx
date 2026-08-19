"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/cart-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <CartProvider>
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </CartProvider>
    </LazyMotion>
  );
}
