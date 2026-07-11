"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { PRODUCT_STATUSES } from "@/lib/types";
import { money, pct, cn } from "@/lib/utils";
import { Input, Select, StatusPill } from "@/components/ui";
import { deleteProductAction } from "./actions";

type SortKey = "updated_at" | "price" | "profit" | "stock" | "profit_rate";

export function ProductList({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))] as string[],
    [products],
  );

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let rows = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!status || p.status === status) &&
        (!kw ||
          [p.id, p.title, p.category, p.description, p.notes]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(kw)),
    );
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * sortDir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * sortDir;
    });
    return rows;
  }, [products, q, cat, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索编号 / 标题 / 备注"
          className="w-64"
        />
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          {PRODUCT_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <span className="ml-auto text-sm text-muted">
          显示 {filtered.length} / {products.length}
        </span>
        <div className="flex overflow-hidden rounded-md border border-hairline">
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              view === "table" ? "bg-surface-dark text-on-dark" : "bg-white text-muted",
            )}
            aria-label="表格视图"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("card")}
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              view === "card" ? "bg-surface-dark text-on-dark" : "bg-white text-muted",
            )}
            aria-label="卡片视图"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-white py-20 text-center text-muted">
          没有匹配的商品
        </div>
      ) : view === "table" ? (
        <TableView
          rows={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          onCopy={copy}
          copied={copied}
        />
      ) : (
        <CardView rows={filtered} onCopy={copy} copied={copied} />
      )}
    </div>
  );
}

type CopyFn = (text: string, id: string) => void;

function SortHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-3 py-2.5 text-right font-medium text-muted hover:text-ink"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          size={12}
          className={active ? "text-primary" : "text-muted-soft"}
        />
        {active && <span className="text-primary">{dir === 1 ? "↑" : "↓"}</span>}
      </span>
    </th>
  );
}

function ResourceLink({
  url,
  code,
  id,
  onCopy,
  copied,
}: {
  url: string | null;
  code: string | null;
  id: string;
  onCopy: CopyFn;
  copied: string | null;
}) {
  if (!url) return <span className="text-muted-soft">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-[160px] items-center gap-1 truncate text-secondary hover:underline"
        title={url}
      >
        <ExternalLink size={13} className="shrink-0" />
        <span className="truncate">{url}</span>
      </a>
      <button
        onClick={() => onCopy(code ? `${url} 提取码:${code}` : url, id)}
        className="shrink-0 text-muted hover:text-ink"
        title={code ? "复制链接和提取码" : "复制链接"}
      >
        {copied === id ? (
          <Check size={13} className="text-success" />
        ) : (
          <Copy size={13} />
        )}
      </button>
      {code && (
        <span className="shrink-0 rounded bg-surface-strong px-1.5 py-0.5 text-xs text-muted">
          {code}
        </span>
      )}
    </div>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`确定删除商品「${title}」(${id})？此操作不可撤销。`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-error/10 hover:text-error"
        title="删除"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}

function TableView({
  rows,
  sortKey,
  sortDir,
  onSort,
  onCopy,
  copied,
}: {
  rows: Product[];
  sortKey: SortKey;
  sortDir: 1 | -1;
  onSort: (k: SortKey) => void;
  onCopy: CopyFn;
  copied: string | null;
}) {
  return (
    <div className="overflow-auto rounded-xl border border-hairline bg-white">
      <table className="w-full text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-hairline bg-surface-soft text-left">
            <th className="px-3 py-2.5 font-medium text-muted">编号</th>
            <th className="px-3 py-2.5 font-medium text-muted">标题</th>
            <th className="px-3 py-2.5 font-medium text-muted">分类</th>
            <th className="px-3 py-2.5 font-medium text-muted">状态</th>
            <SortHead label="成本" active={false} dir={sortDir} onClick={() => {}} />
            <SortHead
              label="售价"
              active={sortKey === "price"}
              dir={sortDir}
              onClick={() => onSort("price")}
            />
            <SortHead
              label="利润"
              active={sortKey === "profit"}
              dir={sortDir}
              onClick={() => onSort("profit")}
            />
            <SortHead
              label="利润率"
              active={sortKey === "profit_rate"}
              dir={sortDir}
              onClick={() => onSort("profit_rate")}
            />
            <SortHead
              label="库存"
              active={sortKey === "stock"}
              dir={sortDir}
              onClick={() => onSort("stock")}
            />
            <th className="px-3 py-2.5 font-medium text-muted">虚拟资料链接</th>
            <th className="px-3 py-2.5 text-right font-medium text-muted">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-hairline-soft hover:bg-surface-soft/50">
              <td className="px-3 py-2.5 font-mono text-xs text-body">{p.id}</td>
              <td className="max-w-[220px] truncate px-3 py-2.5 text-ink" title={p.title}>
                {p.title}
              </td>
              <td className="px-3 py-2.5 text-body">{p.category || "—"}</td>
              <td className="px-3 py-2.5">
                <StatusPill status={p.status} />
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-body">{money(p.cost)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-body">{money(p.price)}</td>
              <td
                className={cn(
                  "px-3 py-2.5 text-right tabular-nums",
                  (p.profit ?? 0) > 0 ? "text-success" : (p.profit ?? 0) < 0 ? "text-error" : "text-body",
                )}
              >
                {money(p.profit)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-body">{pct(p.profit_rate)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-body">{p.stock ?? 0}</td>
              <td className="px-3 py-2.5">
                <ResourceLink
                  url={p.resource_url}
                  code={p.resource_code}
                  id={p.id}
                  onCopy={onCopy}
                  copied={copied}
                />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/products/${p.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-card hover:text-ink"
                    title="编辑"
                  >
                    <Pencil size={15} />
                  </Link>
                  <DeleteButton id={p.id} title={p.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardView({
  rows,
  onCopy,
  copied,
}: {
  rows: Product[];
  onCopy: CopyFn;
  copied: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((p) => (
        <div key={p.id} className="rounded-xl border border-hairline bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-xs text-muted">{p.id}</div>
              <h3 className="truncate font-medium text-ink" title={p.title}>
                {p.title}
              </h3>
            </div>
            <StatusPill status={p.status} />
          </div>
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-muted">
              售价 <span className="text-ink tabular-nums">{money(p.price)}</span>
            </span>
            <span className="text-muted">
              利润{" "}
              <span
                className={cn(
                  "tabular-nums",
                  (p.profit ?? 0) > 0 ? "text-success" : "text-body",
                )}
              >
                {money(p.profit)}
              </span>
            </span>
            <span className="text-muted">
              库存 <span className="text-ink tabular-nums">{p.stock ?? 0}</span>
            </span>
          </div>
          <div className="mb-3 border-t border-hairline-soft pt-2 text-xs">
            <span className="text-muted">虚拟资料：</span>
            <ResourceLink
              url={p.resource_url}
              code={p.resource_code}
              id={p.id}
              onCopy={onCopy}
              copied={copied}
            />
          </div>
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/products/${p.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-card hover:text-ink"
              title="编辑"
            >
              <Pencil size={15} />
            </Link>
            <DeleteButton id={p.id} title={p.title} />
          </div>
        </div>
      ))}
    </div>
  );
}
