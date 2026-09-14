"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";
import { parseAssistantBlocks, productHref, type AssistantBlock } from "@/lib/assistant/format";
import { prepareChatHistory } from "@/lib/assistant/payload";
import { cn } from "@/lib/utils";

const FALLBACK_ERROR = "Não consegui responder agora.";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function postChat(
  body: unknown,
  attempt = 0
): Promise<{ reply?: string; error?: string }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let data: { reply?: string; error?: string } = {};
    try {
      data = raw ? (JSON.parse(raw) as { reply?: string; error?: string }) : {};
    } catch {
      if (attempt === 0) {
        await sleep(500);
        return postChat(body, 1);
      }
      return { error: FALLBACK_ERROR };
    }
    if (!res.ok && attempt === 0 && res.status >= 500) {
      await sleep(500);
      return postChat(body, 1);
    }
    if (data.reply) return { reply: data.reply };
    return { error: data.error || FALLBACK_ERROR };
  } catch {
    if (attempt === 0) {
      await sleep(500);
      return postChat(body, 1);
    }
    return { error: FALLBACK_ERROR };
  }
}

type AssistantIntent = "products" | "doubt" | "routine";
type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const MAX_TURNS = 12;

const CHIPS: { intent: AssistantIntent; label: string; message: string }[] = [
  {
    intent: "products",
    label: "Ver produtos",
    message: "Quero ver os produtos da Iseul.",
  },
  {
    intent: "doubt",
    label: "Tirar uma dúvida",
    message: "Quero tirar uma dúvida sobre skincare ou a loja.",
  },
  {
    intent: "routine",
    label: "Dica de rotina",
    message: "Me dá uma dica de rotina com os produtos da Iseul.",
  },
];

function AssistantBlocks({ blocks }: { blocks: AssistantBlock[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <p key={`t-${index}`} className="text-[14px] leading-relaxed text-iseul-ink">
              {block.text}
            </p>
          );
        }
        if (block.type === "step") {
          return (
            <div key={`s-${index}`} className="pt-0.5">
              <span className="inline-flex rounded-full border border-iseul-line bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-iseul-pine">
                {block.title}
              </span>
            </div>
          );
        }
        return (
          <Link
            key={`p-${block.slug}-${index}`}
            href={productHref(block.slug)}
            className="block rounded-xl border border-iseul-line/80 bg-white px-3 py-2.5 no-underline shadow-sm transition hover:border-iseul-sage"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-snug text-iseul-ink">{block.name}</p>
              {block.price ? (
                <span className="shrink-0 text-[12px] tabular-nums text-iseul-muted">{block.price}</span>
              ) : null}
            </div>
            {block.note ? (
              <p className="mt-1 text-[12px] leading-relaxed text-iseul-muted">{block.note}</p>
            ) : null}
            <p className="mt-1.5 text-[11px] font-medium text-iseul-accent">Ver produto</p>
          </Link>
        );
      })}
    </div>
  );
}

export function IseulAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Oi. Posso te mostrar os produtos, tirar uma dúvida ou montar uma rotina curta.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inFlight = useRef(false);
  const userTurns = messages.filter((item) => item.role === "user").length;
  const limitReached = userTurns >= MAX_TURNS;
  const onAdmin = pathname.startsWith("/admin");
  const onProduct = pathname.startsWith("/produtos/");

  useEffect(() => {
    if (!open || pending) return;
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open, pending]);

  if (!pathname || onAdmin) return null;

  async function send(message: string, intent?: AssistantIntent) {
    const text = message.trim();
    if (!text || inFlight.current || limitReached) return;
    inFlight.current = true;
    const previous = messages;

    setPending(true);
    setError(null);
    inputRef.current?.blur();

    try {
      // iOS Safari abortava o fetch quando o teclado fechava e o layout refluía.
      await sleep(200);
      setMessages([...previous, { role: "user" as const, content: text }]);
      setInput("");
      const data = await postChat({
        message: text,
        intent,
        history: prepareChatHistory(previous, text),
      });
      if (!data.reply) {
        setError(data.error ?? FALLBACK_ERROR);
        setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? FALLBACK_ERROR }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <div
      className={cn(
        "fixed right-4 z-[80] flex flex-col items-end gap-3",
        onProduct
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] md:bottom-6"
          : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:bottom-6"
      )}
    >
      {open && (
        <section
          className="flex h-[min(32rem,calc(100svh-8rem))] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden overscroll-contain rounded-2xl border border-iseul-line bg-[color-mix(in_srgb,var(--paper)_96%,white)] shadow-[0_18px_50px_rgba(28,26,22,.16)]"
          aria-label="Assistente Iseul"
        >
          <header className="flex items-center justify-between border-b border-iseul-line bg-iseul-dew/50 px-4 py-3">
            <div>
              <p className="font-serif text-lg leading-none text-iseul-ink">Iseul</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-iseul-muted">
                Assistente da loja
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-iseul-muted transition-colors hover:bg-white"
              aria-label="Fechar assistente"
            >
              ✕
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-[92%]",
                  message.role === "assistant" ? "self-start w-full" : "self-end"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="rounded-2xl bg-iseul-dew/55 px-3 py-2.5">
                    <AssistantBlocks blocks={parseAssistantBlocks(message.content)} />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-iseul-ink px-3.5 py-2.5 text-[14px] leading-relaxed text-iseul-paper">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            {pending && (
              <div className="self-start rounded-2xl bg-iseul-dew/70 px-3.5 py-2.5 text-[13px] text-iseul-muted">
                Escrevendo…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-iseul-line px-3 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {CHIPS.map((chip) => (
                <button
                  key={chip.intent}
                  type="button"
                  disabled={pending || limitReached}
                  onClick={() => void send(chip.message, chip.intent)}
                  className="rounded-full border border-iseul-line bg-white px-2.5 py-1 text-[11px] font-medium text-iseul-ink transition-colors hover:border-iseul-sage hover:bg-iseul-dew/50 disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {limitReached ? (
              <p className="px-1 text-xs text-iseul-muted">
                Por agora é isso. Se precisar, escreva para contato@iseul.com.br.
              </p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
                className="flex min-w-0 items-end gap-2"
              >
                <label className="sr-only" htmlFor="iseul-assistant-input">
                  Mensagem
                </label>
                <textarea
                  id="iseul-assistant-input"
                  ref={inputRef}
                  rows={2}
                  value={input}
                  disabled={pending}
                  enterKeyHint="send"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Pergunte sobre um produto…"
                  className="min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-iseul-line bg-white px-3 py-2 text-sm text-iseul-ink outline-none placeholder:text-iseul-muted focus:border-iseul-sage"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="rounded-full bg-iseul-ink px-3.5 py-2 text-[12px] font-medium text-iseul-paper disabled:opacity-40"
                >
                  Enviar
                </button>
              </form>
            )}
            {error && <p className="sr-only">{error}</p>}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Fechar assistente Iseul" : "Abrir assistente Iseul"}
        className="group flex flex-col items-end gap-2"
      >
        {!open ? (
          <span className="rounded-2xl border border-iseul-line/90 bg-[color-mix(in_srgb,var(--paper)_94%,white)] px-2.5 py-1.5 text-right shadow-[0_8px_20px_rgba(55,81,69,.14)]">
            <span className="block text-[8px] font-medium uppercase tracking-[0.18em] text-iseul-sage">
              Assistente
            </span>
            <span className="mt-0.5 block font-serif italic text-[17px] leading-none text-iseul-ink">
              Iseul
            </span>
          </span>
        ) : null}
        <span className="grid h-14 w-14 place-items-center rounded-full border border-iseul-line bg-iseul-dew text-iseul-pine shadow-[0_10px_28px_rgba(55,81,69,.22)] transition group-hover:bg-white">
          {open ? <span className="text-lg leading-none">✕</span> : <IseulDropIcon className="h-7 w-7" />}
        </span>
      </button>
    </div>
  );
}
