# @2oolkit/pacifica-cli

Trade perpetual futures on [Pacifica](https://pacifica.fi) — a decentralized derivatives exchange on Solana — from your terminal or AI agent.

**One package, three interfaces:**

| Interface          | Command                            | Use Case                                   |
| ------------------ | ---------------------------------- | ------------------------------------------ |
| **CLI**            | `pacifica-cli`                     | Terminal trading, scripting, automation     |
| **MCP Server**     | `pacifica-mcp`                     | AI agents (Claude, Cursor, Windsurf, etc.) |
| **OpenClaw Skill** | [`skill/SKILL.md`](skill/SKILL.md) | AI agent ecosystem (OpenClaw, ClawdBot)    |

25+ perpetual instruments: crypto (BTC, ETH, SOL), forex (EURUSD), commodities (XAU, XAG), equities (NVDA, GOOGL).

## Installation

```bash
npm install -g @2oolkit/pacifica-cli
```

This installs both `pacifica-cli` (CLI) and `pacifica-mcp` (MCP server).

## Prerequisites

- **Node.js** >= 20
- A **Solana wallet** with an Ed25519 private key (base58 encoded)

---

## CLI Usage

### Quick Start

```bash
# 1. Interactive setup (prompts for private key)
pacifica-cli config init

# 2. Check a price (no auth needed)
pacifica-cli market prices --symbol BTC

# 3. Place a market buy
pacifica-cli order market -s BTC -a 0.001 --side bid

# 4. View open positions
pacifica-cli position list
```

### Configuration

**Interactive setup (recommended):**

```bash
pacifica-cli config init
```

Prompts for your Ed25519 private key (base58 encoded). Account address is automatically derived.

**Manual setup:**

```bash
pacifica-cli config set privateKey <base58-ed25519-private-key>
```

**Environment variables (CI/CD, Docker):**

```bash
export PACIFICA_WALLET_PRIVATE_KEY=<your-private-key>
export PACIFICA_WALLET_ADDRESS=<your-wallet-address>
```

Config is stored at `~/.pacifica-cli/config.json` with `0600` permissions.

### Command Reference

#### Market Data (no auth required)

```bash
pacifica-cli market info                      # List all instruments
pacifica-cli market info --symbol ETH         # Filter by symbol
pacifica-cli market prices                    # All symbol prices
pacifica-cli market prices --symbol BTC       # Single symbol
pacifica-cli market orderbook BTC             # Orderbook
pacifica-cli market orderbook BTC --depth 5   # With aggregation
pacifica-cli market trades ETH                # Recent trades
pacifica-cli market candles BTC -i 4h         # Candlestick data
pacifica-cli market funding SOL -l 50         # Funding rate history
```

#### Orders (auth required)

```bash
# Market order
pacifica-cli order market -s ETH -a 0.1 --side bid
pacifica-cli order market -s ETH -a 0.1 --side ask --reduce-only

# Limit order
pacifica-cli order limit -s BTC -p 60000 -a 0.01 --side bid
pacifica-cli order limit -s BTC -p 70000 -a 0.01 --side ask --tif IOC

# With take-profit / stop-loss
pacifica-cli order market -s ETH -a 0.1 --side bid --tp 2500 --sl 1800

# Manage
pacifica-cli order list                       # Open orders
pacifica-cli order history -l 50              # Order history
pacifica-cli order cancel -s ETH --order-id 123456
pacifica-cli order cancel-all                 # Cancel all
pacifica-cli order cancel-all -s ETH          # Cancel all for symbol
```

**Order options:**

| Option              | Required     | Description            | Default |
| ------------------- | ------------ | ---------------------- | ------- |
| `-s, --symbol`      | Yes          | Trading symbol         | —       |
| `-a, --amount`      | Yes          | Order amount           | —       |
| `--side`            | Yes          | `bid` (buy) or `ask` (sell) | —  |
| `-p, --price`       | Limit only   | Limit price            | —       |
| `--tif`             | No           | `GTC`, `IOC`, `ALO`, `TOB` | `GTC` |
| `--slippage`        | No           | Max slippage percent   | `0.5`   |
| `--reduce-only`     | No           | Reduce-only order      | `false` |
| `--tp`              | No           | Take profit stop price | —       |
| `--sl`              | No           | Stop loss stop price   | —       |

#### Positions, Account & Funding

```bash
pacifica-cli position list                    # All open positions

pacifica-cli account info                     # Balances & equity
pacifica-cli account settings                 # Margin & leverage settings
pacifica-cli account leverage -s BTC -l 20    # Set leverage
pacifica-cli account margin-mode -s BTC --mode isolated
pacifica-cli account trades -s ETH -l 20      # Trade history
pacifica-cli account funding-history -l 20    # Funding payments
```

#### Config

```bash
pacifica-cli config init                      # Interactive setup
pacifica-cli config set <key> <value>         # Set a value
pacifica-cli config get <key>                 # Get a value
pacifica-cli config list                      # Show all (secrets masked)
```

### Output Formats

All commands support `-o json` for scripting and piping:

```bash
pacifica-cli market prices -o json
pacifica-cli order list -o json | jq '.[].order_id'
```

---

## MCP Server

The MCP (Model Context Protocol) server exposes all Pacifica functionality as tools for AI agents. Works with Claude Code, Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

### Setup for Claude Code

```bash
claude mcp add pacifica -- pacifica-mcp
```

### Setup for Claude Desktop / Cursor / Windsurf

Add to your MCP config file:

```json
{
  "mcpServers": {
    "pacifica": {
      "command": "pacifica-mcp"
    }
  }
}
```

Or without global install:

```json
{
  "mcpServers": {
    "pacifica": {
      "command": "npx",
      "args": ["-y", "-p", "@2oolkit/pacifica-cli", "pacifica-mcp"]
    }
  }
}
```

### Available Tools (19)

| Category        | Tools                                                                                            | Auth Required |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| **Market Data** | `get_market_info`, `get_prices`, `get_orderbook`, `get_recent_trades`, `get_candles`, `get_historical_funding` | No  |
| **Orders**      | `create_market_order`, `create_limit_order`, `cancel_order`, `cancel_all_orders`, `get_open_orders`, `get_order_history` | Yes |
| **Positions**   | `get_positions`                                                                                  | Yes           |
| **Account**     | `get_account_info`, `get_account_settings`, `get_trade_history`, `get_funding_history`           | Yes           |
| **Settings**    | `update_leverage`, `update_margin_mode`                                                          | Yes           |

### MCP Prerequisites

Before using MCP tools that require authentication, set up credentials via the CLI:

```bash
pacifica-cli config init         # Interactive setup
```

The MCP server reads the same config file as the CLI (`~/.pacifica-cli/`).

---

## OpenClaw Skill

This package includes an [OpenClaw](https://openclaw.dev) skill definition for AI agent ecosystems. The skill file is located at [`skill/SKILL.md`](skill/SKILL.md) with detailed reference docs in `skill/references/`.

Compatible with OpenClaw, ClawdBot, and other agent skill platforms.

---

## Common Workflows

### Close a Position

```bash
# Long position → sell reduce-only
pacifica-cli order market -s ETH -a 0.1 --side ask --reduce-only

# Short position → buy reduce-only
pacifica-cli order market -s ETH -a 0.1 --side bid --reduce-only
```

Always use `--reduce-only` when closing positions to prevent accidentally opening the opposite direction.

### Bracket Order (Entry + TP/SL)

```bash
pacifica-cli order market -s ETH -a 0.1 --side bid --tp 2500 --sl 1800
```

### Scale-In (DCA)

```bash
pacifica-cli order limit -s ETH -p 2000 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1950 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1900 -a 0.1 --side bid
```

### Portfolio Health Check

```bash
pacifica-cli account info -o json              # Balance & equity
pacifica-cli position list -o json             # Open positions
pacifica-cli order list -o json                # Open orders
```

## Safety Rules

1. **Use `--reduce-only` for all exit orders** — prevents accidental position flips
2. **Check instrument specs** before placing orders — `pacifica-cli market info --symbol BTC`
3. **Check account balance** before large orders — `pacifica-cli account info`
4. **Start with small sizes** when testing strategies
5. **Never expose your private key** — it's used locally for signing, never transmitted

## Security

- **Secret input masking** — `config init` hides your private key as you type (displays `*`)
- **File permissions** — config file is created with `0600` (owner read/write only)
- **Local signing** — Ed25519 signatures computed locally with `tweetnacl`, only signatures are transmitted
- **Signature expiry** — each signed request includes a timestamp and expiry window to prevent replay attacks
## Environment Variables

| Variable                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `PACIFICA_WALLET_PRIVATE_KEY`  | Wallet private key (Ed25519, base58)   |
| `PACIFICA_WALLET_ADDRESS`      | Wallet address / public key (base58)   |

## Resources

- **Pacifica Exchange**: https://pacifica.fi
- **npm Package**: https://www.npmjs.com/package/@2oolkit/pacifica-cli
- **GitHub**: https://github.com/haeminmoon/pacifica-cli
- **Pacifica API Docs**: https://docs.pacifica.fi/api-documentation/api

## License

MIT
