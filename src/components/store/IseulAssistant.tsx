"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";
import { cn } from "@/lib/utils";

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

const PRODUCT_PATH = /\/produtos\/[a-z0-9-]+/gi;
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/produtos\/[a-z0-9-]+)\)/gi;

function renderMessage(content: string) {
  const nodes: ReactNode[] = [];
  const md = [...content.matchAll(MARKDOWN_LINK)];
  let cursor = 0;

  const pushText = (text: string, keyPrefix: string) => {
    const inner = [...text.matchAll(PRODUCT_PATH)];
    let last = 0;
    inner.forEach((match, index) => {
      const start = match.index ?? 0;
      if (start > last) nodes.push(<span key={`${keyPrefix}-t-${index}`}>{text.slice(last, start)}</span>);
      const href = match[0];
      nodes.push(
        <Link
          key={`${keyPrefix}-l-${index}`}
          href={href}
          className="underline decoration-iseul-sage/70 underline-offset-2 hover:text-iseul-accent"
        >
          {href}
        </Link>
      );
      last = start + href.length;
    });
    if (last < text.length) nodes.push(<span key={`${keyPrefix}-end`}>{text.slice(last)}</span>);
  };

  md.forEach((match, index) => {
    const start = match.index ?? 0;
    if (start > cursor) pushText(content.slice(cursor, start), `pre-${index}`);
    const href = match[2].replace("https://iseul.com.br", "").replace("https://www.iseul.com.br", "");
    nodes.push(
      <Link
        key={`md-${index}`}
        href={href}
        className="underline decoration-iseul-sage/70 underline-offset-2 hover:text-iseul-accent"
      >
        {match[1]}
      </Link>
    );
    cursor = start + match[0].length;
  });
  if (cursor < content.length) pushText(content.slice(cursor), "tail");
  return nodes.length ? nodes : content;
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
  const userTurns = messages.filter((item) => item.role === "user").length;
  const limitReached = userTurns >= MAX_TURNS;
  const onAdmin = pathname.startsWith("/admin");
  const onProduct = pathname.startsWith("/produtos/");

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, pending]);

  if (!pathname || onAdmin) return null;

  async function send(message: string, intent?: AssistantIntent) {
    const text = message.trim();
    if (!text || pending || limitReached) return;

    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          intent,
          history: nextHistory.slice(-8, -1),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Não consegui responder agora.");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "Não consegui responder agora." },
        ]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch {
      setError("Não consegui responder agora.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Não consegui responder agora." },
      ]);
    } finally {
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
          className="flex h-[min(32rem,calc(100dvh-8rem))] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-iseul-line bg-[color-mix(in_srgb,var(--paper)_96%,white)] shadow-[0_18px_50px_rgba(28,26,22,.16)]"
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
                  "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                  message.role === "assistant"
                    ? "self-start bg-iseul-dew/70 text-iseul-ink"
                    : "self-end bg-iseul-ink text-iseul-paper"
                )}
              >
                {renderMessage(message.content)}
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
                className="flex items-end gap-2"
              >
                <label className="sr-only" htmlFor="iseul-assistant-input">
                  Mensagem
                </label>
                <textarea
                  id="iseul-assistant-input"
                  rows={2}
                  value={input}
                  disabled={pending}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Pergunte sobre um produto…"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-iseul-line bg-white px-3 py-2 text-sm text-iseul-ink outline-none placeholder:text-iseul-muted focus:border-iseul-sage"
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
        className="grid h-14 w-14 place-items-center rounded-full border border-iseul-line bg-iseul-dew text-iseul-pine shadow-[0_10px_28px_rgba(55,81,69,.22)] transition hover:bg-white"
      >
        {open ? <span className="text-lg leading-none">✕</span> : <IseulDropIcon className="h-7 w-7" />}
      </button>
    </div>
  );
}
