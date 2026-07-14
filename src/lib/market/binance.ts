import "server-only";

// Binance 公开行情 API（不需要 key）。用于 crypto 类标的的确定性位点计算。
const DEFAULT_BASE = "https://api.binance.com";

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

function apiBase(): string {
  return process.env.BINANCE_API_BASE?.trim() || DEFAULT_BASE;
}

// Binance klines 原始返回是一个定长数组，按位取值并转成数字。
function parseKline(row: unknown[]): Kline {
  return {
    openTime: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime: Number(row[6]),
  };
}

/**
 * 拉取指定周期的 K 线。interval 如 "15m" / "1h" / "1d"。
 * 失败（符号不存在、接口不可用等）直接抛错，由上层决定是否回退到 Tavily。
 */
export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 100,
): Promise<Kline[]> {
  const url = `${apiBase()}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Binance klines 请求失败（${symbol} ${interval}）：HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Binance klines 返回格式异常（${symbol} ${interval}）`);
  }
  return data.map(parseKline);
}

/** 最新成交价（用 24hr ticker，比取最后一根 K 线收盘价更接近实时）。 */
export async function fetchLastPrice(symbol: string): Promise<number> {
  const url = `${apiBase()}/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Binance ticker 请求失败（${symbol}）：HTTP ${res.status}`);
  }
  const data = await res.json();
  const price = Number(data?.price);
  if (Number.isNaN(price)) {
    throw new Error(`Binance ticker 返回格式异常（${symbol}）`);
  }
  return price;
}

/**
 * 一次性拉取某个 crypto 标的做研报需要的多周期数据：
 * 15m（短线确认）、1h（趋势）、1d（近期区间），外加最新价。
 */
export async function fetchMarketSnapshot(binanceSymbol: string) {
  const [lastPrice, klines15m, klines1h, klines1d] = await Promise.all([
    fetchLastPrice(binanceSymbol),
    fetchKlines(binanceSymbol, "15m", 96), // 近 24h
    fetchKlines(binanceSymbol, "1h", 72), // 近 3 天
    fetchKlines(binanceSymbol, "1d", 30), // 近 30 天
  ]);
  return { lastPrice, klines15m, klines1h, klines1d };
}
