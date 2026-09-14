import type { Metadata } from "next";
import Script from "next/script";
import { Caveat, Inter, Instrument_Serif } from "next/font/google";
import { MetaPixelRouteTracker } from "@/components/analytics/MetaPixelScript";
import { AppProviders } from "@/components/providers/AppProviders";
import { ScrollManager } from "@/components/providers/ScrollManager";
import { IseulAssistantMount } from "@/components/store/IseulAssistantMount";
import { getMetaPixelSnippet, getPixelId } from "@/lib/meta-pixel";
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
  const pixelId = getPixelId();

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${instrument.variable} ${caveat.variable} font-sans antialiased`}
      >
        {pixelId ? (
          <>
            <Script id="meta-pixel" strategy="beforeInteractive">
              {getMetaPixelSnippet(pixelId)}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        <AppProviders>
          <ScrollManager />
          <MetaPixelRouteTracker />
          <IseulAssistantMount />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
