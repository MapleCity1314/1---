import Link from "next/link";
import { listProducts } from "@/lib/products";
import { computeMetrics, money } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { Plus } from "@/components/icons";
import { DashboardCharts } from "./dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await listProducts();
  const m = computeMetrics(products);

  const cards = [
    { label: "商品数", value: String(m.count), tone: "text-ink" },
    { label: "已上架", value: String(m.onSaleCount), tone: "text-secondary" },
    { label: "总库存", value: String(m.totalStock), tone: "text-ink" },
    { label: "总成本", value: money(m.totalCost), tone: "text-ink" },
    { label: "预估营收", value: money(m.totalRevenue), tone: "text-ink" },
  ];

  return (
    <div>
      <PageHeader
        title="观测面板"
        subtitle="库存与利润的实时概览"
        status={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-body card-shadow">
            <span className="h-2 w-2 rounded-full bg-success" />
            运行中
          </span>
        }
      />

      <div className="mx-auto max-w-4xl space-y-4 px-6 py-6">
        {/* Hero 渐变卡：核心利润 + 营收进度 + 主按钮 */}
        <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-white p-7 card-shadow">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, transparent 40%, rgba(19,166,136,0.10) 100%)",
            }}
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted">
                  预估总利润
                </div>
                <div className="mt-2 font-display text-[44px] leading-none text-ink">
                  {money(m.totalProfit)}
                </div>
              </div>
              <Link href="/products/new">
                <Button>
                  <Plus size={16} />
                  新增商品
                </Button>
              </Link>
            </div>

            {/* 成本占营收进度条 */}
            <div className="mt-7">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted">成本 / 营收</span>
                <span className="tabular-nums text-body">
                  {money(m.totalCost)} / {money(m.totalRevenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-surface-dark"
                  style={{
                    width: `${
                      m.totalRevenue > 0
                        ? Math.min(100, (m.totalCost / m.totalRevenue) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 指标卡 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-hairline bg-white p-4 card-shadow"
            >
              <div className="text-xs font-medium text-muted">{c.label}</div>
              <div className={`mt-2 font-display text-2xl ${c.tone}`}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-hairline-strong bg-white py-20 text-center text-muted card-shadow">
            还没有商品数据。先去
            <Link href="/products/new" className="text-secondary hover:underline">
              新增商品
            </Link>
            ，或用导入脚本把 Excel 台账导进来。
          </div>
        ) : (
          <DashboardCharts products={products} />
        )}
      </div>
    </div>
  );
}
