import { describe, expect, it } from "vitest";
import { isIseulAssistantEnabled } from "./enabled";

describe("isIseulAssistantEnabled", () => {
  it("fica desligado em produção sem a flag", () => {
    const prevVercel = process.env.VERCEL_ENV;
    const prevFlag = process.env.NEXT_PUBLIC_ISEUL_ASSISTANT;
    const prevKey = process.env.OPENAI_API_KEY;
    try {
      process.env.VERCEL_ENV = "production";
      process.env.NEXT_PUBLIC_ISEUL_ASSISTANT = "";
      process.env.OPENAI_API_KEY = "sk-test-not-placeholder";
      expect(isIseulAssistantEnabled()).toBe(false);
      process.env.NEXT_PUBLIC_ISEUL_ASSISTANT = "1";
      expect(isIseulAssistantEnabled()).toBe(true);
    } finally {
      process.env.VERCEL_ENV = prevVercel;
      process.env.NEXT_PUBLIC_ISEUL_ASSISTANT = prevFlag;
      process.env.OPENAI_API_KEY = prevKey;
    }
  });
});
