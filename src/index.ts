import "dotenv/config";
import { Command } from "commander";
import { registerConfigCommands } from "./commands/config";
import { registerMarketCommands } from "./commands/market";
import { registerOrderCommands } from "./commands/order";
import { registerAccountCommands } from "./commands/account";
import { registerPositionCommands } from "./commands/position";
import { handleError } from "./output/error";

const program = new Command();

program
  .name("pacifica-cli")
  .description("CLI toolkit for trading on Pacifica exchange")
  .version("0.1.0")
  .option("-o, --output <format>", "Output format (json/table)", "table")
  .exitOverride();

registerConfigCommands(program);
registerMarketCommands(program);
registerOrderCommands(program);
registerAccountCommands(program);
registerPositionCommands(program);

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "commander.helpDisplayed"
    ) {
      process.exit(0);
    }
    handleError(error);
  }
}

main();
