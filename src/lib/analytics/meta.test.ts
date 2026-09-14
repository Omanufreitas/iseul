import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetMetaInitiateCheckoutForTests,
  trackMetaInitiateCheckout,
} from "./meta";

type FbqCall = unknown[];

describe("InitiateCheckout", () => {
  const calls: FbqCall[] = [];

  beforeEach(() => {
    resetMetaInitiateCheckoutForTests();
    calls.length = 0;
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1378280031081197";
    const stub = ((...args: unknown[]) => {
      calls.push(args);
    }) as typeof window.fbq;
    stub.queue = [];
    vi.stubGlobal("window", { fbq: stub, _fbq: stub } as Window);
  });

  afterEach(() => {
    resetMetaInitiateCheckoutForTests();
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
  });

  it("não dispara duas vezes o mesmo carrinho em sequência", () => {
    const payload = { contentIds: ["p1"], value: 89, numItems: 1 };
    trackMetaInitiateCheckout(payload);
    trackMetaInitiateCheckout(payload);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toBe("InitiateCheckout");
  });
});
