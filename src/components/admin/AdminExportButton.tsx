"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportAdminTable, type AdminExportTable } from "@/actions/admin/export";

type Props = {
  table: AdminExportTable;
  label?: string;
  className?: string;
};

export function AdminExportButton({ table, label = "Exportar CSV", className }: Props) {
  const [pending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportAdminTable(table);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if (!result.csv || !result.filename) {
        toast.error("Não foi possível gerar a planilha.");
        return;
      }

      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Planilha exportada");
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={pending}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl border border-iseul-line bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:border-iseul-accent2 hover:text-iseul-accent disabled:opacity-60"
      }
    >
      <Download className="h-4 w-4" />
      {pending ? "Exportando…" : label}
    </button>
  );
}
