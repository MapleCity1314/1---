"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useImageUpload } from "./hooks/use-image-upload";
import { useImageGeneration } from "./hooks/use-image-generation";
import { useAspectRatio } from "./hooks/use-aspect-ratio";
import { useImageActions } from "./hooks/use-image-actions";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { useDragDrop } from "./hooks/use-drag-drop";
import { usePasteHandler } from "./hooks/use-paste-handler";
import { useResizablePanels } from "./hooks/use-resizable-panels";
import { usePersistentHistory } from "./hooks/use-persistent-history";
import { InputSection } from "./input-section";
import { OutputSection } from "./output-section";
import { ToastNotification } from "./toast-notification";
import { GenerationHistory } from "./generation-history";
import { GlobalDropZone } from "./global-drop-zone";
import type { ModelType, ThinkingLevel, Resolution, Quality } from "./types";
import { DEFAULT_MODEL_ID } from "./model-catalog";
import { useDraftState, getSavedDraft, clearDraft } from "./hooks/use-draft-state";

type AspectRatio = string;

// 抖动着色背景 —— 直接导入以便立即渲染（避免懒加载闪烁）
const Dithering = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })),
  { ssr: false, loading: () => <div className="h-full w-full bg-surface-dark" /> },
);
const MemoizedDithering = memo(Dithering);

// 弹层只在用户交互时才会用到，不需要提前加载
const HowItWorksModal = lazy(() => import("./how-it-works-modal").then((mod) => ({ default: mod.HowItWorksModal })));
const FullscreenViewer = lazy(() => import("./fullscreen-viewer").then((mod) => ({ default: mod.FullscreenViewer })));

export function Studio(): ReactElement {
  const isMobile = useIsMobile();

  // UI 状态 —— 若有草稿会在挂载后恢复
  const [prompt, setPrompt] = useState("");
  const [useUrls, setUseUrls] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL_ID as ModelType);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("minimal");
  const [resolution, setResolution] = useState<Resolution>("1K");
  const [quality, setQuality] = useState<Quality>("auto");
  const [useGrounding, setUseGrounding] = useState(false);
  const draftRef = useRef<ReturnType<typeof getSavedDraft>>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 宽高比
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("square");
  const { availableAspectRatios, detectAspectRatio, closestAvailable } = useAspectRatio(selectedModel);
  const imageLoadCountRef = useRef(0);

  // 切换模型后，若当前比例不受支持，就吸附到最接近的可用比例
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 依赖模型切换后的派生计算，无法在渲染期间同步得出
    setAspectRatio((current) => closestAvailable(current));
  }, [selectedModel, closestAvailable]);

  // 图片上传
  const {
    image1,
    image1Preview,
    image1Url,
    image2,
    image2Preview,
    image2Url,
    handleImageUpload,
    handleUrlChange,
    clearImage,
    restoreImageFromDataUrl,
    showToast: uploadShowToastRef,
  } = useImageUpload({
    onImageLoaded: (width, height) => {
      // 只用第一张上传的图片自动识别比例，第二张不应覆盖当前选择
      if (imageLoadCountRef.current === 0) {
        const detectedRatio = detectAspectRatio(width, height);
        setAspectRatio(detectedRatio);
      }
      imageLoadCountRef.current++;
    },
  });

  // 挂载后恢复草稿（仅客户端，避免 SSR 不一致）
  const draftRestored = useRef(false);
  useEffect(() => {
    if (draftRestored.current) return;
    draftRestored.current = true;
    const draft = getSavedDraft();
    draftRef.current = draft;
    if (!draft) return;
    // 仅客户端挂载后一次性恢复草稿，无法在渲染期间同步得出，故豁免该规则
    /* eslint-disable react-hooks/set-state-in-effect */
    if (draft.prompt) setPrompt(draft.prompt);
    if (draft.aspectRatio) setAspectRatio(draft.aspectRatio);
    if (draft.selectedModel) setSelectedModel(draft.selectedModel);
    if (draft.thinkingLevel) setThinkingLevel(draft.thinkingLevel);
    if (draft.resolution) setResolution(draft.resolution);
    if (draft.useGrounding) setUseGrounding(draft.useGrounding);
    if (draft.useUrls) {
      setUseUrls(true);
      if (draft.image1Url) handleUrlChange(draft.image1Url, 1);
      if (draft.image2Url) handleUrlChange(draft.image2Url, 2);
    } else {
      if (draft.image1Preview) restoreImageFromDataUrl(draft.image1Preview, 1);
      if (draft.image2Preview) restoreImageFromDataUrl(draft.image2Preview, 2);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 状态变化后自动保存草稿
  useDraftState({
    prompt,
    aspectRatio,
    selectedModel,
    thinkingLevel,
    resolution,
    useGrounding,
    useUrls,
    image1Url,
    image2Url,
    image1Preview,
    image2Preview,
  });

  // 持久化历史记录
  const {
    generations: persistedGenerations,
    setGenerations: setPersistedGenerations,
    addGeneration,
    deleteGeneration,
    isLoading: historyLoading,
    hasInitiallyLoaded,
  } = usePersistentHistory();

  // 图片生成
  const {
    selectedGenerationId,
    setSelectedGenerationId,
    imageLoaded,
    setImageLoaded,
    generateImage: runGeneration,
    cancelGeneration,
    loadGeneratedAsInput,
    markGenerationComplete,
  } = useImageGeneration({
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
    generations: persistedGenerations,
    setGenerations: setPersistedGenerations,
    addGeneration,
    onToast: showToast,
    onImageUpload: handleImageUpload,
  });

  // 派生状态
  const selectedGeneration = persistedGenerations.find((g) => g.id === selectedGenerationId) || persistedGenerations[0];
  const generatedImage =
    selectedGeneration?.status === "complete" && selectedGeneration.imageUrl
      ? { url: selectedGeneration.imageUrl, prompt: selectedGeneration.prompt }
      : null;
  const hasImages = !!(useUrls ? image1Url || image2Url : image1 || image2);
  const currentMode = hasImages ? "image-editing" : "text-to-image";
  const canGenerate = prompt.trim().length > 0 && (currentMode === "text-to-image" || !!(useUrls ? image1Url : image1));

  // 图片操作（全屏 / 下载 / 复制等）
  const {
    showFullscreen,
    fullscreenImageUrl,
    setFullscreenImageUrl,
    openFullscreen,
    closeFullscreen,
    downloadImage,
    openImageInNewTab,
    copyImageToClipboard,
  } = useImageActions({
    isMobile: isMobile || false,
    currentMode,
    onToast: showToast,
  });

  // 可拖拽调整宽度的两栏
  const { leftWidth, hasResized, containerRef, handleMouseDown, handleDoubleClick } = useResizablePanels();

  // 拖拽上传
  const { isDraggingOver, dropZoneHover, setDropZoneHover, handleGlobalDrop } = useDragDrop({
    onImageUpload: handleImageUpload,
    setUseUrls,
    onToast: showToast,
  });

  // 粘贴上传
  const { handlePromptPaste } = usePasteHandler({
    image1,
    image2,
    image1Url,
    image2Url,
    useUrls,
    setUseUrls,
    onImageUpload: handleImageUpload,
    onUrlChange: handleUrlChange,
    onToast: showToast,
  });

  // 键盘快捷键
  const { handleKeyDown } = useKeyboardShortcuts({
    canGenerate,
    showFullscreen,
    fullscreenImageUrl,
    generatedImage,
    persistedGenerations,
    onGenerate: runGeneration,
    onCopyImage: () => copyImageToClipboard(generatedImage),
    onDownloadImage: () => downloadImage(generatedImage),
    onLoadAsInput: loadGeneratedAsInput,
    onCloseFullscreen: closeFullscreen,
    setFullscreenImageUrl,
    setSelectedGenerationId,
  });

  // 加载完成后自动选中第一条记录
  useEffect(() => {
    if (!historyLoading && persistedGenerations.length > 0 && !selectedGenerationId) {
      const firstCompleted = persistedGenerations.find((g) => g.status === "complete");
      if (firstCompleted) {
        setSelectedGenerationId(firstCompleted.id);
      }
    }
  }, [historyLoading, persistedGenerations, selectedGenerationId, setSelectedGenerationId]);

  // 切换选中项时保持 imageLoaded 同步——不做淡入淡出
  useEffect(() => {
    if (selectedGeneration?.status === "complete" && selectedGeneration?.imageUrl) {
      setImageLoaded(true);
    }
  }, [selectedGenerationId, selectedGeneration?.status, selectedGeneration?.imageUrl, setImageLoaded]);

  // 初始化上传 toast 引用
  useEffect(() => {
    uploadShowToastRef.current = showToast;
  }, [showToast, uploadShowToastRef]);

  const clearAll = useCallback(() => {
    setPrompt("");
    clearImage(1);
    clearImage(2);
    clearDraft();
    imageLoadCountRef.current = 0;
    setTimeout(() => {
      promptTextareaRef.current?.focus();
    }, 0);
  }, [clearImage]);

  const handleFullscreenNavigate = useCallback(
    (direction: "prev" | "next") => {
      const completedGenerations = (persistedGenerations ?? []).filter((g) => g.status === "complete" && g.imageUrl);
      const currentIndex = completedGenerations.findIndex((g) => g.imageUrl === fullscreenImageUrl);
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === "prev") {
        newIndex = currentIndex === 0 ? completedGenerations.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === completedGenerations.length - 1 ? 0 : currentIndex + 1;
      }

      setFullscreenImageUrl(completedGenerations[newIndex].imageUrl!);
      setSelectedGenerationId(completedGenerations[newIndex].id);
    },
    [persistedGenerations, fullscreenImageUrl, setFullscreenImageUrl, setSelectedGenerationId],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden select-none overscroll-none touch-pan-x touch-pan-y">
      {toast && <ToastNotification message={toast.message} type={toast.type} />}

      {isDraggingOver && (
        <GlobalDropZone dropZoneHover={dropZoneHover} onSetDropZoneHover={setDropZoneHover} onDrop={handleGlobalDrop} />
      )}

      {/* 抖动着色背景 —— 限定在页面内容区内，不覆盖侧栏 */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden rounded-xl shader-background bg-surface-dark">
        <MemoizedDithering
          colorBack="#00000000"
          colorFront="#FFFFFF"
          speed={0.43}
          shape="wave"
          type="4x4"
          pxSize={3}
          scale={0.6}
          style={{
            backgroundColor: "#000000",
            height: "100%",
            width: "100%",
          }}
        />
      </div>

      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center p-2 md:p-4">
        <div className="w-full flex-1 min-h-0 flex flex-col">
          <div className="w-full mx-auto select-none flex-1 min-h-0 flex flex-col">
            <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-hairline bg-card card-shadow px-2 py-2 md:px-3 md:py-3">
              <div className="flex flex-col gap-4 xl:gap-0 flex-1 min-h-0">
                <div ref={containerRef} className="flex flex-col xl:flex-row gap-4 xl:gap-0 flex-1 min-h-0">
                  <div
                    className="flex flex-col xl:w-[35%] xl:min-w-0 xl:pl-2 xl:pr-2 xl:border-r xl:border-hairline xl:pt-2 min-h-0"
                    style={hasResized ? { width: `${leftWidth}%` } : undefined}
                  >
                    <InputSection
                      prompt={prompt}
                      setPrompt={setPrompt}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      availableAspectRatios={availableAspectRatios}
                      useUrls={useUrls}
                      setUseUrls={setUseUrls}
                      image1Preview={image1Preview}
                      image2Preview={image2Preview}
                      image1={image1}
                      image1Url={image1Url}
                      image2Url={image2Url}
                      canGenerate={canGenerate}
                      hasImages={hasImages}
                      onGenerate={runGeneration}
                      onClearAll={clearAll}
                      onImageUpload={handleImageUpload}
                      onUrlChange={handleUrlChange}
                      onClearImage={clearImage}
                      onKeyDown={handleKeyDown}
                      onPromptPaste={handlePromptPaste}
                      onImageFullscreen={(url) => openFullscreen(url)}
                      promptTextareaRef={promptTextareaRef}
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                      thinkingLevel={thinkingLevel}
                      setThinkingLevel={setThinkingLevel}
                      resolution={resolution}
                      setResolution={setResolution}
                      quality={quality}
                      setQuality={setQuality}
                      useGrounding={useGrounding}
                      setUseGrounding={setUseGrounding}
                    />

                    {/* 桌面端历史记录 */}
                    <div className="hidden xl:flex xl:flex-col pt-3 flex-1 min-h-0">
                      <GenerationHistory
                        generations={persistedGenerations}
                        selectedId={selectedGenerationId}
                        onSelect={setSelectedGenerationId}
                        onCancel={cancelGeneration}
                        onDelete={deleteGeneration}
                        isLoading={historyLoading}
                        hasInitiallyLoaded={hasInitiallyLoaded}
                        onImageReady={markGenerationComplete}
                      />
                    </div>
                  </div>

                  <div
                    className="hidden xl:flex items-center justify-center cursor-col-resize hover:bg-surface-soft transition-colors relative group"
                    style={{ width: "8px", flexShrink: 0 }}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleDoubleClick}
                  >
                    <div className="w-0.5 h-8 bg-hairline-strong group-hover:bg-muted-soft transition-colors rounded-full" />
                  </div>

                  <div
                    className="flex flex-col xl:w-[calc(65%-8px)] xl:pl-1 xl:pr-0 flex-1 min-h-0"
                    style={hasResized ? { width: `${100 - leftWidth}%` } : undefined}
                  >
                    <OutputSection
                      selectedGeneration={selectedGeneration}
                      generations={persistedGenerations}
                      selectedGenerationId={selectedGenerationId}
                      setSelectedGenerationId={setSelectedGenerationId}
                      imageLoaded={imageLoaded}
                      setImageLoaded={setImageLoaded}
                      onCancelGeneration={cancelGeneration}
                      onDeleteGeneration={deleteGeneration}
                      onOpenFullscreen={() => generatedImage && openFullscreen(generatedImage.url)}
                      onLoadAsInput={loadGeneratedAsInput}
                      onCopy={() => copyImageToClipboard(generatedImage)}
                      onDownload={() => downloadImage(generatedImage)}
                      onOpenInNewTab={() => openImageInNewTab(generatedImage)}
                      onImageReady={markGenerationComplete}
                    />
                  </div>
                </div>

                {/* 移动端历史记录 —— 放在两栏下方 */}
                <div className="xl:hidden flex-shrink-0 max-h-[18vh] flex flex-col overflow-hidden">
                  <GenerationHistory
                    generations={persistedGenerations}
                    selectedId={selectedGenerationId}
                    onSelect={setSelectedGenerationId}
                    onCancel={cancelGeneration}
                    onDelete={deleteGeneration}
                    isLoading={historyLoading}
                    hasInitiallyLoaded={hasInitiallyLoaded}
                    onImageReady={markGenerationComplete}
                  />
                </div>
              </div>

              <div className="mt-3 md:mt-4 border-t border-hairline-soft pt-3 pb-1 w-full flex items-center justify-center flex-shrink-0">
                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="text-xs text-muted transition-colors hover:text-ink"
                >
                  使用说明
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 懒加载弹层 —— 只在打开时才加载 */}
      <Suspense fallback={null}>
        {showHowItWorks && <HowItWorksModal open={showHowItWorks} onOpenChange={setShowHowItWorks} />}
        {showFullscreen && fullscreenImageUrl && (
          <FullscreenViewer
            imageUrl={fullscreenImageUrl}
            onClose={closeFullscreen}
            onNavigate={handleFullscreenNavigate}
            canNavigate={(persistedGenerations ?? []).filter((g) => g.status === "complete" && g.imageUrl).length > 1}
          />
        )}
      </Suspense>
    </div>
  );
}
