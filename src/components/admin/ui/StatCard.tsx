import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sub?: string;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, sub, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-iseul-line/80 bg-white px-4 py-3.5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-iseul-muted">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-iseul-accent" />}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-iseul-ink">{value}</div>
      {sub && <p className="mt-1 text-xs text-amber-700">{sub}</p>}
    </div>
  );
}
