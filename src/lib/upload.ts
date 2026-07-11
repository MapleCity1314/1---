import { createClient } from "@/lib/supabase/client";

/**
 * 商品图片上传的共享逻辑：校验类型/大小 → 上传到 Supabase Storage 的
 * product-images 公共桶 → 返回 public URL。
 * 商品表单（image-upload.tsx）和 AI 助手的输入框附件都复用这里，保证
 * 桶、路径规则、体积限制完全一致。
 */

export const IMAGE_BUCKET = "product-images";
export const MAX_IMAGE_SIZE_MB = 8;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

function extFromFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] || "jpg";
}

export type UploadOk = { ok: true; url: string };
export type UploadErr = { ok: false; error: string };

/**
 * 校验并上传单张图片。失败时返回 { ok:false, error }，不抛异常，
 * 方便调用方直接把 error 展示到 UI。
 * @param scope 存储路径前缀（商品编号；聊天附件传 "chat"）
 */
export async function uploadImage(
  file: File,
  scope = "new",
): Promise<UploadOk | UploadErr> {
  if (!isAcceptedImage(file)) {
    return { ok: false, error: "仅支持 JPG / PNG / WEBP / GIF 图片" };
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return { ok: false, error: `图片不能超过 ${MAX_IMAGE_SIZE_MB}MB` };
  }

  try {
    const supabase = createClient();
    const path = `${scope}/${Date.now()}.${extFromFile(file)}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "上传失败，请重试" };
  }
}
