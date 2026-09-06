import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["/", "/trocas", "/privacidade", "/entrega"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/produtos/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
