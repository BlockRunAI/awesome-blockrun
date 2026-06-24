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
| `nano.blockrun.ai` | Base mainnet via Circle Gateway | USDC | Batched (Nanopayments) | Gas-free, sub-cent floor, batched onchain settlement. See [the Nanopayments launch post](https://blockrun.ai/signal/nanopayments-mainnet-circle-gateway). |
| `xrpl.blockrun.ai` | XRP Ledger | RLUSD (Ripple-issued USD) | Per-call onchain | **Deprecated (being sunset)** — use Base or Solana for new integrations. See the [XRPL SDK notice](../sdks/xrpl.md). |
| `testnet.blockrun.ai` | Base Sepolia — `eip155:84532` | USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Per-call onchain | Free test USDC. Smaller model catalog. |

All gateways implement [x402 v2](https://x402.org). Facilitators: Coinbase CDP for Base, native Solana verification, t54.ai for XRPL.

## Discovery

```
GET https://blockrun.ai/.well-known/x402     # x402 v1 resource list + v2 metadata
GET https://blockrun.ai/openapi.json         # Full OpenAPI 3.1 spec (read by x402scan)
GET https://blockrun.ai/api/v1/models        # Live model catalog with pricing
```

Replace `blockrun.ai` with `sol.blockrun.ai`, `nano.blockrun.ai`, `xrpl.blockrun.ai`, or `testnet.blockrun.ai` to discover the same endpoints scoped to a different network.

## AI Model Gateway

OpenAI-compatible. 60+ models across chat, reasoning, coding, and vision — plus image, video, music, and speech generation. Per-model pricing is published live at `/api/v1/models`.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/chat/completions` | OpenAI-compatible chat | Token-based, see `/api/v1/models` |
| POST | `/api/v1/chat/{model}` | Chat completions with the model in the path | Token-based |
| POST | `/api/v1/messages` | Anthropic-compatible messages | Token-based |
| POST | `/api/v1/images/generations` | Image generation (gpt-image-1/2, Nano Banana, CogView-4, Grok Imagine) | Per image, per size |
| GET  | `/api/v1/images/generations/{id}` | Async image poll for slow models (gpt-image-2, etc.) | Free |
| POST | `/api/v1/images/image2image` | Image edit / inpainting + multi-image fusion (gpt-image-1/2, Nano Banana, Nano Banana Pro) | Per image |
| POST | `/api/v1/videos/generations` | Video generation (Seedance, Grok Imagine Video, Sora 2) | Per second / token-metered, varies |
| GET  | `/api/v1/videos/generations/{id}` | Async video poll (settlement happens here on completion) | Free |
| POST | `/api/v1/videos` | Standard multimodal `content[]` body — delegates to `/videos/generations` | Per second / token-metered |
| POST | `/api/v1/audio/speech` | Text-to-speech (ElevenLabs voices) | $0.05–$0.10 / 1k chars |
| POST | `/api/v1/audio/generations` | Music generation (MiniMax Music) | $0.15 / track |
| POST | `/api/v1/audio/sound-effects` | Sound-effect generation | $0.05 / generation |
| GET  | `/api/v1/audio/voices` | List available TTS voices | Free |
| POST | `/api/v1/portrait/enroll` | Enroll AI character as a Virtual Portrait (`ta_xxx`) for Seedance | **$0.01 / enrollment** |
| GET  | `/api/v1/wallet/{address}/portraits` | List a wallet's enrolled Virtual Portraits | Free (rate-limited) |
| POST | `/api/v1/realface/init` | Create a RealFace enrollment session, returns h5Link for phone liveness check | Free (rate-limited) |
| POST | `/api/v1/realface/enroll` | Finalize RealFace enrollment after H5 completes (uploads face + biometric match) | **$0.01 / enrollment** |
| GET  | `/api/v1/realface/status` | Poll the state of a RealFace enrollment group | Free (rate-limited) |
| GET  | `/api/v1/wallet/{address}/realfaces` | List a wallet's enrolled RealFaces | Free (rate-limited) |

Per-model pricing is published at `/api/v1/models` and embedded in every 402 response.

## Web & Search

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/search` | Live search (web / news / X) | `max_results × $0.025` / source (default 10) |
| POST | `/api/v1/exa/search` | Web search | $0.01 / call |
| POST | `/api/v1/exa/find-similar` | Find semantically similar pages | $0.01 / call |
| POST | `/api/v1/exa/answer` | AI answer with citations | $0.01 / call |
| POST | `/api/v1/exa/contents` | Extract content from URLs | $0.002 / URL |

## Voice & Phone

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/voice/call` | Place an outbound AI voice call | Per call, returned in 402 |
| GET  | `/api/v1/voice/call/{callId}` | Poll call status / transcript | Free |
| GET/POST | `/api/v1/phone/{path}` | Phone-number provisioning, lookups, and management | Per endpoint, returned in 402 |

## Sandbox Compute

Ephemeral, isolated Python sandboxes for agent code execution.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/modal/sandbox/create` | Create sandbox | $0.01 (flat for short-lived; per-hour for long-lived) |
| POST | `/api/v1/modal/sandbox/exec` | Execute a command in a sandbox | $0.001 |
| POST | `/api/v1/modal/sandbox/status` | Check sandbox status | $0.001 |
| POST | `/api/v1/modal/sandbox/terminate` | Terminate a sandbox | $0.001 |

## Prediction Markets (Predexon)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/pm/{path}` | Predexon API passthrough — markets, events, odds, history | GET $0.001 (tier 1) / POST $0.005 (tier 2) |

## Crypto Data (Surf)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/surf/{path}` | Crypto market / on-chain intelligence — exchanges, on-chain analytics, wallet labels, social mindshare, news, search | Tier 1 $0.001 (reads) · Tier 2 $0.005 (AI rankings/trends) · Tier 3 $0.02 (heavy LLM/SQL reports) |

## 0x Swap (DEX)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/zerox/{path}` | 0x Swap + Gasless aggregation passthrough (price / quote / gasless) | **Free passthrough — no x402 payment** |

## Financial Data (Pyth-backed)

Real-time and historical prices. All `list` endpoints are free. **Crypto, FX, and commodity** price/history are also free; **stock** price/history (US and non-US) are **$0.001/call**.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET | `/api/v1/usstock/list` | US tickers | Free |
| GET | `/api/v1/usstock/price/{symbol}` | US stock spot price | $0.001 |
| GET | `/api/v1/usstock/history/{symbol}` | US stock OHLC | $0.001 |
| GET | `/api/v1/stocks/{market}/list` | Non-US markets (HK, JP, ...) | Free |
| GET | `/api/v1/stocks/{market}/price/{symbol}` | Non-US stock price | $0.001 |
| GET | `/api/v1/stocks/{market}/history/{symbol}` | Non-US OHLC | $0.001 |
| GET | `/api/v1/crypto/list` | Crypto tickers | Free |
| GET | `/api/v1/crypto/price/{symbol}` | Crypto spot | Free |
| GET | `/api/v1/crypto/history/{symbol}` | Crypto OHLC | Free |
| GET | `/api/v1/fx/list` | FX pairs | Free |
| GET | `/api/v1/fx/price/{symbol}` | FX spot | Free |
| GET | `/api/v1/fx/history/{symbol}` | FX OHLC | Free |
| GET | `/api/v1/commodity/list` | Commodities | Free |
| GET | `/api/v1/commodity/price/{symbol}` | Commodity spot | Free |
| GET | `/api/v1/commodity/history/{symbol}` | Commodity OHLC | Free |

## Blockchain RPC (Tatum)

Standard JSON-RPC 2.0 to 40+ chains through one endpoint — no API key. EVM (`eth_*`) and non-EVM methods. See [Multi-chain RPC](../api-reference/multi-chain-rpc.md).

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/rpc/{network}` | Multi-chain JSON-RPC — `ethereum`, `base`, `solana`, `polygon`, `bsc`, `arbitrum`, `bitcoin`, `xrp`, `sui`… (40+, aliases supported) | **$0.002 / call** (batch priced per element) |
| POST | `/api/v1/solana/rpc` | Solana JSON-RPC (also reachable via `/api/v1/rpc/solana`) | Per-method, returned in 402 |

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
| GET | `/.well-known/x402` | x402 discovery (v1+v2) |
| GET | `/openapi.json` | OpenAPI 3.1 spec |

## Payment Protocol

Every paid endpoint follows the same flow:

1. Client sends request without payment → server returns `HTTP 402` with `accepts[]` describing network, asset, amount, `payTo`, and resource URL
2. Client signs a payment authorization (EIP-3009 on EVM, SPL transfer on Solana, XRPL payment channel on `xrpl.blockrun.ai`)
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
