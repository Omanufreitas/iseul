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
