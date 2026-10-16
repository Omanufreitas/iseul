"use client";

export function PrintLabelButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
    >
      Imprimir etiqueta
    </button>
  );
}
