import type { Kline } from "./binance";

/**
 * 位点计算：全部是纯函数、确定性输出，不依赖 AI。
 * 这些数字会作为「权威值」直接注入研报 payload，AI 只负责基于它们写思路/策略文字，
 * 不允许改动数值本身。
 */

/** 经典枢轴点（Pivot Point）及对应的支撑/压力，基于最近一根日线。 */
export function pivotLevels(lastDaily: Kline) {
  const { high, low, close } = lastDaily;
  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);
  return {
    pivot: round(pivot),
    resistances: [round(r1), round(r2), round(r3)],
    supports: [round(s1), round(s2), round(s3)],
  };
}

/**
 * 近端 swing 高低点：在给定 K 线窗口里找局部极值（两侧各 leftRight 根内的最高/最低），
 * 用来补充枢轴点之外、真实被行情验证过的关键位。
 */
export function swingLevels(klines: Kline[], leftRight = 2) {
  const highs: number[] = [];
  const lows: number[] = [];
  for (let i = leftRight; i < klines.length - leftRight; i++) {
    const window = klines.slice(i - leftRight, i + leftRight + 1);
    const cur = klines[i];
    if (window.every((k) => k.high <= cur.high)) highs.push(cur.high);
    if (window.every((k) => k.low >= cur.low)) lows.push(cur.low);
  }
  return { swingHighs: highs.map(round), swingLows: lows.map(round) };
}

/** ATR（简单均幅），用于止损参考距离。 */
export function atr(klines: Kline[], period = 14): number | null {
  if (klines.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < klines.length; i++) {
    const cur = klines[i];
    const prev = klines[i - 1];
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close),
    );
    trs.push(tr);
  }
  const recent = trs.slice(-period);
  return round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

/** 近期区间高低点（用于给 AI 上下文，不直接作为支撑压力）。 */
export function recentRange(klines: Kline[]) {
  const highs = klines.map((k) => k.high);
  const lows = klines.map((k) => k.low);
  return { rangeHigh: round(Math.max(...highs)), rangeLow: round(Math.min(...lows)) };
}

/**
 * 汇总某个 crypto 标的的全部确定性位点，供 generate.ts 直接注入 prompt 和 payload。
 * 支撑/压力各取「枢轴位 + swing 位」去重排序后取前 3 个，由近到远（相对现价）。
 */
export function computeLevels(
  lastPrice: number,
  klines15m: Kline[],
  klines1h: Kline[],
  klines1d: Kline[],
) {
  const lastDaily = klines1d[klines1d.length - 1];
  const pivots = lastDaily ? pivotLevels(lastDaily) : { pivot: null, resistances: [], supports: [] };
  const { swingHighs, swingLows } = swingLevels(klines1h, 2);
  const atr15m = atr(klines15m, 14);
  const { rangeHigh, rangeLow } = recentRange(klines1d);

  const supportCandidates = dedupeSort(
    [...pivots.supports, ...swingLows].filter((v) => v < lastPrice),
    "desc", // 由近到远：离现价最近的支撑排在前面 → 从大到小
  );
  const resistanceCandidates = dedupeSort(
    [...pivots.resistances, ...swingHighs].filter((v) => v > lastPrice),
    "asc",
  );

  return {
    lastPrice: round(lastPrice),
    pivot: pivots.pivot,
    supports: supportCandidates.slice(0, 3),
    resistances: resistanceCandidates.slice(0, 3),
    atr15m,
    rangeHigh,
    rangeLow,
  };
}

function dedupeSort(values: number[], order: "asc" | "desc"): number[] {
  const uniq = Array.from(new Set(values.map(round)));
  uniq.sort((a, b) => (order === "asc" ? a - b : b - a));
  return uniq;
}

function round(n: number): number {
  // 价格量级不定（几分钱到几万），统一保留 4 位小数再裁掉多余的 0。
  return Math.round(n * 10000) / 10000;
}
