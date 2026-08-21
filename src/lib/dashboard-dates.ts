export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export type DashboardRange = {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
};

export function parseDashboardRange(fromParam?: string | null, toParam?: string | null): DashboardRange {
  const today = endOfDay(new Date());
  let to = toParam ? endOfDay(new Date(`${toParam}T12:00:00`)) : today;
  let from = fromParam
    ? startOfDay(new Date(`${fromParam}T12:00:00`))
    : startOfDay(addDays(today, -29));

  if (Number.isNaN(from.getTime())) from = startOfDay(addDays(today, -29));
  if (Number.isNaN(to.getTime())) to = today;
  if (from > to) {
    const tmp = from;
    from = startOfDay(to);
    to = endOfDay(tmp);
  }

  const spanMs = to.getTime() - from.getTime();
  const prevTo = endOfDay(addDays(from, -1));
  const prevFrom = startOfDay(new Date(prevTo.getTime() - spanMs));

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
    prevFrom: toDateInputValue(prevFrom),
    prevTo: toDateInputValue(prevTo),
  };
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
