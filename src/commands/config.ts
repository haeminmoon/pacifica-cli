import { Command } from "commander";
import readline from "readline";
import {
  CliConfig,
  loadConfig,
  saveConfig,
  getEffectiveConfig,
  maskSecret,
} from "../config/store";
import { resolveEnv } from "../config/constants";
import { getPublicKeyFromPrivate } from "../signing/signer";

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden) {
      process.stdout.write(question);
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      if (stdin.setRawMode) stdin.setRawMode(true);

      let input = "";
      const onData = (char: Buffer) => {
        const c = char.toString("utf8");
        if (c === "\n" || c === "\r") {
          stdin.removeListener("data", onData);
          if (stdin.setRawMode) stdin.setRawMode(wasRaw ?? false);
          process.stdout.write("\n");
          rl.close();
          resolve(input);
        } else if (c === "\u0003") {
          process.exit(0);
        } else if (c === "\u007F" || c === "\b") {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          input += c;
          process.stdout.write("*");
        }
      };

      stdin.on("data", onData);
      stdin.resume();
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

export function registerConfigCommands(program: Command): void {
  const config = program.command("config").description("Manage configuration");

  config
    .command("init")
    .description("Interactive configuration setup")
    .action(async () => {
      console.log("\n  Pacifica CLI Configuration\n");

      const privateKey = await prompt("  Wallet Private Key (base58): ", true);
      if (!privateKey) {
        console.error("  Wallet private key is required.");
        process.exit(1);
      }

      let account: string;
      try {
        account = getPublicKeyFromPrivate(privateKey);
        console.log(`  Derived wallet address: ${account}`);
      } catch {
        console.error("  Invalid wallet private key format.");
        process.exit(1);
      }

      saveConfig({
        privateKey,
        account,
      });

      console.log("\n  Configuration saved successfully!\n");
    });

  config
    .command("set")
    .description("Set a configuration value")
    .argument("<key>", "Configuration key")
    .argument("<value>", "Configuration value")
    .action((key: string, value: string) => {
      const validKeys = [
        "env",
        "privateKey",
        "account",
      ];
      if (!validKeys.includes(key)) {
        console.error(`Invalid key. Valid keys: ${validKeys.join(", ")}`);
        process.exit(1);
      }

      if (key === "env") {
        value = resolveEnv(value);
      }

      saveConfig({ [key]: value });
      console.log(`  ${key} updated.`);
    });

  config
    .command("get")
    .description("Get a configuration value")
    .argument("<key>", "Configuration key")
    .action((key: string) => {
      const cfg = getEffectiveConfig();
      const value = cfg[key as keyof CliConfig];
      if (value === undefined) {
        console.log(`  ${key}: (not set)`);
      } else if (key === "privateKey") {
        console.log(`  ${key}: ${maskSecret(String(value))}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

  config
    .command("list")
    .description("Show all configuration")
    .action(() => {
      const cfg = getEffectiveConfig();
      console.log("\n  Current Configuration:\n");
      for (const [key, value] of Object.entries(cfg)) {
        if (value === undefined) continue;
        const display =
          key === "privateKey"
            ? maskSecret(String(value))
            : String(value);
        console.log(`  ${key.padEnd(20)} ${display}`);
      }
      console.log();
    });
}
