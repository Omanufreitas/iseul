"use server";

import { z } from "zod";
import { quoteShippingForCheckout } from "@/lib/shipping";

const quoteShippingSchema = z.object({
  destinationCep: z.string().min(8),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
});

export async function quoteShipping(raw: unknown) {
  const parsed = quoteShippingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const result = await quoteShippingForCheckout(parsed.data.destinationCep, parsed.data.items);
  if ("error" in result) return result;
  return { quote: result };
}
