import { NextResponse } from "next/server";
import { buildMetaUserData, sendMetaCapiEvents, type MetaCapiCustomData } from "@/lib/meta-capi";

type TrackBody = {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  fbc?: string;
  fbp?: string;
  user?: {
    email?: string;
    phone?: string;
    fullName?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  customData?: {
    contentIds?: string[];
    contentName?: string;
    value?: number;
    numItems?: number;
    orderId?: string;
  };
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackBody;
    const { eventName, eventId, customData, user, fbc, fbp } = body;
    const eventSourceUrl = body.eventSourceUrl || request.headers.get("referer") || "";

    if (!eventName || !eventId || !eventSourceUrl) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const userData = buildMetaUserData({
      email: user?.email,
      phone: user?.phone,
      fullName: user?.fullName,
      city: user?.city,
      state: user?.state,
      zip: user?.zip,
      fbc,
      fbp,
    });
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;

    const payload: MetaCapiCustomData = {};
    if (customData?.value != null && customData.value > 0) {
      payload.value = customData.value;
      payload.currency = "BRL";
    }
    if (customData?.contentIds?.length) {
      payload.content_ids = customData.contentIds.map(String);
      payload.content_type = "product";
    }
    if (customData?.contentName) payload.content_name = customData.contentName;
    if (customData?.numItems) payload.num_items = customData.numItems;
    if (customData?.orderId) payload.order_id = customData.orderId;

    const result = await sendMetaCapiEvents([
      {
        eventName,
        eventId,
        eventSourceUrl,
        userData,
        customData: Object.keys(payload).length ? payload : undefined,
      },
    ]);

    if (!result.ok && !result.skipped) {
      return NextResponse.json({ error: result.error ?? "CAPI error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, skipped: result.skipped ?? false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
