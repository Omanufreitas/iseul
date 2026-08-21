import type { Metadata } from "next";
import { Caveat, Inter, Instrument_Serif } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { ScrollManager } from "@/components/providers/ScrollManager";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Iseul em breve",
  description:
    "Iseul. Skincare coreano escolhido produto a produto, com estoque no Brasil e envio em 24h úteis. A seleção abre em breve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${instrument.variable} ${caveat.variable} font-sans antialiased`}
      >
        <AppProviders>
          <ScrollManager />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
