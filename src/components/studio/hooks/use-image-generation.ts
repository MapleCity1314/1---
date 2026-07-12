"use client";

import type React from "react";

import { useCallback, useRef, useState } from "react";
import type { Generation, GenerationPhase, ModelType, ThinkingLevel, Resolution, Quality } from "../types";

interface UseImageGenerationProps {
  prompt: string;
  aspectRatio: string;
  image1: File | null;
  image2: File | null;
  image1Url: string;
  image2Url: string;
  useUrls: boolean;
  selectedModel: ModelType;
  thinkingLevel: ThinkingLevel;
  resolution: Resolution;
  quality: Quality;
  useGrounding: boolean;
  generations: Generation[];
  setGenerations: React.Dispatch<React.SetStateAction<Generation[]>>;
  addGeneration: (generation: Generation) => Promise<void>;
  onToast: (message: string, type?: "success" | "error") => void;
  onImageUpload: (file: File, imageNumber: 1 | 2) => Promise<void>;
}

interface GenerateImageOptions {
  prompt?: string;
  aspectRatio?: string;
  image1?: File | null;
  image2?: File | null;
  image1Url?: string;
  image2Url?: string;
  useUrls?: boolean;
  selectedModel?: ModelType;
  thinkingLevel?: ThinkingLevel;
  resolution?: Resolution;
  quality?: Quality;
  useGrounding?: boolean;
}

let sharedAudioContext: AudioContext | null = null;

const playSuccessSound = () => {
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const oscillator = sharedAudioContext.createOscillator();
    const gainNode = sharedAudioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(sharedAudioContext.destination);

    oscillator.frequency.setValueAtTime(659.25, sharedAudioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, sharedAudioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, sharedAudioContext.currentTime + 0.15);

    oscillator.start(sharedAudioContext.currentTime);
    oscillator.stop(sharedAudioContext.currentTime + 0.15);
  } catch (error) {
    console.log("播放提示音失败:", error);
  }
};

const getPhaseFromProgress = (progress: number): GenerationPhase => {
  if (progress < 20) return "sending";
  if (progress < 80) return "generating";
  if (progress < 95) return "processing";
  return "loading";
};

// 自适应进度：从真实生成耗时里自我校准。
// 放在模块级别，跨渲染保留，每次生成完成后更新。
let expectedDurationMs = 35_000;

/** 两段式进度曲线：
 *  阶段一（0→90%）：在预计耗时内快速缓出
 *  阶段二（90→99%）：无限缓慢爬升，用户始终能看到在动 */
function adaptiveProgress(elapsedMs: number): number {
  const t = elapsedMs / expectedDurationMs;
  if (t < 1) {
    return 90 * (1 - Math.exp(-3 * t));
  }
  const overtime = t - 1;
  return 90 + 9 * (1 - Math.exp(-0.5 * overtime));
}

/** 把 File 读成 data URL。 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("读取图片文件失败"));
    reader.readAsDataURL(file);
  });
}

/** 把远程图片 URL 转成 data URL（编辑模式下模型需要图片内容而不是链接）。 */
async function urlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("读取图片链接失败"));
    reader.readAsDataURL(blob);
  });
}

export function useImageGeneration({
  prompt,
  aspectRatio,
  image1,
  image2,
  image1Url,
  image2Url,
  useUrls,
  selectedModel,
  thinkingLevel,
  resolution,
  quality,
  useGrounding,
  generations,
  setGenerations,
  addGeneration,
  onToast,
  onImageUpload,
}: UseImageGenerationProps) {
  const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  // generationId → stopProgress，markGenerationComplete 用它停掉动画
  const stopProgressMap = useRef<Map<string, () => void>>(new Map());

  const cancelGeneration = (generationId: string) => {
    const generation = generations.find((g) => g.id === generationId);
    if (generation?.abortController) {
      generation.abortController.abort();
    }

    const stopFn = stopProgressMap.current.get(generationId);
    if (stopFn) {
      stopFn();
      stopProgressMap.current.delete(generationId);
    }

    // 直接移除，不留一个「已取消」的缩略图
    setGenerations((prev) => prev.filter((gen) => gen.id !== generationId));
    onToast("已取消生成", "error");
  };

  const generateImage = async (options?: GenerateImageOptions) => {
    const effectivePrompt = options?.prompt ?? prompt;
    const effectiveAspectRatio = options?.aspectRatio ?? aspectRatio;
    const effectiveImage1 = options?.image1 !== undefined ? options.image1 : image1;
    const effectiveImage2 = options?.image2 !== undefined ? options.image2 : image2;
    const effectiveImage1Url = options?.image1Url !== undefined ? options.image1Url : image1Url;
    const effectiveImage2Url = options?.image2Url !== undefined ? options.image2Url : image2Url;
    const effectiveUseUrls = options?.useUrls !== undefined ? options.useUrls : useUrls;
    const effectiveSelectedModel = options?.selectedModel !== undefined ? options.selectedModel : selectedModel;
    const effectiveThinkingLevel = options?.thinkingLevel !== undefined ? options.thinkingLevel : thinkingLevel;
    const effectiveResolution = options?.resolution !== undefined ? options.resolution : resolution;
    const effectiveQuality = options?.quality !== undefined ? options.quality : quality;
    const effectiveUseGrounding = options?.useGrounding !== undefined ? options.useGrounding : useGrounding;

    const hasImages = effectiveUseUrls ? effectiveImage1Url || effectiveImage2Url : effectiveImage1 || effectiveImage2;
    const currentMode = hasImages ? "image-editing" : "text-to-image";

    if (currentMode === "image-editing" && !effectiveUseUrls && !effectiveImage1) {
      onToast("请上传至少一张用于编辑的图片", "error");
      return;
    }
    if (currentMode === "image-editing" && effectiveUseUrls && !effectiveImage1Url) {
      onToast("请提供至少一个用于编辑的图片链接", "error");
      return;
    }
    if (!effectivePrompt.trim()) {
      onToast("请输入提示词", "error");
      return;
    }

    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const controller = new AbortController();

    const newGeneration: Generation = {
      id: generationId,
      status: "loading",
      progress: 0,
      phase: "sending",
      imageUrl: null,
      prompt: effectivePrompt,
      timestamp: Date.now(),
      abortController: controller,
    };

    setGenerations((prev) => [newGeneration, ...prev]);
    setSelectedGenerationId(generationId);

    let isRunning = true;
    let rafId: number;
    const startTime = performance.now();
    let lastUpdateTime = startTime;

    const updateProgress = (currentTime: number) => {
      if (!isRunning) return;

      const deltaTime = currentTime - lastUpdateTime;
      if (deltaTime >= 50) {
        lastUpdateTime = currentTime;
        const elapsedMs = currentTime - startTime;
        const currentProgress = adaptiveProgress(elapsedMs);
        const phase = getPhaseFromProgress(currentProgress);

        setGenerations((prev) =>
          prev.map((gen) =>
            gen.id === generationId && gen.status === "loading" ? { ...gen, progress: currentProgress, phase } : gen,
          ),
        );
      }

      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);

    const stopProgress = () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };

    stopProgressMap.current.set(generationId, stopProgress);

    try {
      let image1DataUrl: string | undefined;
      let image2DataUrl: string | undefined;

      if (currentMode === "image-editing") {
        if (effectiveUseUrls) {
          if (effectiveImage1Url) image1DataUrl = await urlToDataUrl(effectiveImage1Url);
          if (effectiveImage2Url) image2DataUrl = await urlToDataUrl(effectiveImage2Url);
        } else {
          if (effectiveImage1) image1DataUrl = await fileToDataUrl(effectiveImage1);
          if (effectiveImage2) image2DataUrl = await fileToDataUrl(effectiveImage2);
        }
      }

      const response = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: currentMode,
          prompt: effectivePrompt,
          aspectRatio: effectiveAspectRatio,
          model: effectiveSelectedModel,
          thinkingLevel: effectiveThinkingLevel,
          resolution: effectiveResolution,
          quality: effectiveQuality,
          useGrounding: effectiveUseGrounding,
          image1DataUrl,
          image2DataUrl,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "生成失败" }));
        throw new Error(errorData.error || "生成失败");
      }

      const data = await response.json();

      if (data.durationMs && data.durationMs > 0) {
        expectedDurationMs = data.durationMs;
      }

      if (data.url) {
        // 保持 status 为 loading，让组件在进度条下面先渲染图片；
        // <img> 的 onLoad 触发 markGenerationComplete 时才真正切换为完成态。
        setGenerations((prev) =>
          prev.map((gen) =>
            gen.id === generationId && gen.status === "loading"
              ? { ...gen, imageUrl: data.url, aspectRatio: effectiveAspectRatio, mode: currentMode }
              : gen,
          ),
        );
      } else {
        stopProgress();
        stopProgressMap.current.delete(generationId);
      }
    } catch (error) {
      stopProgress();
      stopProgressMap.current.delete(generationId);

      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "发生未知错误";

      setGenerations((prev) => prev.filter((gen) => gen.id !== generationId));

      onToast(errorMessage, "error");
    }
  };

  const loadGeneratedAsInput = async () => {
    const selectedGeneration = generations.find((g) => g.id === selectedGenerationId);
    if (!selectedGeneration?.imageUrl) return;

    try {
      const response = await fetch(selectedGeneration.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "generated-image.png", { type: "image/png" });

      await onImageUpload(file, 1);
      onToast("图片已载入输入框 1", "success");
    } catch (error) {
      console.error("载入图片失败:", error);
      onToast("载入图片失败", "error");
    }
  };

  // 组件里 <img> 的 onLoad 触发时调用：图片已解码渲染完毕，此时移除进度条不会闪烁。
  const markGenerationComplete = useCallback(
    (generationId: string) => {
      const stopFn = stopProgressMap.current.get(generationId);
      if (stopFn) {
        stopFn();
        stopProgressMap.current.delete(generationId);
      }

      let completedGen: Generation | null = null;

      setGenerations((prev) => {
        const gen = prev.find((g) => g.id === generationId);
        if (!gen || gen.status !== "loading" || !gen.imageUrl) return prev;

        completedGen = {
          ...gen,
          status: "complete" as const,
          progress: 100,
          phase: undefined,
          timestamp: Date.now(),
          abortController: undefined,
        };

        return prev.map((g) => (g.id === generationId ? completedGen! : g));
      });

      if (completedGen) {
        setImageLoaded(true);
        playSuccessSound();
        addGeneration(completedGen).catch(() => {});
      }
    },
    [setGenerations, setImageLoaded, addGeneration],
  );

  return {
    selectedGenerationId,
    setSelectedGenerationId,
    imageLoaded,
    setImageLoaded,
    generateImage,
    cancelGeneration,
    loadGeneratedAsInput,
    markGenerationComplete,
  };
}
