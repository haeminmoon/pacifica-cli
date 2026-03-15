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
npm run build    # tsup 빌드
npm run dev      # ts-node 로컬 실행
npm test         # jest 테스트 (24 tests)
npm run lint     # tsc --noEmit (메모리 부족 시 NODE_OPTIONS="--max-old-space-size=4096")
```

## Architecture

```
src/
├── index.ts                  # CLI 엔트리포인트
├── mcp.ts                    # MCP 서버 엔트리포인트 (17 tools)
├── client/api-client.ts      # PacificaApiClient (axios 기반 REST 클라이언트)
├── commands/
│   ├── _helpers.ts           # createPublicClient(), withAuth() → AuthContext
│   ├── config.ts             # config init|set|get|list
│   ├── market.ts             # market info|prices|orderbook|trades|candles|funding
│   ├── order.ts              # order market|limit|cancel|cancel-all|list|history
│   ├── account.ts            # account info|settings|leverage|margin-mode|trades|funding-history
│   └── position.ts           # position list
├── config/
│   ├── constants.ts          # BASE_URLS, ENV_ALIASES, resolveEnv()
│   └── store.ts              # ~/.pacifica-cli/ config.json + session.json (0o600)
├── signing/
│   └── signer.ts             # Ed25519 서명 (tweetnacl + bs58)
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

### Public Endpoints (GET, 서명 불필요)

| Endpoint                                   | Description        |
| ------------------------------------------ | ------------------ |
| `GET /info`                                | 전체 마켓 정보     |
| `GET /info/prices`                         | 전체 심볼 가격     |
| `GET /book?symbol=`                        | 오더북             |
| `GET /trades?symbol=`                      | 최근 체결          |
| `GET /kline?symbol=&interval=&start_time=` | 캔들 차트          |
| `GET /kline/mark_price`                    | 마크 프라이스 캔들 |
| `GET /funding_rate/history?symbol=`        | 펀딩 히스토리      |
| `GET /account?account=`                    | 계정 정보          |
| `GET /account/settings?account=`           | 마진/레버리지 설정 |
| `GET /positions?account=`                  | 포지션             |
| `GET /orders?account=`                     | 미체결 주문        |
| `GET /orders/history?account=`             | 주문 히스토리      |
| `GET /trades/history?account=`             | 체결 히스토리      |
| `GET /funding/history?account=`            | 펀딩 히스토리      |

### Private Endpoints (POST, Ed25519 서명 필요)

| Endpoint                     | Type (for signing)    |
| ---------------------------- | --------------------- |
| `POST /orders/create_market` | `create_market_order` |
| `POST /orders/create`        | `create_limit_order`  |
| `POST /orders/cancel`        | `cancel_order`        |
| `POST /orders/cancel_all`    | `cancel_all_orders`   |
| `POST /account/leverage`     | `update_leverage`     |
| `POST /account/margin_mode`  | `update_margin_mode`  |

### Signing Mechanism

1. JSON 메시지 구성: `{ type, timestamp, expiry_window, data: { ...payload } }`
2. JSON 키를 알파벳순으로 재귀적 정렬
3. compact JSON (`separators=(",",":")`) 직렬화
4. Ed25519 서명 (tweetnacl `sign.detached`)
5. base58 인코딩된 signature를 요청 body에 포함
6. Agent Wallet 사용 시 `agent_wallet` 필드 추가

### Order Sides & Types

- sides: `bid` (매수), `ask` (매도)
- tif: `GTC`, `IOC`, `ALO`, `TOB`
- position sides: `open_long`, `open_short`, `close_long`, `close_short`

## Configuration

설정 파일 위치: `~/.pacifica-cli/config.json` (파일 퍼미션 0o600)

```json
{
  "env": "mainnet",
  "privateKey": "base58 encoded Ed25519 private key",
  "account": "derived public key",
  "agentPrivateKey": "optional agent wallet private key",
  "agentWallet": "optional agent wallet public key"
}
```

환경변수로 오버라이드 가능:

- `PACIFICA_ENV`
- `PACIFICA_PRIVATE_KEY`
- `PACIFICA_ACCOUNT`
- `PACIFICA_AGENT_PRIVATE_KEY`
- `PACIFICA_AGENT_WALLET`

## Key Dependencies

- `commander` - CLI 파싱
- `axios` - HTTP 클라이언트
- `tweetnacl` - Ed25519 서명
- `bs58` - Base58 인코딩/디코딩
- `@modelcontextprotocol/sdk` - MCP 서버
- `zod` - MCP 입력 검증
