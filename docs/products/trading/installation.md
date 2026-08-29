---
title: Setting Up Trading
description: Install Franklin, fund a wallet on Solana or Base, and confirm the agent can pull live technical signals before you let it near real money.
---

# Setting Up Trading

Franklin's trading tools are built into the agent — install Franklin, fund a wallet, and verify signals work. A few minutes start to finish.

:::note{title="Requirements"}
Node.js 20.19+ (Node 22 LTS recommended) and, for paid features, a wallet funded with USDC on Solana or Base. Signals and paper trading work on the free tier with no wallet.
:::

## Install

Pick one of the three install methods.

::::tabs

:::tab{label="Global install"}
```bash
npm install -g @blockrun/franklin
franklin --version      # 3.42.0 or later
```
:::

:::tab{label="Via npx"}
```bash
npx @blockrun/franklin
```
No global install and no `sudo` needed.
:::

:::tab{label="User-owned Node (fixes EACCES)"}
```bash
# nvm
nvm install 22 && nvm use 22
npm install -g @blockrun/franklin

# or fnm
fnm install 22 && fnm use 22
npm install -g @blockrun/franklin
```
:::

::::

## Set up and verify

::::steps

:::step{title="Create a wallet"}
A fresh install defaults to Solana. Pass `base` for a Base wallet.

```bash
franklin setup           # Solana
franklin setup base      # Base
franklin balance         # prints the address and USDC balance
```

Fund the address with USDC, or use the card onramp from inside Franklin. See [Wallet Setup](../../getting-started/wallet-setup.md). Switch chains later with `franklin solana` / `franklin base`.
:::

:::step{title="Health check"}
```bash
franklin doctor
```

Checks Node, wallet, chain, gateway reachability, MCP servers, and telemetry in one command.
:::

:::step{title="Configure (optional)"}
Trading settings live in `~/.blockrun/trading-config.json`, written with defaults on first run:

```json
{
  "version": 1,
  "watchlist": ["BTC", "ETH", "SOL"],
  "signals": { "rsi_oversold": 30, "rsi_overbought": 70 },
  "model_tier": "cheap"
}
```

Real-money controls are environment variables and flags:

```bash
# Polymarket per-order cap (default $25) and optional cumulative session cap
export POLYMARKET_MAX_BET_USD=25
export POLYMARKET_MAX_SESSION_USD=100

# Hard cap on gateway spend for a session
franklin --max-spend 5

# Headless runs reject all trade plans unless this is passed (still bounded by --max-spend)
franklin -p "review my SOL thesis" --max-spend 2 --approve-trades
```

Your own guardrails go in `~/.blockrun/hooks/` — see [Risk Management](risk-management.md).
:::

:::step{title="Test it works"}
In a Franklin session:

```
What's the current RSI for ETH?
```

Franklin should call `TradingSignal` and return the indicators plus a verdict. Then try a paper trade:

```
Open a $100 paper position in ETH and tell me my exposure
```

`TradingOpenPosition` fills at the live price and `TradingPortfolio` reports cash, positions, and how close you are to the exposure caps.
:::

::::

## Troubleshooting

### `ERR_REQUIRE_ESM` on first run

Node is older than 20.19. Upgrade to Node 20.19+ or 22 LTS.

### `EACCES` during `npm install -g`

Your global npm folder is root-owned. Don't use `sudo` — run `npx @blockrun/franklin`, or install Node via `nvm`/`fnm` so global packages live in your home directory.

### "Wallet not configured" / free models only

Create and fund a wallet:

```bash
franklin setup
franklin balance
```

Paid models and paid tools activate as soon as the wallet holds USDC.

### Trade plan rejected in a scripted run

Non-interactive runs (`-p`) fail closed. Add `--approve-trades` and make sure the plan's total fits inside the remaining `--max-spend`.

### Swap tool says execution is unavailable

Expected in 3.42.0: `JupiterSwap`, `Base0xSwap`, and `Base0xGaslessSwap` are paused while local transaction validation lands. Use `JupiterQuote` / `Base0xQuote` for routes and prices.

### MCP servers or gateway not reachable

```bash
franklin doctor --json
```

## What's next?

::::cards

:::card{title="Tools reference" href="tools.md" icon="Boxes"}
Learn what each trading tool does and what it costs.
:::

:::card{title="Risk management" href="risk-management.md" icon="TrendingUp"}
Understand the caps and the trade-plan gate before you trade.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund your agent with USDC on Solana or Base.
:::

::::
