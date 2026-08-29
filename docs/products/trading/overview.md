---
title: Trading with Franklin
description: Franklin's built-in trading surface — live signals, paper trading with hard exposure caps, prediction-market bets, and a trade-plan gate that keeps real money behind your approval.
---

# Trading with Franklin

Your AI just became a trader — one that has to ask before it spends.

Trading is Franklin's flagship arena. The [Franklin agent](../franklin.md) ships with the trading tools built in: it buys live market data, computes signals locally, keeps a wallet-bound trading journal, paper-trades against real prices, and proposes real-money trade plans that nothing executes until you approve. There is no separate trading package to install.

:::note{title="alpha-mcp is retired"}
Earlier versions of these pages documented `alpha-mcp`, a standalone MCP server. That repo has not shipped since January 2026. The maintained trading surface is Franklin itself — this section documents Franklin 3.42.0.
:::

## What It Does

- **Technical Analysis** — `TradingSignal`: price, RSI, MACD, Bollinger Bands, volatility, and a bullish / bearish / neutral verdict, computed locally from live market data
- **Multi-asset market data** — `TradingMarket`: crypto spot, trending coins, market overview, FX pairs, commodities, and equities across 12 markets via the BlockRun gateway
- **Paper trading** — open and close simulated positions at live prices, with a persistent portfolio and trade log across sessions
- **Prediction markets** — research odds across Polymarket, Kalshi and others (`PredictionMarket`), and place real bets on Polymarket (`PolymarketBet`)
- **DEX routes** — read-only quotes on Solana (Jupiter) and Base (0x)
- **DeFi & on-chain reads** — protocol TVL, chains, yields, token prices, and read-only JSON-RPC across 40+ chains
- **Risk Management** — code-level exposure caps on paper trades, a mandatory trade plan for real money, per-order bet caps, and your own veto hooks
- **Trade Memory** — every trade journals its thesis on open and P&L on close into a journal keyed by your wallet address, recallable from any directory

## Pricing

**Franklin is free and open source (Apache-2.0).** You only pay, from your own wallet over x402, for the intelligence and data the agent actually uses:

- Signals and crypto / FX / commodity prices: free
- Equity prices, prediction-market data, on-chain RPC, web search: paid per call from the agent wallet — the tool descriptions show the per-call price before Franklin calls them
- Model calls: provider cost, no platform margin, plus $0.001 per request
- Polymarket bets: your own funds on Polygon, plus network fees — bets do **not** draw from the `--max-spend` AI budget

## Quick Start

```bash
npm install -g @blockrun/franklin
franklin setup            # Solana wallet (default); `franklin setup base` for Base
franklin balance          # fund the address with USDC
franklin --max-spend 5    # start with a hard cap on this session's spend
```

Then, in the session:

```
what's BTC looking like today?
```

Franklin calls `TradingSignal` and returns a signal report with a verdict. Signals need no wallet at all — the free-tier models can run them.

## Data Sources

| Source | Data Type | Pricing |
|--------|-----------|---------|
| Live market data | Crypto spot, trending, market overview | Free |
| Local indicators | RSI, MACD, Bollinger, volatility | Free (computed on your machine) |
| BlockRun gateway | FX pairs, commodities | Free |
| BlockRun gateway | Equity prices (12 markets) | Pay-per-call |
| BlockRun gateway | Prediction-market search, wallet profiles, smart money | Pay-per-call |
| BlockRun gateway | Read-only JSON-RPC across 40+ chains | Pay-per-call |
| Jupiter (Solana) / 0x (Base) | DEX quotes | Free (quote only) |
| Polymarket (Polygon) | Bet execution | Your funds + fees |

## How It Works

1. **Discover** — Franklin decides what analysis the question needs
2. **Analyze** — calls `TradingSignal`, `TradingMarket`, `PredictionMarket`, or DeFi tools
3. **Decide** — evaluates signals against the portfolio and the risk caps
4. **Plan** — for real money, proposes a `TradePlan`; for paper trades, opens a simulated position
5. **Approve** — you approve, revise, or reject the plan (a paper trade needs no approval)
6. **Execute** — places the order within the approved budget
7. **Record** — journals thesis and outcome to the wallet-keyed trading journal

## Safety First

Franklin's money guardrails are layered, and each has a hard bound:

| Guardrail | Value |
|-----------|-------|
| Paper-trading per-position cap | $400 |
| Paper-trading total exposure cap | $900 (of a $1,000 paper bankroll) |
| Real-money trades | Require an approved `TradePlan`; approvals expire after 15 minutes |
| Headless runs | Reject every plan unless `--approve-trades`, and only within `--max-spend` |
| Polymarket per-order cap | $25 by default (`POLYMARKET_MAX_BET_USD`) |
| Session spend | `--max-spend <usd>` — the session stops when exceeded |
| Your own rules | `PreSpend` lifecycle hooks can veto any money-moving tool |

:::warning{title="DEX execution is currently paused"}
In 3.42.0 the live swap tools (`JupiterSwap`, `Base0xSwap`, `Base0xGaslessSwap`) are temporarily disabled while Franklin adds complete local transaction validation — Franklin will not sign opaque upstream transaction bytes. Quotes still work. Polymarket bets and paper trading are unaffected. See [Risk Management](risk-management.md) for the full enforcement model.
:::

## Franklin Trading (specialized fork)

[Franklin-Trading](https://github.com/BlockRunAI/Franklin-Trading) (`@blockrun/franklin-trading`) is a fork of Franklin specialized as a wallet-native trading agent: it strips the media, social, phone, and browser tools, adds a `defineStrategy` DSL, trading skills (`/trade-signal`, `/trade-strategy`, `/trade-discussion`), and a Base MCP connector. Its unified backtest → paper → live strategy runner (`franklin-trading run <strategy> --mode ...`) is still roadmap work, and the fork predates Franklin's trade-plan gate and lifecycle hooks. Unless you specifically want the strategy DSL, use Franklin's built-in trading documented here.

## What's next?

::::cards

:::card{title="Set up trading" href="installation.md" icon="Terminal"}
Install Franklin, fund a wallet, and confirm signals work.
:::

:::card{title="Tools reference" href="tools.md" icon="Boxes"}
Signals, market data, paper trading, trade plans, prediction markets, DEX quotes, DeFi, RPC, wallet.
:::

:::card{title="Risk management" href="risk-management.md" icon="TrendingUp"}
How the exposure caps, trade-plan gate, bet caps, and hooks protect your capital.
:::

::::

## Links

- [GitHub: Franklin](https://github.com/BlockRunAI/Franklin)
- [GitHub: Franklin-Trading](https://github.com/BlockRunAI/Franklin-Trading)
- [Franklin hook examples](https://github.com/BlockRunAI/Franklin/tree/main/docs/examples/hooks)
