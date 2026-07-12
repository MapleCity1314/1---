"use client";

import { useCallback, useMemo } from "react";
import { ALL_ASPECT_RATIOS } from "../constants";
import { aspectRatiosForModel } from "../model-catalog";
import type { AspectRatioOption } from "../types";

/** Closest option (by width/height ratio) to a target numeric ratio. */
function closestByRatio(targetRatio: number, options: AspectRatioOption[]): AspectRatioOption {
  let closest = options[0];
  let smallestDiff = Math.abs(targetRatio - closest.ratio);
  for (const option of options) {
    const diff = Math.abs(targetRatio - option.ratio);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = option;
    }
  }
  return closest;
}

export function useAspectRatio(modelId: string) {
  // 只保留当前模型实际支持的比例选项
  const availableAspectRatios = useMemo(() => {
    const supported = aspectRatiosForModel(modelId);
    return ALL_ASPECT_RATIOS.filter((r) => supported.includes(r.value));
  }, [modelId]);

  // 根据拖入图片的宽高，找到最接近的受支持比例
  const detectAspectRatio = useCallback(
    (width: number, height: number): string => closestByRatio(width / height, availableAspectRatios).value,
    [availableAspectRatios],
  );

  // 切换模型后，当前比例可能不再受支持，找一个最接近的替代
  const closestAvailable = useCallback(
    (value: string): string => {
      if (availableAspectRatios.some((r) => r.value === value)) return value;
      const current = ALL_ASPECT_RATIOS.find((r) => r.value === value);
      return closestByRatio(current?.ratio ?? 1, availableAspectRatios).value;
    },
    [availableAspectRatios],
  );

  return {
    availableAspectRatios,
    detectAspectRatio,
    closestAvailable,
  };
}
