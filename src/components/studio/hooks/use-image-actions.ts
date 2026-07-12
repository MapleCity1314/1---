"use client";

import { useCallback, useState } from "react";

interface UseImageActionsProps {
  isMobile: boolean;
  currentMode: string;
  onToast: (message: string, type: "success" | "error") => void;
}

interface GeneratedImage {
  url: string;
  prompt: string;
}

export function useImageActions({ isMobile, currentMode, onToast }: UseImageActionsProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState("");

  const openFullscreen = useCallback((imageUrl: string) => {
    if (imageUrl) {
      setFullscreenImageUrl(imageUrl);
      setShowFullscreen(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(false);
    setFullscreenImageUrl("");
    document.body.style.overflow = "unset";
  }, []);

  const downloadImage = useCallback(
    async (generatedImage: GeneratedImage | null) => {
      if (!generatedImage) return;
      try {
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `studio-${currentMode}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("下载图片失败:", error);
        window.open(generatedImage.url, "_blank");
      }
    },
    [currentMode],
  );

  const openImageInNewTab = useCallback((generatedImage: GeneratedImage | null) => {
    if (!generatedImage?.url) {
      console.error("没有可用的图片地址");
      return;
    }

    try {
      if (generatedImage.url.startsWith("data:")) {
        const parts = generatedImage.url.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
        if (newWindow) {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        }
      } else {
        window.open(generatedImage.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("打开图片失败:", error);
      window.open(generatedImage.url, "_blank");
    }
  }, []);

  const copyImageToClipboard = useCallback(
    async (generatedImage: GeneratedImage | null) => {
      if (!generatedImage) return;

      const convertToPngBlob = async (imageUrl: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("无法获取 canvas 上下文"));
              return;
            }

            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("转换为 blob 失败"));
                }
              },
              "image/png",
              1.0,
            );
          };

          img.onerror = () => reject(new Error("图片加载失败"));
          img.src = imageUrl;
        });
      };

      try {
        if (isMobile) {
          try {
            const pngBlob = await convertToPngBlob(generatedImage.url);
            const clipboardItem = new ClipboardItem({ "image/png": pngBlob });
            await navigator.clipboard.write([clipboardItem]);
            onToast("图片已复制到剪贴板", "success");
            return;
          } catch {
            try {
              const response = await fetch(generatedImage.url);
              const blob = await response.blob();
              const reader = new FileReader();
              reader.onloadend = async () => {
                try {
                  await navigator.clipboard.writeText(reader.result as string);
                  onToast("图片数据已复制，可粘贴到支持的应用中", "success");
                } catch {
                  throw new Error("当前环境不支持剪贴板");
                }
              };
              reader.readAsDataURL(blob);
              return;
            } catch {
              onToast("当前环境不支持复制，请使用下载按钮", "error");
              return;
            }
          }
        }

        onToast("正在复制图片...", "success");
        window.focus();

        const pngBlob = await convertToPngBlob(generatedImage.url);
        const clipboardItem = new ClipboardItem({ "image/png": pngBlob });
        await navigator.clipboard.write([clipboardItem]);

        onToast("图片已复制到剪贴板", "success");
      } catch (error) {
        console.error("复制图片失败:", error);
        if (error instanceof Error && error.message.includes("not focused")) {
          onToast("请先点击页面，然后重试复制", "error");
        } else {
          onToast("复制图片失败", "error");
        }
      }
    },
    [isMobile, onToast],
  );

  return {
    showFullscreen,
    fullscreenImageUrl,
    setFullscreenImageUrl,
    openFullscreen,
    closeFullscreen,
    downloadImage,
    openImageInNewTab,
    copyImageToClipboard,
  };
}
