export type ChatTurn = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 8;
const MAX_TURN_CHARS = 1200;

export function clipChatText(text: string, max = MAX_TURN_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

/** Histórico enviado à API: últimas falas, sem a mensagem atual, cada uma limitada. */
export function prepareChatHistory(messages: ChatTurn[], currentMessage: string): ChatTurn[] {
  return messages
    .filter((item) => item.content.trim() && item.content.trim() !== currentMessage.trim())
    .slice(-MAX_HISTORY)
    .map((item) => ({
      role: item.role,
      content: clipChatText(item.content),
    }));
}
