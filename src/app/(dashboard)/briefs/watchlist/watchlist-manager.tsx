"use client";

import { useActionState, useEffect, useState } from "react";
import type { WatchlistItem } from "@/lib/types";
import { ASSET_TYPES, type AssetType } from "@/lib/types";
import { Button, Input, Label, Select } from "@/components/ui";
import { Pencil, Trash, Plus } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  createWatchlistItemAction,
  updateWatchlistItemAction,
  deleteWatchlistItemAction,
} from "./actions";

const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  crypto: "加密货币",
  commodity: "商品/贵金属",
  stock: "个股",
  macro: "宏观",
};

type ItemFormAction = (
  prev: unknown,
  formData: FormData,
) => Promise<{ error?: string | null } | undefined>;

function ItemFields({ item }: { item?: WatchlistItem }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor="symbol">标的代码 *</Label>
        <Input
          id="symbol"
          name="symbol"
          defaultValue={item?.symbol}
          placeholder="如 BTCUSDT / XAUUSD"
          required
        />
      </div>
      <div>
        <Label htmlFor="display_name">展示名 *</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={item?.display_name}
          placeholder="如 BTC / 黄金"
          required
        />
      </div>
      <div>
        <Label htmlFor="asset_type">类型</Label>
        <Select id="asset_type" name="asset_type" defaultValue={item?.asset_type ?? "crypto"} className="w-full">
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="binance_symbol">Binance 符号（可空）</Label>
        <Input
          id="binance_symbol"
          name="binance_symbol"
          defaultValue={item?.binance_symbol ?? ""}
          placeholder="能在 Binance 拉到 K 线时填，如 BTCUSDT"
        />
      </div>
      <div>
        <Label htmlFor="sort_order">排序（越小越靠前）</Label>
        <Input id="sort_order" name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
      </div>
      <div className="flex items-center gap-2 pt-6">
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={item?.enabled ?? true}
          className="h-4 w-4 rounded border-hairline"
        />
        <Label htmlFor="enabled" className="mb-0">
          启用（生成研报时纳入）
        </Label>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">备注</Label>
        <Input id="notes" name="notes" defaultValue={item?.notes ?? ""} />
      </div>
    </div>
  );
}

function AddItemForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState<
    { error?: string | null } | undefined,
    FormData
  >(createWatchlistItemAction as ItemFormAction, undefined);

  // 提交成功（state 存在且无 error）后关闭表单——放在 effect 里，不在渲染阶段调用父组件的 setState
  useEffect(() => {
    if (state && !state.error) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="rounded-2xl border border-hairline bg-card p-5 card-shadow">
      <ItemFields />
      {state?.error && <p className="mt-3 text-sm text-error">{state.error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          取消
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "新增"}
        </Button>
      </div>
    </form>
  );
}

function EditItemRow({ item, onDone }: { item: WatchlistItem; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<
    { error?: string | null } | undefined,
    FormData
  >(updateWatchlistItemAction as ItemFormAction, undefined);

  useEffect(() => {
    if (state && !state.error) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="rounded-2xl border border-hairline bg-surface-soft/60 p-5">
      <input type="hidden" name="id" value={item.id} />
      <ItemFields item={item} />
      {state?.error && <p className="mt-3 text-sm text-error">{state.error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          取消
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteWatchlistItemAction}
      onSubmit={(e) => {
        if (!confirm(`确定删除关注标的「${name}」？此操作不可撤销。`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-error/10 hover:text-error"
        title="删除"
      >
        <Trash size={15} />
      </button>
    </form>
  );
}

export function WatchlistManager({ items }: { items: WatchlistItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} />
            新增标的
          </Button>
        )}
      </div>

      {adding && <AddItemForm onDone={() => setAdding(false)} />}

      {items.length === 0 && !adding ? (
        <div className="rounded-[22px] border border-dashed border-hairline-strong bg-card py-20 text-center text-muted card-shadow">
          关注清单为空，先新增至少一个标的才能生成研报。
        </div>
      ) : (
        items.map((item) =>
          editingId === item.id ? (
            <EditItemRow key={item.id} item={item} onDone={() => setEditingId(null)} />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-card p-4 card-shadow"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    item.enabled ? "bg-success" : "bg-muted-soft",
                  )}
                  title={item.enabled ? "已启用" : "已停用"}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{item.display_name}</span>
                    <span className="font-mono text-xs text-muted">{item.symbol}</span>
                    <span className="rounded-full bg-surface-strong px-2 py-0.5 text-xs text-muted">
                      {ASSET_TYPE_LABEL[item.asset_type]}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="mt-0.5 truncate text-xs text-muted" title={item.notes}>
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-card hover:text-ink"
                  title="编辑"
                >
                  <Pencil size={15} />
                </button>
                <DeleteButton id={item.id} name={item.display_name} />
              </div>
            </div>
          ),
        )
      )}
    </div>
  );
}
