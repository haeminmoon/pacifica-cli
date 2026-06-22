# Market Data Reference

All market data commands are public and do not require authentication. Use them freely for price checks, research, and strategy development.

## Instruments

Pacifica offers 25+ perpetual instruments across crypto, forex, commodities, and equities.

### List All Instruments

```bash
pacifica-cli market info
pacifica-cli market info -o json
```

### Filter by Symbol

```bash
pacifica-cli market info --symbol BTC
pacifica-cli market info --symbol ETH -o json
```

### Instrument Fields

| Field | Description |
|-------|-------------|
| `symbol` | Trading symbol (e.g., BTC, ETH, SOL) |
| `tick_size` | Minimum price increment |
| `lot_size` | Minimum amount increment |
| `max_leverage` | Maximum leverage allowed |
| `min_order_size` | Minimum order notional in USD |
| `max_order_size` | Maximum order notional in USD |
| `funding_rate` | Current funding rate |

### Available Symbols

Use `pacifica-cli market info` to discover all available symbols. Common categories:

**Crypto:** BTC, ETH, SOL, XRP, DOGE, AVAX, SUI, LINK, AAVE, UNI, CRV, LTC, LDO, HYPE, ENA, BNB

**Forex:** EURUSD

**Commodities:** XAU (Gold), XAG (Silver), NATGAS, CL (Oil), PAXG

**Equities:** NVDA, GOOGL, HOOD

**Memes:** PUMP, FARTCOIN, kBONK, kPEPE, PENGU

## Prices

Get prices, funding rates, open interest, and 24h volume for all symbols:

```bash
pacifica-cli market prices
pacifica-cli market prices --symbol BTC -o json
```

### Price Fields

| Field | Description |
|-------|-------------|
| `mark` | Mark price (used for margin/liquidation) |
| `mid` | Mid price (average of best bid/ask) |
| `oracle` | Oracle price (external reference) |
| `funding` | Current funding rate |
| `next_funding` | Next period funding rate |
| `open_interest` | Total open interest |
| `volume_24h` | 24-hour trading volume in USD |

## Orderbook

View bids and asks for a symbol:

```bash
pacifica-cli market orderbook BTC
pacifica-cli market orderbook ETH --depth 5
pacifica-cli market orderbook BTC -o json
```

### Orderbook Fields

| Field | Description |
|-------|-------------|
| `side` | BID or ASK |
| `price` | Price level |
| `amount` | Total amount at this level |
| `orders` | Number of orders at this level |

### Analyzing Orderbook

- **Spread** = lowest ask - highest bid. Tight spread = good liquidity.
- **Depth** = total amount at each level. Deep book = less slippage.
- **Imbalance** = total bid amount vs total ask amount. More bids = buying pressure.

## Recent Trades

View recent executions:

```bash
pacifica-cli market trades BTC
pacifica-cli market trades ETH -o json
```

### Trade Fields

| Field | Description |
|-------|-------------|
| `price` | Execution price |
| `amount` | Trade amount |
| `side` | open_long, open_short, close_long, close_short |
| `cause` | normal, liquidation |
| `time` | Timestamp |

## Candlestick Data

Get OHLCV candles:

```bash
pacifica-cli market candles BTC -i 1h
pacifica-cli market candles ETH -i 4h
pacifica-cli market candles SOL -i 1d -o json
```

### Intervals

| Interval | Description |
|----------|-------------|
| `1m` | 1 minute |
| `3m` | 3 minutes |
| `5m` | 5 minutes |
| `15m` | 15 minutes |
| `30m` | 30 minutes |
| `1h` | 1 hour |
| `2h` | 2 hours |
| `4h` | 4 hours |
| `8h` | 8 hours |
| `12h` | 12 hours |
| `1d` | 1 day |

### Candle Fields

| Field | Description |
|-------|-------------|
| `time` | Candle open time |
| `open` | Open price |
| `high` | High price |
| `low` | Low price |
| `close` | Close price |
| `volume` | Volume |
| `trades` | Number of trades |

### Number of Bars & Pagination

The Pacifica `/kline` API returns **at most 4000 bars per request**. The CLI exposes this through
`-c, --count <n>` (default `200`), which fetches the N most-recent bars ending now (or at `--end`):

```bash
# Default: 200 most-recent bars
pacifica-cli market candles BTC -i 1m

# Up to the per-request maximum (single request; may be slightly fewer due to market gaps)
pacifica-cli market candles BTC -i 1m -c 4000 -o json

# More than 4000: the CLI AUTO-PAGINATES, windowing the time range backwards in
# <=4000-bar chunks, deduping and sorting ascending by time, capped at the requested count
pacifica-cli market candles BTC -i 1m -c 8000 -o json | jq 'length'   # ~8000
```

When `--count` exceeds 4000 the CLI issues multiple `/kline` requests automatically — no manual
paging needed. Bars are returned oldest-first with no duplicates, and never more than `--count`.

### Custom Time Range

```bash
# Custom start time (milliseconds). Overrides --count; a single request only.
pacifica-cli market candles BTC -i 1h --start 1700000000000

# Custom range
pacifica-cli market candles BTC -i 1h --start 1700000000000 --end 1700100000000
```

A `--start`/`--end` range wider than 4000 bars is rejected with a clear message (it does not leak a
raw server error). To pull more than 4000 bars, use `--count <n>` so the CLI auto-paginates.

## Funding Rates

View historical funding rates for a symbol:

```bash
pacifica-cli market funding BTC
pacifica-cli market funding ETH -l 50
pacifica-cli market funding SOL -o json
```

### Funding Fields

| Field | Description |
|-------|-------------|
| `funding_rate` | Actual funding rate applied |
| `next_funding_rate` | Predicted next funding rate |
| `oracle_price` | Oracle price at the time |
| `time` | Settlement timestamp |

### Funding Rate Interpretation

| Rate | Direction | Meaning |
|------|-----------|---------|
| Positive | Longs pay shorts | Market is bullish (trading at premium to oracle) |
| Negative | Shorts pay longs | Market is bearish (trading at discount to oracle) |
| Very high (>0.01%) | Strong bias | Consider contrarian position to collect funding |
| Near zero | Balanced | No significant funding opportunity |

Funding is settled every hour on Pacifica. Payment = position size * funding rate * mark price.

### Funding Rate Scanning

To find funding opportunities across all symbols:

```bash
pacifica-cli market prices -o json
```

Check the `funding` and `next_funding` fields for each symbol to identify extreme rates.
