import { describe, expect, it } from "vitest";
import { melhorEnvioServiceRequiresAgency } from "./agency";
import { buildCartPayload } from "./build-cart";

describe("melhorEnvioServiceRequiresAgency", () => {
  it("exige agência para Total Express", () => {
    expect(melhorEnvioServiceRequiresAgency(35, "Total Express Standard")).toBe(true);
    expect(melhorEnvioServiceRequiresAgency(1, "Correios PAC")).toBe(false);
  });
});

describe("buildCartPayload agency", () => {
  const base = {
    serviceId: 35,
    shipper: {
      name: "Iseul",
      document: "63829102000134",
      phone: "",
      email: "contato@iseul.com.br",
      street: "Rua Cacimba",
      number: "868",
      complement: "",
      neighborhood: "Jardim Canguru",
      city: "Campo Grande",
      state: "MS",
      zip: "79072266",
    },
    recipient: {
      name: "Cliente",
      phone: "67999999999",
      email: "cliente@test.com",
      document: "01973158523",
      street: "Rua Teste",
      number: "1",
      complement: "",
      neighborhood: "Centro",
      city: "Serra",
      state: "ES",
      zip: "29164632",
    },
    items: [{ product_name: "Produto", quantity: 1, unit_price: 100, variant_id: null }],
    variantDims: new Map(),
    insuranceValue: 100,
  };

  it("inclui agency e agency_id quando informado", () => {
    const payload = buildCartPayload({ ...base, agencyId: 6139 });
    expect(payload.agency).toBe(6139);
    expect(payload.options.agency_id).toBe(6139);
  });

  it("omite agency para Correios", () => {
    const payload = buildCartPayload({ ...base, serviceId: 1, agencyId: null });
    expect(payload.agency).toBeUndefined();
    expect(payload.options.agency_id).toBeUndefined();
  });
});
