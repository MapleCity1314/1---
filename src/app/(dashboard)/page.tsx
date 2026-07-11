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
    { label: "预估总利润", value: money(m.totalProfit), tone: "text-primary-active" },
  ];

  return (
    <div>
      <PageHeader
        title="观测面板"
        subtitle="库存与利润的实时概览"
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
            <div key={c.label} className="rounded-lg border border-hairline bg-white p-4">
              <div className={`font-display text-3xl ${c.tone}`}>{c.value}</div>
              <div className="mt-1 text-xs text-muted">{c.label}</div>
            </div>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-hairline bg-white py-20 text-center text-muted">
            还没有商品数据。先去
            <Link href="/products/new" className="text-primary hover:underline">
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
