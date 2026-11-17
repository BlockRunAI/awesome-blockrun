---
title: Market Data
description: Free spot prices for crypto, FX and commodities and free crypto OHLC history. Equity prices are not currently served; the equity symbol catalogs stay free.
---

# Market Data

Spot prices for crypto, FX and commodities, historical OHLC bars for crypto,
and symbol catalogs for US and international equities.

**Crypto, FX and commodity prices are free** — no payment header, no wallet.
They are **daily closes, not realtime ticks**: every response carries
`realtime: false` and a `note` saying so. Realtime feeds and full global
coverage are available on request ([hello@blockrun.ai](mailto:hello@blockrun.ai)).

:::warning Equity prices are not currently served
The equity `/price` and `/history` routes (`/api/v1/usstock/*` and
`/api/v1/stocks/{market}/*`) answer `501` with
`"We do not currently serve equity prices"`, before any payment challenge, so
nothing is ever charged. The equity `/list` catalogs still work and still
enumerate every ticker, with `available: false`.
:::

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/crypto/list` | GET | Free | Available crypto symbols |
| `/api/v1/crypto/price/{symbol}` | GET | Free | Crypto spot price (daily close) |
| `/api/v1/crypto/history/{symbol}` | GET | Free | Crypto OHLC bars |
| `/api/v1/fx/list` | GET | Free | Available FX pairs |
| `/api/v1/fx/price/{symbol}` | GET | Free | FX spot rate (daily close) |
| `/api/v1/fx/history/{symbol}` | GET | — | `501`: no free OHLC source for FX |
| `/api/v1/commodity/list` | GET | Free | Available commodities |
| `/api/v1/commodity/price/{symbol}` | GET | Free | Commodity spot price (daily close) |
| `/api/v1/commodity/history/{symbol}` | GET | — | `501`: no free OHLC source for commodities |
| `/api/v1/usstock/list` | GET | Free | US tickers (`available: false`) |
| `/api/v1/usstock/price/{symbol}` | GET | — | `501`: equity prices not currently served |
| `/api/v1/usstock/history/{symbol}` | GET | — | `501`: equity prices not currently served |
| `/api/v1/stocks/{market}/list` | GET | Free | Tickers for one market (`available: false`) |
| `/api/v1/stocks/{market}/price/{symbol}` | GET | — | `501`: equity prices not currently served |
| `/api/v1/stocks/{market}/history/{symbol}` | GET | — | `501`: equity prices not currently served |

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
description }] }`; equity catalogs add `available: false`, a `note` and a
`contact`.

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
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |

The response carries `symbol`, `category`, `price`, `publishTime` (unix
seconds), `timestamp` (ISO-8601), `assetType`, `source`, `realtime: false`, a
`note` and `free: true`. `publishTime` is when that close was published — read
it before treating the number as current.

---

## OHLC history

Crypto only. FX and commodity `/history` answer `501` (`"Historical bars are not
available for this category on the free tier"`): their free source publishes
one closing point per day with no high or low, so bars are not built from it.

```bash
curl "https://blockrun.ai/api/v1/crypto/history/BTC-USD?resolution=D&from=1735689600&to=1738368000"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `symbol` | path | Yes | Any symbol from the matching `/list` |
| `resolution` | query | No | Bar size — `1`, `5`, `15`, `60`, `240`, `D`, `W`, `M`. Default `D`; anything else is `400` |
| `from` | query | Yes | Start, unix seconds. Missing or non-positive is `400` |
| `to` | query | No | End, unix seconds. Defaults to now; must be greater than `from` |

The response is `{ symbol, category, resolution, from, to, bars, source,
realtime, note, free }` where each bar is `{ t, o, h, l, c, v }` (`t` = bar
start in unix seconds). A valid symbol with no bars in the window returns
`404`.

---

## Discovery

Free endpoints answer `HEAD` with a `402` whose body is x402
discovery metadata (`"error": "Payment Required (discovery)"`, `free: true`,
amount `0`) so indexers can register them — that is not a charge. A plain
`GET` returns `200` and the data. The equity `/price` and `/history` routes
answer `501` to every method, `HEAD` included.

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `400` | Bad `resolution`, missing/invalid `from`, or `to` ≤ `from` on `/history` | No |
| `402` | Discovery metadata (`HEAD`/`OPTIONS` on free feeds) | No |
| `404` | Symbol not covered (`"Symbol not covered by our free daily-close feeds"`, body has a `hint`), unknown `{market}`, or no bars in the requested window | No |
| `501` | Equity `/price` or `/history` (not currently served), or FX/commodity `/history` (no free OHLC source) | No |
| `502` | History upstream unavailable | No |
| `503` | The free price source for that symbol is not answering — `Retry-After: 60` | No |

## What's next?

::::cards

:::card{title="DefiLlama" href="defillama.md" icon="Landmark"}
Protocol TVL, per-chain TVL and yield pools.
:::

:::card{title="Multi-chain RPC" href="multi-chain-rpc.md" icon="Link"}
JSON-RPC to 40 chains through one endpoint.
:::

::::
