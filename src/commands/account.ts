import { Command } from "commander";
import { withAuth } from "./_helpers";
import { output, getOutputFormat } from "../output/formatter";
import { handleError } from "../output/error";
import { formatNumber, formatTimestamp } from "../utils/helpers";
import { BUILDER_CODE, BUILDER_MAX_FEE_RATE } from "../config/constants";

export function registerAccountCommands(program: Command): void {
  const account = program
    .command("account")
    .description("Account management");

  account
    .command("info")
    .description("Get account information")
    .action(async () => {
      try {
        const ctx = withAuth();
        const result = await ctx.client.getAccountInfo(ctx.account);
        const d = result.data;
        if (!d) {
          console.log("No account data");
          return;
        }

        const info = {
          balance: formatNumber(d.balance, 2),
          account_equity: formatNumber(d.account_equity, 2),
          available_to_spend: formatNumber(d.available_to_spend, 2),
          available_to_withdraw: formatNumber(d.available_to_withdraw, 2),
          pending_balance: formatNumber(d.pending_balance, 2),
          total_margin_used: formatNumber(d.total_margin_used, 2),
          fee_level: d.fee_level,
          maker_fee: formatNumber(d.maker_fee, 4),
          taker_fee: formatNumber(d.taker_fee, 4),
          positions_count: d.positions_count,
          orders_count: d.orders_count,
          updated: formatTimestamp(d.updated_at),
        };

        output(info, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("settings")
    .description("Get account margin and leverage settings")
    .action(async () => {
      try {
        const ctx = withAuth();
        const result = await ctx.client.getAccountSettings(ctx.account);

        const settings = (result.data?.margin_settings || []).map((s) => ({
          symbol: s.symbol,
          isolated: s.isolated,
          leverage: s.leverage,
          updated: formatTimestamp(s.updated_at),
        }));

        output(settings, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("leverage")
    .description("Update leverage for a symbol")
    .requiredOption("-s, --symbol <symbol>", "Trading symbol")
    .requiredOption("-l, --leverage <leverage>", "New leverage value")
    .action(async (options) => {
      try {
        const { client } = withAuth();
        const result = await client.updateLeverage(
          options.symbol,
          parseInt(options.leverage)
        );
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("margin-mode")
    .description("Update margin mode for a symbol")
    .requiredOption("-s, --symbol <symbol>", "Trading symbol")
    .requiredOption("--mode <mode>", "Margin mode (isolated/cross)")
    .action(async (options) => {
      try {
        const { client } = withAuth();
        const isolated = options.mode.toLowerCase() === "isolated";
        const result = await client.updateMarginMode(
          options.symbol,
          isolated
        );
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("trades")
    .description("Get trade history")
    .option("-s, --symbol <symbol>", "Filter by symbol")
    .option("-l, --limit <limit>", "Number of records", "20")
    .action(async (options) => {
      try {
        const ctx = withAuth();
        const result = await ctx.client.getTradeHistory(ctx.account, {
          symbol: options.symbol,
          limit: parseInt(options.limit),
        });

        const formatted = (result.data || []).map((t) => ({
          symbol: t.symbol,
          side: t.side,
          amount: formatNumber(t.amount),
          price: formatNumber(t.price),
          entry_price: formatNumber(t.entry_price),
          fee: formatNumber(t.fee, 4),
          pnl: formatNumber(t.pnl, 2),
          type: t.event_type,
          time: formatTimestamp(t.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("builder-approve")
    .description("Approve the builder code for fee sharing")
    .action(async () => {
      try {
        const { client } = withAuth();
        const result = await client.approveBuilderCode({
          builderCode: BUILDER_CODE,
          maxFeeRate: BUILDER_MAX_FEE_RATE,
        });
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  account
    .command("funding-history")
    .description("Get funding payment history")
    .option("-l, --limit <limit>", "Number of records", "20")
    .action(async (options) => {
      try {
        const ctx = withAuth();
        const result = await ctx.client.getFundingHistory(
          ctx.account,
          parseInt(options.limit)
        );

        const formatted = (result.data || []).map((f) => ({
          symbol: f.symbol,
          side: f.side,
          amount: formatNumber(f.amount),
          payout: formatNumber(f.payout, 4),
          rate: formatNumber(f.rate, 6),
          time: formatTimestamp(f.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });
}
