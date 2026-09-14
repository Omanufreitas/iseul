import OpenAI from "openai";

export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === "") return false;
  if (key.includes("sk-...") || key === "sua-chave") return false;
  return true;
}

export function getOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY não configurada");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function getOpenAIChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}
