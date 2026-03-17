# Prediction Markets API

Access real-time prediction market data via x402 micropayments. Powered by [Predexon](https://predexon.com).

Unified access to Polymarket, Kalshi, dFlow, Binance, Limitless, Opinion, and Predict.Fun through a single API.

## Networks

| Network | Base URL | Asset |
|---------|----------|-------|
| Base (Ethereum L2) | `https://blockrun.ai` | USDC |
| Solana | `https://sol.blockrun.ai` | USDC |

## Pricing

| Tier | Price | Use Case |
|------|-------|----------|
| Tier 1 | $0.001 | Market data, events, trades, orderbooks, positions, leaderboards |
| Tier 2 | $0.005 | Wallet analytics, smart money, cross-platform matching, Binance data |

---

## Endpoints

### Polymarket — Market Data (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/polymarket/markets` | GET | Query markets with filtering, sorting, and pagination |
| `/api/v1/pm/polymarket/events` | GET | List events with filtering and sorting |
| `/api/v1/pm/polymarket/crypto-updown` | GET | List crypto up/down prediction markets |
| `/api/v1/pm/polymarket/market-price/{token_id}` | GET | Get current or historical price for a token |
| `/api/v1/pm/polymarket/candlesticks/{condition_id}` | GET | Get historical OHLCV candlestick data |
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

### Cross-Platform Matching (Tier 2: $0.005)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/matching-markets` | GET | Find equivalent markets across Polymarket and Kalshi |
| `/api/v1/pm/matching-markets/pairs` | GET | Get all active exact-matched market pairs |

### Other Platforms (Tier 1: $0.001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/pm/limitless/orderbooks` | GET | Historical orderbook snapshots for Limitless |
| `/api/v1/pm/opinion/orderbooks` | GET | Historical orderbook snapshots for Opinion |
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

## SDK Usage

### Python

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

# Cross-platform matching ($0.005)
pairs = client.pm("matching-markets/pairs")

# Binance ($0.005)
candles = client.pm("binance/candles/BTCUSDT", interval="1h", limit=24)
```

### TypeScript

```typescript
import { LLMClient } from "blockrun-llm";

const client = new LLMClient();

// Market data ($0.001)
const markets = await client.pm("polymarket/markets", { search: "bitcoin", limit: "10" });
const events = await client.pm("polymarket/events");

// Wallet analytics ($0.005)
const profile = await client.pm("polymarket/wallet/0x1234...abcd");

// Binance ($0.005)
const candles = await client.pm("binance/candles/BTCUSDT", { interval: "1h", limit: "24" });
```

### Solana

```python
from blockrun_llm.solana_client import SolanaLLMClient

client = SolanaLLMClient()
markets = client.pm("polymarket/markets", search="bitcoin")
```

Works on all clients: `LLMClient` (Base), `AsyncLLMClient`, and `SolanaLLMClient`.

---

## Partner

These endpoints are powered by [Predexon](https://predexon.com) — a unified prediction market data aggregator. Payments go directly to the Predexon treasury via x402.

Full Predexon API documentation: [docs.predexon.com](https://docs.predexon.com)
