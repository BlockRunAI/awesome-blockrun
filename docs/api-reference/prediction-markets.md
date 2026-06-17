---
title: Prediction Markets API
description: Real-time prediction market data across Polymarket, Kalshi, and more — plus wallet identity, clustering, and sports markets, paid per call in USDC over x402.
---

# Prediction Markets API

Access real-time prediction market data via x402 micropayments. Powered by [Predexon](https://predexon.com).

Unified access to Polymarket, Kalshi, dFlow, Binance, Limitless, Opinion, Predict.Fun, sports markets, plus UMA Oracle resolution data, canonical cross-venue market IDs, and on-chain wallet identity & clustering — all through a single API.

:::note
Mirrors the Predexon **v2 Data API** (`docs.predexon.com/openapi-v2.json`). Predexon's separate Trading API (order placement, fund management) is intentionally not exposed.
:::

## Networks

| Network | Base URL | Asset |
|---------|----------|-------|
| Base (Ethereum L2) | `https://blockrun.ai` | USDC |
| Solana | `https://sol.blockrun.ai` | USDC |

## Pricing

| Tier | Price | Use Case |
|------|-------|----------|
| Tier 1 | $0.001 | Market data, events, trades, orderbooks, positions, leaderboards, sports markets, canonical cross-venue markets |
| Tier 2 | $0.005 | Wallet analytics (incl. identity + clustering), smart money, cross-platform matching, Binance data |

---

## Endpoints

### Polymarket — Market Data (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/markets` | GET | Query markets with filtering, sorting, and pagination |
| `/api/v1/pm/polymarket/markets/keyset` | GET | Same filters as `/polymarket/markets`, with cursor-based keyset pagination |
| `/api/v1/pm/polymarket/events` | GET | List events with filtering and sorting |
| `/api/v1/pm/polymarket/events/keyset` | GET | List events with cursor-based keyset pagination |
| `/api/v1/pm/polymarket/crypto-updown` | GET | List crypto up/down prediction markets |
| `/api/v1/pm/polymarket/market-price/{token_id}` | GET | Get current or historical price for a token |
| `/api/v1/pm/polymarket/candlesticks/{condition_id}` | GET | Get historical OHLCV candlestick data for a market |
| `/api/v1/pm/polymarket/candlesticks/token/{token_id}` | GET | Get historical OHLCV candlestick data for a single outcome token |
| `/api/v1/pm/polymarket/volume-chart/{condition_id}` | GET | Get volume chart with YES/NO breakdown |
| `/api/v1/pm/polymarket/orderbooks` | GET | Get historical orderbook snapshots |
| `/api/v1/pm/polymarket/trades` | GET | Query historical trade data |
| `/api/v1/pm/polymarket/activity` | GET | Fetch trading activity (merges, splits, redeems) |
| `/api/v1/pm/polymarket/markets/{token_id}/volume` | GET | Get historical cumulative volume |
| `/api/v1/pm/polymarket/markets/{condition_id}/open_interest` | GET | Get historical open interest |
| `/api/v1/pm/polymarket/positions` | GET | Fetch all user positions |

### Polymarket — Analytics (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/leaderboard` | GET | Global leaderboard of smart wallets |
| `/api/v1/pm/polymarket/leaderboard/market/{condition_id}` | GET | Leaderboard for a specific market |
| `/api/v1/pm/polymarket/cohorts/stats` | GET | Compare performance across trading style cohorts |
| `/api/v1/pm/polymarket/market/{condition_id}/top-holders` | GET | Top holders ranked by position size |

### Polymarket — Wallet Analytics (Tier 2: $0.005)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/wallet/{wallet}` | GET | Complete smart wallet profile |
| `/api/v1/pm/polymarket/wallet/{wallet}/markets` | GET | Per-market performance breakdown |
| `/api/v1/pm/polymarket/wallet/{wallet}/similar` | GET | Find wallets with similar portfolios |
| `/api/v1/pm/polymarket/wallet/pnl/{wallet}` | GET | P&L summary and time series |
| `/api/v1/pm/polymarket/wallet/positions/{wallet}` | GET | Open and historical positions |
| `/api/v1/pm/polymarket/wallet/volume-chart/{wallet}` | GET | Volume chart by BUY/SELL side |
| `/api/v1/pm/polymarket/wallets/profiles` | GET | Batch wallet profiles (max 20) |
| `/api/v1/pm/polymarket/wallets/filter` | GET | Filter wallets by market trades |

### Polymarket — Smart Money (Tier 2: $0.005)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/market/{condition_id}/smart-money` | GET | Smart money positioning on a market |
| `/api/v1/pm/polymarket/markets/smart-activity` | GET | Markets where top wallets are active |

### UMA Oracle — Polymarket Resolution (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/uma/markets` | GET | List UMA oracle questions filtered by state (proposed, disputed, resolved, …) |
| `/api/v1/pm/polymarket/uma/market/{condition_id}` | GET | Current UMA oracle status and event timeline for a single market |

### Wallet Identity & Clustering (Tier 2: $0.005)

Cross-context wallet labels and on-chain relationship graph data.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/wallet/identity/{wallet}` | GET | Identity and profile metadata for a single wallet address |
| `/api/v1/pm/polymarket/wallet/identities` | POST | Bulk identity lookup — body `{"addresses":[...]}` (up to 200 addresses) |
| `/api/v1/pm/polymarket/wallet/{address}/cluster` | GET | Wallets connected to a seed address via on-chain transfers and identity proofs |

### Kalshi (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/kalshi/markets` | GET | Query markets with filtering, sorting, and pagination |
| `/api/v1/pm/kalshi/trades` | GET | Fetch historical trade data |
| `/api/v1/pm/kalshi/orderbooks` | GET | Fetch historical orderbook snapshots |

### dFlow

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/pm/dflow/trades` | GET | $0.001 | Fetch trade history for a wallet |
| `/api/v1/pm/dflow/wallet/positions/{wallet}` | GET | $0.005 | Current positions for a wallet |
| `/api/v1/pm/dflow/wallet/pnl/{wallet}` | GET | $0.005 | Realized P&L history for a wallet |

### Binance (Tier 2: $0.005)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/binance/candles/{symbol}` | GET | OHLCV candlestick data (BTCUSDT, ETHUSDT, SOLUSDT, XRPUSDT) |
| `/api/v1/pm/binance/ticks/{symbol}` | GET | Raw book ticker data at microsecond granularity |

### Cross-Venue Canonical Markets (Tier 1: $0.001)

Predexon v2 unified data layer — canonical Predexon IDs across all venues.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/markets` | GET | List canonical market/question containers with cross-venue Predexon IDs |
| `/api/v1/pm/markets/listings` | GET | List venue-native executable listings flattened across canonical markets |
| `/api/v1/pm/outcomes/{predexon_id}` | GET | Resolve a canonical Predexon outcome ID to its market context and venue listings |

### Cross-Platform Matching & Search (Tier 2: $0.005)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/matching-markets` | GET | Find equivalent markets across Polymarket and Kalshi |
| `/api/v1/pm/matching-markets/pairs` | GET | Get all active exact-matched market pairs |
| `/api/v1/pm/markets/search` | GET | Search markets across Polymarket, Kalshi, Limitless, Opinion, and Predict.Fun in a single call |

### Sports Markets (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/sports/categories` | GET | List available sports categories, sports, and leagues |
| `/api/v1/pm/sports/markets` | GET | List sports markets grouped by game (filter by `sport`, `league`, `game_date`, etc.) |
| `/api/v1/pm/sports/markets/{game_id}` | GET | Get a single sports game with all venue outcomes |
| `/api/v1/pm/sports/outcomes/{predexon_id}` | GET | Find all equivalent sports outcomes across venues for a Predexon ID |

### Other Platforms (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/limitless/markets` | GET | List Limitless markets with filtering and sorting |
| `/api/v1/pm/limitless/orderbooks` | GET | Historical orderbook snapshots for Limitless |
| `/api/v1/pm/opinion/markets` | GET | List Opinion markets with filtering and sorting |
| `/api/v1/pm/opinion/orderbooks` | GET | Historical orderbook snapshots for Opinion |
| `/api/v1/pm/predictfun/markets` | GET | List Predict.Fun markets with filtering and sorting |
| `/api/v1/pm/predictfun/orderbooks` | GET | Historical orderbook snapshots for Predict.Fun |

---

## Example: Polymarket Markets

```
GET https://blockrun.ai/api/v1/pm/polymarket/markets
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search query (3-100 chars) |
| `status` | string | Filter by status (`active`, `closed`, `archived`) |
| `sort` | string | Sort by `volume`, `liquidity`, `created` |
| `limit` | integer | Results per page (1-100, default 20) |
| `pagination_key` | string | Cursor for pagination |

### Example

```bash
curl "https://blockrun.ai/api/v1/pm/polymarket/markets?search=bitcoin&limit=10"
```

Returns `402` with payment requirements. Attach an x402 payment header to get results.

---

## Example: Kalshi Markets

```
GET https://blockrun.ai/api/v1/pm/kalshi/markets
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `open` or `closed` |
| `search` | string | Search in title (3-100 chars) |
| `ticker` | string | Filter by ticker(s) (max 50) |
| `event_ticker` | string | Filter by event ticker(s) |
| `sort` | string | `volume`, `open_interest`, `price_desc`, `price_asc`, `close_time` |
| `limit` | integer | Results per page (1-100, default 20) |
| `pagination_key` | string | Cursor for pagination |

### Example

```bash
curl "https://blockrun.ai/api/v1/pm/kalshi/markets?search=bitcoin&sort=volume"
```

---

## Example: Binance Candles

```
GET https://blockrun.ai/api/v1/pm/binance/candles/{symbol}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, or `XRPUSDT` |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `interval` | string | `1s`, `1m`, `5m`, `15m`, `1h`, `4h`, `1d` (default `1m`) |
| `start_time` | integer | Unix timestamp (seconds) |
| `end_time` | integer | Unix timestamp (seconds) |
| `limit` | integer | Max candles (1-1500, default 500) |

### Example

```bash
curl "https://blockrun.ai/api/v1/pm/binance/candles/BTCUSDT?interval=1h&limit=24"
```

---

## Example: Wallet Profile

```
GET https://blockrun.ai/api/v1/pm/polymarket/wallet/{wallet}
```

### Example

```bash
curl "https://blockrun.ai/api/v1/pm/polymarket/wallet/0x1234...abcd"
```

Returns a complete smart wallet profile with trading stats, P&L, labels, and activity metrics.

---

## Example: Bulk Wallet Identity (POST)

```
POST https://blockrun.ai/api/v1/pm/polymarket/wallet/identities
```

Body shape:

```json
{ "addresses": ["0xabc...", "0xdef...", "..."] }
```

Up to 200 addresses per call. For a single wallet, prefer `GET /polymarket/wallet/identity/{wallet}`.

```bash
curl -X POST "https://blockrun.ai/api/v1/pm/polymarket/wallet/identities" \
  -H "content-type: application/json" \
  -d '{"addresses":["0x1234...abcd","0x5678...ef01"]}'
```

---

## Example: Sports Markets

```
GET https://blockrun.ai/api/v1/pm/sports/markets
```

```bash
curl "https://blockrun.ai/api/v1/pm/sports/markets?league=mlb&status=open&limit=10"
curl "https://blockrun.ai/api/v1/pm/sports/markets/mlb-laa-nym-2026-05-02"
```

Returns sports games grouped with all venue outcomes (Kalshi, Polymarket, etc.) attached.

---

## SDK Usage

::::tabs

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()

# Market data ($0.001)
markets = client.pm("polymarket/markets", search="bitcoin", limit=10)
events = client.pm("polymarket/events")
trades = client.pm("kalshi/trades")

# Wallet analytics ($0.005)
profile = client.pm("polymarket/wallet/0x1234...abcd")
pnl = client.pm("polymarket/wallet/pnl/0x1234...abcd")

# Canonical cross-venue markets ($0.001)
canonical = client.pm("markets", venue="polymarket", limit=20)
listings = client.pm("markets/listings", league="mlb")

# Sports ($0.001)
games = client.pm("sports/markets", league="mlb", status="open")

# Cross-platform matching ($0.005)
pairs = client.pm("matching-markets/pairs")

# Wallet identity (single, $0.005)
identity = client.pm("polymarket/wallet/identity/0x1234...abcd")

# Wallet identity (bulk, POST, $0.005)
identities = client.pm_query(
    "polymarket/wallet/identities",
    {"addresses": ["0x1234...abcd", "0x5678...ef01"]},
)

# Binance ($0.005)
candles = client.pm("binance/candles/BTCUSDT", interval="1h", limit=24)
```
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient } from "blockrun-llm";

const client = new LLMClient();

// Market data ($0.001)
const markets = await client.pm("polymarket/markets", { search: "bitcoin", limit: "10" });
const events = await client.pm("polymarket/events");

// Wallet analytics ($0.005)
const profile = await client.pm("polymarket/wallet/0x1234...abcd");
const identity = await client.pm("polymarket/wallet/identity/0x1234...abcd");

// Bulk wallet identity (POST, $0.005)
const identities = await client.pmQuery("polymarket/wallet/identities", {
  addresses: ["0x1234...abcd", "0x5678...ef01"],
});

// Canonical cross-venue markets + sports ($0.001)
const canonical = await client.pm("markets", { venue: "polymarket", limit: "20" });
const games = await client.pm("sports/markets", { league: "mlb", status: "open" });

// Binance ($0.005)
const candles = await client.pm("binance/candles/BTCUSDT", { interval: "1h", limit: "24" });
```
:::

:::tab{label="Solana"}
```python
from blockrun_llm.solana_client import SolanaLLMClient

client = SolanaLLMClient()
markets = client.pm("polymarket/markets", search="bitcoin")
```
:::

::::

Works on all clients: `LLMClient` (Base), `AsyncLLMClient`, and `SolanaLLMClient`.

---

## Partner

These endpoints are powered by [Predexon](https://predexon.com) — a unified prediction market data aggregator. Payments go directly to the Predexon treasury via x402.

Full Predexon API documentation: [docs.predexon.com](https://docs.predexon.com)

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Feed market and wallet data into an LLM to analyze odds and positioning.
:::

:::card{title="Multi-chain RPC" href="multi-chain-rpc.md" icon="Route"}
Read on-chain data across 40+ chains to complement wallet identity lookups.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes and how the SDKs surface payment failures.
:::

::::
