"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";
import { fbq } from "@/lib/meta-pixel";
import {
  emptyRotinaAnswers,
  isRotinaTriggerHref,
  PASSOS_ROTINA,
  PELE_SENSIVEL,
  PELE_TIPOS,
  QUEIXAS,
  rotinaPedeDetalhes,
  rotinaWhatsAppUrl,
  ROTINA_BOTAO,
  ROTINA_CONVITE_KEY,
  ROTINA_CONVITE_MS,
  ROTINA_MAX_QUEIXAS,
  ROTINAS_HOJE,
  type RotinaAnswers,
} from "@/lib/rotina-quiz";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;

function toggleValue(list: string[], value: string, max?: number) {
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (max != null && list.length >= max) return list;
  return [...list, value];
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-left text-[13.5px] leading-snug transition",
        selected
          ? "border-iseul-pine bg-iseul-pine text-iseul-paper"
          : "border-iseul-line bg-white text-iseul-ink hover:border-iseul-sage"
      )}
    >
      {children}
    </button>
  );
}

export function RotinaQuiz() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<RotinaAnswers>(emptyRotinaAnswers);
  const [invite, setInvite] = useState(false);
  const onProduct = pathname.startsWith("/produtos/");
  const hidden =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/obrigado");

  const openQuiz = useCallback(() => {
    setInvite(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (hidden) return;

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-iseul-rotina]")) {
        event.preventDefault();
        openQuiz();
        return;
      }
      const link = target.closest("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (!isRotinaTriggerHref(href)) return;
      if (href.includes("montar-rotina")) event.preventDefault();
      openQuiz();
    }

    function onHash() {
      if (isRotinaTriggerHref(window.location.hash)) openQuiz();
    }

        document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHash);
    if (isRotinaTriggerHref(window.location.hash)) openQuiz();
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
    };
  }, [hidden, openQuiz]);

  useEffect(() => {
    if (hidden || open) return;
    try {
      if (sessionStorage.getItem(ROTINA_CONVITE_KEY) === "1") return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => setInvite(true), ROTINA_CONVITE_MS);
    return () => window.clearTimeout(timer);
  }, [hidden, open]);

  function dismissInvite() {
    setInvite(false);
    try {
      sessionStorage.setItem(ROTINA_CONVITE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function closeQuiz() {
    setOpen(false);
    setStep(1);
    setAnswers(emptyRotinaAnswers());
  }

  const needsRoutineDetails = rotinaPedeDetalhes(answers.rotinaHoje);
  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(answers.tipoPele);
    if (step === 2) return Boolean(answers.sensivel);
    if (step === 3) return answers.queixas.length > 0 || Boolean(answers.queixaLivre.trim());
    if (step === 4) {
      if (!answers.rotinaHoje) return false;
      if (needsRoutineDetails && answers.passos.length === 0) return false;
      return true;
    }
    return answers.nome.trim().length >= 2;
  }, [answers, needsRoutineDetails, step]);

  function sendToWhatsApp() {
    fbq("track", "Contact");
    window.open(rotinaWhatsAppUrl(answers), "_blank", "noopener,noreferrer");
    dismissInvite();
    closeQuiz();
  }

  if (hidden) return null;

  const dockClass = onProduct
    ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] md:bottom-6"
    : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:bottom-6";

  return (
    <>
      {open ? (
        <section
          className={cn(
            "fixed right-3 z-[80] flex w-[min(calc(100vw-1.5rem),22.5rem)] flex-col overflow-hidden rounded-2xl border border-iseul-line bg-[color-mix(in_srgb,var(--paper)_96%,white)] shadow-[0_18px_50px_rgba(28,26,22,.16)] md:right-4",
            onProduct
              ? "bottom-[calc(11rem+env(safe-area-inset-bottom))] max-h-[min(34rem,calc(100dvh-16.5rem))] md:bottom-[5.75rem] md:max-h-[min(34rem,calc(100dvh-12rem))]"
              : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-h-[min(34rem,calc(100dvh-12rem))] md:bottom-[5.75rem]"
          )}
          aria-label="Montar minha rotina"
        >
          <header className="flex items-center justify-between border-b border-iseul-line bg-iseul-dew/50 px-4 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-iseul-sage">
                Rotina personalizada
              </p>
              <p className="mt-1 font-serif text-xl leading-none text-iseul-ink">{ROTINA_BOTAO}</p>
            </div>
            <button
              type="button"
              onClick={closeQuiz}
              className="grid h-8 w-8 place-items-center rounded-full text-iseul-muted hover:bg-white"
              aria-label="Fechar questionário"
            >
              ✕
            </button>
          </header>

          <div className="h-px bg-iseul-line">
            <div
              className="h-px bg-iseul-pine transition-[width] duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-iseul-muted">
              {step} de {TOTAL_STEPS}
            </p>

            {step === 1 ? (
              <fieldset className="mt-3">
                <legend className="font-serif text-[26px] leading-tight text-iseul-ink">
                  Qual é o seu tipo de pele?
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PELE_TIPOS.map((option) => (
                    <Choice
                      key={option}
                      selected={answers.tipoPele === option}
                      onClick={() => setAnswers((prev) => ({ ...prev, tipoPele: option }))}
                    >
                      {option}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <fieldset className="mt-3">
                <legend className="font-serif text-[26px] leading-tight text-iseul-ink">
                  Sua pele é sensível?
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PELE_SENSIVEL.map((option) => (
                    <Choice
                      key={option}
                      selected={answers.sensivel === option}
                      onClick={() => setAnswers((prev) => ({ ...prev, sensivel: option }))}
                    >
                      {option}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <fieldset className="mt-3">
                <legend className="font-serif text-[26px] leading-tight text-iseul-ink">
                  O que mais te incomoda?
                </legend>
                <p className="mt-2 text-[13px] text-iseul-muted">Até {ROTINA_MAX_QUEIXAS} opções.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUEIXAS.map((option) => (
                    <Choice
                      key={option}
                      selected={answers.queixas.includes(option)}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          queixas: toggleValue(prev.queixas, option, ROTINA_MAX_QUEIXAS),
                        }))
                      }
                    >
                      {option}
                    </Choice>
                  ))}
                </div>
                <label className="mt-4 block text-sm">
                  <span className="mb-1 block text-iseul-muted">Outra coisa (opcional)</span>
                  <input
                    value={answers.queixaLivre}
                    onChange={(event) =>
                      setAnswers((prev) => ({ ...prev, queixaLivre: event.target.value }))
                    }
                    className="w-full rounded-xl border border-iseul-line bg-white px-3 py-2.5 text-sm outline-none focus:border-iseul-sage"
                    placeholder="Ex.: cicatriz de acne"
                  />
                </label>
              </fieldset>
            ) : null}

            {step === 4 ? (
              <fieldset className="mt-3">
                <legend className="font-serif text-[26px] leading-tight text-iseul-ink">
                  Como está sua rotina hoje?
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ROTINAS_HOJE.map((option) => (
                    <Choice
                      key={option}
                      selected={answers.rotinaHoje === option}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          rotinaHoje: option,
                          passos: rotinaPedeDetalhes(option) ? prev.passos : [],
                          produtos: rotinaPedeDetalhes(option) ? prev.produtos : "",
                        }))
                      }
                    >
                      {option}
                    </Choice>
                  ))}
                </div>
                {needsRoutineDetails ? (
                  <>
                    <p className="mt-5 text-[13px] text-iseul-muted">Quais passos você já usa?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PASSOS_ROTINA.map((option) => (
                        <Choice
                          key={option}
                          selected={answers.passos.includes(option)}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              passos: toggleValue(prev.passos, option),
                            }))
                          }
                        >
                          {option}
                        </Choice>
                      ))}
                    </div>
                    <label className="mt-4 block text-sm">
                      <span className="mb-1 block text-iseul-muted">Produtos e marcas (opcional)</span>
                      <textarea
                        rows={3}
                        value={answers.produtos}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, produtos: event.target.value }))
                        }
                        className="w-full resize-none rounded-xl border border-iseul-line bg-white px-3 py-2.5 text-sm outline-none focus:border-iseul-sage"
                        placeholder="Ex.: Sabonete Cetaphil, hidratante Neutrogena Hydro Boost"
                      />
                    </label>
                  </>
                ) : null}
              </fieldset>
            ) : null}

            {step === 5 ? (
              <fieldset className="mt-3">
                <legend className="font-serif text-[26px] leading-tight text-iseul-ink">
                  Como a gente te chama?
                </legend>
                <label className="mt-4 block text-sm">
                  <span className="mb-1 block text-iseul-muted">Nome</span>
                  <input
                    value={answers.nome}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, nome: event.target.value }))}
                    className="w-full rounded-xl border border-iseul-line bg-white px-3 py-2.5 text-sm outline-none focus:border-iseul-sage"
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </label>
              </fieldset>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-iseul-line px-4 py-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="rounded-full border border-iseul-line px-4 py-2.5 text-sm text-iseul-ink hover:bg-white"
              >
                Voltar
              </button>
            ) : null}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => setStep((value) => value + 1)}
                className="ml-auto rounded-full bg-iseul-pine px-5 py-2.5 text-sm font-medium text-iseul-paper disabled:opacity-40"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={sendToWhatsApp}
                className="ml-auto rounded-full bg-iseul-pine px-5 py-2.5 text-sm font-medium text-iseul-paper disabled:opacity-40"
              >
                Enviar no WhatsApp
              </button>
            )}
          </div>
        </section>
      ) : null}

      <div className={cn("fixed right-4 z-[81] flex flex-col items-end gap-3", dockClass)}>
        {invite && !open ? (
          <div className="w-[min(100vw-2rem,20.5rem)] rounded-2xl border border-iseul-line bg-[color-mix(in_srgb,var(--paper)_96%,white)] p-4 shadow-[0_18px_50px_rgba(28,26,22,.16)]">
            <div className="flex items-start justify-between gap-3">
              <p className="font-serif text-[22px] leading-tight text-iseul-ink">
                Não sabe por onde começar?
              </p>
              <button
                type="button"
                onClick={dismissInvite}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-iseul-muted hover:bg-white"
                aria-label="Fechar convite"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-iseul-muted">
              Cinco perguntas rápidas e a gente monta a rotina certa para a sua pele no WhatsApp.
            </p>
            <button
              type="button"
              onClick={openQuiz}
              className="mt-4 w-full rounded-full bg-iseul-pine py-2.5 text-sm font-medium text-iseul-paper hover:bg-iseul-pine/90"
            >
              Quero minha rotina
            </button>
          </div>
        ) : null}

      <button
        type="button"
        onClick={() => (open ? closeQuiz() : openQuiz())}
        aria-expanded={open}
        aria-label={open ? "Fechar questionário de rotina" : "Montar minha rotina"}
        className="flex max-w-[11.5rem] items-center gap-3 rounded-full bg-iseul-pine py-2 pl-2 pr-4 text-left text-iseul-paper shadow-[0_12px_28px_rgba(55,81,69,.28)] transition hover:bg-iseul-pine/90"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-iseul-dew text-iseul-pine">
          {open ? <span className="text-lg leading-none">✕</span> : <IseulDropIcon className="h-6 w-6" />}
        </span>
        {!open ? (
          <span>
            <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-[#C5D7CC]">
              Rotina personalizada
            </span>
            <span className="mt-0.5 block font-serif text-[17px] leading-tight">{ROTINA_BOTAO}</span>
          </span>
        ) : null}
      </button>
      </div>
    </>
  );
}
