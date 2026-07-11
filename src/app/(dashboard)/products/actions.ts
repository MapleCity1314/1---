"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { num } from "@/lib/utils";
import { PRODUCT_STATUSES, type ProductInput, type ProductStatus } from "@/lib/types";

function parseForm(formData: FormData): ProductInput {
  const str = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const statusRaw = str("status");
  const status: ProductStatus | null =
    statusRaw && (PRODUCT_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as ProductStatus)
      : null;

  return {
    id: String(formData.get("id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    category: str("category"),
    condition: str("condition"),
    description: str("description"),
    cost: num(formData.get("cost")),
    price: num(formData.get("price")),
    profit: null, // 交由服务端自动推算
    profit_rate: null,
    stock: num(formData.get("stock")) ?? 0,
    status,
    image_url: str("image_url"),
    xianyu_url: str("xianyu_url"),
    resource_url: str("resource_url"),
    resource_code: str("resource_code"),
    notes: str("notes"),
  };
}

export async function createProductAction(_prev: unknown, formData: FormData) {
  const input = parseForm(formData);
  if (!input.id) return { error: "商品编号不能为空" };
  if (!input.title) return { error: "商品标题不能为空" };
  try {
    await createProduct(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return { error: msg.includes("duplicate") ? "该商品编号已存在" : "创建失败：" + msg };
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/products");
}

export async function updateProductAction(_prev: unknown, formData: FormData) {
  const input = parseForm(formData);
  if (!input.id) return { error: "缺少商品编号" };
  if (!input.title) return { error: "商品标题不能为空" };
  try {
    await updateProduct(input.id, input);
  } catch (e) {
    return { error: "更新失败：" + (e instanceof Error ? e.message : "未知错误") };
  }
  revalidatePath("/products");
  revalidatePath(`/products/${input.id}`);
  revalidatePath("/");
  redirect("/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/products");
  revalidatePath("/");
}
