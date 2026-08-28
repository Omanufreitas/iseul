import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-iseul-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-iseul-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
