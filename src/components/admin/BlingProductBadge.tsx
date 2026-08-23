import { blingProductSyncLabel } from "@/lib/bling/product-fiscal";

export function BlingProductBadge({
  status,
  title,
}: {
  status: string | null | undefined;
  title?: string | null;
}) {
  const label = blingProductSyncLabel(status);
  const className =
    status === "synced"
      ? "bg-green-100 text-green-800"
      : status === "error"
        ? "bg-red-100 text-red-800"
        : status === "pending"
          ? "bg-amber-100 text-amber-800"
          : "bg-neutral-100 text-neutral-600";

  return (
    <span
      title={title ?? undefined}
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}
