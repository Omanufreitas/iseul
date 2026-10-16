export type TotalExpressCredentials = {
  login: string;
  password: string;
  reid: string;
  token: string;
  service: string;
};

export function getTotalExpressCredentials(): TotalExpressCredentials | null {
  const login = process.env.TOTAL_EXPRESS_LOGIN?.trim() ?? "";
  const password = process.env.TOTAL_EXPRESS_PASSWORD?.trim() ?? "";
  const reid = process.env.TOTAL_EXPRESS_REID?.trim() ?? "";
  const token = process.env.TOTAL_EXPRESS_TOKEN?.trim() ?? "";
  if (!login || !password || !reid || !token) return null;
  return {
    login,
    password,
    reid,
    token,
    service: process.env.TOTAL_EXPRESS_SERVICE?.trim() || "EXP",
  };
}

export function isTotalExpressConfigured(): boolean {
  return getTotalExpressCredentials() !== null;
}
