"use client";

/**
 * pptx/ppt 预览：客户端没有干净的离线渲染库，走微软 Office Online 的
 * 只读嵌入查看器。会把这个短时签名 URL 传给微软服务器渲染——
 * 敏感文件请提前告知使用者这一点，或改走「仅下载」。
 */
export function OfficeOnlineViewer({ url }: { url: string }) {
  const embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  return (
    <iframe
      src={embedSrc}
      title="Office 在线预览"
      className="h-full w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}
