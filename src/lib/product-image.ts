/** Especificações de imagem de produto (cards e PDP usam 1:1). */
export const PRODUCT_IMAGE_SPECS = {
  aspectRatio: "1:1",
  recommendedWidth: 1200,
  recommendedHeight: 1200,
  minWidth: 800,
  minHeight: 800,
  maxFileSizeMb: 2,
  formats: ["JPG", "PNG", "WebP"] as const,
};

export function productImageSpecLabel(): string {
  const { recommendedWidth, recommendedHeight, minWidth, maxFileSizeMb, formats } =
    PRODUCT_IMAGE_SPECS;
  return `Recomendado: ${recommendedWidth}×${recommendedHeight} px (quadrada ${PRODUCT_IMAGE_SPECS.aspectRatio}), mínimo ${minWidth}×${minWidth} px · ${formats.join(", ")} · até ${maxFileSizeMb} MB`;
}

export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export const PRODUCT_IMAGE_MAX_BYTES = PRODUCT_IMAGE_SPECS.maxFileSizeMb * 1024 * 1024;

const REMOTE_URL = /^https?:\/\//i;

/** Normaliza lista de URLs (capa + galeria), sem blobs nem duplicatas. */
export function normalizeProductImageUrls(
  imageUrls: unknown,
  legacyImageUrl?: string | null
): string[] {
  const raw = Array.isArray(imageUrls) ? imageUrls : [];
  const collected: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const url = item.trim();
    if (!url || url.startsWith("blob:") || !REMOTE_URL.test(url)) continue;
    if (!collected.includes(url)) collected.push(url);
  }

  const legacy = legacyImageUrl?.trim();
  if (legacy && REMOTE_URL.test(legacy) && !collected.includes(legacy)) {
    collected.unshift(legacy);
  }

  return collected;
}

export function primaryProductImageUrl(urls: string[]): string {
  return urls[0] ?? "";
}

export function productImagesFromRow(row: Record<string, unknown>): string[] {
  return normalizeProductImageUrls(row.image_urls, row.image_url as string | null);
}
