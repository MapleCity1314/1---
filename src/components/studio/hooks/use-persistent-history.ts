"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAnonymousGenerations,
  saveAnonymousGeneration,
  clearAnonymousGenerations,
  deleteAnonymousGeneration,
} from "@/lib/studio/anonymous-generations";
import type { Generation } from "../types";

// 纯浏览器端历史记录：图片本体存在 Supabase Storage，这里只在 localStorage
// 里存最近的生成记录（URL + 元数据），没有数据库、不分页。
export function usePersistentHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // 挂载后再从 localStorage 恢复，避免 SSR 不一致。
  // localStorage 在服务端不存在，只能放进 effect 里读，无法用惰性初始值替代。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGenerations(getAnonymousGenerations());
    setIsLoading(false);
    setHasInitiallyLoaded(true);
  }, []);

  const addGeneration = useCallback(async (generation: Generation) => {
    setGenerations((prev) => {
      const existingIndex = prev.findIndex((g) => g.id === generation.id);
      return existingIndex >= 0
        ? prev.map((g) => (g.id === generation.id ? generation : g))
        : [generation, ...prev];
    });
    // 只持久化已完成的记录，跳过临时的 loading 行
    if (generation.status !== "loading") {
      saveAnonymousGeneration(generation);
    }
  }, []);

  const updateGeneration = useCallback((id: string, updates: Partial<Generation>) => {
    setGenerations((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const clearHistory = useCallback(async () => {
    clearAnonymousGenerations();
    setGenerations([]);
  }, []);

  const deleteGeneration = useCallback(async (id: string) => {
    deleteAnonymousGeneration(id);
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // 没有数据库，不分页，但保持相同的接口形状方便调用方
  const loadMore = useCallback(async () => {}, []);

  return {
    generations,
    setGenerations,
    addGeneration,
    clearHistory,
    deleteGeneration,
    isLoading,
    hasInitiallyLoaded,
    hasMore: false,
    loadMore,
    isLoadingMore: false,
    updateGeneration,
  };
}
