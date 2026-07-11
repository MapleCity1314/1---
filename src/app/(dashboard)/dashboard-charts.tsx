"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";

const PALETTE = ["#cc785c", "#5db8a6", "#e8a55a", "#243b53", "#5db872", "#a9583e", "#8e8b82"];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-white p-5">
      <h3 className="mb-4 text-sm font-medium text-body-strong">{title}</h3>
      {children}
    </div>
  );
}

export function DashboardCharts({ products }: { products: Product[] }) {
  // 分类分布（按商品数）
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const k = p.category || "未分类";
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [products]);

  // 上架状态占比
  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const k = p.status || "未知";
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [products]);

  // 利润 Top 10（按单件利润 × 库存的总利润贡献）
  const topProfit = useMemo(() => {
    return [...products]
      .map((p) => ({
        name: p.title.length > 10 ? p.title.slice(0, 10) + "…" : p.title,
        利润: Math.round(((p.profit ?? 0) * (p.stock ?? 0)) * 100) / 100,
      }))
      .filter((x) => x.利润 !== 0)
      .sort((a, b) => b.利润 - a.利润)
      .slice(0, 10);
  }, [products]);

  // 库存 Top 10
  const topStock = useMemo(() => {
    return [...products]
      .map((p) => ({
        name: p.title.length > 10 ? p.title.slice(0, 10) + "…" : p.title,
        库存: p.stock ?? 0,
      }))
      .filter((x) => x.库存 > 0)
      .sort((a, b) => b.库存 - a.库存)
      .slice(0, 10);
  }, [products]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="分类分布">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={byCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(e) => `${e.name} ${e.value}`}
            >
              {byCategory.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="上架状态占比">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={byStatus}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              label={(e) => `${e.name} ${e.value}`}
            >
              {byStatus.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="利润贡献 Top 10（利润 × 库存）">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProfit} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} stroke="#ebe6df" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#6c6a64" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: "#6c6a64" }}
            />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Bar dataKey="利润" fill="#cc785c" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="库存 Top 10">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topStock} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} stroke="#ebe6df" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#6c6a64" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: "#6c6a64" }}
            />
            <Tooltip />
            <Bar dataKey="库存" fill="#5db8a6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
