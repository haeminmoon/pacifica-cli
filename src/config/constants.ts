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
