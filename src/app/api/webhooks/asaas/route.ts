import { NextResponse } from "next/server";
import {
  isAsaasPaymentActivationEvent,
  isAsaasPaymentFailureEvent,
  parseAsaasWebhookPayload,
  verifyAsaasWebhookToken,
} from "@/lib/asaas-webhook";
import { syncOrderPaymentFromAsaas } from "@/lib/orders/fulfill";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!verifyAsaasWebhookToken(request)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const payload = parseAsaasWebhookPayload(body);
    const event = payload.event;
    const paymentId = payload.payment?.id;

    if (isAsaasPaymentActivationEvent(event) && paymentId) {
      const result = await syncOrderPaymentFromAsaas(paymentId);
      return NextResponse.json(result.body, { status: result.status });
    }

    if (isAsaasPaymentFailureEvent(event) && paymentId) {
      await syncOrderPaymentFromAsaas(paymentId);
      return NextResponse.json({ received: true, event });
    }

    return NextResponse.json({ received: true, event });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "iseul-asaas-webhook" });
}
