import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fbq,
  getMetaPixelSnippet,
  resetMetaPixelForTests,
  trackStorefrontPageView,
} from "./meta-pixel";

type FbqCall = unknown[];

describe("meta pixel", () => {
  const calls: FbqCall[] = [];

  beforeEach(() => {
    resetMetaPixelForTests();
    calls.length = 0;
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1378280031081197";
    const stub = ((...args: unknown[]) => {
      calls.push(args);
    }) as typeof window.fbq;
    stub.queue = [];
    vi.stubGlobal("window", { fbq: stub, _fbq: stub } as Window);
  });

  afterEach(() => {
    resetMetaPixelForTests();
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
  });

  it("snippet oficial inicia o pixel e dispara PageView no hard-load", () => {
    const snippet = getMetaPixelSnippet("1378280031081197");
    expect(snippet).toContain("fbq('init','1378280031081197')");
    expect(snippet).toContain("fbq('track','PageView')");
    expect(snippet).toContain("__ISEUL_PIXEL_BOOT_PV=true");
    expect(snippet).toContain("n.queue=[]");
  });

  it("manda ViewContent na hora para o stub/queue do fbq", () => {
    fbq("track", "ViewContent", { content_ids: ["p1"], value: 89, currency: "BRL" });
    expect(calls[0]?.[0]).toBe("track");
    expect(calls[0]?.[1]).toBe("ViewContent");
    expect(calls[0]?.[2]).toMatchObject({ content_ids: ["p1"], currency: "BRL" });
  });

  it("dispara PageView em cada rota da loja e ignora admin", () => {
    trackStorefrontPageView("/");
    trackStorefrontPageView("/");
    trackStorefrontPageView("/produtos/relief-sun");
    trackStorefrontPageView("/checkout");
    trackStorefrontPageView("/admin/pedidos");

    const events = calls.map((call) => call[1]);
    expect(events).toEqual(["PageView", "PageView", "PageView"]);
  });

  it("não duplica o PageView do snippet no primeiro hydrate", () => {
    window.__ISEUL_PIXEL_BOOT_PV = true;
    trackStorefrontPageView("/produtos/relief-sun");
    expect(calls).toHaveLength(0);
    trackStorefrontPageView("/produtos/relief-sun");
    expect(calls).toHaveLength(0);
    trackStorefrontPageView("/checkout");
    expect(calls[0]?.[1]).toBe("PageView");
  });
});
