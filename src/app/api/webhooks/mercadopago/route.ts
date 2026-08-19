import { NextResponse } from "next/server";
import {
  extractMercadoPagoWebhookDataId,
  isMercadoPagoIpnRequest,
  resolveMercadoPagoWebhookSecret,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago-webhook";
import { syncOrderPaymentFromMercadoPago } from "@/lib/orders/fulfill";

function extractPaymentId(request: Request, body?: Record<string, unknown>) {
  return extractMercadoPagoWebhookDataId(new URL(request.url).searchParams, body);
}

async function handlePayment(request: Request, paymentId: string) {
  const isIpn = isMercadoPagoIpnRequest(new URL(request.url).searchParams);
  const hasSecret = !!resolveMercadoPagoWebhookSecret();

  const signatureOk =
    isIpn ||
    !hasSecret ||
    verifyMercadoPagoWebhookSignature(paymentId, {
      signature: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
    });

  if (!signatureOk) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await syncOrderPaymentFromMercadoPago(paymentId);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const topic = body.type ?? body.topic ?? body.action;
    const paymentId = extractPaymentId(request, body);

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    if (topic === "payment" || String(body.action).includes("payment")) {
      return handlePayment(request, paymentId);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
    const paymentId = extractPaymentId(request);

    if (!paymentId) {
      return NextResponse.json({ status: "ok", service: "iseul-mercadopago-webhook" });
    }

    if (topic === "payment") {
      return handlePayment(request, paymentId);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
