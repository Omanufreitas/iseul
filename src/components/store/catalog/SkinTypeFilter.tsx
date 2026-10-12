"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { SkinTypeOption } from "@/lib/skin-types";

type Props = {
  value: string;
  options: SkinTypeOption[];
  onChange: (slug: string) => void;
};

type MenuBox = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function SkinTypeFilter({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<MenuBox | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((skin) => skin.slug === value);

  useEffect(() => {
    if (!open) return;

    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      if (rect.bottom < 8 || rect.top > window.innerHeight - 8) {
        setOpen(false);
        return;
      }
      const margin = 12;
      const width = Math.min(320, window.innerWidth - margin * 2);
      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = window.innerWidth - margin - width;
      }
      if (left < margin) left = margin;
      const top = rect.bottom + 6;
      const maxHeight = Math.max(160, Math.min(320, window.innerHeight - top - margin));
      setBox({ top, left, width, maxHeight });
    }

    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    place();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const menu =
    open && box
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-label`}
            style={{ top: box.top, left: box.left, width: box.width, maxHeight: box.maxHeight }}
            className="fixed z-[85] overflow-y-auto rounded-xl border border-iseul-line bg-white py-1 shadow-card"
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
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:w-auto sm:min-w-[168px] sm:flex-none">
      <label id={`${listId}-label`} className="sr-only">
        Filtrar por tipo de pele
      </label>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-iseul-line/80 bg-iseul-areia/60 py-2 pl-2 pr-2 text-left text-[11px] text-iseul-ink transition focus:border-iseul-sage focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-sage/25 sm:py-2.5 sm:pl-3.5 sm:pr-3 sm:text-[13px]"
      >
        <span className="truncate">{selected?.label ?? "Pele"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-iseul-muted sm:h-4 sm:w-4" aria-hidden />
      </button>
      {menu}
    </div>
  );
}
