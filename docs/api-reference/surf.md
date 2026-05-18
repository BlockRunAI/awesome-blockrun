# Surf — Crypto Data API

Real-time crypto data for AI agents. 83 endpoints across exchanges, on-chain analytics, prediction markets, wallet labels, social mindshare, news, and search — all priced per call in USDC. No Surf account, no API key, just a wallet.

Powered by [Surf](https://asksurf.ai) (asksurf.ai). BlockRun proxies the same endpoints with x402 settlement directly to Surf's treasury — your USDC routes 1:1 to them, BlockRun takes no spread.

## The Problem Surf Solves

Crypto data is fragmented across CoinGecko, DefiLlama, Dune, Nansen, Glassnode, CryptoQuant, Polymarket, Kalshi, and dozens of L1/L2 RPCs. Each has its own API, its own account, its own pricing. An autonomous trading agent that wants to check "Is the BTC funding rate flipping negative *and* is the Fear & Greed index above 70 *and* are smart money wallets selling?" needs to integrate three different vendors.

Surf unifies all of it behind one schema, billed per-call in stablecoins. An agent's research wallet can query 80+ sources without onboarding to any of them.

## Endpoints by Category

83 endpoints organized across 12 domains. **Three flat price tiers:**

| Tier | Price | Use case |
|------|-------|----------|
| Tier 1 | **$0.001 / call** | Simple lookups (prices, rankings, indices) |
| Tier 2 | **$0.005 / call** | Time-series, technical indicators, orderbook depth |
| Tier 3 | **$0.02 / call** | On-chain SQL — raw queries against 80+ ClickHouse tables |

### Categories

| Category | Endpoints | What it covers |
|----------|-----------|----------------|
| **prediction** | 17 | Polymarket + Kalshi + dFlow markets, trades, positions, odds |
| **social** | 11 | Mindshare, sentiment, KOL coverage, trending tokens on social |
| **search** | 11 | Project / token / wallet / news search |
| **market** | 11 | Token rankings, Fear & Greed, ETF flows, options, liquidations, on-chain indicators (NUPL/SOPR/MVRV), technical indicators (RSI/MACD/Bollinger/EMA) |
| **onchain** | 7 | Bridge ranking, yield pools, gas prices, tx detail, **raw SQL** (tier 3), structured queries |
| **exchange** | 7 | CEX trading pairs, ticker prices, perp snapshots, orderbook depth, klines, funding history, long/short ratio |
| **wallet** | 6 | Wallet labels (smart-money, exchange, KOL), portfolio detail, PnL, position history |
| **token** | 4 | Token metadata, holders, supply, unlock schedules |
| **project** | 3 | Project profiles, tokenomics, ecosystem maps |
| **fund** | 3 | VC fund detail, portfolio, ranking |
| **news** | 2 | AI-curated crypto news feed, article detail |
| **web** | 1 | General crypto web search |

Full endpoint list (with `requiredParams`) is in `/openapi.json` and `/llms.txt` — search for `/api/v1/surf/`.

---

## Base URL

All Surf endpoints route through:

```
https://blockrun.ai/api/v1/surf/<endpoint-path>
```

Method follows the upstream — most are `GET` with query string params, the three SQL/structured-query endpoints (`onchain/sql`, `onchain/query`, `onchain/schema`) are `POST` with JSON bodies.

---

## Examples

### Spot price lookup (Tier 1 — $0.001)

```bash
curl "https://blockrun.ai/api/v1/surf/market/price?symbol=BTC"
# → HTTP 402 with payment requirements

# Sign EIP-3009 transfer, retry with X-Payment header
curl "https://blockrun.ai/api/v1/surf/market/price?symbol=BTC" \
  -H "X-Payment: <signed-x402>"
# → token price history JSON
```

### Fear & Greed snapshot (Tier 1)

```bash
curl -H "X-Payment: <signed>" \
  "https://blockrun.ai/api/v1/surf/market/fear-greed"
```

### Perpetual funding history (Tier 2 — $0.005)

```bash
curl -H "X-Payment: <signed>" \
  "https://blockrun.ai/api/v1/surf/exchange/funding-history?pair=BTC-USDT-PERP"
```

### Raw on-chain SQL (Tier 3 — $0.02)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Payment: <signed>" \
  "https://blockrun.ai/api/v1/surf/onchain/sql" \
  -d '{
    "query": "SELECT chain, count() FROM tx WHERE block_time > now() - INTERVAL 1 DAY GROUP BY chain"
  }'
```

The SQL endpoint runs against Surf's ClickHouse cluster — 80+ tables across Ethereum, Solana, Base, Arbitrum, Optimism, BSC, Polygon. Typical query latency: sub-second.

---

## SDK Usage

### TypeScript

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });

// Simple price lookup
const btc = await client.surf('GET', 'market/price', { symbol: 'BTC' });

// Time-series funding history
const funding = await client.surf('GET', 'exchange/funding-history', {
  pair: 'BTC-USDT-PERP',
});

// Raw SQL
const flows = await client.surf('POST', 'onchain/sql', {
  query: 'SELECT chain, sum(value_usd) FROM bridge_tx WHERE block_time > now() - INTERVAL 7 DAY GROUP BY chain',
});
```

### Python

```python
from blockrun_llm import LLMClient

client = LLMClient()

# Simple price lookup
btc = client.surf('GET', 'market/price', {'symbol': 'BTC'})

# Polymarket position lookup for a wallet
pos = client.surf('GET', 'prediction-market/polymarket/positions',
                  {'address': '0xCC8c44AD3dc2A58D841c3EB26131E49b22665EF8'})

# Raw on-chain SQL
result = client.surf('POST', 'onchain/sql',
                     {'query': 'SELECT count() FROM tx WHERE chain = \'base\''})
```

### MCP (Claude Code / OpenClaw)

```text
Use blockrun_surf to look up the current funding rate for BTC-USDT-PERP and compare it to the 7-day average.
```

The `blockrun_surf` MCP tool ships with [BlockRun MCP](../mcp/blockrun-mcp.md). It accepts `endpoint`, `params`, and `method` and handles the x402 settlement automatically.

---

## Use Cases

### 1. Macro snapshot before every trade (~$0.003)

```typescript
const [price, fng, funding] = await Promise.all([
  client.surf('GET', 'market/price', { symbol: 'BTC' }),       // $0.001
  client.surf('GET', 'market/fear-greed'),                      // $0.001
  client.surf('GET', 'exchange/funding-history', { pair: 'BTC-USDT-PERP' }), // $0.005
]);
```

Total cost: $0.007 per pre-trade snapshot. Cheap enough to run every minute on a long-running bot.

### 2. Smart-money wallet monitor ($0.005/wallet)

```python
labels = client.surf('GET', 'wallet/label', {'address': addr})
positions = client.surf('GET', 'prediction-market/polymarket/positions', {'address': addr})
```

Pipe into an LLM to summarize: *"Wallet X (smart-money DeFi whale) opened a $200K Polymarket position on the Fed Dec rate cut."*

### 3. On-chain SQL for research reports ($0.02/query)

```sql
-- "Which Base contracts grew most in unique users last week?"
SELECT to, count(DISTINCT from) AS unique_callers
FROM tx
WHERE chain = 'base' AND block_time > now() - INTERVAL 7 DAY
GROUP BY to
ORDER BY unique_callers DESC
LIMIT 20
```

A weekly research bot that runs this twice and feeds the result into Claude Opus to write a 1-page narrative costs ~$0.04 + LLM tokens.

### 4. Multi-source prediction-market aggregator (Tier 1, ~$0.003/event)

```python
poly = client.surf('GET', 'prediction-market/polymarket/markets', {'market_slug': slug})
kalshi = client.surf('GET', 'prediction-market/kalshi/markets', {'event_ticker': ticker})
```

Compare odds across two venues, surface arb opportunities.

---

## Required Parameters

Each endpoint declares its required query/body params in the upstream OpenAPI spec. If a required param is missing, BlockRun returns `400 Bad Request` **before** settling payment — you never get charged for a malformed call.

Common required params:
- `pair` → `BTC-USDT`, `ETH-USDT-PERP`, etc. (exchange endpoints)
- `symbol` → `BTC`, `ETH`, `SOL` (market endpoints)
- `address` → wallet address (wallet/position endpoints)
- `chain` → `ethereum`, `solana`, `base`, `arbitrum`, etc.
- `condition_id` or `market_slug` or `event_slug` → for Polymarket/Kalshi market lookups

---

## Pricing

| Tier | Price | Endpoints in tier |
|------|-------|-------------------|
| Tier 1 | $0.001 | 44 (basic lookups, rankings, snapshots) |
| Tier 2 | $0.005 | 36 (time-series, indicators, depth, history) |
| Tier 3 | $0.02 | 3 (`onchain/sql`, `onchain/query`, `onchain/schema`) |

Payment is in USDC on Base or Solana via x402. **Settles 1:1 directly to Surf's treasury wallet** (`0x058a5961FbE8cD8E4B47C69d3d82E159cb5d8F17` on Base) — BlockRun takes no margin. We pass through pricing as-is in exchange for being the discovery/auth/settlement layer.

---

## vs. Other Options

| | BlockRun Surf | Surf directly | CoinGecko Pro | Dune |
|--|---------------|---------------|---------------|------|
| Payment | USDC per call | Subscription | Subscription | Subscription |
| Account required | No | Yes | Yes | Yes |
| Works for autonomous agents | ✅ | ❌ (API key, KYC) | ❌ | ❌ |
| Coverage | 83 endpoints across 12 categories | Same upstream | Prices only | SQL only |
| On-chain SQL | ✅ ($0.02/query) | ✅ | ❌ | ✅ ($$$) |
| Same wallet as LLM calls | ✅ | N/A | N/A | N/A |

---

## Error Handling

| Code | Description |
|------|-------------|
| 200 | Success — query result in body |
| 400 | Missing required param (pre-payment validation, **not charged**) |
| 402 | Payment required — sign and retry |
| 404 | Unknown endpoint path (typo in `surf/<path>`) |
| 429 | Surf upstream rate limited — `Retry-After` header set, **not charged**. See [Rate Limits](rate-limits.md) |
| 502 | Surf upstream returned an error — **not charged**, error body forwarded |
| 503 | Surf integration not configured on this BlockRun deployment |

---

## Links

- [Surf marketplace page](https://blockrun.ai/marketplace/surf)
- [Surf (upstream)](https://asksurf.ai)
- [BlockRun MCP `blockrun_surf` tool](../mcp/blockrun-mcp.md)
- [Rate Limits](rate-limits.md)
- [Error Handling](errors.md)
