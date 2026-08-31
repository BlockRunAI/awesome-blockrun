---
title: DefiLlama
description: DeFi protocol TVL, per-chain TVL, yield pools and token prices from DefiLlama's dataset, paid per call in USDC over x402 — no account, no API key.
---

# DefiLlama

DeFi's reference dataset — every protocol DefiLlama tracks, TVL by chain, every
yield pool, and token prices across chains. Pay per call in USDC over x402; no
account and no API key.

DefiLlama publishes under Apache 2.0 with explicit free-for-commercial-use
terms. BlockRun wraps it with metering, timeouts and a single payment rail so an
agent can budget a call the same way it budgets any other endpoint.

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/defillama/protocols` | GET | $0.006 | Every DeFi protocol tracked, with current and historical TVL across chains |
| `/api/v1/defillama/protocol/{slug}` | GET | $0.006 | Detailed TVL + breakdown for one protocol |
| `/api/v1/defillama/chains` | GET | $0.006 | TVL for every chain DefiLlama tracks |
| `/api/v1/defillama/yields` | GET | $0.006 | Every tracked yield pool (lending, LPs, staking, vaults) with current APY/TVL |
| `/api/v1/defillama/prices/{coins}` | GET | $0.002 | Token price lookup, comma-separated coin identifiers |

Prices above include the flat $0.001 transaction fee added to every paid call
(base $0.005 / $0.001). They are quoted in every 402 response — read them at
request time rather than copying from this page.

Query-string parameters are forwarded to DefiLlama unchanged, so any filter the
upstream endpoint accepts works here too.

---

## GET /api/v1/defillama/protocols

Every protocol DefiLlama indexes, with current TVL and per-chain breakdown.

```bash
curl https://blockrun.ai/api/v1/defillama/protocols \
  -H "X-Payment: <x402_payment_token>"
```

Returns a JSON array. Each entry carries `name`, `slug`, `category`, `chains`,
`tvl` and change-over-time fields. It is a large payload — expect several MB.

---

## GET /api/v1/defillama/protocol/{slug}

One protocol in detail, addressed by its DefiLlama slug.

```bash
curl https://blockrun.ai/api/v1/defillama/protocol/aave \
  -H "X-Payment: <x402_payment_token>"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `slug` | path | Yes | DefiLlama protocol slug — `aave`, `uniswap`, `lido`, … |

Slugs come from the `slug` field of `/protocols`. An unknown slug is rejected
upstream and comes back as `400` (`error: "Bad Request"`, with the upstream
message in `details`) — it is **not** charged.

The heaviest protocols (`uniswap`, for one) return multi-MB payloads; the
upstream timeout is 25s.

---

## GET /api/v1/defillama/chains

Current TVL totals for every chain.

```bash
curl https://blockrun.ai/api/v1/defillama/chains \
  -H "X-Payment: <x402_payment_token>"
```

---

## GET /api/v1/defillama/yields

Every yield pool DefiLlama tracks, with APY and TVL — lending markets, LP
positions, staking and vaults.

```bash
curl https://blockrun.ai/api/v1/defillama/yields \
  -H "X-Payment: <x402_payment_token>"
```

Filter client-side on `chain`, `project`, `symbol`, `apy` and `tvlUsd`.

---

## GET /api/v1/defillama/prices/{coins}

Token prices in DefiLlama's coin syntax. Cheaper than the other four at $0.002
because it is a point lookup rather than a full dataset.

```bash
curl "https://blockrun.ai/api/v1/defillama/prices/coingecko:bitcoin,ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" \
  -H "X-Payment: <x402_payment_token>"
```

| Parameter | In | Required | Description |
|-----------|----|----------|-------------|
| `coins` | path | Yes | Comma-separated coin identifiers |

Identifier forms:

- `coingecko:<id>` — e.g. `coingecko:bitcoin`
- `<chain>:<address>` — e.g. `ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`, `solana:So11111111111111111111111111111111111111112`

The response is `{ "coins": { ... } }` keyed by the identifier you passed, each
with `price`, `symbol`, `confidence` and `timestamp` (contract-address
identifiers also carry `decimals`). An identifier
DefiLlama does not know is simply absent from `coins` — the call still returns
`200` and is charged, so validate identifiers before batching them.

---

## Payment flow

A request without a payment header returns `402`. The signed requirements are
in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (and
`WWW-Authenticate: X402 requirements="…"`), and the JSON body restates the
price for humans and mirrors the challenge itself (`x402Version`, `accepts`)
for clients that only read the body:

```json
{
  "x402Version": 2,
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "amount": "2000", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300 }],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "endpoint": "/api/v1/defillama/prices/coingecko:bitcoin",
  "method": "GET",
  "description": "Token price lookup. …",
  "price": { "amount": "0.0020", "currency": "USD" },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

Successful responses carry `X-Payment-Receipt` (the settlement transaction
hash) and `X-Payment-Response` (base64 x402 settlement receipt).

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `400` | DefiLlama rejected the request (unknown slug, bad parameter). Upstream `4xx` codes are passed through as-is with `error: "Bad Request"` and the upstream body in `details` | No |
| `402` | No payment header — body carries `price` and the headers carry the signed requirements | No |
| `402` | `error: "Payment verification failed"` with a machine-readable `code`: `PAYMENT_INVALID`, `PAYMENT_UNFUNDED` (insufficient USDC or expired `validBefore`) or `PAYMENT_BLOCKHASH_STALE`; `message` explains the fix when one is known | No |
| `402` | `code: "PAYMENT_REPLAY"` — the payment authorization was already used. Sign a fresh one per request | No |
| `402` | `error: "Payment settlement failed"` — data was fetched but settlement did not land; `details` has the reason | No |
| `404` | Unknown BlockRun endpoint — body lists `available` paths | No |
| `502` | DefiLlama upstream error or 25s timeout (`"Payment was NOT charged."`) | No |
| `503` | Service paused | No |

Payment settles only after a successful upstream response, so a failed call
never costs you anything.

## What's next?

::::cards

:::card{title="Surf — Crypto Data" href="surf.md" icon="ChartLine"}
Exchange, on-chain and social data across 83 endpoints.
:::

:::card{title="0x Swap (DEX)" href="zerox-swap.md" icon="ArrowLeftRight"}
Swap quotes and gasless trading — free to call.
:::

:::card{title="How x402 Works" href="../x402/how-it-works.md" icon="Zap"}
The 402 response and on-chain settlement, end to end.
:::

::::
