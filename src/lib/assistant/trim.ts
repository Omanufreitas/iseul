const FILLER_PATTERNS = [
  /\s*Se tiver(?: mais)? dúvidas[^.!?]*[.!?]\s*/gi,
  /\s*Se precisar(?: de mais informações)?[^.!?]*[.!?]\s*/gi,
  /\s*Estou aqui para ajudar[^.!?]*[.!?]\s*/gi,
  /\s*Fico à disposição[^.!?]*[.!?]\s*/gi,
  /\s*Qualquer coisa, é só (?:perguntar|chamar)[^.!?]*[.!?]\s*/gi,
  /\s*Espero ter ajudado[^.!?]*[.!?]\s*/gi,
];

export function trimAssistantResponse(text: string): string {
  let result = text.replace(/\r\n/g, "\n").trim();
  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, "\n").trim();
  }
  return result.replace(/[^\S\n]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
