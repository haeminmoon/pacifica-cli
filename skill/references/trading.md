# Trading Reference

Detailed guide for order placement, management, and position handling on Pacifica.

## Order Types

### Market Order

Executes immediately at the best available price with slippage protection.

```bash
pacifica-cli order market -s ETH -a 0.1 --side bid
```

**When to use:** When you need immediate execution and accept market price.

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--slippage <percent>` | Maximum slippage tolerance | `0.5` |
| `--reduce-only` | Only reduce existing position | `false` |
| `--tp <price>` | Take profit stop price | — |
| `--sl <price>` | Stop loss stop price | — |

### Limit Order

Places an order at a specific price. Only executes at the specified price or better.

```bash
pacifica-cli order limit -s BTC -p 60000 -a 0.01 --side bid
```

**When to use:** When you want price certainty and are willing to wait for fills.

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--tif <tif>` | Time in force (GTC/IOC/ALO/TOB) | `GTC` |
| `--reduce-only` | Only reduce existing position | `false` |
| `--tp <price>` | Take profit stop price | — |
| `--sl <price>` | Stop loss stop price | — |

## Time in Force

| TIF | Name | Description |
|-----|------|-------------|
| `GTC` | Good Till Cancel | Order remains open until filled or manually cancelled |
| `IOC` | Immediate or Cancel | Fill as much as possible immediately, cancel the rest |
| `ALO` | Add Liquidity Only | Rejected if it would match immediately (maker-only, lower fees) |
| `TOB` | Top of Book | Matches at the top of book price |

## Order Sides

| Side | Position Effect | Description |
|------|----------------|-------------|
| `bid` | Opens long / Closes short | Buy the asset |
| `ask` | Opens short / Closes long | Sell the asset |

## Position Management

### Opening a Position

```bash
# Open long (buy)
pacifica-cli order market -s ETH -a 0.1 --side bid

# Open short (sell)
pacifica-cli order market -s ETH -a 0.1 --side ask
```

### Closing a Position

**Always use `--reduce-only` when closing** to prevent accidentally opening a position in the opposite direction.

```bash
# Close long — sell with reduce-only
pacifica-cli order market -s ETH -a 0.1 --side ask --reduce-only

# Close short — buy with reduce-only
pacifica-cli order market -s ETH -a 0.1 --side bid --reduce-only
```

### Checking Positions

```bash
pacifica-cli position list
pacifica-cli position list -o json
```

Position fields:
- `symbol` — Trading symbol
- `side` — BUY (long) or SELL (short)
- `amount` — Position size
- `entry_price` — Average entry price
- `margin` — Margin used
- `isolated` — YES/NO

## Bracket Orders

Enter a position with automatic take-profit and stop-loss:

```bash
# Long ETH with TP at 2500 and SL at 1800
pacifica-cli order market -s ETH -a 0.1 --side bid --tp 2500 --sl 1800

# Short BTC with TP at 60000 and SL at 75000
pacifica-cli order market -s BTC -a 0.01 --side ask --tp 60000 --sl 75000
```

## Scaling Strategies

### Scale-In (DCA)

Place multiple limit orders at different price levels:

```bash
pacifica-cli order limit -s ETH -p 2000 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1950 -a 0.1 --side bid
pacifica-cli order limit -s ETH -p 1900 -a 0.1 --side bid
```

### Scale-Out

Take partial profits at different levels:

```bash
pacifica-cli order limit -s ETH -p 2200 -a 0.05 --side ask --reduce-only
pacifica-cli order limit -s ETH -p 2300 -a 0.05 --side ask --reduce-only
```

## Order Management

### List Open Orders

```bash
pacifica-cli order list
pacifica-cli order list -o json
```

### Cancel Orders

```bash
# Cancel by order ID
pacifica-cli order cancel -s ETH --order-id 123456

# Cancel by client order ID
pacifica-cli order cancel -s ETH --client-order-id my-order-1

# Cancel all orders
pacifica-cli order cancel-all

# Cancel all for a specific symbol
pacifica-cli order cancel-all -s ETH
```

### Order History

```bash
pacifica-cli order history -l 20
pacifica-cli order history -l 50 -o json
```

## Leverage

```bash
# Set leverage (1-50x depending on symbol)
pacifica-cli account leverage -s BTC -l 20
pacifica-cli account leverage -s ETH -l 10

# Check current settings
pacifica-cli account settings
```

## Margin Mode

```bash
# Cross margin (shared across positions)
pacifica-cli account margin-mode -s BTC --mode cross

# Isolated margin (per-position)
pacifica-cli account margin-mode -s BTC --mode isolated
```

## Minimum Order Sizes

Check minimum order sizes before placing orders:

```bash
pacifica-cli market info -o json
```

Key fields:
- `min_order_size` — Minimum notional value in USD
- `lot_size` — Minimum amount increment
- `tick_size` — Minimum price increment

## Common Mistakes

1. **Forgetting `--reduce-only`** when closing positions — may open an opposite position
2. **Wrong side** — `bid` is buy/long, `ask` is sell/short
3. **Order below minimum** — check `min_order_size` with `market info`
4. **Not approving builder code** — run `account builder-approve` before first trade
