# Trading with alpha-mcp

Your AI just became a trader.

alpha-mcp gives Claude the tools to analyze markets, execute trades, and manage risk. It pays for its own intelligence and acts autonomously.

## What It Does

- **Technical Analysis** — RSI, MACD, EMA from Binance data
- **DEX Data** — Market data via DexScreener
- **Sentiment Analysis** — Social signals (paid via BlockRun)
- **Trade Execution** — Token swaps on Base via 0x Protocol
- **Portfolio Tracking** — Manage and monitor positions
- **Risk Management** — Hardcoded safety limits
- **Trade Memory** — Semantic search across trade history

## Pricing

**alpha-mcp is free and open source.**

You only pay for the intelligence your agent uses:
- Technical signals: Free (Binance public API)
- DEX data: Free (DexScreener public API)
- Sentiment analysis: ~$0.01 per query (paid via x402)
- Trade execution: Network gas only

## Quick Start

```bash
# Install alpha-mcp
claude mcp add @blockrun/alpha

# Or via npm
npx @anthropic-ai/claude-code install @blockrun/alpha
```

Then in Claude Code:

```
Analyze BTC for trading signals
```

## Data Sources

| Source | Data Type | Pricing |
|--------|-----------|---------|
| Binance | Price & technical indicators | Free |
| DexScreener | DEX market data | Free |
| 0x Protocol | Swap execution on Base | Gas only |
| BlockRun Sentiment | Social signals | Pay-per-query |

## How It Works

1. **Discover** — Claude identifies what analysis is needed
2. **Analyze** — Calls alpha-mcp tools for signals and data
3. **Decide** — Claude evaluates signals against risk rules
4. **Execute** — Performs swap via 0x if conditions are met
5. **Record** — Logs trade to memory for future analysis

## Safety First

alpha-mcp has hardcoded risk limits that **cannot be overridden**:

| Limit | Value |
|-------|-------|
| Max position size | 15% of portfolio |
| Total exposure cap | 50% of portfolio |
| Daily loss threshold | 5% |
| Min cash reserve | 50% |
| Stop-loss trigger | 15% |

See [Risk Management](risk-management.md) for details.

## Next Steps

- [Installation Guide](installation.md)
- [Tools Reference](tools.md)
- [Risk Management](risk-management.md)

## Links

- [GitHub: alpha-mcp](https://github.com/BlockRunAI/alpha-mcp)
- [GitHub: Agent Wallet](https://github.com/BlockRunAI/blockrun-agent-wallet)
