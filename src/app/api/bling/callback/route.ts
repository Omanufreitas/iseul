import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeBlingAuthorizationCode } from "@/lib/bling/oauth";
import { saveBlingTokensToDb } from "@/lib/bling/token-store";

const STATE_COOKIE = "bling_oauth_state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/config?bling=error&msg=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.json({ error: "code ausente" }, { status: 400 });
  }

  if (!expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL("/admin/config?bling=error&msg=state_invalido", request.url),
    );
  }

  try {
    const tokens = await exchangeBlingAuthorizationCode(code);
    await saveBlingTokensToDb({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    return NextResponse.redirect(new URL("/admin/config?bling=connected", request.url));
  } catch (e) {
    const message = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(
      new URL(`/admin/config?bling=error&msg=${encodeURIComponent(message.slice(0, 120))}`, request.url),
    );
  }
}
