import { Command } from "commander";
import { createPublicClient } from "./_helpers";
import { output, getOutputFormat } from "../output/formatter";
import { handleError } from "../output/error";
import { formatNumber, formatTimestamp } from "../utils/helpers";

export function registerMarketCommands(program: Command): void {
  const market = program
    .command("market")
    .description("Market data commands");

  market
    .command("info")
    .description("List all available instruments")
    .option("--symbol <symbol>", "Filter by symbol")
    .action(async (options) => {
      try {
        const client = createPublicClient();
        const result = await client.getMarketInfo();
        let data = result.data || [];

        if (options.symbol) {
          data = data.filter(
            (d) =>
              d.symbol.toUpperCase() === options.symbol.toUpperCase()
          );
        }

        const formatted = data.map((d) => ({
          symbol: d.symbol,
          tick_size: d.tick_size,
          lot_size: d.lot_size,
          max_leverage: d.max_leverage,
          min_order: d.min_order_size,
          max_order: d.max_order_size,
          funding_rate: formatNumber(d.funding_rate, 6),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  market
    .command("prices")
    .description("Get price information for all symbols")
    .option("--symbol <symbol>", "Filter by symbol")
    .action(async (options) => {
      try {
        const client = createPublicClient();
        const result = await client.getPrices();
        let data = result.data || [];

        if (options.symbol) {
          data = data.filter(
            (d) =>
              d.symbol.toUpperCase() === options.symbol.toUpperCase()
          );
        }

        const formatted = data.map((d) => ({
          symbol: d.symbol,
          mark: formatNumber(d.mark),
          mid: formatNumber(d.mid),
          oracle: formatNumber(d.oracle),
          funding: formatNumber(d.funding, 6),
          next_funding: formatNumber(d.next_funding, 6),
          open_interest: formatNumber(d.open_interest, 2),
          volume_24h: formatNumber(d.volume_24h, 2),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  market
    .command("orderbook")
    .description("Get orderbook for a symbol")
    .argument("<symbol>", "Trading symbol (e.g. BTC)")
    .option("--depth <depth>", "Aggregation level", "1")
    .action(async (symbol: string, options) => {
      try {
        const client = createPublicClient();
        const result = await client.getOrderbook(
          symbol,
          parseInt(options.depth)
        );

        const book = result.data;
        if (!book || !book.l) {
          console.log("No orderbook data");
          return;
        }

        const bids = (book.l[0] || []).map((level) => ({
          side: "BID",
          price: formatNumber(level.p),
          amount: formatNumber(level.a),
          orders: level.n,
        }));

        const asks = (book.l[1] || []).map((level) => ({
          side: "ASK",
          price: formatNumber(level.p),
          amount: formatNumber(level.a),
          orders: level.n,
        }));

        const fmt = getOutputFormat(program.opts());
        if (fmt === "json") {
          output({ bids: book.l[0], asks: book.l[1], timestamp: book.t }, fmt);
        } else {
          console.log(`\n  Orderbook: ${symbol}  (${formatTimestamp(book.t)})\n`);
          console.log("  --- ASKS ---");
          output(asks.reverse(), fmt);
          console.log("\n  --- BIDS ---");
          output(bids, fmt);
        }
      } catch (e) {
        handleError(e);
      }
    });

  market
    .command("trades")
    .description("Get recent trades for a symbol")
    .argument("<symbol>", "Trading symbol")
    .action(async (symbol: string) => {
      try {
        const client = createPublicClient();
        const result = await client.getRecentTrades(symbol);

        const formatted = (result.data || []).map((t) => ({
          price: formatNumber(t.price),
          amount: formatNumber(t.amount),
          side: t.side,
          cause: t.cause,
          time: formatTimestamp(t.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  market
    .command("candles")
    .description("Get candlestick data")
    .argument("<symbol>", "Trading symbol")
    .option(
      "-i, --interval <interval>",
      "Candle interval (1m,5m,15m,1h,4h,1d)",
      "1h"
    )
    .option(
      "--start <timestamp>",
      "Start time in ms",
      String(Date.now() - 24 * 60 * 60 * 1000)
    )
    .option("--end <timestamp>", "End time in ms")
    .action(async (symbol: string, options) => {
      try {
        const client = createPublicClient();
        const result = await client.getCandles(
          symbol,
          options.interval,
          parseInt(options.start),
          options.end ? parseInt(options.end) : undefined
        );

        const formatted = (result.data || []).map((c) => ({
          time: formatTimestamp(c.t),
          open: formatNumber(c.o),
          high: formatNumber(c.h),
          low: formatNumber(c.l),
          close: formatNumber(c.c),
          volume: formatNumber(c.v, 2),
          trades: c.n,
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  market
    .command("funding")
    .description("Get historical funding rates")
    .argument("<symbol>", "Trading symbol")
    .option("-l, --limit <limit>", "Number of records", "20")
    .action(async (symbol: string, options) => {
      try {
        const client = createPublicClient();
        const result = await client.getHistoricalFunding(
          symbol,
          parseInt(options.limit)
        );

        const formatted = (result.data || []).map((f) => ({
          funding_rate: formatNumber(f.funding_rate, 6),
          next_funding_rate: formatNumber(f.next_funding_rate, 6),
          oracle_price: formatNumber(f.oracle_price),
          time: formatTimestamp(f.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });
}
