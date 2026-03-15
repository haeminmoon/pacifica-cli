import axios, { AxiosInstance } from "axios";
import { BASE_URLS } from "../config/constants";
import { SignerConfig, signPayload } from "../signing/signer";
import {
  ApiResponse,
  MarketInfo,
  PriceInfo,
  OrderbookData,
  RecentTrade,
  Candle,
  FundingRate,
  AccountInfo,
  AccountSettings,
  Position,
  Order,
  TradeRecord,
  FundingPayment,
} from "./types";

export class PacificaApiClient {
  private http: AxiosInstance;
  private signerConfig?: SignerConfig;

  constructor(env: string, signerConfig?: SignerConfig) {
    const baseURL = BASE_URLS[env];
    if (!baseURL) {
      throw new Error(`Unknown environment: ${env}`);
    }
    this.http = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json", Accept: "*/*" },
      timeout: 30000,
    });
    this.signerConfig = signerConfig;
  }

  private ensureSigner(): SignerConfig {
    if (!this.signerConfig) {
      throw new Error("Authentication required. Run: pacifica-cli config init");
    }
    return this.signerConfig;
  }

  private async signedPost<T>(
    path: string,
    type: string,
    data: Record<string, unknown>,
    expiryWindow?: number
  ): Promise<T> {
    const signer = this.ensureSigner();
    const payload = signPayload(signer, type, data, expiryWindow);
    const res = await this.http.post<T>(path, payload);
    return res.data;
  }

  // ─── Market Data (Public GET) ────────────────────────────────────────

  async getMarketInfo(): Promise<ApiResponse<MarketInfo[]>> {
    const res = await this.http.get("/info");
    return res.data;
  }

  async getPrices(): Promise<ApiResponse<PriceInfo[]>> {
    const res = await this.http.get("/info/prices");
    return res.data;
  }

  async getOrderbook(symbol: string, aggLevel?: number): Promise<ApiResponse<OrderbookData>> {
    const params: Record<string, unknown> = { symbol };
    if (aggLevel !== undefined) params.agg_level = aggLevel;
    const res = await this.http.get("/book", { params });
    return res.data;
  }

  async getRecentTrades(symbol: string): Promise<ApiResponse<RecentTrade[]>> {
    const res = await this.http.get("/trades", { params: { symbol } });
    return res.data;
  }

  async getCandles(
    symbol: string,
    interval: string,
    startTime: number,
    endTime?: number
  ): Promise<ApiResponse<Candle[]>> {
    const params: Record<string, unknown> = {
      symbol,
      interval,
      start_time: startTime,
    };
    if (endTime !== undefined) params.end_time = endTime;
    const res = await this.http.get("/kline", { params });
    return res.data;
  }

  async getHistoricalFunding(
    symbol: string,
    limit?: number,
    cursor?: string
  ): Promise<ApiResponse<FundingRate[]>> {
    const params: Record<string, unknown> = { symbol };
    if (limit !== undefined) params.limit = limit;
    if (cursor) params.cursor = cursor;
    const res = await this.http.get("/funding_rate/history", { params });
    return res.data;
  }

  // ─── Account (GET with account param) ────────────────────────────────

  async getAccountInfo(account: string): Promise<ApiResponse<AccountInfo>> {
    const res = await this.http.get("/account", { params: { account } });
    return res.data;
  }

  async getAccountSettings(account: string): Promise<ApiResponse<AccountSettings>> {
    const res = await this.http.get("/account/settings", {
      params: { account },
    });
    return res.data;
  }

  async getPositions(account: string): Promise<ApiResponse<Position[]>> {
    const res = await this.http.get("/positions", { params: { account } });
    return res.data;
  }

  async getOpenOrders(account: string): Promise<ApiResponse<Order[]>> {
    const res = await this.http.get("/orders", { params: { account } });
    return res.data;
  }

  async getOrderHistory(
    account: string,
    limit?: number,
    cursor?: string
  ): Promise<ApiResponse<Order[]>> {
    const params: Record<string, unknown> = { account };
    if (limit !== undefined) params.limit = limit;
    if (cursor) params.cursor = cursor;
    const res = await this.http.get("/orders/history", { params });
    return res.data;
  }

  async getTradeHistory(
    account: string,
    opts?: {
      symbol?: string;
      startTime?: number;
      endTime?: number;
      limit?: number;
      cursor?: string;
    }
  ): Promise<ApiResponse<TradeRecord[]>> {
    const params: Record<string, unknown> = { account };
    if (opts?.symbol) params.symbol = opts.symbol;
    if (opts?.startTime) params.start_time = opts.startTime;
    if (opts?.endTime) params.end_time = opts.endTime;
    if (opts?.limit) params.limit = opts.limit;
    if (opts?.cursor) params.cursor = opts.cursor;
    const res = await this.http.get("/trades/history", { params });
    return res.data;
  }

  async getFundingHistory(
    account: string,
    limit?: number,
    cursor?: string
  ): Promise<ApiResponse<FundingPayment[]>> {
    const params: Record<string, unknown> = { account };
    if (limit !== undefined) params.limit = limit;
    if (cursor) params.cursor = cursor;
    const res = await this.http.get("/funding/history", { params });
    return res.data;
  }

  // ─── Orders (Signed POST) ───────────────────────────────────────────

  async createMarketOrder(opts: {
    symbol: string;
    amount: string;
    side: "bid" | "ask";
    slippagePercent: string;
    reduceOnly: boolean;
    clientOrderId?: string;
    builderCode?: string;
    takeProfit?: { stop_price: string; limit_price?: string };
    stopLoss?: { stop_price: string; limit_price?: string };
  }): Promise<unknown> {
    const data: Record<string, unknown> = {
      symbol: opts.symbol,
      amount: opts.amount,
      side: opts.side,
      slippage_percent: opts.slippagePercent,
      reduce_only: opts.reduceOnly,
    };
    if (opts.clientOrderId) data.client_order_id = opts.clientOrderId;
    if (opts.builderCode) data.builder_code = opts.builderCode;
    if (opts.takeProfit) data.take_profit = opts.takeProfit;
    if (opts.stopLoss) data.stop_loss = opts.stopLoss;

    return this.signedPost("/orders/create_market", "create_market_order", data);
  }

  async createLimitOrder(opts: {
    symbol: string;
    price: string;
    amount: string;
    side: "bid" | "ask";
    tif: string;
    reduceOnly: boolean;
    clientOrderId?: string;
    builderCode?: string;
    takeProfit?: { stop_price: string; limit_price?: string };
    stopLoss?: { stop_price: string; limit_price?: string };
  }): Promise<unknown> {
    const data: Record<string, unknown> = {
      symbol: opts.symbol,
      price: opts.price,
      amount: opts.amount,
      side: opts.side,
      tif: opts.tif,
      reduce_only: opts.reduceOnly,
    };
    if (opts.clientOrderId) data.client_order_id = opts.clientOrderId;
    if (opts.builderCode) data.builder_code = opts.builderCode;
    if (opts.takeProfit) data.take_profit = opts.takeProfit;
    if (opts.stopLoss) data.stop_loss = opts.stopLoss;

    return this.signedPost("/orders/create", "create_order", data);
  }

  async cancelOrder(opts: {
    symbol: string;
    orderId?: number;
    clientOrderId?: string;
  }): Promise<unknown> {
    const data: Record<string, unknown> = { symbol: opts.symbol };
    if (opts.orderId !== undefined) data.order_id = opts.orderId;
    if (opts.clientOrderId) data.client_order_id = opts.clientOrderId;

    return this.signedPost("/orders/cancel", "cancel_order", data);
  }

  async cancelAllOrders(opts: {
    allSymbols: boolean;
    symbol?: string;
    excludeReduceOnly?: boolean;
  }): Promise<unknown> {
    const data: Record<string, unknown> = {
      all_symbols: opts.allSymbols,
      exclude_reduce_only: opts.excludeReduceOnly ?? false,
    };
    if (!opts.allSymbols && opts.symbol) {
      data.symbol = opts.symbol;
    }

    return this.signedPost("/orders/cancel_all", "cancel_all_orders", data);
  }

  // ─── Account Actions (Signed POST) ──────────────────────────────────

  async updateLeverage(symbol: string, leverage: number): Promise<unknown> {
    return this.signedPost("/account/leverage", "update_leverage", {
      symbol,
      leverage,
    });
  }

  async updateMarginMode(
    symbol: string,
    isolated: boolean
  ): Promise<unknown> {
    return this.signedPost("/account/margin_mode", "update_margin_mode", {
      symbol,
      isolated,
    });
  }

  async approveBuilderCode(opts: {
    builderCode: string;
    maxFeeRate: string;
  }): Promise<unknown> {
    return this.signedPost(
      "/account/builder_codes/approve",
      "approve_builder_code",
      {
        builder_code: opts.builderCode,
        max_fee_rate: opts.maxFeeRate,
      }
    );
  }
}
