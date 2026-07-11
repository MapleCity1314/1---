/**
 * 一次性导入脚本：把闲鱼台账 Excel 导入 Supabase products 表。
 *
 * 用法（在项目根目录）：
 *   1. 先把 .env.local 配好 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
 *   2. npx tsx scripts/import-xlsx.ts "legacy/闲鱼一元小店商品台账模板.xlsx"
 *
 * 说明：用 service_role 密钥绕过 RLS 批量写入；重复编号会被覆盖（upsert）。
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { resolve } from "node:path";

config({ path: ".env.local" });

// Excel 中文表头 → 数据库字段
const MAP: Record<string, string> = {
  编号: "id",
  商品标题: "title",
  分类: "category",
  成色: "condition",
  商品信息: "description",
  成本价: "cost",
  闲鱼售价: "price",
  预估利润: "profit",
  利润率: "profit_rate",
  库存数量: "stock",
  上架状态: "status",
  图片链接: "image_url",
  闲鱼链接: "xianyu_url",
  资料链接: "resource_url",
  提取码: "resource_code",
  备注: "notes",
};

const NUMERIC = new Set(["cost", "price", "profit", "profit_rate", "stock"]);

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

import { existsSync } from "node:fs";

function findDefaultFile(): string | null {
  const candidates = [
    "legacy/闲鱼一元小店商品台账模板.xlsx",
    "闲鱼一元小店商品台账模板.xlsx",
  ];
  return candidates.find((c) => existsSync(resolve(c))) ?? null;
}

async function main() {
  const file = process.argv[2] || findDefaultFile();
  if (!file) {
    console.error(
      "找不到台账文件。请把 xlsx 路径作为参数传入：npx tsx scripts/import-xlsx.ts \"路径/台账.xlsx\"",
    );
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "缺少环境变量：请在 .env.local 里配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const wb = XLSX.readFile(resolve(file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

  const rows = raw
    .map((r) => {
      const out: Record<string, unknown> = {};
      for (const [zh, en] of Object.entries(MAP)) {
        if (!(zh in r)) continue;
        out[en] = NUMERIC.has(en) ? num(r[zh]) : r[zh];
      }
      return out;
    })
    .filter((r) => r.id != null && String(r.id).trim() !== "");

  if (rows.length === 0) {
    console.error("没有可导入的数据行（请检查表头是否含「编号」列）。");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { error, count } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "id", count: "exact" });

  if (error) {
    console.error("导入失败：", error.message);
    process.exit(1);
  }
  console.log(`✅ 导入完成，共写入 ${count ?? rows.length} 条商品。`);
}

main();
