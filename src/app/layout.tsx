import type { Metadata } from "next";
import { Caveat, Inter, Instrument_Serif } from "next/font/google";
import { MetaPixelScript } from "@/components/analytics/MetaPixelScript";
import { AppProviders } from "@/components/providers/AppProviders";
import { ScrollManager } from "@/components/providers/ScrollManager";
import { IseulAssistantMount } from "@/components/store/IseulAssistantMount";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Iseul",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${instrument.variable} ${caveat.variable} font-sans antialiased`}
      >
        <AppProviders>
          <ScrollManager />
          <MetaPixelScript />
          <IseulAssistantMount />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
