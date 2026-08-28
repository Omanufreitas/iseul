"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/dashboard-dates";
import { DATE_PRESETS, type DatePreset } from "@/lib/date-presets";

export { DATE_PRESETS, type DatePreset } from "@/lib/date-presets";

type Props = {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  disabled?: boolean;
  /** Alinha o painel — use "left" dentro de formulários de filtro */
  align?: "left" | "right";
  /** "field" ocupa a largura total e combina com inputs de filtro */
  variant?: "default" | "field";
};

function formatRangeShort(from: string, to: string) {
  const f = new Date(`${from}T12:00:00`).toLocaleDateString("pt-BR");
  const t = new Date(`${to}T12:00:00`).toLocaleDateString("pt-BR");
  return `${f} — ${t}`;
}

function formatRangeLabel(from: string, to: string) {
  const f = new Date(`${from}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: from.slice(0, 4) !== to.slice(0, 4) ? "numeric" : undefined,
  });
  const t = new Date(`${to}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${f} — ${t}`;
}

export function DateRangePicker({
  from,
  to,
  onApply,
  disabled,
  align = "right",
  variant = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
  }, [from, to]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function applyCustom() {
    if (!draftFrom || !draftTo) return;
    let f = draftFrom;
    let t = draftTo;
    if (f > t) [f, t] = [t, f];
    onApply(f, t);
    setOpen(false);
  }

  function applyPreset(preset: DatePreset) {
    const range = preset.getRange();
    onApply(range.from, range.to);
    setOpen(false);
  }

  const activePreset = DATE_PRESETS.find((p) => {
    const r = p.getRange();
    return r.from === from && r.to === to;
  });

  const buttonLabel = activePreset?.label ?? formatRangeShort(from, to);
  const isField = variant === "field";

  return (
    <div className={cn("relative", isField && "w-full")} ref={panelRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-iseul-line bg-white text-sm font-medium shadow-sm transition",
          "hover:border-iseul-accent2 hover:shadow-md disabled:opacity-60",
          open && "border-iseul-accent ring-2 ring-iseul-dew",
          isField
            ? "w-full justify-between px-3.5 py-2.5 bg-neutral-50/50"
            : "px-4 py-2.5",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-iseul-accent" />
          <span className="truncate">{buttonLabel}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-iseul-line bg-white shadow-card",
            align === "left" ? "left-0" : "right-0",
          )}
        >
          {!isField && (
            <div className="border-b bg-gradient-to-r from-iseul-dew/80 to-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-iseul-muted">
                Período
              </p>
              <p className="mt-0.5 text-sm text-iseul-ink">{formatRangeLabel(from, to)}</p>
            </div>
          )}

          <div className="p-4">
            {isField && !activePreset && (
              <p className="mb-3 text-xs text-iseul-muted">{formatRangeShort(from, to)}</p>
            )}
            <p className="mb-2 text-xs font-medium text-neutral-500">Atalhos</p>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition",
                    activePreset?.id === p.id
                      ? "bg-iseul-accent text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-700 hover:bg-iseul-dew"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-5 border-t pt-4">
              <p className="mb-3 text-xs font-medium text-neutral-500">Período personalizado</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs">
                  <span className="mb-1 block text-neutral-500">De</span>
                  <input
                    type="date"
                    value={draftFrom}
                    max={draftTo || undefined}
                    onChange={(e) => setDraftFrom(e.target.value)}
                    className="w-full rounded-lg border border-iseul-line px-3 py-2 text-sm focus:border-iseul-accent focus:outline-none focus:ring-2 focus:ring-iseul-dew"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-neutral-500">Até</span>
                  <input
                    type="date"
                    value={draftTo}
                    min={draftFrom || undefined}
                    max={toDateInputValue(new Date())}
                    onChange={(e) => setDraftTo(e.target.value)}
                    className="w-full rounded-lg border border-iseul-line px-3 py-2 text-sm focus:border-iseul-accent focus:outline-none focus:ring-2 focus:ring-iseul-dew"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={applyCustom}
                disabled={!draftFrom || !draftTo}
                className="mt-3 w-full rounded-xl bg-iseul-accent py-2.5 text-sm font-medium text-white transition hover:bg-iseul-accent/90 disabled:opacity-50"
              >
                Aplicar período
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
