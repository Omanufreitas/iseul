import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export function AdminEmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-iseul-line bg-white px-6 py-16 text-center shadow-card">
      <Icon className="mx-auto h-10 w-10 text-neutral-300" />
      <p className="mt-3 font-medium text-iseul-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-iseul-muted">{description}</p>}
    </div>
  );
}
