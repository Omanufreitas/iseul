"use server";

import { subscribeWaitlist } from "@/lib/waitlist";
import { waitlistEmailSchema } from "@/lib/validations";

export type WaitlistActionState = {
  ok: boolean;
  message: string;
};

export async function joinWaitlist(
  _prev: WaitlistActionState | null,
  formData: FormData
): Promise<WaitlistActionState> {
  const parsed = waitlistEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe um e-mail válido." };
  }

  try {
    await subscribeWaitlist(parsed.data.email);
    return {
      ok: true,
      message: "Pronto. Avisamos você nas próximas novidades.",
    };
  } catch {
    return { ok: false, message: "Não foi possível salvar agora. Tente de novo." };
  }
}
