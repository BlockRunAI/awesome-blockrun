---
title: Trading Tools Reference
description: Franklin's trading tools — signals, market data, paper trading, trade plans, prediction markets, DEX quotes, DeFi data, on-chain RPC, and the wallet.
---

# Trading Tools Reference

Franklin's trading surface is a set of built-in tools the agent calls on its own. Tool names below are the exact names you will see in the session's tool activity.

## TradingSignal

Price, technical indicators, and a verdict for a cryptocurrency, computed locally from live market data.

**What it returns:**
- Current price, market cap, 24h volume
- RSI, MACD (signal / histogram), Bollinger Bands, annualized volatility
- A Verdict section: bullish / bearish / neutral with confidence and bull/bear signal lists
- A dual-listing note for tickers that also trade as equities (COIN, MSTR, CRCL, …), so the agent can fetch the spot equity in parallel

**Parameters:** `ticker` (required), `days` (lookback; default 90 — below 35 leaves MACD undefined)

**Example usage:**

```
Get technical signals for BTC
```

```
What's the RSI and MACD for ETH?
```

**Pricing:** Free

---

## TradingMarket

Market data across asset classes.

**Actions:**
- `price` — crypto spot (free)
- `trending` — top trending coins (free)
- `overview` — top 20 by market cap (free)
- `fxPrice` — FX pairs like `EUR-USD` via the BlockRun gateway (free)
- `commodityPrice` — `XAU-USD` (gold), `XAG-USD` (silver), … (free)
- `stockPrice` — equities across `us`, `hk`, `jp`, `kr`, `gb`, `de`, `fr`, `nl`, `ie`, `lu`, `cn`, `ca` (paid per call from the agent wallet; `market` is required)

**Example usage:**

```
What's gold doing today?
```

```
Price of 7203 on the Tokyo exchange
```

---

## TradingPortfolio · TradingOpenPosition · TradingClosePosition · TradingHistory

Paper trading against live prices. Fills are simulated (10 bps fee); no real assets move and no USDC is spent on exchange fees.

**TradingPortfolio** — cash, open positions with unrealized P&L, realized P&L, and a readout of exposure against the caps. Includes a journal-discipline footer scored on rationale completeness.

**TradingOpenPosition** — buy into a position. Pre-trade risk checks enforce the $400 per-position cap, the $900 total exposure cap, and cash sufficiency; a blocked order returns the reason so the agent can retry smaller. Optional `rationale` (direction, price target, stop, time horizon, conviction, evidence, tags, thesis) is journaled.

**TradingClosePosition** — sell part or all of a position. Exits always bypass the exposure caps so the agent is never trapped in a losing position.

**TradingHistory** — recent trades and realized P&L over a time window, read from the persistent trade log so it spans every prior session on the machine.

**State on disk:** `~/.blockrun/portfolio.json` (portfolio, $1,000 starting paper bankroll), `~/.blockrun/trades.jsonl` (trade log), `~/.blockrun/memory/trading-*/` (wallet-keyed journal).

**Example usage:**

```
Open a $200 paper position in SOL — thesis: funding flipped negative
```

```
Am I up this week? What was my worst trade?
```

**Pricing:** Free

---

## TradePlan

The agent's only path to real-money authorization. **Required before any swap or Polymarket order.**

**Actions:**
- `propose` — validates the intended trades, persists a pending plan, and blocks until you decide
- `status` — show the active plan and its remaining budget
- `cancel` — cancel a plan by id

**Each trade:** `venue` (`jupiter` | `zerox` | `polymarket`), `action` (`buy` | `sell` | `swap` | `bet`), `asset`, `amountUsd`, optional `direction`, `maxSlippageBps`, `stopCondition`, plus a one-paragraph `rationale` for the plan.

Approved plans expire after 15 minutes and their budget draws down as trades execute. Without an approval surface (a scripted `-p` run) the proposal fails closed unless `--approve-trades` was granted and the total fits the remaining `--max-spend`. Every decision is appended to `~/.blockrun/approvals.jsonl`.

---

## PredictionMarket

Prediction-market research via the BlockRun gateway, paid per call.

**Actions:** `searchAll` (Polymarket, Kalshi, Limitless, Opinion, Predict.Fun in one call), `searchPolymarket`, `searchKalshi`, `leaderboard`, `walletProfile`, `walletPnl`, `walletPositions`, `smartActivity`, `smartMoney`.

**Example usage:**

```
Is there a market anywhere on the Fed cutting in September?
```

```
What are the top Polymarket wallets by P&L positioning in right now?
```

---

## PolymarketBet

Real-money bets on Polymarket (CLOB V2, Polygon), signed locally by your BlockRun key. Orders spend pUSD in a Polymarket deposit wallet funded from your own Base USDC.

**Actions:** `setup` (create / inspect the deposit wallet and approvals; reports region status), `fund`, `buy` / `sell` (limit or market), `orders`, `cancel`, `positions`, `redeem`, `withdraw`.

Every placement is a dry-run preview unless `confirm:true`; a confirmed placement is shown to you for approval before signing (bypass only with `auto_approve` / `FRANKLIN_POLYMARKET_AUTO_APPROVE=1` for headless runs). Per-order cap `POLYMARKET_MAX_BET_USD` (default $25) and optional `POLYMARKET_MAX_SESSION_USD`. Order placement is geoblocked in some regions.

:::warning{title="Behind the trade-plan gate"}
`PolymarketBet` orders also require an approved `TradePlan`. Bets are your own funds on Polygon and do not draw from the `--max-spend` AI budget; the small funding fee is metered as x402 spend.
:::

---

## JupiterQuote · Base0xQuote (and the paused swap tools)

Read-only DEX routes and prices: Jupiter on Solana, 0x on Base.

`JupiterSwap`, `Base0xSwap`, and `Base0xGaslessSwap` exist but are **temporarily disabled in 3.42.0** while Franklin adds complete local transaction, Permit2, and EIP-712 validation — Franklin will not sign opaque transaction bytes handed back by an upstream. When re-enabled they remain behind `TradePlan`.

**Example usage:**

```
What's the best route to swap 100 USDC to SOL right now?
```

---

## DeFiLlamaProtocols · DeFiLlamaProtocol · DeFiLlamaChains · DeFiLlamaYields · DeFiLlamaPrice

Protocol TVL and rankings, per-protocol detail, chain TVL, yield pools, and token prices.

```
Which Base protocols grew TVL the most this month?
```

---

## MultiChainRPC

Read-only JSON-RPC across 40 chains through one gateway endpoint (no per-chain key), paid per call. EVM chains speak `eth_*`, Solana speaks `getSlot` / `getBalance` / `getTransaction`, Bitcoin-family speaks `getblockcount`. Signing and send-transaction methods are rejected.

```
Did my last Base transaction land? Check the receipt.
```

---

## Wallet

Franklin's own wallet status — chain, address, USDC balance. Never costs USDC.

```
What's my balance?
```

---

## Tool Interaction Flow

Typical session:

1. **TradingSignal** / **TradingMarket** — indicators and prices
2. **PredictionMarket** / **DeFiLlama\*** — (optional) odds, TVL, yields
3. **TradingOpenPosition** — paper trade, checked against the exposure caps
4. **TradePlan** — for real money: propose, wait for your approval
5. **PolymarketBet** — execute within the approved budget
6. **TradingPortfolio** / **TradingHistory** — verify position and P&L
7. Journal entry written automatically; recall later with **MemoryRecall**

## Example Session

```
User: Analyze ETH and open a paper position if signals are good

Franklin:
1. TradingSignal ETH
   → RSI 45 (neutral), MACD bullish crossover · Verdict: bullish (medium confidence)

2. TradingPortfolio
   → Cash $1,000 · exposure $0 / $900 cap

3. TradingOpenPosition ETH $150, rationale: bullish MACD crossover, stop −4%
   → Filled at live price (10 bps simulated fee)

4. TradingPortfolio
   → ETH $150 (unrealized 0.0%) · exposure $150 / $900

Journal: thesis recorded under your wallet's trading journal
```

## What's next?

::::cards

:::card{title="Risk management" href="risk-management.md" icon="TrendingUp"}
The caps, the trade-plan gate, and the hooks that gate every spend.
:::

:::card{title="Setup" href="installation.md" icon="Terminal"}
Get Franklin running with a funded wallet.
:::

:::card{title="Overview" href="overview.md" icon="Book"}
What Franklin's trading surface does and how it pays for its own intelligence.
:::

::::
