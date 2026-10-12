"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SkinTypeOption } from "@/lib/skin-types";

type Props = {
  value: string;
  options: SkinTypeOption[];
  onChange: (slug: string) => void;
};

export function SkinTypeFilter({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((skin) => skin.slug === value);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:w-auto sm:min-w-[168px] sm:flex-none">
      <label id={`${listId}-label`} className="sr-only">
        Filtrar por tipo de pele
      </label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-iseul-line/80 bg-iseul-areia/60 py-2 pl-2 pr-2 text-left text-[11px] text-iseul-ink transition focus:border-iseul-sage focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-sage/25 sm:py-2.5 sm:pl-3.5 sm:pr-3 sm:text-[13px]"
      >
        <span className="truncate">{selected?.label ?? "Pele"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-iseul-muted sm:h-4 sm:w-4" aria-hidden />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${listId}-label`}
          className="absolute right-0 z-30 mt-1 max-h-80 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-iseul-line bg-white py-1 shadow-card"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-[13px] text-iseul-ink hover:bg-iseul-areia/70"
            >
              Pele
            </button>
          </li>
          {options.map((skin) => (
            <li key={skin.slug}>
              <button
                type="button"
                role="option"
                aria-selected={value === skin.slug}
                onClick={() => {
                  onChange(skin.slug);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-iseul-areia/70"
              >
                <span className="block text-[13px] text-iseul-ink">{skin.label}</span>
                {skin.description ? (
                  <span className="mt-0.5 block text-[11px] leading-snug text-iseul-muted">
                    {skin.description}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
