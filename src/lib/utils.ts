import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, DashboardMetrics } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number | null | undefined): string {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return "¥" + n.toFixed(2);
}

export function pct(n: number | null | undefined): string {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return (n * 100).toFixed(1) + "%";
}

export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// 根据成本与售价自动推算利润 / 利润率
export function deriveProfit(
  cost: number | null,
  price: number | null,
): { profit: number | null; profit_rate: number | null } {
  if (cost === null || price === null) return { profit: null, profit_rate: null };
  const profit = Math.round((price - cost) * 100) / 100;
  const profit_rate = price ? Math.round((profit / price) * 10000) / 10000 : null;
  return { profit, profit_rate };
}

export function computeMetrics(items: Product[]): DashboardMetrics {
  let totalStock = 0;
  let totalCost = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  let onSaleCount = 0;
  for (const r of items) {
    const stock = r.stock ?? 0;
    totalStock += stock;
    totalCost += (r.cost ?? 0) * stock;
    totalRevenue += (r.price ?? 0) * stock;
    totalProfit += (r.profit ?? 0) * stock;
    if (r.status === "已上架") onSaleCount += 1;
  }
  return {
    count: items.length,
    totalStock,
    totalCost: Math.round(totalCost * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    onSaleCount,
  };
}
