"use client";

// PDF 预览：浏览器原生 PDF 渲染器，签名 URL 直接喂给 iframe。
export function PdfViewer({ url }: { url: string }) {
  return <iframe src={url} title="PDF 预览" className="h-full w-full border-0" />;
}
