"use client";

import type React from "react";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui";
import { Trash } from "@/components/icons";
import { ImageUploadBox } from "./image-upload-box";
import { ModelSelector } from "./model-selector";
import { AspectRatioSelector } from "./aspect-ratio-selector";
import { SettingsPanel } from "./settings-panel";
import { cn } from "@/lib/utils";
import { isImageFile } from "@/lib/studio/image-utils";
import type { AspectRatioOption, ModelType, ThinkingLevel, Resolution, Quality } from "./types";

interface InputSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  availableAspectRatios: AspectRatioOption[];
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (level: ThinkingLevel) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  useGrounding: boolean;
  setUseGrounding: (use: boolean) => void;
  useUrls: boolean;
  setUseUrls: (use: boolean) => void;
  image1Preview: string | null;
  image2Preview: string | null;
  image1: File | null;
  image1Url: string;
  image2Url: string;
  canGenerate: boolean;
  hasImages: boolean;
  onGenerate: () => void;
  onClearAll: () => void;
  onImageUpload: (file: File, slot: 1 | 2) => Promise<void>;
  onUrlChange: (url: string, slot: 1 | 2) => void;
  onClearImage: (slot: 1 | 2) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPromptPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onImageFullscreen: (url: string) => void;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const InputSection = memo(function InputSection({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  availableAspectRatios,
  selectedModel,
  setSelectedModel,
  thinkingLevel,
  setThinkingLevel,
  resolution,
  setResolution,
  quality,
  setQuality,
  useGrounding,
  setUseGrounding,
  useUrls,
  setUseUrls,
  image1Preview,
  image2Preview,
  image1Url,
  image2Url,
  canGenerate,
  hasImages,
  onGenerate,
  onClearAll,
  onImageUpload,
  onUrlChange,
  onClearImage,
  onKeyDown,
  onPromptPaste,
  onImageFullscreen,
  promptTextareaRef,
}: InputSectionProps) {
  const handleFile1Change = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file, 1);
        e.target.value = "";
      }
    },
    [onImageUpload],
  );

  const handleFile2Change = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file, 2);
        e.target.value = "";
      }
    },
    [onImageUpload],
  );

  const handleDrop1 = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && isImageFile(file)) {
        onImageUpload(file, 1);
      }
    },
    [onImageUpload],
  );

  const handleDrop2 = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && isImageFile(file)) {
        onImageUpload(file, 2);
      }
    },
    [onImageUpload],
  );

  const handleClearImage1 = useCallback(() => onClearImage(1), [onClearImage]);
  const handleClearImage2 = useCallback(() => onClearImage(2), [onClearImage]);

  const handleSelectImage1 = useCallback(() => {
    if (image1Preview) {
      onImageFullscreen(image1Preview);
    } else {
      document.getElementById("studio-file1")?.click();
    }
  }, [image1Preview, onImageFullscreen]);

  const handleSelectImage2 = useCallback(() => {
    if (image2Preview) {
      onImageFullscreen(image2Preview);
    } else {
      document.getElementById("studio-file2")?.click();
    }
  }, [image2Preview, onImageFullscreen]);

  const handleUrl1Change = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value, 1),
    [onUrlChange],
  );

  const handleUrl2Change = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value, 2),
    [onUrlChange],
  );

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value),
    [setPrompt],
  );

  const toggleUrls = useCallback((value: boolean) => () => setUseUrls(value), [setUseUrls]);

  const showGeminiOptions = selectedModel === "google/gemini-3.1-flash-image-preview";
  const showQuality = selectedModel.startsWith("openai/");
  const showSettings = showGeminiOptions || showQuality;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 md:gap-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="mb-1 flex min-w-0 items-center justify-between select-none md:mb-2">
            <label className="text-sm font-medium text-body-strong md:text-base">提示词</label>
            <div className="flex min-w-0 shrink flex-wrap items-center justify-end gap-1.5 overflow-hidden md:gap-2">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              {showSettings && (
                <SettingsPanel
                  showGeminiOptions={showGeminiOptions}
                  showQuality={showQuality}
                  thinkingLevel={thinkingLevel}
                  setThinkingLevel={setThinkingLevel}
                  resolution={resolution}
                  setResolution={setResolution}
                  quality={quality}
                  setQuality={setQuality}
                  useGrounding={useGrounding}
                  setUseGrounding={setUseGrounding}
                />
              )}
              <AspectRatioSelector value={aspectRatio} options={availableAspectRatios} onChange={setAspectRatio} />
              <Button
                onClick={onClearAll}
                disabled={!prompt.trim() && !hasImages}
                variant="secondary"
                aria-label="清空全部"
                className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm"
              >
                <Trash size={14} className="md:hidden" />
                <span className="hidden md:inline">清空</span>
              </Button>
            </div>
          </div>
          <textarea
            ref={promptTextareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={onKeyDown}
            onPaste={onPromptPaste}
            placeholder="描述你想生成的画面…"
            aria-label="图片生成提示词"
            autoFocus
            className="min-h-[60px] max-h-[100px] w-full flex-1 resize-none rounded-md border border-hairline bg-card p-2 text-xs text-ink outline-none select-text placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15 sm:min-h-[100px] sm:max-h-[140px] md:p-4 md:text-base lg:min-h-[12vh] lg:max-h-[18vh] xl:min-h-[14vh] xl:max-h-[20vh]"
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3">
          <div>
            <div className="mb-1 flex min-w-0 items-center justify-between select-none md:mb-2">
              <label className="text-sm font-medium text-body-strong md:text-base">图片（可选）</label>
              <div className="inline-flex rounded-md border border-hairline bg-canvas p-0.5">
                <button
                  type="button"
                  onClick={toggleUrls(false)}
                  className={cn(
                    "rounded-[5px] px-2 py-1 text-xs font-medium transition-colors md:px-4 md:py-1.5 md:text-sm",
                    !useUrls ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  文件
                </button>
                <button
                  type="button"
                  onClick={toggleUrls(true)}
                  className={cn(
                    "rounded-[5px] px-2 py-1 text-xs font-medium transition-colors md:px-4 md:py-1.5 md:text-sm",
                    useUrls ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  链接
                </button>
              </div>
            </div>

            {useUrls ? (
              <div className="space-y-2 lg:min-h-[12vh] xl:min-h-[14vh]">
                <div className="relative">
                  <input
                    type="url"
                    value={image1Url}
                    onChange={handleUrl1Change}
                    placeholder="第一张图片链接"
                    aria-label="第一张图片链接"
                    className="w-full rounded-md border border-hairline bg-card p-2 pr-8 text-xs text-ink outline-none select-text placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15 md:p-3"
                  />
                  {image1Url && (
                    <button
                      onClick={handleClearImage1}
                      aria-label="清除第一张图片链接"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-muted transition-colors hover:text-ink"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={image2Url}
                    onChange={handleUrl2Change}
                    placeholder="第二张图片链接"
                    aria-label="第二张图片链接"
                    className="w-full rounded-md border border-hairline bg-card p-2 pr-8 text-xs text-ink outline-none select-text placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15 md:p-3"
                  />
                  {image2Url && (
                    <button
                      onClick={handleClearImage2}
                      aria-label="清除第二张图片链接"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-muted transition-colors hover:text-ink"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="select-none lg:min-h-[12vh] xl:min-h-[14vh]">
                <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <ImageUploadBox
                    imageNumber={1}
                    preview={image1Preview}
                    onDrop={handleDrop1}
                    onClear={handleClearImage1}
                    onSelect={handleSelectImage1}
                  />
                  <input
                    id="studio-file1"
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={handleFile1Change}
                  />

                  <ImageUploadBox
                    imageNumber={2}
                    preview={image2Preview}
                    onDrop={handleDrop2}
                    onClear={handleClearImage2}
                    onSelect={handleSelectImage2}
                  />
                  <input
                    id="studio-file2"
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={handleFile2Change}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-0">
          <Button onClick={onGenerate} disabled={!canGenerate} className="h-10 w-full text-sm font-semibold md:h-12 md:text-base">
            开始生成
          </Button>
        </div>
      </div>
    </div>
  );
});
