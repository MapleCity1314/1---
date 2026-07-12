"use client";

// 图片预览：签名 URL 直接喂给原生 <img>，居中缩放展示。
export function ImageViewer({ url, name }: { url: string; name: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-surface-soft p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- 短时签名 URL，域名随部署环境变化 */}
      <img src={url} alt={name} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
