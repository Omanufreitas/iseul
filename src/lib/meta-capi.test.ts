import { afterEach, describe, expect, it } from "vitest";
import {
  buildMetaPurchaseEvent,
  getMetaCapiConfig,
  hashMetaEmail,
  hashMetaPhone,
} from "./meta-capi";
import { getMetaPurchaseEventId } from "./meta-pixel";

describe("meta-capi hashing", () => {
  it("normaliza e-mail", () => {
    const a = hashMetaEmail("Test@Iseul.com.br");
    const b = hashMetaEmail("test@iseul.com.br");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("normaliza telefone BR", () => {
    const a = hashMetaPhone("(67) 99922-2204");
    const b = hashMetaPhone("5567999222204");
    expect(a).toBe(b);
  });
});

describe("getMetaCapiConfig", () => {
  const prevPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const prevToken = process.env.META_CAPI_ACCESS_TOKEN;
  const prevTest = process.env.META_TEST_EVENT_CODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = prevPixel;
    process.env.META_CAPI_ACCESS_TOKEN = prevToken;
    process.env.META_TEST_EVENT_CODE = prevTest;
  });

  it("retorna null sem token", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1378280031081197";
    delete process.env.META_CAPI_ACCESS_TOKEN;
    expect(getMetaCapiConfig()).toBeNull();
  });

  it("lê pixel, token e código de teste", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1378280031081197";
    process.env.META_CAPI_ACCESS_TOKEN = "EAA-test";
    process.env.META_TEST_EVENT_CODE = "TEST123";
    expect(getMetaCapiConfig()).toEqual({
      pixelId: "1378280031081197",
      accessToken: "EAA-test",
      testEventCode: "TEST123",
    });
  });
});

describe("buildMetaPurchaseEvent", () => {
  it("usa o mesmo event_id do pixel e o total do pedido", () => {
    const event = buildMetaPurchaseEvent({
      id: "ord-1",
      total: 197.64,
      customer_email: "a@b.com",
      customer_name: "Ana Silva",
      customer_phone: "67999999999",
      shipping_address: { city: "Campo Grande", state: "MS", zip: "79072-266" },
      items: [
        { product_id: "prod-1", quantity: 2 },
        { product_id: "prod-2", quantity: 1 },
      ],
    });

    expect(event?.eventId).toBe(getMetaPurchaseEventId("ord-1"));
    expect(event?.customData).toMatchObject({
      value: 197.64,
      currency: "BRL",
      content_ids: ["prod-1", "prod-2"],
      num_items: 3,
      order_id: "ord-1",
    });
    expect(event?.eventSourceUrl).toContain("/obrigado?order=ord-1");
  });

  it("ignora pedido sem valor", () => {
    expect(buildMetaPurchaseEvent({ id: "ord-0", total: 0 })).toBeNull();
  });
});
