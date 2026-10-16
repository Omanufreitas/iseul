export function normalizarTelefone(value: string): string {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function samePhone(left: string, right: string): boolean {
  const a = left.replace(/\D/g, "");
  const b = right.replace(/\D/g, "");
  if (!a || !b) return false;
  const local = (value: string) => (value.startsWith("55") && value.length > 11 ? value.slice(2) : value);
  return local(a) === local(b);
}

export function displayPhone(stored: string): string {
  const digits = stored.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  return local;
}
