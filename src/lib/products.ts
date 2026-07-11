import "server-only";
import { createClient } from "@/lib/supabase/server";
import { deriveProfit } from "@/lib/utils";
import type { Product, ProductInput } from "@/lib/types";

// 读取全部商品（按更新时间倒序）
export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Product) ?? null;
}

// 当前登录用户邮箱（写入 updated_by 审计字段）
async function currentEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// 规整入库数据：自动推算利润 / 利润率、补审计字段
function normalize(input: ProductInput, email: string | null) {
  const { profit, profit_rate } = deriveProfit(
    input.cost ?? null,
    input.price ?? null,
  );
  return {
    ...input,
    profit: input.profit ?? profit,
    profit_rate: input.profit_rate ?? profit_rate,
    updated_by: email,
  };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("products")
    .insert(normalize(input, email))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const supabase = await createClient();
  const email = await currentEmail();
  const payload = normalize(input, email);
  // 不允许通过 update 改主键
  delete (payload as Partial<ProductInput>).id;
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
