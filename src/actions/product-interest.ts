"use server";

import { z } from "zod";
import { subscribeProductInterest } from "@/lib/waitlist";

const schema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().trim().email("Informe um e-mail válido"),
  phone: z.string().trim().min(10, "Informe um WhatsApp válido"),
});

export async function joinProductInterest(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await subscribeProductInterest(parsed.data);
    return { success: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível salvar agora." };
  }
}
