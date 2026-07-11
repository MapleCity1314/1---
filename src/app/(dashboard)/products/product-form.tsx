"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deriveProfit, money, pct } from "@/lib/utils";
import { PRODUCT_STATUSES, type Product } from "@/lib/types";
import { FileDown } from "lucide-react";
import { Button, Input, Textarea, Select, Label } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";

type FormAction = (
  prev: unknown,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export function ProductForm({
  product,
  action,
  mode,
}: {
  product?: Product;
  action: FormAction;
  mode: "new" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [cost, setCost] = useState(product?.cost?.toString() ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");

  const preview = deriveProfit(
    cost === "" ? null : Number(cost),
    price === "" ? null : Number(price),
  );

  return (
    <form action={formAction} className="max-w-3xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="id">商品编号 *</Label>
          <Input
            id="id"
            name="id"
            defaultValue={product?.id}
            readOnly={mode === "edit"}
            placeholder="如 A001"
            className={mode === "edit" ? "bg-surface-soft text-muted" : ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">上架状态</Label>
          <Select
            id="status"
            name="status"
            defaultValue={product?.status ?? "待上架"}
            className="w-full"
          >
            {PRODUCT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="title">商品标题 *</Label>
          <Input id="title" name="title" defaultValue={product?.title} required />
        </div>

        <div>
          <Label htmlFor="category">分类</Label>
          <Input id="category" name="category" defaultValue={product?.category ?? ""} />
        </div>
        <div>
          <Label htmlFor="condition">成色</Label>
          <Input id="condition" name="condition" defaultValue={product?.condition ?? ""} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">商品信息</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="cost">成本价</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="price">闲鱼售价</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 rounded-md bg-surface-soft px-4 py-3 text-sm text-muted">
          自动推算：预估利润{" "}
          <b className="text-ink tabular-nums">{money(preview.profit)}</b> ·
          利润率 <b className="text-ink tabular-nums">{pct(preview.profit_rate)}</b>
        </div>

        <div>
          <Label htmlFor="stock">库存数量</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            step="1"
            defaultValue={product?.stock ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="xianyu_url">闲鱼商品链接</Label>
          <Input id="xianyu_url" name="xianyu_url" defaultValue={product?.xianyu_url ?? ""} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="image_url">商品图片</Label>
          <ImageUpload
            name="image_url"
            defaultValue={product?.image_url}
            productId={product?.id}
          />
        </div>

        {/* 虚拟资料专区 */}
        <div className="md:col-span-2 rounded-xl border border-secondary/25 bg-secondary/5 p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-secondary">
            <FileDown size={15} /> 虚拟资料交付
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="resource_url">资料链接（网盘/下载）</Label>
              <Input
                id="resource_url"
                name="resource_url"
                placeholder="https://pan.example.com/s/..."
                defaultValue={product?.resource_url ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="resource_code">提取码</Label>
              <Input
                id="resource_code"
                name="resource_code"
                placeholder="如 8xk2"
                defaultValue={product?.resource_code ?? ""}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">备注</Label>
          <Textarea id="notes" name="notes" rows={2} defaultValue={product?.notes ?? ""} />
        </div>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : mode === "new" ? "创建商品" : "保存修改"}
        </Button>
        <Link href="/products">
          <Button type="button" variant="secondary">
            取消
          </Button>
        </Link>
      </div>
    </form>
  );
}
