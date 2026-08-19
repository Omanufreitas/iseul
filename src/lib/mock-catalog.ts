import "server-only";

import type { Product } from "@/types";
import { DEFAULT_STORE_SETTINGS } from "@/lib/constants";
import { loadMockProducts } from "@/lib/mock-catalog-store";

export function getMockProducts(): Product[] {
  return loadMockProducts();
}

export function getMockProductBySlug(slug: string): Product | null {
  return getMockProducts().find((p) => p.slug === slug) ?? null;
}

export function getMockProductById(id: string): Product | null {
  return getMockProducts().find((p) => p.id === id) ?? null;
}

export function getMockSettings() {
  return { id: 1, ...DEFAULT_STORE_SETTINGS };
}
