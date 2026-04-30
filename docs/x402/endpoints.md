# x402 Endpoints

Complete catalog of every x402-enabled endpoint BlockRun exposes, across all gateway domains. Intended for x402scan, the Circle x402 ecosystem, and protocol integrators.

For programmatic integration, prefer the discovery endpoints at the bottom of this page — they always reflect the live state.

## Gateways

The same paths are available on each gateway. The 402 response advertises which network and asset the gateway accepts.

| Domain | Network | Asset | Settlement | Notes |
|---|---|---|---|---|
| `blockrun.ai` | Base mainnet — `eip155:8453` | USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Per-call onchain | Default gateway. EIP-3009 / x402 v2. |
| `sol.blockrun.ai` | Solana mainnet — `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | USDC SPL `EPjFWdd5AufqSSqeM2qN1xzybapC8C4wEBmGbV4Vu5JLs` | Per-call onchain | Solana SPL transfers. |
| `nano.blockrun.ai` | Base mainnet via Circle Gateway | USDC | Batched (Nanopayments) | Gas-free, sub-cent floor, batched onchain settlement. See [the Nanopayments launch post](https://blockrun.ai/signal/nanopayments-mainnet-circle-gateway). |
| `testnet.blockrun.ai` | Base Sepolia — `eip155:84532` | USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Per-call onchain | Free test USDC. Smaller model catalog. |

All gateways implement [x402 v2](https://x402.org). The verifier/facilitator is Coinbase CDP for Base; native verification on Solana.

## Discovery

```
GET https://blockrun.ai/.well-known/x402     # x402 v1 resource list + v2 metadata
GET https://blockrun.ai/openapi.json         # Full OpenAPI 3.1 spec (read by x402scan)
GET https://blockrun.ai/api/v1/models        # Live model catalog with pricing
```

Replace `blockrun.ai` with `sol.blockrun.ai`, `nano.blockrun.ai`, or `testnet.blockrun.ai` to discover the same endpoints scoped to a different network.

## AI Model Gateway

OpenAI-compatible. 50+ chat models from OpenAI, Anthropic, Google, xAI, DeepSeek, Moonshot, Z.AI, NVIDIA, Mistral, MiniMax, and Cohere.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/chat/completions` | OpenAI-compatible chat | Token-based, see `/api/v1/models` |
| POST | `/api/v1/messages` | Anthropic-compatible messages | Token-based |
| POST | `/api/v1/images/generations` | Image generation (DALL-E 3, gpt-image-1/2, Nano Banana, Grok Imagine, Flux) | Per image, per size |
| GET  | `/api/v1/images/generations/{id}` | Async image poll for slow models (gpt-image-2, etc.) | Free |
| POST | `/api/v1/images/image2image` | Image edit / inpainting (gpt-image-1, gpt-image-2) | Per image |
| POST | `/api/v1/videos/generations` | Video generation (Seedance, Grok Imagine Video) | Per second, varies |
| GET  | `/api/v1/videos/generations/{id}` | Async video poll | Free |
| POST | `/api/v1/audio/generations` | Music / audio (MiniMax Music) | Per track |

Per-model pricing is published at `/api/v1/models` and embedded in every 402 response.

## Web & Search

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/search` | Web search (Exa-backed) | ~$0.005 / call |
| GET/POST | `/api/v1/exa/{path}` | Exa raw passthrough (search, contents, find_similar) | Per-tier |

## Sandbox Compute (Modal)

Ephemeral, isolated Python sandboxes for agent code execution.

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| POST | `/api/v1/modal/sandbox/create` | Create sandbox | $0.01 |
| POST | `/api/v1/modal/sandbox/exec` | Execute code | $0.001 |
| POST | `/api/v1/modal/sandbox/files/read` | Read file | $0.001 |
| POST | `/api/v1/modal/sandbox/files/write` | Write file | $0.001 |
| POST | `/api/v1/modal/sandbox/destroy` | Destroy sandbox | $0.001 |

## Prediction Markets (Predexon)

| Method | Path | Purpose | Pricing |
|---|---|---|---|
| GET/POST | `/api/v1/pm/{path}` | Predexon API passthrough — markets, events, odds, history | $0.001 (tier 1) / $0.005 (tier 2) |

## Financial Data (Pyth-backed)

Real-time and historical prices. List endpoints are free; price/history endpoints are $0.001/call.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/usstock/list` | US tickers (free) |
| GET | `/api/v1/usstock/price/{symbol}` | US stock spot price |
| GET | `/api/v1/usstock/history/{symbol}` | US stock OHLC |
| GET | `/api/v1/stocks/{market}/list` | Non-US markets (HK, JP, ...) (free) |
| GET | `/api/v1/stocks/{market}/price/{symbol}` | Non-US stock price |
| GET | `/api/v1/stocks/{market}/history/{symbol}` | Non-US OHLC |
| GET | `/api/v1/crypto/list` | Crypto tickers (free) |
| GET | `/api/v1/crypto/price/{symbol}` | Crypto spot |
| GET | `/api/v1/crypto/history/{symbol}` | Crypto OHLC |
| GET | `/api/v1/fx/list` | FX pairs (free) |
| GET | `/api/v1/fx/price/{symbol}` | FX spot |
| GET | `/api/v1/fx/history/{symbol}` | FX OHLC |
| GET | `/api/v1/commodity/list` | Commodities (free) |
| GET | `/api/v1/commodity/price/{symbol}` | Commodity spot |
| GET | `/api/v1/commodity/history/{symbol}` | Commodity OHLC |

## X / Twitter (AttentionVC) — Currently Paused

Partnership upgrade in progress. These endpoints return HTTP 503 with a waitlist link. Subscribe via `POST /api/v1/x/waitlist`. Pricing below applies on resume.

| Method | Path | Resumed pricing |
|---|---|---|
| POST | `/api/v1/x/trending` | $0.002 |
| POST | `/api/v1/x/articles/rising` | $0.001 |
| POST | `/api/v1/x/search` | $0.001 |
| POST | `/api/v1/x/users/info` | $0.001 |
| POST | `/api/v1/x/users/lookup` | $0.001 |
| POST | `/api/v1/x/users/tweets` | $0.001 |
| POST | `/api/v1/x/users/mentions` | $0.001 |
| POST | `/api/v1/x/users/followers` | $0.001 |
| POST | `/api/v1/x/users/following` | $0.001 |
| POST | `/api/v1/x/users/followings` | $0.001 |
| POST | `/api/v1/x/users/verified-followers` | $0.001 |
| POST | `/api/v1/x/tweets/lookup` | $0.001 |
| POST | `/api/v1/x/tweets/replies` | $0.001 |
| POST | `/api/v1/x/tweets/thread` | $0.001 |
| POST | `/api/v1/x/waitlist` | Free |

## Free Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/models` | Live model catalog with pricing |
| GET | `/api/v1/balance` | Wallet USDC balance check |
| GET | `/api/v1/health/overview` | Service health |
| GET | `/api/v1/health/chain` | Chain RPC health |
| GET | `/api/v1/health/models` | Per-provider availability |
| GET | `/api/v1/health/regions` | Region/edge health |
| GET | `/.well-known/x402` | x402 discovery (v1+v2) |
| GET | `/openapi.json` | OpenAPI 3.1 spec |

## Payment Protocol

Every paid endpoint follows the same flow:

1. Client sends request without payment → server returns `HTTP 402` with `accepts[]` describing network, asset, amount, `payTo`, and resource URL
2. Client signs a payment authorization (EIP-3009 on EVM, SPL transfer on Solana)
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
