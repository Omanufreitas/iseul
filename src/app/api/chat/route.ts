import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeAssistantQuota, getClientIp, recordAssistantUse } from "@/lib/assistant/quota";
import { formatCatalogSnapshot, formatStoreFacts } from "@/lib/assistant/catalog-snapshot";
import { isIseulAssistantEnabled } from "@/lib/assistant/enabled";
import { clipChatText } from "@/lib/assistant/payload";
import { trimAssistantResponse } from "@/lib/assistant/trim";
import { listProducts, getStoreSettings } from "@/lib/catalog";
import { getOpenAIChatModel, getOpenAIClient } from "@/lib/openai/client";
import {
  buildAssistantSystemPrompt,
  intentInstruction,
  isAssistantIntent,
} from "@/lib/prompts/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const historySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const schema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z.array(historySchema).max(12).optional(),
  intent: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isIseulAssistantEnabled()) {
      return NextResponse.json({ error: "Assistente indisponível." }, { status: 503 });
    }

    const ip = getClientIp(request);
    const quota = consumeAssistantQuota(ip);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "Muitas mensagens por hoje. Tente de novo amanhã ou escreva para contato@iseul.com.br.",
        },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
    }

    const intent = isAssistantIntent(parsed.data.intent) ? parsed.data.intent : undefined;
    const history = (parsed.data.history ?? []).map((item) => ({
      role: item.role,
      content: clipChatText(item.content),
    }));
    const [products, settings] = await Promise.all([listProducts(), getStoreSettings()]);
    const catalog = formatCatalogSnapshot(products.filter((product) => product.active));
    const system = [
      buildAssistantSystemPrompt({
        catalog,
        storeFacts: formatStoreFacts(settings),
      }),
      intentInstruction(intent),
    ]
      .filter(Boolean)
      .join("\n\n");

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: getOpenAIChatModel(),
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        ...history.map((item) => ({ role: item.role, content: item.content })),
        { role: "user", content: parsed.data.message },
      ],
    });

    const reply = trimAssistantResponse(completion.choices[0]?.message?.content ?? "");
    if (!reply) {
      return NextResponse.json({ error: "Não consegui responder agora." }, { status: 502 });
    }

    recordAssistantUse(ip);
    return NextResponse.json(
      { reply, remaining: Math.max(0, quota.remaining - 1) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[iseul-assistant]", error);
    return NextResponse.json({ error: "Não consegui responder agora." }, { status: 500 });
  }
}
