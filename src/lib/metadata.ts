import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import type { Product } from "@/types";

export function productMetadata(product: Product): Metadata {
  const path = `/produtos/${product.slug}`;
  const title = `${product.name} | Iseul`;
  const description =
    product.pitch?.trim() ||
    product.full_name?.trim().slice(0, 160) ||
    `${product.name} — ${product.brand}. Skincare coreano original na Iseul.`;

  const image = product.image_url || product.image_urls[0] || undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: "website",
      locale: "pt_BR",
      siteName: "Iseul",
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function buildProductJsonLd(product: Product) {
  const inStock = product.stock > 0;
  const images = product.image_urls.length > 0 ? product.image_urls : product.image_url ? [product.image_url] : [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.full_name || product.pitch || product.name,
    image: images,
    brand: {
      "@type": "Brand",
      name: product.brand || "Iseul",
    },
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produtos/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
