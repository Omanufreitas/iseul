const DAILY_LIMIT = 20;

type Bucket = { day: string; count: number };

const hits = new Map<string, Bucket>();

function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function consumeAssistantQuota(ip: string): { allowed: boolean; remaining: number } {
  const day = todayKey();
  const current = hits.get(ip);
  if (!current || current.day !== day) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }
  if (current.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: DAILY_LIMIT - current.count };
}

export function recordAssistantUse(ip: string): void {
  const day = todayKey();
  const current = hits.get(ip);
  if (!current || current.day !== day) {
    hits.set(ip, { day, count: 1 });
    return;
  }
  current.count += 1;
}

export function getAssistantDailyLimit(): number {
  return DAILY_LIMIT;
}
