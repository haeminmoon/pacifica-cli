import path from "path";
import os from "os";

export const ENV_ALIASES: Record<string, string> = {
  prod: "mainnet",
  production: "mainnet",
  mainnet: "mainnet",
  test: "testnet",
  testnet: "testnet",
};

export const BASE_URLS: Record<string, string> = {
  mainnet: "https://api.pacifica.fi/api/v1",
  testnet: "https://test-api.pacifica.fi/api/v1",
};

export const CONFIG_DIR = path.join(os.homedir(), ".pacifica-cli");
export const CONFIG_FILE = "config.json";

export const BUILDER_CODE = "2oolkit";
export const BUILDER_MAX_FEE_RATE = "0.001";

// ─── Candles (GET /kline) ───────────────────────────────────────────────

/**
 * Maximum candles the API returns for a single /kline request. The server
 * rejects any time range wider than this many candles with HTTP 400
 * ("Time range too large ... Max range: 4000 candles").
 */
export const CANDLE_MAX_BARS = 4000;

/** All candle intervals supported by the API, in ascending duration. */
export const CANDLE_INTERVALS = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
] as const;

export type CandleInterval = (typeof CANDLE_INTERVALS)[number];

/** Duration of each interval in milliseconds. */
export const INTERVAL_MS: Record<CandleInterval, number> = {
  "1m": 60_000,
  "3m": 3 * 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "2h": 2 * 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "8h": 8 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

/** Resolve an interval string to its millisecond duration, validating it. */
export function intervalToMs(interval: string): number {
  const ms = INTERVAL_MS[interval as CandleInterval];
  if (ms === undefined) {
    throw new Error(
      `Unknown interval: "${interval}". Valid intervals: ${CANDLE_INTERVALS.join(", ")}`
    );
  }
  return ms;
}

export function resolveEnv(input: string): string {
  const normalized = input.toLowerCase().trim();
  const env = ENV_ALIASES[normalized];
  if (!env) {
    throw new Error(
      `Unknown environment: "${input}". Valid options: ${Object.keys(ENV_ALIASES).join(", ")}`
    );
  }
  return env;
}
