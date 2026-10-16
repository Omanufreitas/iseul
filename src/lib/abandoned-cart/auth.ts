import { timingSafeEqual } from "node:crypto";

export function isRoboAuthorized(header: string | null): boolean {
  const expected = process.env.ROBO_API_TOKEN?.trim() ?? "";
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length).trim();
  const provided = Buffer.from(token);
  const stored = Buffer.from(expected);
  if (provided.length !== stored.length) return false;
  return timingSafeEqual(provided, stored);
}
