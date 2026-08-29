---
title: Market Data (Pyth)
description: Spot prices and OHLC history for stocks, crypto, FX and commodities from Pyth Network — crypto, FX and commodities are free; equities are $0.002 per call.
---

# Market Data (Pyth)

Spot prices and historical OHLC bars across four asset classes, grounded in
[Pyth Network](https://pyth.network) on-chain feeds.

**Crypto, FX and commodity prices are free.** Equities — US and international —
are `$0.002` per call (`$0.001` base plus the flat `$0.001` transaction fee;
the 402 quotes `"0.0020"`), because those feeds are broker-fed rather than
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
| `/api/v1/usstock/price/{symbol}` | GET | $0.002 | US equity spot price |
| `/api/v1/usstock/history/{symbol}` | GET | $0.002 | US equity OHLC bars |
| `/api/v1/stocks/{market}/list` | GET | Free | Tickers for one non-US market |
| `/api/v1/stocks/{market}/price/{symbol}` | GET | $0.002 | Non-US equity spot price |
| `/api/v1/stocks/{market}/history/{symbol}` | GET | $0.002 | Non-US equity OHLC bars |

`GET` and `POST` both work on the `/price` and `/history` paths; `POST` exists
so callers that cannot attach headers to a `GET` still have a route. `/list` is
`GET` only.

## Symbol formats

Always resolve symbols from the matching `/list` endpoint rather than guessing.

| Asset class | Format | Examples |
|-------------|--------|----------|
| Crypto | `BASE-QUOTE` | `BTC-USD`, `ETH-USD`, `SOL-USD` |
| FX | `BASE-QUOTE` | `EUR-USD`, `GBP-USD`, `JPY-USD` |
| Commodity | `METAL-USD` / ticker | `XAU-USD` (gold), `XAG-USD` (silver) |
| US equity | Plain ticker | `AAPL`, `TSLA`, `NVDA`, `SPY` |
| Non-US equity | Per-market convention | HKEX `-HK` suffix (`0005-HK`), TSE 4-digit (`7203`), KRX 6-digit (`005930`), LSE/XETRA/Euronext alpha (`HSBA`, `SAP`, `MC`) |

`/list` takes `q` (substring filter) and `limit` (max 2000, default 100) and
returns `{ category, label, count, example, endpoints, symbols: [{ symbol,
description }] }`.

## Markets

`{market}` for the `/stocks/` family: `us`, `hk`, `jp`, `kr`, `gb`, `de`, `fr`,
`nl`, `ie`, `lu`, `cn`, `ca`. An unknown market returns `404` with the
`supported` list. `/api/v1/usstock/*` is a legacy alias for
`/api/v1/stocks/us/*` and behaves identically.

---

## Spot price

```bash
# Free — no payment header needed
curl https://blockrun.ai/api/v1/crypto/price/BTC-USD

# Paid — $0.002
curl https://blockrun.ai/api/v1/usstock/price/AAPL \
  -H "X-Payment: <x402_payment_token>"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |
| `session` | query | No | Equity-only session hint — `pre`, `post` or `on`. Omit for regular hours; ignored for non-equity symbols |

The response carries `symbol`, `category`, `price`, `confidence` (Pyth's
interval around the price), `publishTime` (unix seconds), `timestamp`
(ISO-8601), `assetType`, `feedId` and `source: "pyth"`; free feeds add
`free: true`. Treat `confidence` as real: a wide interval means the feed is
uncertain, not that the price is precise.

---

## OHLC history

```bash
curl "https://blockrun.ai/api/v1/crypto/history/BTC-USD?resolution=D&from=1735689600&to=1738368000"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |
| `resolution` | query | No | Bar size — `1`, `5`, `15`, `60`, `240`, `D`, `W`, `M`. Default `D`; anything else is `400` |
| `from` | query | Yes | Start, unix seconds. Missing or non-positive is `400` |
| `to` | query | No | End, unix seconds. Defaults to now; must be greater than `from` |
| `session` | query | No | Equity-only — `pre`, `post` or `on` |

The response is `{ symbol, category, resolution, from, to, bars, source }`
where each bar is `{ t, o, h, l, c, v }` (`t` = bar start in unix seconds). A
valid symbol with no bars in the window returns `404` before any settlement,
so an empty range is never charged.

On paid feeds the `402` is issued before parameter validation, so an unpaid
probe always gets a clean payment challenge; validation errors only surface
once a payment header is attached.

---

## Discovery

Free endpoints answer `HEAD` with a `402` whose body is x402
discovery metadata (`"error": "Payment Required (discovery)"`, `free: true`,
amount `0`) so indexers can register them — that is not a charge. A plain
`GET` returns `200` and the data.

Paid feeds return a real `402` on an unpaid `GET`: the signed requirements are
in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (and
`WWW-Authenticate`), and the JSON body carries `price.amount` (`"0.0020"`),
an `example` call and the same requirements under `x402`. Settled responses
carry `PAYMENT-RESPONSE` and `X-Payment-Receipt` (transaction hash) headers.

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `400` | Bad `resolution`, missing/invalid `from`, or `to` ≤ `from` on `/history` | No |
| `402` | Payment required (paid feeds), or discovery metadata (`HEAD`/`OPTIONS` on free feeds) | No |
| `402` | `error: "Payment verification failed"` — `details` has the verifier's reason. These feeds do not yet attach a machine-readable `code` | No |
| `402` | `error: "Payment settlement failed"` — data was fetched but settlement did not land; `PAYMENT-RESPONSE` carries `errorReason` | No |
| `404` | Symbol not found for that category (body has a `hint`), unknown `{market}`, or no bars in the requested window | No |
| `502` | Price feed upstream unavailable (5s timeout, one retry) | No |

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
