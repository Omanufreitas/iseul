import { describe, expect, it } from "vitest";
import { isMelhorEnvioProtocolCode, resolveCarrierTrackingCode } from "./tracking";

describe("resolveCarrierTrackingCode", () => {
  it("usa o tracking dos Correios quando disponível", () => {
    expect(
      resolveCarrierTrackingCode({
        tracking: "AB123456789BR",
        protocol: "ORD-202609144606880",
      })
    ).toBe("AB123456789BR");
  });

  it("nunca usa protocol ORD como rastreio", () => {
    expect(
      resolveCarrierTrackingCode({
        tracking: null,
        protocol: "ORD-202609144606880",
      })
    ).toBeNull();
  });

  it("ignora tracking que veio como ORD", () => {
    expect(
      resolveCarrierTrackingCode({
        tracking: "ORD-202609144606880",
        protocol: "ORD-202609144606880",
      })
    ).toBeNull();
  });
});

describe("isMelhorEnvioProtocolCode", () => {
  it("detecta protocolo ORD", () => {
    expect(isMelhorEnvioProtocolCode("ORD-202609144606880")).toBe(true);
    expect(isMelhorEnvioProtocolCode("AB123456789BR")).toBe(false);
  });
});
