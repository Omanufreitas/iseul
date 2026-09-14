import { IseulAssistant } from "@/components/store/IseulAssistant";
import { isOpenAIConfigured } from "@/lib/openai/client";

export function IseulAssistantMount() {
  if (!isOpenAIConfigured()) return null;
  return <IseulAssistant />;
}
