/** Generic API response envelope */
export interface ApiResponse<T> {
  data: T;
}

/** GET /info */
export interface MarketInfo {
  symbol: string;
  tick_size: string;
  lot_size: string;
  max_leverage: number;
  min_order_size: string;
  max_order_size: string;
  funding_rate: string;
}

/** GET /info/prices */
export interface PriceInfo {
  symbol: string;
  mark: string;
  mid: string;
  oracle: string;
  funding: string;
  next_funding: string;
  open_interest: string;
  volume_24h: string;
}

/** GET /book */
export interface OrderbookLevel {
  p: string;
  a: string;
  n: number;
}

export interface OrderbookData {
  l: [OrderbookLevel[], OrderbookLevel[]];
  t: number;
}

/** GET /trades */
export interface RecentTrade {
  price: string;
  amount: string;
  side: string;
  cause: string;
  created_at: number;
}

/** GET /kline */
export interface Candle {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
  n: number;
}

/** GET /funding_rate/history */
export interface FundingRate {
  funding_rate: string;
  next_funding_rate: string;
  oracle_price: string;
  created_at: number;
}

/** GET /account */
export interface AccountInfo {
  balance: string;
  account_equity: string;
  available_to_spend: string;
  available_to_withdraw: string;
  pending_balance: string;
  total_margin_used: string;
  fee_level: number;
  maker_fee: string;
  taker_fee: string;
  positions_count: number;
  orders_count: number;
  updated_at: number;
}

/** GET /account/settings */
export interface MarginSetting {
  symbol: string;
  isolated: boolean;
  leverage: number;
  updated_at: number;
}

export interface AccountSettings {
  margin_settings: MarginSetting[];
}

/** GET /orders, /orders/history */
export interface Order {
  order_id: number;
  symbol: string;
  side: string;
  order_type: string;
  price: string;
  initial_price: string;
  initial_amount: string;
  amount: string;
  filled_amount: string;
  average_filled_price: string | null;
  order_status: string;
  reduce_only: boolean;
  created_at: number;
}

/** GET /positions */
export interface Position {
  symbol: string;
  side: string;
  amount: string;
  entry_price: string;
  margin: string | null;
  funding: string;
  isolated: boolean;
  created_at: number;
  updated_at: number;
}

/** GET /trades/history */
export interface TradeRecord {
  symbol: string;
  side: string;
  amount: string;
  price: string;
  entry_price: string;
  fee: string;
  pnl: string;
  event_type: string;
  created_at: number;
}

/** GET /funding/history */
export interface FundingPayment {
  symbol: string;
  side: string;
  amount: string;
  payout: string;
  rate: string;
  created_at: number;
}
