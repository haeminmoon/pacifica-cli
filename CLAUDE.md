# Pacifica CLI

CLI toolkit & MCP server for trading perpetual futures on the Pacifica exchange.

## Project Overview

- **Language**: TypeScript (target ES2022, CommonJS)
- **CLI Framework**: Commander.js
- **Build Tool**: tsup → `dist/index.js` (CLI), `dist/mcp.js` (MCP server)
- **Test Framework**: Jest + ts-jest
- **Node**: >= 20

## Commands

```
npm run build    # tsup build
npm run dev      # ts-node local run
npm test         # jest tests (23 tests)
npm run lint     # tsc --noEmit (if OOM: NODE_OPTIONS="--max-old-space-size=4096")
```

## Architecture

```
src/
├── index.ts                  # CLI entrypoint
├── mcp.ts                    # MCP server entrypoint (17 tools)
├── client/api-client.ts      # PacificaApiClient (axios-based REST client)
├── commands/
│   ├── _helpers.ts           # createPublicClient(), withAuth() → AuthContext
│   ├── config.ts             # config init|set|get|list
│   ├── market.ts             # market info|prices|orderbook|trades|candles|funding
│   ├── order.ts              # order market|limit|cancel|cancel-all|list|history
│   ├── account.ts            # account info|settings|leverage|margin-mode|trades|funding-history
│   └── position.ts           # position list
├── config/
│   ├── constants.ts          # BASE_URLS, ENV_ALIASES, resolveEnv()
│   └── store.ts              # ~/.pacifica-cli/ config.json (0o600)
├── signing/
│   └── signer.ts             # Ed25519 signing (tweetnacl + bs58)
├── output/
│   ├── formatter.ts          # output() → json | table
│   └── error.ts              # ActionableError, handleError()
└── utils/
    └── helpers.ts            # formatNumber, formatTimestamp, formatSide, parseIntStrict, truncateAddress
```

## Pacifica API

- **Mainnet**: `https://api.pacifica.fi/api/v1`
- **Testnet**: `https://test-api.pacifica.fi/api/v1`
- **Docs**: https://docs.pacifica.fi/api-documentation/api

### Public Endpoints (GET, no signature required)

| Endpoint                                   | Description              |
| ------------------------------------------ | ------------------------ |
| `GET /info`                                | All market info          |
| `GET /info/prices`                         | All symbol prices        |
| `GET /book?symbol=`                        | Orderbook                |
| `GET /trades?symbol=`                      | Recent trades            |
| `GET /kline?symbol=&interval=&start_time=` | Candlestick data         |
| `GET /kline/mark_price`                    | Mark price candles       |
| `GET /funding_rate/history?symbol=`        | Funding rate history     |
| `GET /account?account=`                    | Account info             |
| `GET /account/settings?account=`           | Margin & leverage config |
| `GET /positions?account=`                  | Positions                |
| `GET /orders?account=`                     | Open orders              |
| `GET /orders/history?account=`             | Order history            |
| `GET /trades/history?account=`             | Trade history            |
| `GET /funding/history?account=`            | Funding history          |

### Private Endpoints (POST, Ed25519 signature required)

| Endpoint                     | Type (for signing)    |
| ---------------------------- | --------------------- |
| `POST /orders/create_market` | `create_market_order` |
| `POST /orders/create`        | `create_limit_order`  |
| `POST /orders/cancel`        | `cancel_order`        |
| `POST /orders/cancel_all`    | `cancel_all_orders`   |
| `POST /account/leverage`     | `update_leverage`     |
| `POST /account/margin_mode`  | `update_margin_mode`  |

### Signing Mechanism

1. Compose JSON message: `{ type, timestamp, expiry_window, data: { ...payload } }`
2. Sort JSON keys recursively (alphabetical)
3. Serialize as compact JSON (`separators=(",",":")`)
4. Sign with Ed25519 (tweetnacl `sign.detached`)
5. Include base58-encoded signature in the request body

### Order Sides & Types

- Sides: `bid` (buy/long), `ask` (sell/short)
- TIF: `GTC`, `IOC`, `ALO`, `TOB`
- Position sides: `open_long`, `open_short`, `close_long`, `close_short`

## Configuration

Config file location: `~/.pacifica-cli/config.json` (file permissions 0o600)

```json
{
  "env": "mainnet",
  "privateKey": "base58 encoded Ed25519 private key",
  "account": "derived public key"
}
```

Environment variable overrides:

- `PACIFICA_WALLET_PRIVATE_KEY`
- `PACIFICA_WALLET_ADDRESS`

## Key Dependencies

- `commander` - CLI parsing
- `axios` - HTTP client
- `tweetnacl` - Ed25519 signing
- `bs58` - Base58 encoding/decoding
- `@modelcontextprotocol/sdk` - MCP server
- `zod` - MCP input validation
