import { maskCep } from "@/lib/utils";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  if (!first) return "olá";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatOrderDate(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function paymentMethodLabel(method: string | null | undefined): string {
  const value = method?.trim().toLowerCase() ?? "";
  if (value.includes("pix")) return "Pix";
  if (value.includes("cartao") || value.includes("cartão") || value.includes("card")) return "Cartão";
  if (value.includes("boleto")) return "Boleto";
  return method?.trim() || "Pagamento";
}

export function shippingLabel(input: {
  shippingMethod?: string | null;
  address?: Record<string, string> | null;
}): string {
  if (input.shippingMethod?.trim()) return input.shippingMethod.trim();
  const addr = input.address ?? {};
  const fromParts = [addr.shipping_carrier, addr.shipping_service].filter(Boolean).join(" ");
  return fromParts || "transportadora";
}

export function formatAddress(address: Record<string, string> | null | undefined): {
  linha1: string;
  linha2: string;
  cep: string;
} {
  const addr = address ?? {};
  const street = [addr.street, addr.number].filter(Boolean).join(", ");
  const linha1 = [street, addr.complement?.trim()].filter(Boolean).join(" — ");
  const cityState = [addr.city, addr.state].filter(Boolean).join("/");
  const linha2 = [addr.neighborhood, cityState].filter(Boolean).join(" · ");
  return {
    linha1: linha1 || "Endereço informado no checkout",
    linha2,
    cep: addr.zip ? maskCep(addr.zip) : "",
  };
}

export function trackingUrl(code: string): string {
  return `https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(code.trim())}`;
}

export function absoluteAssetUrl(url: string | null | undefined, siteUrl: string): string | null {
  const value = url?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}
