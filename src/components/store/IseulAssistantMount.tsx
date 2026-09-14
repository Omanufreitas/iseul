import { IseulAssistant } from "@/components/store/IseulAssistant";
import { isIseulAssistantEnabled } from "@/lib/assistant/enabled";

export function IseulAssistantMount() {
  if (!isIseulAssistantEnabled()) return null;
  return <IseulAssistant />;
}
