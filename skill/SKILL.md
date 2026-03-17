---
name: pacifica
description: >-
  Trade perpetual futures on the Pacifica exchange via CLI or MCP server.
  Use when the user wants to: trade crypto perpetuals (BTC, ETH, SOL, and 25+ instruments),
  check prices or funding rates, view orderbooks, place limit or market orders,
  cancel orders, manage positions, check account balances or margin,
  view order/fill/trade history, monitor funding payments,
  or automate derivatives trading strategies.
  Pacifica is a perpetual futures exchange on Solana with deep liquidity and competitive fees.
  Also available as an MCP server (pacifica-mcp) for Claude, Cursor, and other AI agents.
license: MIT
compatibility: >-
  Requires Node.js >= 20. Works on macOS, Linux, and Windows.
  Network access to pacifica.fi required.
metadata:
  author: 2oolkit
  version: "0.1.0"
  exchange: pacifica
  openclaw:
    emoji: "🌊"
    homepage: "https://pacifica.fi"
    primaryEnv: "PACIFICA_WALLET_PRIVATE_KEY"
    requires:
      bins: ["pacifica-cli", "pacifica-mcp"]
      env: ["PACIFICA_WALLET_PRIVATE_KEY", "PACIFICA_WALLET_ADDRESS"]
    install:
      - id: "pacifica-cli-npm"
        kind: "npm"
        package: "@2oolkit/pacifica-cli"
        bins: ["pacifica-cli", "pacifica-mcp"]
        label: "Install pacifica-cli & pacifica-mcp via npm"
  clawdbot:
    emoji: "🌊"
    homepage: "https://pacifica.fi"
    primaryEnv: "PACIFICA_WALLET_PRIVATE_KEY"
    requires:
      bins: ["pacifica-cli", "pacifica-mcp"]
      env: ["PACIFICA_WALLET_PRIVATE_KEY", "PACIFICA_WALLET_ADDRESS"]
    install:
      - id: "pacifica-cli-npm"
        kind: "npm"
        package: "@2oolkit/pacifica-cli"
        bins: ["pacifica-cli"]
        label: "Install pacifica-cli via npm"
---

# Pacifica

Trade perpetual futures on [Pacifica](https://pacifica.fi), a perpetual futures exchange on Solana. Execute orders, manage positions, monitor markets, and automate trading strategies — via CLI or MCP server.

Pacifica offers 25+ perpetual instruments including crypto (BTC, ETH, SOL), forex (EURUSD), commodities (XAU, XAG, NATGAS), and equities (NVDA, GOOGL) with competitive maker/taker fees.

**Available interfaces:**
- **CLI** (`pacifica-cli`) — Terminal trading, scripting, automation
- **MCP Server** (`pacifica-mcp`) — AI agents via Model Context Protocol (Claude, Cursor, Windsurf)

## Getting Started

### Install

```bash
npm install -g @2oolkit/pacifica-cli
```

Verify installation:

```bash
pacifica-cli --version
```

### First-Time Setup

Run the interactive setup wizard:

```bash
pacifica-cli config init
```

You will be prompted for:

| Field | Description | Where to Find |
|-------|-------------|---------------|
| **Environment** | `mainnet` or `testnet` | Choose based on your needs |
| **Private Key** | Ed25519 private key (base58) | Your Solana wallet private key |

The wizard automatically derives your account address from the private key.

**Alternative: Environment Variables**

```bash
export PACIFICA_WALLET_PRIVATE_KEY=<your-private-key>
export PACIFICA_WALLET_ADDRESS=<your-wallet-address>
```

A `.env` file in the working directory is also supported.

### Verify Setup

```bash
# Check account balance
pacifica-cli account info

# Test with market data (no auth needed)
pacifica-cli market prices --symbol BTC
```

## Output Format

**Always use `-o json` when parsing command output programmatically.** Table format is for human display only.

```bash
# JSON output (for agents and scripts)
pacifica-cli market prices -o json

# Table output (default, for humans)
pacifica-cli market prices

# Pipe JSON to other tools
pacifica-cli order list -o json | jq '.[].order_id'
```

All commands support `-o json`. Data goes to stdout, errors go to stderr.

## Command Reference

### Market Data (No Authentication Required)

These commands work without config. Use them for price checks, instrument discovery, and market analysis.

| Command | Description |
|---------|-------------|
| `pacifica-cli market info` | List all available instruments |
| `pacifica-cli market info --symbol ETH` | Filter by symbol |
| `pacifica-cli market prices` | Prices, funding, open interest, 24h volume |
| `pacifica-cli market prices --symbol BTC` | Filter by symbol |
| `pacifica-cli market orderbook BTC` | Orderbook with bids and asks |
| `pacifica-cli market orderbook BTC --depth 5` | With aggregation level |
| `pacifica-cli market trades ETH` | Recent trades |
| `pacifica-cli market candles BTC -i 4h` | Candlestick data |
| `pacifica-cli market candles BTC -i 1h --start <ms>` | With custom start time |
| `pacifica-cli market funding SOL -l 50` | Funding rate history |

### Trading (Authentication Required)

All trading commands require a configured private key.

#### Create Orders

| Command | Description |
|---------|-------------|
| `pacifica-cli order market -s ETH -a 0.1 --side bid` | Market buy |
| `pacifica-cli order market -s ETH -a 0.1 --side ask` | Market sell |
| `pacifica-cli order market -s ETH -a 0.1 --side ask --reduce-only` | Market sell (close only) |
| `pacifica-cli order limit -s BTC -p 60000 -a 0.01 --side bid` | Limit buy |
| `pacifica-cli order limit -s BTC -p 70000 -a 0.01 --side ask` | Limit sell |
| `pacifica-cli order limit -s ETH -p 2000 -a 1 --side bid --tif IOC` | IOC limit |
| `pacifica-cli order market -s ETH -a 0.1 --side bid --tp 2500 --sl 1800` | With TP/SL |

**Market order options:**

| Option | Required | Description | Default |
|--------|----------|-------------|---------|
| `-s, --symbol <symbol>` | Yes | Trading symbol (e.g., `BTC`, `ETH`) | — |
| `-a, --amount <amount>` | Yes | Order amount in base currency | — |
| `--side <bid\|ask>` | Yes | `bid` (buy/long) or `ask` (sell/short) | — |
| `--slippage <percent>` | No | Max slippage percent | `0.5` |
| `--reduce-only` | No | Only reduce existing position | `false` |
| `--client-order-id <id>` | No | Custom client order ID (UUID) | — |
| `--tp <price>` | No | Take profit stop price | — |
| `--sl <price>` | No | Stop loss stop price | — |

**Limit order options:**

| Option | Required | Description | Default |
|--------|----------|-------------|---------|
| `-s, --symbol <symbol>` | Yes | Trading symbol | — |
| `-p, --price <price>` | Yes | Limit price | — |
| `-a, --amount <amount>` | Yes | Order amount | — |
| `--side <bid\|ask>` | Yes | `bid` (buy) or `ask` (sell) | — |
| `--tif <tif>` | No | GTC, IOC, ALO, TOB | `GTC` |
| `--reduce-only` | No | Only reduce existing position | `false` |
| `--client-order-id <id>` | No | Custom client order ID | — |
| `--tp <price>` | No | Take profit stop price | — |
| `--sl <price>` | No | Stop loss stop price | — |

#### Manage Orders

| Command | Description |
|---------|-------------|
| `pacifica-cli order list` | List all open orders |
| `pacifica-cli order cancel -s ETH --order-id <id>` | Cancel by order ID |
| `pacifica-cli order cancel -s ETH --client-order-id <id>` | Cancel by client order ID |
| `pacifica-cli order cancel-all` | Cancel all open orders |
| `pacifica-cli order cancel-all -s ETH` | Cancel all for a symbol |
| `pacifica-cli order history -l 50` | Order history |

### Positions

| Command | Description |
|---------|-------------|
| `pacifica-cli position list` | List all open positions |

### Account

| Command | Description |
|---------|-------------|
| `pacifica-cli account info` | Balances, equity, margin, fees |
| `pacifica-cli account settings` | Margin mode & leverage per symbol |
| `pacifica-cli account leverage -s BTC -l 20` | Set leverage |
| `pacifica-cli account margin-mode -s BTC --mode isolated` | Set margin mode |
| `pacifica-cli account trades -s ETH -l 20` | Trade history |
| `pacifica-cli account funding-history -l 20` | Funding payments |

### Authentication & Config

| Command | Description |
|---------|-------------|
| `pacifica-cli config init` | Interactive setup wizard |
| `pacifica-cli config set <key> <value>` | Update a config value |
| `pacifica-cli config get <key>` | Get a config value (secrets masked) |
| `pacifica-cli config list` | Show all config (secrets masked) |

## Common Workflows

### Check Price and Place Order

```bash
# 1. Check current ETH price
pacifica-cli market prices --symbol ETH -o json

# 2. Check available balance
pacifica-cli account info -o json

# 3. Place a limit buy below current price
pacifica-cli order limit -s ETH -p 1900 -a 0.1 --side bid

# 4. Verify the order is open
pacifica-cli order list
```

### Close a Position

```bash
# 1. Check your positions
pacifica-cli position list -o json

# 2. Close a long position with a market sell (reduce-only)
pacifica-cli order market -s ETH -a 0.1 --side ask --reduce-only

# 3. Close a short position with a market buy (reduce-only)
pacifica-cli order market -s BTC -a 0.01 --side bid --reduce-only
```

**Always use `--reduce-only` when closing positions** to prevent accidentally opening a position in the opposite direction.

### Bracket Order (Entry + Take-Profit + Stop-Loss)

```bash
# Enter long with TP/SL
pacifica-cli order market -s ETH -a 0.1 --side bid --tp 2500 --sl 1800
```

### Scale-In (Dollar-Cost Average)

```bash
# Place multiple limit buys at different levels
pacifica-cli order limit -s ETH -p 2000 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1950 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1900 -a 0.1 --side bid
```

### Funding Rate Analysis

```bash
# 1. Check funding rates across symbols
pacifica-cli market prices -o json
# Look at funding and next_funding fields

# 2. Detailed funding history for a symbol
pacifica-cli market funding BTC -l 20

# 3. Check your funding payments
pacifica-cli account funding-history -l 20
```

### Cancel Everything and Flatten

```bash
# 1. Cancel all open orders
pacifica-cli order cancel-all

# 2. Close all positions (for each position)
pacifica-cli position list -o json
# Then for each long position:
pacifica-cli order market -s <symbol> -a <amount> --side ask --reduce-only
# For each short position:
pacifica-cli order market -s <symbol> -a <amount> --side bid --reduce-only
```

### Portfolio Health Check

```bash
# 1. Check margin and available balance
pacifica-cli account info -o json

# 2. Check all open positions
pacifica-cli position list -o json

# 3. Check all open orders
pacifica-cli order list -o json

# 4. Review recent order history
pacifica-cli order history -l 10 -o json
```

## Trading Parameters

### Order Sides

| Side | Meaning |
|------|---------|
| `bid` | Buy / Long |
| `ask` | Sell / Short |

### Position Sides (in trade history)

| Side | Meaning |
|------|---------|
| `open_long` | Opening a long position |
| `open_short` | Opening a short position |
| `close_long` | Closing a long position |
| `close_short` | Closing a short position |

### Time in Force

| TIF | Description |
|-----|-------------|
| `GTC` | Good Till Cancel — remains until filled or cancelled |
| `IOC` | Immediate or Cancel — fill what's available, cancel rest |
| `ALO` | Add Liquidity Only — rejected if would take (maker-only) |
| `TOB` | Top of Book |

### Funding Rate Interpretation

| Rate | Direction | Meaning |
|------|-----------|---------|
| Positive | Longs pay shorts | Market is bullish (premium) |
| Negative | Shorts pay longs | Market is bearish (discount) |
| High absolute value | Strong directional bias | Consider contrarian position |
| Near zero | Balanced market | No significant funding opportunity |

Funding is settled every hour.

## Safety Rules

1. **Never place orders without explicit user intent.** Always confirm before placing orders.
2. **Check account balance** with `pacifica-cli account info -o json` before placing large orders.
3. **Use `--reduce-only`** when closing positions to prevent accidentally opening a new position.
4. **Start with small sizes** when testing strategies or executing unfamiliar operations.
5. **Check minimum order sizes** with `pacifica-cli market info -o json`. Orders below `min_order_size` will be rejected.
6. **Never expose the private key.** It is used locally for Ed25519 signing and is never sent to any server.
7. **Verify symbols** using `pacifica-cli market info` before placing orders.

## Error Handling

Errors are written to stderr with actionable recovery instructions.

### Common Errors and Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| `Not configured` | No private key set | `pacifica-cli config init` |
| `Verification failed` | Bad signature / wrong signing type | Check private key |
| `Order below minimum` | size * price too small | Increase amount or price |
| `Request failed 400` | Bad request parameters | Check error detail |

### Error Output Format

```
API Error (400): <message>
Detail: {"error":"description"}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PACIFICA_WALLET_PRIVATE_KEY` | Wallet private key (Ed25519, base58, overrides config) |
| `PACIFICA_WALLET_ADDRESS` | Wallet address / public key (base58, overrides config) |

## Configuration Files

| File | Path | Description |
|------|------|-------------|
| Config | `~/.pacifica-cli/config.json` | Private key, account, environment |

Config file is created with `0600` permissions (owner read/write only).

## Detailed References

For in-depth guides on specific topics:

- **[references/trading.md](references/trading.md)** — Order types, position management, bracket orders, scaling strategies
- **[references/market-data.md](references/market-data.md)** — Instrument discovery, orderbook analysis, funding rate strategies
- **[references/authentication.md](references/authentication.md)** — Setup methods, security best practices

## MCP Server

For AI agents that support MCP (Model Context Protocol), this package also ships `pacifica-mcp`:

```bash
# Claude Code
claude mcp add pacifica -- pacifica-mcp
```

```json
// Claude Desktop / Cursor / Windsurf — add to MCP config:
{
  "mcpServers": {
    "pacifica": {
      "command": "pacifica-mcp",
      "env": {
        "PACIFICA_WALLET_PRIVATE_KEY": "<your-private-key>"
      }
    }
  }
}
```

The `env` field passes credentials directly to the MCP server. Alternatively, run `pacifica-cli config init` and the MCP server reads `~/.pacifica-cli/config.json` automatically.

The MCP server exposes 19 tools: `get_market_info`, `get_prices`, `get_orderbook`, `get_recent_trades`, `get_candles`, `get_historical_funding`, `get_account_info`, `get_account_settings`, `get_positions`, `get_open_orders`, `get_order_history`, `get_trade_history`, `get_funding_history`, `create_market_order`, `create_limit_order`, `cancel_order`, `cancel_all_orders`, `update_leverage`, `update_margin_mode`.

## Resources

- **Pacifica Exchange**: https://pacifica.fi
- **npm Package**: https://www.npmjs.com/package/@2oolkit/pacifica-cli
- **GitHub**: https://github.com/haeminmoon/pacifica-cli
- **Pacifica API Docs**: https://docs.pacifica.fi/api-documentation/api

---

**Quick Win:** Start by checking a price (`pacifica-cli market prices --symbol BTC`) to verify the CLI works, then place a small limit order away from market price to test the full flow.

**Security:** Keep your private key secure. Never commit config files to version control. The private key is only used locally for Ed25519 signing — it is never transmitted.
