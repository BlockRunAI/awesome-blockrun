---
title: Market Data
description: Free crypto, FX and commodity prices, free crypto OHLC history, on-chain US stock prices from tokenized-stock DEX pools, and free equity catalogs.
---

# Market Data

Spot prices for crypto, FX and commodities, historical OHLC bars for crypto,
on-chain prices for US stocks, and symbol catalogs for US and international
equities.

**Crypto, FX and commodity prices are free** — no payment header, no wallet.
They are **daily closes, not realtime ticks**: every response carries
`realtime: false` and a `note` saying so. Realtime feeds and full global
coverage are available on request ([hello@blockrun.ai](mailto:hello@blockrun.ai)).

:::info US stock prices are on-chain
`/api/v1/stocks/us/price/{symbol}` returns the price of a US stock's
**tokenized share on a blockchain**, read from decentralized-exchange pools —
not an exchange quote. Each gateway reports **its own chain**:

- `blockrun.ai` (pays in USDC on Base) — Coinbase Tokenized Stocks in Aerodrome
  Slipstream and Uniswap v3 pools on Base.
- `sol.blockrun.ai` (pays in USDC on Solana) — xStocks in Raydium CLMM and Orca
  Whirlpool pools on Solana.

$0.005 per call. A ticker with no on-chain market on that chain answers `404`
before any payment and is never charged; `/api/v1/stocks/us/list?covered=true`
lists the covered set. US history and every non-US price and history still
answer `501`, also before payment.
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
| `/api/v1/stocks/us/price/{symbol}` | GET | $0.005 | On-chain US stock price on this gateway's chain |
| `/api/v1/usstock/price/{symbol}` | GET | $0.005 | Alias of `/api/v1/stocks/us/price/{symbol}` |
| `/api/v1/stocks/us/list` | GET | Free | US tickers, each with `onchain: { base, solana }`; `?covered=true` lists only this chain's covered set |
| `/api/v1/usstock/list` | GET | Free | Alias of `/api/v1/stocks/us/list` |
| `/api/v1/stocks/us/history/{symbol}` | GET | — | `501`: equity history is not served |
| `/api/v1/stocks/{market}/list` | GET | Free | Tickers for a non-US market (`available: false`) |
| `/api/v1/stocks/{market}/price/{symbol}` | GET | — | `501` for every market except `us` |
| `/api/v1/stocks/{market}/history/{symbol}` | GET | — | `501`: equity history is not served |

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
| US equity | Plain ticker; share classes with a dash. The issuer's own token symbol in its lower-case suffix (`TSLAx` on Solana, `TSLAc` on Base) also works | `AAPL`, `TSLA`, `NVDA`, `SPY`, `BRK-B` |
| Non-US equity | Per-market convention | HKEX `-HK` suffix (`0005-HK`), TSE 4-digit (`7203`), KRX 6-digit (`005930`), LSE/XETRA/Euronext alpha (`HSBA`, `SAP`, `MC`) |

`/list` takes `q` (substring filter) and `limit` (max 2000, default 100) and
returns `{ category, label, count, example, endpoints, symbols: [{ symbol,
description }] }`. The US catalog adds `onchain: { base, solana }` and
`available` (true when this gateway sells that ticker) per symbol; non-US
catalogs add `available: false`, a `note` and a `contact`.

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

## On-chain US stock price

```bash
# 1st call answers 402 with the price; an x402 client pays and repeats it.
curl -i https://blockrun.ai/api/v1/stocks/us/price/NVDA        # Base
curl -i https://sol.blockrun.ai/api/v1/stocks/us/price/TSLA    # Solana
```

How the price is made:

1. Only curated pools are read: verified on chain to pair the issuer's token
   with USDC (or SOL on Solana). Nothing comes from a price aggregator.
2. A pool counts when it holds at least $20,000 on its USDC side (a SOL side
   counts at its USD value) and has liquidity active at its current price.
3. With three or more such pools, any more than 3% from their weighted median
   is dropped. With exactly two that disagree by more than 3%, the deeper one
   is kept, the other is listed with `excludedReason: "outlier"`, and the
   answer carries `staleWarning: ["pools_disagree"]`.
4. The price is the USDC-weighted mean, divided by the token's dividend
   multiplier, so it is per share of the underlying stock.

Everything is read in one call at one slot (Solana) or block (Base).

The response carries:

| Field | Meaning |
|-------|---------|
| `chain` | `base` or `solana` — the chain the price comes from |
| `price` | USD per share |
| `kind`, `note` | `onchain_dex_mid`, and a sentence saying it is the token's price on that chain, not an exchange quote |
| `token` | issuer, address, standard, decimals |
| `multiplier` | the dividend multiplier in force and any scheduled change (`next`) |
| `pools[]` | every pool: `dex`, `quote`, `price`, `quoteSideUsd`, `tvlUsd`, `weight`, `included`, `excludedReason`, `lastTxAt`, `ageSeconds` |
| `quoteSideUsd`, `tvlUsd`, `poolSpreadBps` | totals and the spread across the pools used |
| `staleWarning`, `staleWarningText` | present when it applies: `single_pool` (one pool priced it, nothing cross-checks it), `pools_disagree` (two pools more than 3% apart; the deeper one priced it), `inactive_pool` (a used pool with no transaction in 6 hours), `paused` |
| `slot` / `blockNumber`, `chainTime`, `readAt` | when and at what chain height it was read |
| `usMarket` | `session` (`pre`, `regular`, `post`, `closed`) and `nextOpen` |
| `asset` | on-chain token data, SEC EDGAR company facts, shares outstanding, and `marketCapUsd` (on-chain price × SEC shares; `null` when SEC has no single current count) |
| `otherChains` | whether the other gateway's chain has a market for the ticker, and its URL |

Neither failure after payment charges you; both answer `503` with
`payment_status: "not_charged"` and release the payment:

- `source_unavailable` — the chain could not be read in time. It carries
  `Retry-After: 30`; retry with the same payment header.
- `no_qualifying_pool` — the ticker is listed but no pool qualifies right now
  (thin, inactive or paused). No `Retry-After`: an immediate retry will not
  help; check `otherChains` or try later.

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
`GET` returns `200` and the data. The US on-chain price answers `HEAD` with
its real `402` (the $0.005 requirement); an uncovered ticker answers `404`.
The routes that answer `501` do so to every method, `HEAD` included.

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `400` | Bad `resolution`, missing/invalid `from`, or `to` ≤ `from` on `/history` | No |
| `402` | Discovery metadata (`HEAD`/`OPTIONS` on free feeds), or the payment challenge on the US on-chain price | No |
| `404` | Symbol not covered (`"Symbol not covered by our free daily-close feeds"`, body has a `hint`), `no_onchain_market` for a US ticker with no market on that chain, unknown `{market}`, or no bars in the requested window | No |
| `501` | US history, non-US `/price` or `/history`, or FX/commodity `/history` (no free OHLC source) | No |
| `502` | History upstream unavailable | No |
| `503` | A free price source is not answering (`Retry-After: 60`); or, after payment, the chain could not be read (`source_unavailable`, `Retry-After: 30`) or no pool qualifies (`no_qualifying_pool`) — the payment is released | No |

## What's next?

::::cards

:::card{title="DefiLlama" href="defillama.md" icon="Landmark"}
Protocol TVL, per-chain TVL and yield pools.
:::

:::card{title="Multi-chain RPC" href="multi-chain-rpc.md" icon="Link"}
JSON-RPC to 40 chains through one endpoint.
:::

::::
