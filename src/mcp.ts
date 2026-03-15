import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPublicClient, createAuthClient } from "./commands/_helpers";
import { BUILDER_CODE, BUILDER_MAX_FEE_RATE } from "./config/constants";

function mcpText(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function mcpError(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const result = await fn();
    return mcpText(JSON.stringify(result, null, 2));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return mcpError(msg);
  }
}

const server = new McpServer({ name: "pacifica", version: "0.1.0" });

// ─── Market Data Tools ─────────────────────────────────────────────────

server.tool("get_market_info", "Get market info for all available instruments", {}, async () => {
  return withErrorHandling(() => createPublicClient().getMarketInfo());
});

server.tool("get_prices", "Get price information for all symbols", {}, async () => {
  return withErrorHandling(() => createPublicClient().getPrices());
});

server.tool(
  "get_orderbook",
  "Get orderbook for a trading symbol",
  { symbol: z.string().describe("Trading symbol (e.g. BTC)"), agg_level: z.number().optional().describe("Aggregation level") },
  async ({ symbol, agg_level }) => {
    return withErrorHandling(() => createPublicClient().getOrderbook(symbol, agg_level));
  }
);

server.tool(
  "get_recent_trades",
  "Get recent trades for a symbol",
  { symbol: z.string().describe("Trading symbol") },
  async ({ symbol }) => {
    return withErrorHandling(() => createPublicClient().getRecentTrades(symbol));
  }
);

server.tool(
  "get_candles",
  "Get candlestick data for a symbol",
  {
    symbol: z.string(),
    interval: z.string().describe("1m,5m,15m,1h,4h,1d"),
    start_time: z.number().describe("Start time in ms"),
    end_time: z.number().optional().describe("End time in ms"),
  },
  async ({ symbol, interval, start_time, end_time }) => {
    return withErrorHandling(() => createPublicClient().getCandles(symbol, interval, start_time, end_time));
  }
);

server.tool(
  "get_historical_funding",
  "Get historical funding rates for a symbol",
  { symbol: z.string(), limit: z.number().optional() },
  async ({ symbol, limit }) => {
    return withErrorHandling(() => createPublicClient().getHistoricalFunding(symbol, limit));
  }
);

// ─── Account Tools ──────────────────────────────────────────────────────

server.tool("get_account_info", "Get account information", {}, async () => {
  const auth = createAuthClient();
  if (!auth) return mcpError("Not configured. Run: pacifica-cli config init");
  return withErrorHandling(() => auth.client.getAccountInfo(auth.account));
});

server.tool("get_account_settings", "Get account margin/leverage settings", {}, async () => {
  const auth = createAuthClient();
  if (!auth) return mcpError("Not configured");
  return withErrorHandling(() => auth.client.getAccountSettings(auth.account));
});

server.tool("get_positions", "Get all open positions", {}, async () => {
  const auth = createAuthClient();
  if (!auth) return mcpError("Not configured");
  return withErrorHandling(() => auth.client.getPositions(auth.account));
});

server.tool("get_open_orders", "Get all open orders", {}, async () => {
  const auth = createAuthClient();
  if (!auth) return mcpError("Not configured");
  return withErrorHandling(() => auth.client.getOpenOrders(auth.account));
});

server.tool(
  "get_order_history",
  "Get order history",
  { limit: z.number().optional() },
  async ({ limit }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() => auth.client.getOrderHistory(auth.account, limit));
  }
);

server.tool(
  "get_trade_history",
  "Get trade history",
  { symbol: z.string().optional(), limit: z.number().optional() },
  async ({ symbol, limit }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() => auth.client.getTradeHistory(auth.account, { symbol, limit }));
  }
);

server.tool(
  "get_funding_history",
  "Get funding payment history",
  { limit: z.number().optional() },
  async ({ limit }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() => auth.client.getFundingHistory(auth.account, limit));
  }
);

// ─── Order Tools ────────────────────────────────────────────────────────

server.tool(
  "create_market_order",
  "Create a market order",
  {
    symbol: z.string(),
    amount: z.string(),
    side: z.enum(["bid", "ask"]),
    slippage_percent: z.string().default("0.5"),
    reduce_only: z.boolean().default(false),
  },
  async ({ symbol, amount, side, slippage_percent, reduce_only }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() =>
      auth.client.createMarketOrder({
        symbol,
        amount,
        side,
        slippagePercent: slippage_percent,
        reduceOnly: reduce_only,
        builderCode: BUILDER_CODE,
      })
    );
  }
);

server.tool(
  "create_limit_order",
  "Create a limit order",
  {
    symbol: z.string(),
    price: z.string(),
    amount: z.string(),
    side: z.enum(["bid", "ask"]),
    tif: z.enum(["GTC", "IOC", "ALO", "TOB"]).default("GTC"),
    reduce_only: z.boolean().default(false),
  },
  async ({ symbol, price, amount, side, tif, reduce_only }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() =>
      auth.client.createLimitOrder({
        symbol,
        price,
        amount,
        side,
        tif,
        reduceOnly: reduce_only,
        builderCode: BUILDER_CODE,
      })
    );
  }
);

server.tool(
  "cancel_order",
  "Cancel a specific order",
  {
    symbol: z.string(),
    order_id: z.number().optional(),
    client_order_id: z.string().optional(),
  },
  async ({ symbol, order_id, client_order_id }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() =>
      auth.client.cancelOrder({ symbol, orderId: order_id, clientOrderId: client_order_id })
    );
  }
);

server.tool(
  "cancel_all_orders",
  "Cancel all orders",
  {
    symbol: z.string().optional(),
    exclude_reduce_only: z.boolean().default(false),
  },
  async ({ symbol, exclude_reduce_only }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() =>
      auth.client.cancelAllOrders({ allSymbols: !symbol, symbol, excludeReduceOnly: exclude_reduce_only })
    );
  }
);

server.tool(
  "update_leverage",
  "Update leverage for a symbol",
  { symbol: z.string(), leverage: z.number() },
  async ({ symbol, leverage }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() => auth.client.updateLeverage(symbol, leverage));
  }
);

server.tool(
  "update_margin_mode",
  "Update margin mode for a symbol",
  { symbol: z.string(), isolated: z.boolean() },
  async ({ symbol, isolated }) => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() => auth.client.updateMarginMode(symbol, isolated));
  }
);

server.tool(
  "approve_builder_code",
  "Approve the builder code for fee sharing",
  {},
  async () => {
    const auth = createAuthClient();
    if (!auth) return mcpError("Not configured");
    return withErrorHandling(() =>
      auth.client.approveBuilderCode({ builderCode: BUILDER_CODE, maxFeeRate: BUILDER_MAX_FEE_RATE })
    );
  }
);

// ─── Start Server ───────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
