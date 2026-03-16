# Authentication Reference

Detailed guide for Pacifica CLI authentication setup, key management, and security.

## Overview

Pacifica uses Ed25519 key-based signing for all private operations. The flow:

1. **Configure** your private key (Ed25519, base58 encoded)
2. **Trade** — every order is signed locally with your private key

**Authentication required for:** Orders, positions, account info, leverage, margin mode, trade/funding history.
**No authentication needed for:** Instruments, prices, orderbook, trades, candles, funding rates.

## Setup Methods

### Method 1: Interactive Wizard (Recommended)

Best for first-time setup. Guides you through each step.

```bash
pacifica-cli config init
```

Prompts for:

| Field | Format | Description |
|-------|--------|-------------|
| Environment | `mainnet` / `testnet` | Network to connect to |
| Private Key | Base58 string | Ed25519 private key from your Solana wallet |

The wizard automatically derives your account address from the private key.

### Method 2: Manual Config

```bash
pacifica-cli config set env mainnet
pacifica-cli config set privateKey <base58-private-key>
```

Account address is automatically derived when you set the private key.

### Method 3: Environment Variables

```bash
export PACIFICA_WALLET_PRIVATE_KEY=<base58-private-key>
export PACIFICA_WALLET_ADDRESS=<base58-public-key>
```

Or use a `.env` file in the working directory:

```
PACIFICA_WALLET_PRIVATE_KEY=<base58-private-key>
PACIFICA_WALLET_ADDRESS=<base58-public-key>
```

Environment variables override config file values.

### Verify Setup

```bash
# Check config
pacifica-cli config list

# Verify account access
pacifica-cli account info
```

## Config File

Location: `~/.pacifica-cli/config.json`

```json
{
  "env": "mainnet",
  "privateKey": "base58-private-key",
  "account": "base58-public-key"
}
```

File permissions are set to `0600` (owner read/write only).

## Security Best Practices

### Key Management

1. **Never share your private key.** It controls your funds.
2. **Never commit config files to version control.** Add `~/.pacifica-cli/` to your global `.gitignore`.
3. **Store keys securely.** Use a hardware wallet or secure key management system for your main key.

### How Signing Works

The CLI signs orders locally — your private key never leaves your machine:

1. Order data is composed as a JSON message with type, timestamp, and expiry
2. JSON keys are sorted recursively (alphabetical)
3. Message is serialized as compact JSON
4. Ed25519 signature is computed locally using `tweetnacl`
5. Base58-encoded signature is sent with the request
6. The API verifies the signature against your account's public key

**Your private key is never transmitted.** Only the signature is sent.

### Signature Expiry

Each signed request includes:
- `timestamp` — Current time in milliseconds
- `expiry_window` — How long the signature is valid (default: 60 seconds)

If the API receives a request outside its expiry window, it will reject it. This prevents replay attacks.

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `PACIFICA_WALLET_PRIVATE_KEY` | Wallet private key (Ed25519, base58, overrides config) |
| `PACIFICA_WALLET_ADDRESS` | Wallet address / public key (base58, overrides config) |

## Troubleshooting

### "Not configured" Error

```bash
# Re-run setup
pacifica-cli config init

# Or set manually
pacifica-cli config set privateKey <key>
```

### "Verification failed" Error

This means the signature doesn't match. Common causes:
- Wrong private key for the account
- Clock skew (timestamp too far in the past/future)
- Corrupted private key

```bash
# Verify your config
pacifica-cli config list

# Re-enter your private key
pacifica-cli config set privateKey <correct-key>
```

### Config File Not Found

The config file is created automatically by `config init` or `config set`. If it's missing:

```bash
pacifica-cli config init
```
