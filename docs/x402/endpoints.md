---
title: x402 Endpoints
description: Complete catalog of every x402-enabled BlockRun endpoint across all gateway domains — for x402scan, the Circle ecosystem, and protocol integrators.
---

# x402 Endpoints

Complete catalog of every x402-enabled endpoint BlockRun exposes, across all gateway domains. Intended for x402scan, the Circle x402 ecosystem, and protocol integrators.

For programmatic integration, prefer the discovery endpoints at the bottom of this page — they always reflect the live state.

:::tip{title="Don't hard-code prices"}
Pricing is embedded in every 402 response and published live at `/api/v1/models`. Read amounts at request time rather than copying them from this page.
:::

## Gateways

The same paths are available on each gateway. The 402 response advertises which network and asset the gateway accepts.

| Domain | Network | Asset | Settlement | Notes |
|---|---|---|---|---|
| `blockrun.ai` | Base mainnet — `eip155:8453` | USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Per-call onchain | Default gateway. EIP-3009 / x402 v2. |
| `sol.blockrun.ai` | Solana mainnet — `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | USDC SPL `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Per-call onchain | Solana SPL transfers. |
| `nano.blockrun.ai` | Polygon / Arbitrum / Optimism / Unichain via Circle Gateway | USDC | Batched (Nanopayments) | Gas-free, sub-cent floor, batched onchain settlement. Base buyers use `blockrun.ai` (native x402). See [the Nanopayments launch post](https://blockrun.ai/signal/nanopayments-mainnet-circle-gateway). |
| `xrpl.blockrun.ai` | XRP Ledger | RLUSD (Ripple-issued USD) | — | **Sunset — the gateway no longer serves requests** (returns 404 as of 2026-08-29). Use Base or Solana. See the [XRPL SDK notice](../sdks/xrpl.md). |

All live gateways implement [x402 v2](https://x402.org). Facilitators: Coinbase CDP for Base, PayAI for Solana, Circle Gateway for `nano.blockrun.ai`.

Per-token chat (`/chat/completions`, `/messages`, `/responses`) is billed at the vendor's list price plus a **5% platform fee**, then the flat **$0.001 / request** transaction fee. Media generation carries a 5% margin; Live Search is a flat $0.08 per call. Flat prices quoted below already include the transaction fee; per-unit rates (per 1k characters, per second) are shown with the fee separately.

## Discovery

```
GET https://blockrun.ai/.well-known/x402     # x402 v1 resource list + v2 metadata
GET https://blockrun.ai/openapi.json         # Full OpenAPI 3.1 spec (read by x402scan)
GET https://blockrun.ai/api/v1/models        # Live model catalog with pricing
```

Replace `blockrun.ai` with `sol.blockrun.ai` or `nano.blockrun.ai` to discover the same endpoints scoped to a different network.

## AI Model Gateway

OpenAI-compatible. 93 models across chat, reasoning, coding, and vision — plus image, video, music, and speech generation. Per-model pricing is published live at `/api/v1/models`.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/chat/completions` | OpenAI-compatible chat | Token-based, see `/api/v1/models` |
| POST | `/api/v1/chat/{model}` | Chat completions with the model in the path | Token-based |
| POST | `/api/v1/messages` | Anthropic-compatible messages (native passthrough — responses returned verbatim) | Token-based |
| POST | `/api/v1/responses` | OpenAI Responses API (stateless; `background:true` supported) | Token-based |
| GET  | `/api/v1/responses/{id}` | Poll or attach (`?stream=true`) to a background response | Free (settled at create) |
| POST | `/api/v1/responses/{id}/cancel` | Cancel a background response | Free |
| POST | `/api/v1beta/models/{model}:generateContent` | Native Gemini `generateContent` passthrough | Token-based — allowlisted enterprise payers only |
| POST | `/api/v1/decisions` | OpenAI-compatible typed judgments (predicate / choice / score) — see [Decisions](../api-reference/decisions.md) | $0.001 + token cost, quoted in the 402 |
| POST | `/api/v1/images/generations` | Image generation (GPT Image, Nano Banana, Grok Imagine, Seedream, CogView-4) | Per image, per size |
| GET  | `/api/v1/images/generations/{id}` | Async image poll for slow models (gpt-image-2, etc.) | Free |
| POST | `/api/v1/images/image2image` | Image edit / inpainting + multi-image fusion (GPT Image, Nano Banana family) | Per image |
| POST | `/api/v1/images/edits` | OpenAI / LiteLLM-compatible path for image edits — same models, prices and job polling as `/images/image2image` | Per image |
| POST | `/api/v1/videos/generations` | Video generation (Seedance, Grok Imagine Video) | Per second / token-metered, varies |
| GET  | `/api/v1/videos/generations/{id}` | Async video poll (settlement happens here on completion) | Free |
| POST | `/api/v1/videos` | Standard multimodal `content[]` body — delegates to `/videos/generations` | Per second / token-metered |
| GET  | `/api/v1/videos/{id}` | Poll a job created via `/api/v1/videos` | Free |
| POST | `/api/v1/audio/speech` | Text-to-speech (ElevenLabs voices, `bytedance/seed-audio-1.0`) | $0.0525–$0.105 / 1k chars (ElevenLabs) or $0.003 / second of audio (Seed Audio), + $0.001 per call |
| POST | `/api/v1/audio/generations` | Music generation (MiniMax Music) | $0.20 / track |
| GET  | `/api/v1/audio/generations/{id}` | Poll a music job | Free |
| POST | `/api/v1/audio/sound-effects` | Sound-effect generation | $0.0535 / generation |
| GET  | `/api/v1/audio/voices` | List available TTS voices | Free |
| POST | `/api/v1/portrait/enroll` | Enroll AI character as a Virtual Portrait (`ta_xxx`) for Seedance | **$0.011 / enrollment** |
| GET  | `/api/v1/wallet/{address}/portraits` | List a wallet's enrolled Virtual Portraits | Free (rate-limited) |
| POST | `/api/v1/realface/init` | Create a RealFace enrollment session, returns h5Link for phone liveness check | Free (rate-limited) |
| POST | `/api/v1/realface/enroll` | Finalize RealFace enrollment after H5 completes (uploads face + biometric match) | **$0.011 / enrollment** |
| GET  | `/api/v1/realface/status` | Poll the state of a RealFace enrollment group | Free (rate-limited) |
| GET  | `/api/v1/wallet/{address}/realfaces` | List a wallet's enrolled RealFaces | Free (rate-limited) |
| GET  | `/api/v1/wallet/{address}/reconciliation` | Per-model token usage and spend for a wallet (30-day window) | Free (rate-limited) |

Per-model pricing is published at `/api/v1/models` and embedded in every 402 response.

## Web & Search

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/search` | Live search (web / news) | $0.081 per call ($0.08 + the fee), any `max_results` |
| GET  | `/api/v1/search/{id}` | Poll an async search (`Prefer: respond-async`) — wallet proof required, never settles again | Free |
| POST | `/api/v1/exa/search` | Web search | $0.011 / call |
| POST | `/api/v1/exa/find-similar` | Find semantically similar pages | $0.011 / call |
| POST | `/api/v1/exa/answer` | AI answer with citations | $0.011 / call |
| POST | `/api/v1/exa/contents` | Extract content from URLs | $0.002 / URL + $0.001 / request |

## Voice & Phone

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/voice/call` | Place an outbound AI voice call | $0.541 / call |
| GET  | `/api/v1/voice/call/{callId}` | Poll call status / transcript | Free |
| POST | `/api/v1/phone/lookup` | Carrier + line-type lookup | $0.011 |
| POST | `/api/v1/phone/lookup/fraud` | Fraud scoring for a number | $0.051 |
| POST | `/api/v1/phone/numbers/buy` | Rent a number | $5.001 |
| POST | `/api/v1/phone/numbers/renew` | Renew a rented number | $5.001 |
| POST | `/api/v1/phone/numbers/list` | List your rented numbers | $0.002 |
| POST | `/api/v1/phone/numbers/release` | Release a rented number | Free |

## Wallet Funding

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/polymarket/fund` | Bridge USDC from Base into a Polymarket (Polygon) account — see [Polymarket Funding](../api-reference/polymarket-funding.md) | $0.011 fee + the deposit amount |
| POST | `/api/v1/onramp/token` | Mint a one-time Coinbase Onramp link for a Base wallet (a wallet signature proves ownership; no payment moves) | Free — Base USDC only |

## Sandbox Compute

Ephemeral, isolated Python sandboxes for agent code execution.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/modal/sandbox/create` | Create sandbox | $0.011 floor (short-lived); per-hour for long-lived |
| POST | `/api/v1/modal/sandbox/exec` | Execute a command in a sandbox | $0.002 |
| POST | `/api/v1/modal/sandbox/status` | Check sandbox status | $0.002 |
| POST | `/api/v1/modal/sandbox/terminate` | Terminate a sandbox | $0.002 |

## Prediction Markets (Predexon)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/pm/{path}` | Predexon passthrough — Polymarket, Kalshi, Limitless, Opinion, Predict.Fun, Binance, UMA oracle, wallet identity | $0.0085, every tier and method |

## 0x Swap (DEX)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/zerox/{path}` | 0x Swap + Gasless aggregation passthrough — `price`, `quote`, `swap/chains`, `gasless/price`, `gasless/quote`, `gasless/submit`, `gasless/status/{trade_hash}`, `gasless/approval-tokens`, `gasless/chains` | **Free passthrough — no x402 payment** |

## DeFi Data (DefiLlama)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET | `/api/v1/defillama/protocols` | Every DeFi protocol DefiLlama tracks, with TVL | $0.006 |
| GET | `/api/v1/defillama/protocol/{slug}` | TVL + breakdown for one protocol (`aave`, `uniswap`, …) | $0.006 |
| GET | `/api/v1/defillama/chains` | TVL by chain | $0.006 |
| GET | `/api/v1/defillama/yields` | Every tracked yield pool (lending, LP, staking, vaults) with APY/TVL | $0.006 |
| GET | `/api/v1/defillama/prices/{coins}` | Token prices, comma-separated coin ids (`coingecko:bitcoin`, `ethereum:0x…`) | $0.002 |

See [DefiLlama](../api-reference/defillama.md).

## Financial Data

Spot prices are free daily closes (`realtime: false`), not realtime ticks. All `list` endpoints are free. **Crypto, FX and commodity** spot prices and **crypto** OHLC history are free. US stock prices are on-chain: `/api/v1/stocks/us/price/{symbol}` ($0.005) reads tokenized-stock DEX pools — Coinbase Tokenized Stocks on Base at blockrun.ai, xStocks on Solana at sol.blockrun.ai — and a ticker with no on-chain market on that chain answers `404` before payment. US history and every non-US price/history answer `501` before any payment. See [Market Data](../api-reference/market-data.md).

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET | `/api/v1/stocks/us/price/{symbol}` | On-chain US stock price on this gateway's chain (alias `/api/v1/usstock/price/{symbol}`) | $0.005 |
| GET | `/api/v1/stocks/us/list` | US tickers with `onchain: { base, solana }`; `?covered=true` for this chain's set (alias `/api/v1/usstock/list`) | Free |
| GET | `/api/v1/stocks/us/history/{symbol}` | US stock OHLC | `501` — not served |
| GET | `/api/v1/stocks/{market}/list` | Tickers for a non-US market (`available: false`) | Free |
| GET | `/api/v1/stocks/{market}/price/{symbol}` | Non-US stock price | `501` — not served |
| GET | `/api/v1/stocks/{market}/history/{symbol}` | Stock OHLC | `501` — not served |
| GET | `/api/v1/crypto/list` | Crypto tickers | Free |
| GET | `/api/v1/crypto/price/{symbol}` | Crypto spot (daily close) | Free |
| GET | `/api/v1/crypto/history/{symbol}` | Crypto OHLC | Free |
| GET | `/api/v1/fx/list` | FX pairs | Free |
| GET | `/api/v1/fx/price/{symbol}` | FX spot (daily close) | Free |
| GET | `/api/v1/fx/history/{symbol}` | FX OHLC | `501` — no free OHLC source |
| GET | `/api/v1/commodity/list` | Commodities | Free |
| GET | `/api/v1/commodity/price/{symbol}` | Commodity spot (daily close) | Free |
| GET | `/api/v1/commodity/history/{symbol}` | Commodity OHLC | `501` — no free OHLC source |

## Blockchain RPC

Standard JSON-RPC 2.0 to 40 chains through one endpoint — no API key. EVM (`eth_*`) and non-EVM methods. See [Multi-chain RPC](../api-reference/multi-chain-rpc.md).

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/rpc/{network}` | Multi-chain JSON-RPC — `ethereum`, `base`, `solana`, `polygon`, `bsc`, `arbitrum`, `bitcoin`, `xrp`, `sui`… (40, aliases supported) | **$0.003 / call** (batch priced per element) |
| POST | `/api/v1/solana/rpc` | Solana JSON-RPC (also reachable via `/api/v1/rpc/solana`) | $0.0015 / call, batch priced per element |

## Free Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/models` | Live chat model catalog with pricing |
| GET | `/api/v1/images/models` | Image model list |
| GET | `/api/v1/video/models` | Video model list |
| GET | `/api/v1/audio/models` | Audio (music / speech / SFX) model list |
| GET | `/api/v1/audio/voices` | TTS voice list |
| GET | `/api/v1/balance` | Wallet USDC balance check |
| GET | `/api/health` | Basic service health |
| GET | `/api/v1/health/overview` | Service health |
| GET | `/api/v1/health/chain` | Chain RPC health |
| GET | `/api/v1/health/models` | Per-model availability |
| GET | `/api/v1/health/regions` | Region/edge health |
| GET | `/api/pricing` | Pricing info |
| GET | `/brand/numbers.json` | Published catalog counts (models, tools, chains, savings) |
| GET | `/.well-known/x402` | x402 discovery (v1+v2) |
| GET | `/openapi.json` | OpenAPI 3.1 spec |

## Payment Protocol

Every paid endpoint follows the same flow:

1. Client sends request without payment → server returns `HTTP 402` with `accepts[]` describing network, asset, amount, `payTo`, and resource URL
2. Client signs a payment authorization (EIP-3009 on EVM, SPL transfer on Solana, a batched Circle Gateway authorization on `nano.blockrun.ai`)
3. Client retries with the `PAYMENT-SIGNATURE` header (x402 v2)
4. Server verifies via the network's facilitator, executes the API call, settles onchain
5. Server returns the response with `X-Payment-Receipt` (tx hash)

For full details and code samples see [Payment Flow](payment-flow.md). For threat model and non-custodial guarantees see [Security](security.md).

## Source of Truth

This page is human-maintained and may lag a few hours behind code changes. For machine integration:

- **Discovery**: `GET /.well-known/x402` — canonical resource list, updated per-deploy
- **OpenAPI**: `GET /openapi.json` — full request/response schemas (this is what x402scan reads)
- **Models**: `GET /api/v1/models` — live model catalog with current pricing

Pricing is also embedded in every 402 response, so clients should not hard-code amounts — read them at request time.

## Contact

- GitHub: [BlockRunAI](https://github.com/BlockRunAI)
- Site: [blockrun.ai](https://blockrun.ai)
- x402 protocol: [x402.org](https://x402.org)

## What's next?

::::cards

:::card{title="Payment Flow" href="payment-flow.md" icon="Route"}
The request, signature, and settlement sequence every endpoint follows.
:::

:::card{title="How x402 Works" href="how-it-works.md" icon="Zap"}
Protocol concepts behind the 402 response and on-chain settlement.
:::

:::card{title="Security" href="security.md" icon="Wallet"}
The threat model and non-custodial guarantees for paid calls.
:::

::::

For wallet-tool response limits, recovery, supported query parameters and free number-release authentication, see [Agent wallet integration and result recovery](../api-reference/agent-wallet-integration.md).
