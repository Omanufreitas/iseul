import { getTotalExpressCredentials } from "./config";

const QUOTE_URL = "https://edi.totalexpress.com.br/webservice_calculo_frete.php";

export type TotalExpressQuote = {
  price: number;
  deliveryDays: number;
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tagValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)`));
  return match?.[1]?.trim() || null;
}

export function parseTotalExpressQuote(xml: string): TotalExpressQuote | null {
  const code = tagValue(xml, "CodigoProc");
  if (code !== "1") return null;
  const rawPrice = tagValue(xml, "ValorServico");
  const rawDays = tagValue(xml, "Prazo");
  if (!rawPrice || !rawDays) return null;
  const price = Number(rawPrice.replace(/\./g, "").replace(",", "."));
  const deliveryDays = Number.parseInt(rawDays, 10);
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(deliveryDays)) return null;
  return { price: Math.round(price * 100) / 100, deliveryDays };
}

function quoteEnvelope(input: {
  service: string;
  destinationCep: string;
  weightKg: number;
  declaredValue: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
}): string {
  const weight = Math.max(0.01, input.weightKg).toFixed(2);
  const declared = Math.max(0, input.declaredValue).toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:calcularFrete" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Body>
    <urn:calcularFrete soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <calcularFreteRequest xsi:type="urn:calcularFreteRequest">
        <TipoServico xsi:type="xsd:string">${xmlEscape(input.service)}</TipoServico>
        <CepDestino xsi:type="xsd:nonNegativeInteger">${xmlEscape(input.destinationCep)}</CepDestino>
        <Peso xsi:type="xsd:decimal">${weight}</Peso>
        <ValorDeclarado xsi:type="xsd:decimal">${declared}</ValorDeclarado>
        <TipoEntrega xsi:type="xsd:nonNegativeInteger">0</TipoEntrega>
        <ServicoCOD xsi:type="xsd:boolean">false</ServicoCOD>
        <Altura xsi:type="xsd:nonNegativeInteger">${Math.max(1, Math.round(input.heightCm))}</Altura>
        <Largura xsi:type="xsd:nonNegativeInteger">${Math.max(1, Math.round(input.widthCm))}</Largura>
        <Profundidade xsi:type="xsd:nonNegativeInteger">${Math.max(1, Math.round(input.lengthCm))}</Profundidade>
      </calcularFreteRequest>
    </urn:calcularFrete>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export async function quoteTotalExpress(input: {
  destinationCep: string;
  weightKg: number;
  declaredValue: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
}): Promise<TotalExpressQuote | null> {
  const credentials = getTotalExpressCredentials();
  const cep = input.destinationCep.replace(/\D/g, "");
  if (!credentials || cep.length !== 8) return null;

  const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString("base64");
  try {
    const res = await fetch(QUOTE_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "urn:simulaFrete#calcularFrete",
      },
      body: quoteEnvelope({ ...input, service: credentials.service, destinationCep: cep }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[total-express] cotação falhou", res.status);
      return null;
    }
    return parseTotalExpressQuote(await res.text());
  } catch (error) {
    console.error("[total-express] cotação indisponível", error instanceof Error ? error.message : "erro");
    return null;
  }
}
