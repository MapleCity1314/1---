import { PageHeader } from "@/components/page-header";
import { Studio } from "@/components/studio";

export default function StudioPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="AI 绘图工坊" />
      <div className="min-h-0 flex-1 p-4 md:p-6">
        <Studio />
      </div>
    </div>
  );
}
