import { resolveEnv, BASE_URLS } from "../../src/config/constants";

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
