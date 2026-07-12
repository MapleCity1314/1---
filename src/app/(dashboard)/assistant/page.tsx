import { PageHeader } from "@/components/page-header";
import { Assistant } from "./assistant";

export default function AssistantPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="AI 助手" />
      <Assistant />
    </div>
  );
}
