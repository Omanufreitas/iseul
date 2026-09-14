import { describe, expect, it } from "vitest";
import { prepareChatHistory } from "./payload";

describe("prepareChatHistory", () => {
  it("não manda a mensagem atual de novo e corta texto longo", () => {
    const history = prepareChatHistory(
      [
        { role: "assistant", content: "Oi" },
        { role: "user", content: "a".repeat(2000) },
        { role: "user", content: "ok agora" },
      ],
      "ok agora"
    );
    expect(history).toHaveLength(2);
    expect(history[1]?.content.length).toBeLessThan(2000);
    expect(history.some((item) => item.content === "ok agora")).toBe(false);
  });
});
