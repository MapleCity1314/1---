"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { ImagePlus, X, Loader, ImageOff } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "product-images";
const MAX_SIZE_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function extFromFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] || "jpg";
}

/**
 * 商品图片上传：支持点击选择 / 拖拽 / 粘贴，直接把文件上传到 Supabase
 * Storage 的 product-images 公共桶，回填 public URL。不再提供手填链接输入框。
 */
export function ImageUpload({
  name,
  defaultValue,
  productId,
}: {
  name: string;
  defaultValue?: string | null;
  productId?: string;
}) {
  const [url, setUrl] = useState<string | null>(defaultValue ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("仅支持 JPG / PNG / WEBP / GIF 图片");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`图片不能超过 ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${productId || "new"}/${Date.now()}.${extFromFile(file)}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败，请重试");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  return (
    <div>
      <input type="hidden" name={name} value={url ?? ""} />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {url ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- 远程用户上传图片，域名随部署环境变化，无法静态配置 next/image remotePatterns */}
          <img
            src={url}
            alt="商品图片预览"
            className="h-24 w-24 rounded-md border border-hairline object-cover"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm text-secondary hover:underline"
            >
              更换图片
            </button>
            <button
              type="button"
              onClick={() => setUrl(null)}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-error"
            >
              <X size={14} />
              移除
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) handleFiles(e.dataTransfer.files);
          }}
          onPaste={(e) => {
            const file = Array.from(e.clipboardData.files)[0];
            if (file && !uploading) void upload(file);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "flex h-24 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-sm outline-none transition-colors",
            dragOver
              ? "border-primary bg-primary/5 text-primary-active"
              : "border-hairline bg-canvas text-muted hover:border-primary hover:text-primary-active",
          )}
        >
          {uploading ? (
            <>
              <Loader size={18} className="animate-spin" />
              上传中…
            </>
          ) : (
            <>
              <ImagePlus size={18} />
              点击 / 拖拽 / 粘贴上传图片
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-error">
          <ImageOff size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
