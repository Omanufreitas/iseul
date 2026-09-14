import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fbq,
  flushMetaPixelQueue,
  resetMetaPixelForTests,
  trackStorefrontPageView,
} from "./meta-pixel";

type FbqCall = unknown[];

describe("meta pixel queue", () => {
  const calls: FbqCall[] = [];

  beforeEach(() => {
    resetMetaPixelForTests();
    calls.length = 0;
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1378280031081197";
    vi.stubGlobal("window", {} as Window);
  });

  afterEach(() => {
    resetMetaPixelForTests();
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
  });

  it("guarda evento até o fbq existir e depois envia", () => {
    fbq("track", "ViewContent", { content_ids: ["p1"], value: 89, currency: "BRL" });
    expect(calls).toHaveLength(0);

    window.fbq = ((...args: unknown[]) => {
      calls.push(args);
    }) as typeof window.fbq;

    flushMetaPixelQueue();
    expect(calls[0]?.[0]).toBe("track");
    expect(calls[0]?.[1]).toBe("ViewContent");
  });

  it("dispara PageView em cada rota da loja e ignora admin", () => {
    window.fbq = ((...args: unknown[]) => {
      calls.push(args);
    }) as typeof window.fbq;

    trackStorefrontPageView("/");
    trackStorefrontPageView("/");
    trackStorefrontPageView("/produtos/relief-sun");
    trackStorefrontPageView("/checkout");
    trackStorefrontPageView("/admin/pedidos");

    const events = calls.map((call) => call[1]);
    expect(events).toEqual(["PageView", "PageView", "PageView"]);
  });
});
