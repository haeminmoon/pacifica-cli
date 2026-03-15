import { Command } from "commander";
import { withAuth } from "./_helpers";
import { output, getOutputFormat } from "../output/formatter";
import { handleError } from "../output/error";
import { formatNumber, formatSide, formatTimestamp } from "../utils/helpers";

export function registerPositionCommands(program: Command): void {
  const position = program
    .command("position")
    .description("Position management");

  position
    .command("list")
    .description("List all open positions")
    .action(async () => {
      try {
        const ctx = withAuth();
        const result = await ctx.client.getPositions(ctx.account);

        const formatted = (result.data || []).map((p) => ({
          symbol: p.symbol,
          side: formatSide(p.side),
          amount: formatNumber(p.amount),
          entry_price: formatNumber(p.entry_price),
          margin: p.margin ? formatNumber(p.margin, 2) : "-",
          funding: formatNumber(p.funding, 4),
          isolated: p.isolated ? "YES" : "NO",
          opened: formatTimestamp(p.created_at),
          updated: formatTimestamp(p.updated_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });
}
