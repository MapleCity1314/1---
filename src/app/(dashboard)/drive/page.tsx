import { listNodes, getBreadcrumb } from "@/lib/drive";
import { PageHeader } from "@/components/page-header";
import { DriveBrowser } from "./drive-browser";

export const dynamic = "force-dynamic";

export default async function DrivePage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const parentId = folder || null;

  const [nodes, breadcrumb] = await Promise.all([
    listNodes(parentId),
    getBreadcrumb(parentId),
  ]);

  return (
    <div>
      <PageHeader
        title="文档库"
        subtitle={`共 ${nodes.length} 项`}
        breadcrumb="平台"
      />
      <div className="mx-auto max-w-5xl px-8 py-7">
        <DriveBrowser nodes={nodes} breadcrumb={breadcrumb} currentFolderId={parentId} />
      </div>
    </div>
  );
}
