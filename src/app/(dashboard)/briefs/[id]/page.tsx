import { notFound } from "next/navigation";
import Link from "next/link";
import { getBrief } from "@/lib/briefs";
import { PageHeader } from "@/components/page-header";
import { AlertTriangle, ChevronLeft } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { BriefAssetSection } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatLevels(levels: number[]): string {
  return levels.length ? levels.join(" / ") : "—";
}

function AssetCard({ asset }: { asset: BriefAssetSection }) {
  const isEstimated = asset.data_source === "tavily_estimated";
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5 card-shadow">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg text-ink">{asset.display_name}</h3>
          <span className="font-mono text-xs text-muted">{asset.symbol}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            isEstimated ? "bg-warning/15 text-[#8a6d10]" : "bg-success/12 text-success",
          )}
          title={
            isEstimated
              ? "该标的位点为 AI 基于联网检索的估算值，仅供参考"
              : "该标的位点为服务端从实时行情计算得出"
          }
        >
          {isEstimated ? "AI 估算" : "实时计算"}
        </span>
      </div>

      {asset.last_price !== null && (
        <div className="mb-3 text-2xl tabular-nums text-ink">
          {asset.last_price}
        </div>
      )}

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted">支撑位</div>
          <div className="tabular-nums text-body">{formatLevels(asset.support_levels)}</div>
        </div>
        <div>
          <div className="text-xs text-muted">压力位</div>
          <div className="tabular-nums text-body">{formatLevels(asset.resistance_levels)}</div>
        </div>
      </div>

      <div className="mb-2 border-t border-hairline-soft pt-3">
        <div className="mb-1 text-xs font-medium text-muted">思路</div>
        <p className="text-sm text-body">{asset.bias}</p>
      </div>

      <div className="mb-2">
        <div className="mb-1 text-xs font-medium text-muted">进出场策略</div>
        <p className="whitespace-pre-wrap text-sm text-body">{asset.entry_plan || "—"}</p>
      </div>

      {asset.invalidation && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted">逻辑失效条件</div>
          <p className="text-sm text-body">{asset.invalidation}</p>
        </div>
      )}
    </div>
  );
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = await getBrief(id);
  if (!brief) notFound();

  const { payload } = brief;

  return (
    <div>
      <PageHeader
        title={brief.title}
        actions={
          <Link
            href="/briefs"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-card px-4 text-sm font-medium text-ink hover:bg-surface-card"
          >
            <ChevronLeft size={15} />
            返回列表
          </Link>
        }
      />

      <div className="mx-auto max-w-4xl space-y-5 px-6 py-7">
        {brief.event_note && (
          <div className="rounded-xl border border-hairline bg-surface-soft px-4 py-3 text-sm text-body">
            关键节点：{brief.event_note}
          </div>
        )}

        {/* 今日结论 */}
        <div className="rounded-[22px] border border-hairline bg-card p-6 card-shadow">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            今日结论
          </div>
          <p className="text-base leading-relaxed text-ink">{payload.conclusion}</p>
        </div>

        {/* 各标的 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {payload.assets.map((asset) => (
            <AssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>

        {/* 时间表 */}
        {payload.watch_schedule.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-card p-5 card-shadow">
            <h4 className="mb-2 font-medium text-body-strong">今日重点关注时间表</h4>
            <ul className="space-y-1 text-sm text-body">
              {payload.watch_schedule.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 风险提醒 */}
        {payload.risk_notes.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-card p-5 card-shadow">
            <h4 className="mb-2 flex items-center gap-1.5 font-medium text-body-strong">
              <AlertTriangle size={16} className="text-warning" />
              风险提醒与禁止交易条件
            </h4>
            <ul className="space-y-1 text-sm text-body">
              {payload.risk_notes.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 来源与免责声明 */}
        <div className="rounded-2xl border border-hairline-soft bg-surface-soft/50 p-5 text-xs text-muted">
          <div className="mb-1.5">
            参考来源：{payload.sources.join("、")}
          </div>
          <p>{payload.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
