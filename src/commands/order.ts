import { Command } from "commander";
import { withAuth } from "./_helpers";
import { output, getOutputFormat } from "../output/formatter";
import { handleError } from "../output/error";
import { formatNumber, formatSide, formatTimestamp } from "../utils/helpers";
import { BUILDER_CODE } from "../config/constants";

export function registerOrderCommands(program: Command): void {
  const order = program.command("order").description("Order management");

  order
    .command("market")
    .description("Create a market order")
    .requiredOption("-s, --symbol <symbol>", "Trading symbol (e.g. BTC)")
    .requiredOption("-a, --amount <amount>", "Order amount")
    .requiredOption("--side <side>", "Order side (bid/ask)")
    .option("--slippage <percent>", "Max slippage percent", "0.5")
    .option("--reduce-only", "Reduce-only order", false)
    .option("--client-order-id <id>", "Client order ID (UUID)")
    .option("--tp <price>", "Take profit stop price")
    .option("--sl <price>", "Stop loss stop price")
    .action(async (options) => {
      try {
        const { client } = withAuth();
        const result = await client.createMarketOrder({
          symbol: options.symbol,
          amount: options.amount,
          side: options.side,
          slippagePercent: options.slippage,
          reduceOnly: options.reduceOnly,
          clientOrderId: options.clientOrderId,
          builderCode: BUILDER_CODE,
          takeProfit: options.tp
            ? { stop_price: options.tp }
            : undefined,
          stopLoss: options.sl ? { stop_price: options.sl } : undefined,
        });
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  order
    .command("limit")
    .description("Create a limit order")
    .requiredOption("-s, --symbol <symbol>", "Trading symbol")
    .requiredOption("-p, --price <price>", "Order price")
    .requiredOption("-a, --amount <amount>", "Order amount")
    .requiredOption("--side <side>", "Order side (bid/ask)")
    .option("--tif <tif>", "Time in force (GTC/IOC/ALO/TOB)", "GTC")
    .option("--reduce-only", "Reduce-only order", false)
    .option("--client-order-id <id>", "Client order ID (UUID)")
    .option("--tp <price>", "Take profit stop price")
    .option("--sl <price>", "Stop loss stop price")
    .action(async (options) => {
      try {
        const { client } = withAuth();
        const result = await client.createLimitOrder({
          symbol: options.symbol,
          price: options.price,
          amount: options.amount,
          side: options.side,
          tif: options.tif,
          reduceOnly: options.reduceOnly,
          clientOrderId: options.clientOrderId,
          builderCode: BUILDER_CODE,
          takeProfit: options.tp
            ? { stop_price: options.tp }
            : undefined,
          stopLoss: options.sl ? { stop_price: options.sl } : undefined,
        });
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  order
    .command("cancel")
    .description("Cancel an order")
    .requiredOption("-s, --symbol <symbol>", "Trading symbol")
    .option("--order-id <id>", "Exchange order ID")
    .option("--client-order-id <id>", "Client order ID")
    .action(async (options) => {
      try {
        if (!options.orderId && !options.clientOrderId) {
          console.error("Provide --order-id or --client-order-id");
          process.exit(1);
        }
        const { client } = withAuth();
        const result = await client.cancelOrder({
          symbol: options.symbol,
          orderId: options.orderId ? parseInt(options.orderId) : undefined,
          clientOrderId: options.clientOrderId,
        });
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  order
    .command("cancel-all")
    .description("Cancel all orders")
    .option("-s, --symbol <symbol>", "Cancel only for this symbol")
    .option("--exclude-reduce-only", "Exclude reduce-only orders", false)
    .action(async (options) => {
      try {
        const { client } = withAuth();
        const result = await client.cancelAllOrders({
          allSymbols: !options.symbol,
          symbol: options.symbol,
          excludeReduceOnly: options.excludeReduceOnly,
        });
        output(result, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  order
    .command("list")
    .description("List open orders")
    .action(async () => {
      try {
        const { client, account } = withAuth();
        const result = await client.getOpenOrders(account);

        const formatted = (result.data || []).map((o) => ({
          order_id: o.order_id,
          symbol: o.symbol,
          side: formatSide(o.side),
          type: o.order_type,
          price: formatNumber(o.price),
          amount: o.initial_amount,
          filled: o.filled_amount,
          reduce_only: o.reduce_only,
          created: formatTimestamp(o.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });

  order
    .command("history")
    .description("Get order history")
    .option("-l, --limit <limit>", "Number of records", "20")
    .action(async (options) => {
      try {
        const { client, account } = withAuth();
        const result = await client.getOrderHistory(
          account,
          parseInt(options.limit)
        );

        const formatted = (result.data || []).map((o) => ({
          order_id: o.order_id,
          symbol: o.symbol,
          side: formatSide(o.side),
          type: o.order_type,
          price: formatNumber(o.initial_price),
          avg_fill: o.average_filled_price
            ? formatNumber(o.average_filled_price)
            : "-",
          amount: o.amount,
          filled: o.filled_amount,
          status: o.order_status,
          created: formatTimestamp(o.created_at),
        }));

        output(formatted, getOutputFormat(program.opts()));
      } catch (e) {
        handleError(e);
      }
    });
}
