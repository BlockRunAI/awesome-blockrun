# Trading Tools Reference

alpha-mcp provides 7 tools for autonomous crypto trading.

## alpha_signal

Technical indicators from Binance.

**What it returns:**
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- EMA (Exponential Moving Averages)
- Volume analysis
- Price action data

**Example usage:**

```
Get technical signals for BTC/USDT
```

```
What's the RSI and MACD for ETH?
```

**Pricing:** Free (Binance public API)

---

## alpha_dex

DEX market data via DexScreener.

**What it returns:**
- Token prices across DEXes
- Liquidity depth
- 24h volume
- Price changes
- Pool information

**Example usage:**

```
Check the liquidity for PEPE on Uniswap
```

```
What DEXes have the best price for swapping 1000 USDC to ETH?
```

**Pricing:** Free (DexScreener public API)

---

## alpha_sentiment

Social sentiment analysis powered by BlockRun.

**What it returns:**
- Social media sentiment score
- Trending topics
- Influencer activity
- News sentiment
- Community metrics

**Example usage:**

```
What's the social sentiment around SOL right now?
```

```
Is there any negative news about BTC today?
```

**Pricing:** ~$0.01 per query (paid via x402)

---

## alpha_swap

Execute token swaps on Base via 0x Protocol.

**What it does:**
- Finds best swap route
- Executes trade on-chain
- Returns transaction hash

**Parameters:**
- `tokenIn`: Token to sell
- `tokenOut`: Token to buy
- `amount`: Amount to swap
- `slippage`: Max slippage (default 0.5%)

**Example usage:**

```
Swap 100 USDC for ETH on Base
```

```
Buy $50 worth of PEPE with USDC
```

**Pricing:** Network gas only (no BlockRun fee)

**Safety:** Subject to risk management limits. See [Risk Management](risk-management.md).

---

## alpha_portfolio

Track and manage trading positions.

**What it returns:**
- Current holdings
- Position sizes (% of portfolio)
- Unrealized P&L
- Entry prices
- Portfolio value

**Example usage:**

```
What's my current portfolio?
```

```
How much ETH do I hold?
```

**Pricing:** Free

---

## alpha_risk

Enforce risk management constraints.

**What it does:**
- Validates trades against risk limits
- Returns approval/rejection with reason
- Cannot be overridden

**Risk limits enforced:**

| Limit | Value |
|-------|-------|
| Max position size | 15% |
| Total exposure cap | 50% |
| Daily loss threshold | 5% |
| Min cash reserve | 50% |
| Stop-loss trigger | 15% |

**Example usage:**

```
Can I buy $500 worth of PEPE?
```

Claude will automatically check risk limits before executing.

**Pricing:** Free

---

## alpha_memory

Semantic search across trade history.

**What it does:**
- Stores all trade decisions and outcomes
- Enables learning from past trades
- Retrieves relevant historical context

**Example usage:**

```
What happened last time I traded PEPE?
```

```
Show me my most profitable trades this week
```

```
Why did I sell ETH on Monday?
```

**Pricing:** Free (local storage)

---

## Tool Interaction Flow

Typical trading session:

1. **alpha_signal** — Get technical indicators
2. **alpha_dex** — Check liquidity and prices
3. **alpha_sentiment** — (optional) Check social signals
4. **alpha_risk** — Validate trade against limits
5. **alpha_swap** — Execute if approved
6. **alpha_portfolio** — Verify position
7. **alpha_memory** — Log for future reference

## Example Session

```
User: Analyze ETH and execute a trade if signals are good

Claude:
1. Calls alpha_signal for ETH/USDT
   → RSI: 45 (neutral), MACD: bullish crossover

2. Calls alpha_dex for ETH liquidity
   → Sufficient liquidity on Uniswap, best price

3. Calls alpha_risk to validate $100 buy
   → Approved: within position limits

4. Calls alpha_swap to buy $100 ETH
   → Executed, tx: 0x...

5. Calls alpha_portfolio
   → Updated holdings: 0.042 ETH

6. Calls alpha_memory
   → Logged: "Bought ETH on bullish MACD crossover"
```

## Next Steps

- [Risk Management](risk-management.md) — Understand safety limits
- [Installation](installation.md) — Get started
- [Overview](overview.md) — Product introduction
