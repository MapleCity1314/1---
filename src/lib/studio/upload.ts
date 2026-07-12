import { createClient } from "@/lib/supabase/server";

const IMAGE_BUCKET = "product-images";

/**
 * 服务端图片上传：AI 生成的图片（base64）→ Supabase Storage。
 * 复用商品图片的 product-images 公共桶，路径加 studio/ 前缀区分，
 * 不需要新建桶或 RLS 策略。
 */
export async function uploadGeneratedImage(
  base64: string,
  mediaType: string,
  filenamePrefix: string,
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const ext = mediaType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "png";
  const filename = `studio/${filenamePrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filename, buffer, { contentType: mediaType, cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
