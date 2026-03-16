import fs from "fs";
import path from "path";
import { CONFIG_DIR, CONFIG_FILE } from "./constants";

export interface CliConfig {
  env: string;
  privateKey?: string;
  account?: string;
}

const DEFAULT_CONFIG: CliConfig = {
  env: "mainnet",
};

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function configPath(): string {
  return path.join(CONFIG_DIR, CONFIG_FILE);
}

export function loadConfig(): CliConfig {
  try {
    const raw = fs.readFileSync(configPath(), "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_CONFIG };
    }
    console.error(`Warning: Failed to load config: ${err instanceof Error ? err.message : String(err)}`);
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(partial: Partial<CliConfig>): void {
  ensureConfigDir();
  const existing = loadConfig();
  const merged = { ...existing, ...partial };
  fs.writeFileSync(configPath(), JSON.stringify(merged, null, 2), {
    mode: 0o600,
  });
}

export function getEffectiveConfig(): CliConfig {
  const fileConfig = loadConfig();

  return {
    env: fileConfig.env,
    privateKey: process.env.PACIFICA_WALLET_PRIVATE_KEY || fileConfig.privateKey,
    account: process.env.PACIFICA_WALLET_ADDRESS || fileConfig.account,
  };
}

export function maskSecret(value: string): string {
  if (value.length <= 8) return "****";
  return value.slice(0, 4) + "****" + value.slice(-4);
}
