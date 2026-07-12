import type { Generation } from "@/components/studio/types";

// 浏览器端只读历史：图片本体存在 Supabase Storage，这里只在 localStorage
// 里存最近的生成记录（URL + 元数据），刷新页面后画廊仍能恢复。
const HISTORY_KEY = "studio_generation_history";
const MAX_GENERATIONS = 50;

export function getAnonymousGenerations(): Generation[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? (JSON.parse(stored) as Generation[]) : [];
  } catch (error) {
    console.error("读取生成历史失败:", error);
    return [];
  }
}

/** 按 id 插入或更新（loading → complete 原地覆盖）。 */
export function saveAnonymousGeneration(generation: Generation) {
  try {
    const existing = getAnonymousGenerations();
    const withoutDup = existing.filter((g) => g.id !== generation.id);
    const updated = [generation, ...withoutDup].slice(0, MAX_GENERATIONS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("保存生成记录失败:", error);
  }
}

export function clearAnonymousGenerations() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("清空生成历史失败:", error);
  }
}

export function deleteAnonymousGeneration(id: string) {
  try {
    const filtered = getAnonymousGenerations().filter((g) => g.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("删除生成记录失败:", error);
  }
}
