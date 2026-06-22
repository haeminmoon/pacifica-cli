import {
  resolveEnv,
  BASE_URLS,
  CANDLE_INTERVALS,
  CANDLE_MAX_BARS,
  intervalToMs,
} from "../../src/config/constants";

describe("resolveEnv", () => {
  it("resolves mainnet aliases", () => {
    expect(resolveEnv("prod")).toBe("mainnet");
    expect(resolveEnv("production")).toBe("mainnet");
    expect(resolveEnv("mainnet")).toBe("mainnet");
  });

  it("resolves testnet aliases", () => {
    expect(resolveEnv("test")).toBe("testnet");
    expect(resolveEnv("testnet")).toBe("testnet");
  });

  it("is case insensitive", () => {
    expect(resolveEnv("MAINNET")).toBe("mainnet");
    expect(resolveEnv("Testnet")).toBe("testnet");
  });

  it("throws on unknown env", () => {
    expect(() => resolveEnv("invalid")).toThrow("Unknown environment");
  });
});

describe("BASE_URLS", () => {
  it("has mainnet and testnet URLs", () => {
    expect(BASE_URLS.mainnet).toBe("https://api.pacifica.fi/api/v1");
    expect(BASE_URLS.testnet).toBe("https://test-api.pacifica.fi/api/v1");
  });
});

describe("candle constants", () => {
  it("caps a single request at 4000 bars", () => {
    expect(CANDLE_MAX_BARS).toBe(4000);
  });

  it("exposes all API-supported intervals in ascending duration", () => {
    expect([...CANDLE_INTERVALS]).toEqual([
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
    ]);
  });
});

describe("intervalToMs", () => {
  it("resolves every supported interval to a positive duration", () => {
    for (const interval of CANDLE_INTERVALS) {
      expect(intervalToMs(interval)).toBeGreaterThan(0);
    }
  });

  it("maps known intervals to their millisecond duration", () => {
    expect(intervalToMs("1m")).toBe(60_000);
    expect(intervalToMs("30m")).toBe(30 * 60_000);
    expect(intervalToMs("2h")).toBe(2 * 60 * 60_000);
    expect(intervalToMs("1d")).toBe(24 * 60 * 60_000);
  });

  it("durations strictly increase with interval order", () => {
    const durations = CANDLE_INTERVALS.map((i) => intervalToMs(i));
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeGreaterThan(durations[i - 1]);
    }
  });

  it("throws on an unknown interval", () => {
    expect(() => intervalToMs("7m")).toThrow("Unknown interval");
  });
});
