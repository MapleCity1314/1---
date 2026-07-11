import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts } from "@/lib/products";
import { computeMetrics, money } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { DashboardCharts } from "./dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await listProducts();
  const m = computeMetrics(products);

  const cards = [
    { label: "商品数", value: m.count, tone: "text-ink" },
    { label: "已上架", value: m.onSaleCount, tone: "text-success" },
    { label: "总库存", value: m.totalStock, tone: "text-ink" },
    { label: "总成本", value: money(m.totalCost), tone: "text-ink" },
    { label: "预估营收", value: money(m.totalRevenue), tone: "text-ink" },
    { label: "预估总利润", value: money(m.totalProfit), tone: "text-success" },
  ];

  return (
    <div>
      <PageHeader
        title="观测面板"
        subtitle="库存与利润的实时概览"
        status={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-body shadow-sm">
            <span className="h-2 w-2 rounded-full bg-success" />
            运行中
          </span>
        }
        actions={
          <Link href="/products/new">
            <Button>
              <Plus size={16} />
              新增商品
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 p-8">
        {/* 指标卡 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-hairline bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-muted-soft">
                {c.label}
              </div>
              <div className={`mt-2 font-display text-3xl ${c.tone}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hairline bg-white py-20 text-center text-muted">
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
