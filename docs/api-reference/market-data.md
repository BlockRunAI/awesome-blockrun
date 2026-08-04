---
title: Market Data (Pyth)
description: Spot prices and OHLC history for stocks, crypto, FX and commodities from Pyth Network — crypto, FX and commodities are free; equities are $0.0010 per call.
---

# Market Data (Pyth)

Spot prices and historical OHLC bars across four asset classes, grounded in
[Pyth Network](https://pyth.network) on-chain feeds.

**Crypto, FX and commodity prices are free.** Equities — US and international —
are `$0.0010` per call, because those feeds are broker-fed rather than
open on-chain data. Every `/list` endpoint is free regardless of asset class.

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/crypto/list` | GET | Free | Available crypto symbols |
| `/api/v1/crypto/price/{symbol}` | GET | Free | Crypto spot price |
| `/api/v1/crypto/history/{symbol}` | GET | Free | Crypto OHLC bars |
| `/api/v1/fx/list` | GET | Free | Available FX pairs |
| `/api/v1/fx/price/{symbol}` | GET | Free | FX spot rate |
| `/api/v1/fx/history/{symbol}` | GET | Free | FX OHLC bars |
| `/api/v1/commodity/list` | GET | Free | Available commodities |
| `/api/v1/commodity/price/{symbol}` | GET | Free | Commodity spot price |
| `/api/v1/commodity/history/{symbol}` | GET | Free | Commodity OHLC bars |
| `/api/v1/usstock/list` | GET | Free | US tickers |
| `/api/v1/usstock/price/{symbol}` | GET | $0.0010 | US equity spot price |
| `/api/v1/usstock/history/{symbol}` | GET | $0.0010 | US equity OHLC bars |
| `/api/v1/stocks/{market}/list` | GET | Free | Tickers for one non-US market |
| `/api/v1/stocks/{market}/price/{symbol}` | GET | $0.0010 | Non-US equity spot price |
| `/api/v1/stocks/{market}/history/{symbol}` | GET | $0.0010 | Non-US equity OHLC bars |

`GET` and `POST` both work on every path; `POST` exists so callers that cannot
attach headers to a `GET` still have a route.

## Symbol formats

Always resolve symbols from the matching `/list` endpoint rather than guessing.

| Asset class | Format | Examples |
|-------------|--------|----------|
| Crypto | `BASE-QUOTE` | `BTC-USD`, `ETH-USD`, `SOL-USD` |
| FX | `BASE-QUOTE` | `EUR-USD`, `GBP-USD`, `JPY-USD` |
| Commodity | `METAL-USD` / ticker | `XAU-USD` (gold), `XAG-USD` (silver) |
| US equity | Plain ticker | `AAPL`, `TSLA`, `NVDA`, `SPY` |
| Non-US equity | Per-market convention | HKEX `-HK` suffix, TSE 4-digit, KRX 6-digit, LSE/XETRA/Euronext alpha |

`/list` takes `q` (substring filter) and `limit` (max 2000, default 100).

## Markets

`{market}` for the `/stocks/` family: `us`, `hk`, `jp`, `kr`, `gb`, `de`, `fr`,
`nl`, `ie`, `lu`, `cn`, `ca`. `/api/v1/usstock/*` is a legacy alias for
`/api/v1/stocks/us/*` and behaves identically.

---

## Spot price

```bash
# Free — no payment header needed
curl https://blockrun.ai/api/v1/crypto/price/BTC-USD

# Paid — $0.0010
curl https://blockrun.ai/api/v1/usstock/price/AAPL \
  -H "X-Payment: <x402_payment_token>"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |
| `session` | query | No | Trading session hint — `regular` or `extended` |

The response carries `symbol`, `price`, `confidence` (Pyth's interval around
the price), `publishTime` and `source`. Treat `confidence` as real: a wide
interval means the feed is uncertain, not that the price is precise.

---

## OHLC history

```bash
curl "https://blockrun.ai/api/v1/crypto/history/BTC-USD?resolution=D&from=1735689600&to=1738368000"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |
| `resolution` | query | No | Bar size — `1`, `5`, `15`, `60`, `240`, `D`, `W`, `M`. Default `D` |
| `from` | query | No | Start, unix seconds |
| `to` | query | No | End, unix seconds. Defaults to now |
| `session` | query | No | `regular` or `extended` |

---

## Discovery

Free endpoints still answer a `402` when you ask for one without payment — that
response is x402 discovery metadata for indexers, not a charge. A plain `GET`
returns `200` and the data.

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `402` | Payment required (paid feeds), or discovery metadata (free feeds) | No |
| `404` | Symbol not found — check the matching `/list` | No |

## What's next?

::::cards

:::card{title="Surf — Crypto Data" href="surf.md" icon="ChartLine"}
Exchange depth, liquidations, on-chain SQL and wallet labels.
:::

:::card{title="DefiLlama" href="defillama.md" icon="Landmark"}
Protocol TVL, per-chain TVL and yield pools.
:::

:::card{title="Multi-chain RPC" href="multi-chain-rpc.md" icon="Link"}
JSON-RPC to 40 chains through one endpoint.
:::

::::
