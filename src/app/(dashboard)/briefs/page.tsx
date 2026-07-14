import Link from "next/link";
import { listBriefs } from "@/lib/briefs";
import { PageHeader } from "@/components/page-header";
import { List, LineChart } from "@/components/icons";
import { GenerateBriefButton } from "./generate-brief-button";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  daily: "每日",
  manual: "手动",
  event: "关键节点",
};

export default async function BriefsPage() {
  const briefs = await listBriefs();

  return (
    <div>
      <PageHeader
        title="盘面研报"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/briefs/watchlist"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-card px-4 text-sm font-medium text-ink hover:bg-surface-card"
            >
              <List size={15} />
              关注清单
            </Link>
            <GenerateBriefButton />
          </div>
        }
      />

      <div className="mx-auto max-w-4xl px-6 py-7">
        {briefs.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-hairline-strong bg-card py-20 text-center text-muted card-shadow">
            还没有研报。先去
            <Link href="/briefs/watchlist" className="text-secondary hover:underline">
              配置关注清单
            </Link>
            ，再点击「生成今日研报」。
          </div>
        ) : (
          <div className="space-y-3">
            {briefs.map((b) => (
              <Link
                key={b.id}
                href={`/briefs/${b.id}`}
                className="block rounded-2xl border border-hairline bg-card p-5 card-shadow transition-colors hover:bg-surface-soft/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <LineChart size={16} className="shrink-0 text-secondary" />
                      <h3 className="truncate font-display text-lg text-ink">{b.title}</h3>
                    </div>
                    {b.summary && (
                      <p className="line-clamp-2 text-sm text-muted">{b.summary}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center rounded-full bg-surface-strong px-2.5 py-0.5 text-xs font-medium text-muted">
                      {SCOPE_LABEL[b.scope] ?? b.scope}
                    </span>
                    <div className="mt-1.5 text-xs text-muted-soft">
                      {new Date(b.generated_at).toLocaleString("zh-CN", {
                        timeZone: "Asia/Shanghai",
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
