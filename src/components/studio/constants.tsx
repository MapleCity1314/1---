import type { AspectRatioOption } from "./types";

function ratioIcon(w: number, h: number) {
  return (
    <svg className="h-3 w-3 md:h-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
      <rect x={12 - w / 2} y={12 - h / 2} width={w} height={h} stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { value: "square", label: "1:1", ratio: 1, icon: ratioIcon(12, 12) },
  { value: "portrait", label: "9:16", ratio: 9 / 16, icon: ratioIcon(8, 16) },
  { value: "landscape", label: "16:9", ratio: 16 / 9, icon: ratioIcon(16, 8) },
  { value: "wide", label: "21:9", ratio: 21 / 9, icon: ratioIcon(20, 6) },
];

export const ALL_ASPECT_RATIOS: AspectRatioOption[] = [
  ...DEFAULT_ASPECT_RATIOS,
  { value: "4:3", label: "4:3", ratio: 4 / 3, icon: ratioIcon(14, 10) },
  { value: "3:2", label: "3:2", ratio: 3 / 2, icon: ratioIcon(16, 8) },
  { value: "2:3", label: "2:3", ratio: 2 / 3, icon: ratioIcon(8, 16) },
  { value: "3:4", label: "3:4", ratio: 3 / 4, icon: ratioIcon(10, 14) },
  { value: "5:4", label: "5:4", ratio: 5 / 4, icon: ratioIcon(14, 10) },
  { value: "4:5", label: "4:5", ratio: 4 / 5, icon: ratioIcon(10, 14) },
];
