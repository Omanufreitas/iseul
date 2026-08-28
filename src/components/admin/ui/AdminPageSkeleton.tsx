export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-neutral-200/70" />
        ))}
      </div>
      <div className="h-32 rounded-2xl bg-neutral-200/70" />
      <div className="h-64 rounded-2xl bg-neutral-200/70" />
    </div>
  );
}
