/** Validação de CPF/CNPJ (dígitos verificadores). */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function allSameDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

export function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || allSameDigits(d)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(d[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(d[10]);
}

export function isValidCnpj(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14 || allSameDigits(d)) return false;

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * w1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (d1 !== Number(d[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += Number(d[i]) * w2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return d2 === Number(d[13]);
}

export function isValidCpfCnpj(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length === 11) return isValidCpf(d);
  if (d.length === 14) return isValidCnpj(d);
  return false;
}

export function validateCpfCnpjMessage(value: string): string | null {
  const d = onlyDigits(value);
  if (!d) {
    return "Informe o CPF ou CNPJ do remetente em Admin → Configurações.";
  }
  if (d.length !== 11 && d.length !== 14) {
    return "CPF deve ter 11 dígitos ou CNPJ 14 dígitos (somente números).";
  }
  if (!isValidCpfCnpj(d)) {
    return "CPF/CNPJ do remetente inválido. Confira em Admin → Configurações.";
  }
  return null;
}
