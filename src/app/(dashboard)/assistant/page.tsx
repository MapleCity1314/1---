import { PageHeader } from "@/components/page-header";
import { Assistant } from "./assistant";

export default function AssistantPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="AI 助手" subtitle="用大白话查数据、改商品、写文案 · DeepSeek 驱动" />
      <Assistant />
    </div>
  );
}
