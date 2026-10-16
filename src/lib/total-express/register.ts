import { getTotalExpressCredentials } from "./config";

const REGISTER_URL =
  "https://apis.totalexpress.com.br/ics-edi-lv/v1/coleta/smartlabel/registrar";

export class TotalExpressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TotalExpressError";
  }
}

export type SmartLabelVolume = {
  awb: string;
  rota: string;
  barcode: string;
};

export type SmartLabelPayload = {
  remetenteId: number;
  cnpj: string;
  remessaCodigo: string;
  encomendas: Array<{
    servicoTipo: 1;
    entregaTipo: 0;
    peso: number;
    volumes: 1;
    condFrete: "CIF";
    pedido: string;
    natureza: string;
    volumesTipo: "CX";
    icmsIsencao: 0;
    destinatario: {
      nome: string;
      cpfCnpj: string;
      endereco: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
        pais: "Brasil";
        cep: string;
      };
      email?: string;
      telefone1?: number;
    };
    docFiscal: {
      nfe: Array<{
        nfeNumero: number;
        nfeSerie: number;
        nfeData: string;
        nfeValTotal: number;
        nfeValProd: number;
        nfeChave: string;
      }>;
    };
  }>;
};

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function money(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function phoneNumber(digits: string): number | undefined {
  const national = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  const trimmed = national.slice(0, 12);
  if (trimmed.length < 10) return undefined;
  return Number(trimmed);
}

export function buildSmartLabelPayload(input: {
  reid: string;
  shipperDocument: string;
  orderNumber: string;
  productName: string;
  weightKg: number;
  recipient: {
    name: string;
    document: string;
    email?: string;
    phone?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  invoice: {
    number: string;
    series: string;
    issuedOn: string;
    total: number;
    products: number;
    key: string;
  };
}): SmartLabelPayload {
  const reid = Number(input.reid.replace(/\D/g, ""));
  const cnpj = input.shipperDocument.replace(/\D/g, "");
  const cep = input.recipient.zip.replace(/\D/g, "");
  const document = input.recipient.document.replace(/\D/g, "");
  const key = input.invoice.key.replace(/\D/g, "");
  const nfeNumero = Number(input.invoice.number.replace(/\D/g, ""));
  const nfeSerie = Number(input.invoice.series.replace(/\D/g, ""));
  if (!Number.isInteger(reid) || reid <= 0) {
    throw new TotalExpressError("Reid do contrato Total Express inválido.");
  }
  if (cnpj.length !== 14) {
    throw new TotalExpressError("CNPJ do remetente precisa ter 14 dígitos em Admin → Configurações.");
  }
  if (cep.length !== 8) throw new TotalExpressError("CEP de entrega inválido.");
  if (document.length !== 11 && document.length !== 14) {
    throw new TotalExpressError("CPF ou CNPJ do destinatário ausente no pedido.");
  }
  if (key.length !== 44) throw new TotalExpressError("NF-e sem chave de acesso de 44 dígitos.");
  if (!Number.isInteger(nfeNumero) || nfeNumero <= 0) {
    throw new TotalExpressError("NF-e sem número.");
  }
  if (!Number.isInteger(nfeSerie) || nfeSerie < 0) {
    throw new TotalExpressError("NF-e sem série.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.invoice.issuedOn)) {
    throw new TotalExpressError("NF-e sem data de emissão.");
  }

  const phone = phoneNumber((input.recipient.phone ?? "").replace(/\D/g, ""));
  const email = clip(input.recipient.email ?? "", 60);
  const complement = clip(input.recipient.complement ?? "", 60);
  const orderCode = clip(input.orderNumber, 20);

  return {
    remetenteId: reid,
    cnpj,
    remessaCodigo: clip(`ISEUL-${orderCode}`, 20),
    encomendas: [
      {
        servicoTipo: 1,
        entregaTipo: 0,
        peso: money(Math.max(0.01, input.weightKg)),
        volumes: 1,
        condFrete: "CIF",
        pedido: orderCode,
        natureza: clip(input.productName || "COSMETICOS", 25),
        volumesTipo: "CX",
        icmsIsencao: 0,
        destinatario: {
          nome: clip(input.recipient.name, 40),
          cpfCnpj: document,
          endereco: {
            logradouro: clip(input.recipient.street, 80),
            numero: clip(input.recipient.number || "S/N", 10),
            ...(complement ? { complemento: complement } : {}),
            bairro: clip(input.recipient.neighborhood, 40),
            cidade: clip(input.recipient.city, 40),
            estado: clip(input.recipient.state.toUpperCase(), 2),
            pais: "Brasil",
            cep,
          },
          ...(email ? { email } : {}),
          ...(phone ? { telefone1: phone } : {}),
        },
        docFiscal: {
          nfe: [
            {
              nfeNumero,
              nfeSerie,
              nfeData: input.invoice.issuedOn,
              nfeValTotal: money(input.invoice.total),
              nfeValProd: money(input.invoice.products),
              nfeChave: key,
            },
          ],
        },
      },
    ],
  };
}

function errorText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as {
    descricao?: unknown;
    message?: unknown;
    retorno?: { erros?: Array<{ erro?: unknown }> };
  };
  const listed = record.retorno?.erros
    ?.map((item) => String(item.erro ?? "").trim())
    .filter(Boolean);
  if (listed?.length) return listed.join(" ");
  const descricao = String(record.descricao ?? "").trim();
  if (descricao) return descricao;
  const message = String(record.message ?? "").trim();
  return message || null;
}

function volumeFrom(node: unknown): SmartLabelVolume | null {
  if (!node || typeof node !== "object") return null;
  const volumes = (node as { volumes?: unknown }).volumes;
  if (!Array.isArray(volumes)) return null;
  for (const volume of volumes) {
    if (!volume || typeof volume !== "object") continue;
    const awb = String((volume as { awb?: unknown }).awb ?? "").trim();
    if (!awb) continue;
    const rota = String((volume as { rota?: unknown }).rota ?? "").trim();
    const barcode = String((volume as { codigoBarras?: unknown }).codigoBarras ?? "").trim() || awb;
    return { awb, rota, barcode };
  }
  return null;
}

export function parseSmartLabelResponse(status: number, body: unknown): SmartLabelVolume {
  const retorno =
    body && typeof body === "object" ? (body as { retorno?: unknown }).retorno : null;
  const groups = [
    retorno && typeof retorno === "object" ? (retorno as { encomendas?: unknown }).encomendas : null,
    retorno && typeof retorno === "object" ? (retorno as { sucesso?: unknown }).sucesso : null,
  ];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const item of group) {
      const volume = volumeFrom(item);
      if (volume) return volume;
    }
  }
  const detail = errorText(body);
  if (status === 401) {
    throw new TotalExpressError("Total Express recusou o login do contrato.");
  }
  throw new TotalExpressError(detail || "Total Express não registrou o envio.");
}

export async function registerSmartLabel(payload: SmartLabelPayload): Promise<SmartLabelVolume> {
  const credentials = getTotalExpressCredentials();
  if (!credentials) {
    throw new TotalExpressError("Contrato da Total Express não configurado.");
  }
  const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString("base64");
  const res = await fetch(REGISTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok && res.status !== 206) {
    throw new TotalExpressError(
      errorText(body) || `Total Express recusou o envio (${res.status}).`
    );
  }
  return parseSmartLabelResponse(res.status, body);
}
