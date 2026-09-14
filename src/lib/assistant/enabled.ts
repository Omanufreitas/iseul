import { isOpenAIConfigured } from "@/lib/openai/client";

/** Em produção o assistente fica desligado até NEXT_PUBLIC_ISEUL_ASSISTANT=1. */
export function isIseulAssistantEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ISEUL_ASSISTANT === "1") return isOpenAIConfigured();
  if (process.env.NEXT_PUBLIC_ISEUL_ASSISTANT === "0") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return isOpenAIConfigured();
}
