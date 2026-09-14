import { describe, expect, it } from "vitest";
import { consumeAssistantQuota, getAssistantDailyLimit, getClientIp } from "./quota";

describe("assistant quota", () => {
  it("bloqueia depois do limite diário", () => {
    const ip = `test-${Date.now()}`;
    const limit = getAssistantDailyLimit();
    let last = { allowed: true, remaining: limit };
    for (let i = 0; i < limit; i++) {
      last = consumeAssistantQuota(ip);
    }
    expect(last.allowed).toBe(true);
    expect(consumeAssistantQuota(ip).allowed).toBe(false);
  });

  it("lê o primeiro IP do x-forwarded-for", () => {
    const request = new Request("http://localhost/api/chat", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });
    expect(getClientIp(request)).toBe("1.1.1.1");
  });
});
