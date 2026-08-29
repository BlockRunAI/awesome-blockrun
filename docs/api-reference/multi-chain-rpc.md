---
title: Multi-chain RPC
description: Standard JSON-RPC 2.0 access to every supported blockchain through one endpoint, paid $0.003 per call in USDC over x402 — no account, no API key, no monthly plan.
---

# Multi-chain RPC — one endpoint, every chain

Standard JSON-RPC 2.0 access to 40 blockchains through a single endpoint. No account, no API key, no monthly plan — pay **$0.003 per call** in USDC over x402. Built for AI agents that read on-chain data across many chains from one wallet.

BlockRun proxies upstream RPC gateways with x402 settlement, so an agent can query any supported chain without onboarding to a node provider.

## The problem it solves

Traditional RPC providers (Alchemy, Infura, QuickNode) make you sign up, manage an API key, and pick a monthly plan with rate-limit tiers — **per chain**. An agent that needs Ethereum *and* Base *and* Solana *and* Polygon ends up with four accounts and four keys. BlockRun gives you one endpoint for 40 chains, paid per call, with on-chain settlement receipts.

## Endpoint

```
POST /api/v1/rpc/{network}
```

Swap `{network}` for the chain. Body is a standard JSON-RPC 2.0 request; the response is returned verbatim from the upstream node. EVM (`eth_*`) and non-EVM (`getSlot`, …) methods both work. A JSON-RPC **batch** (array body) is priced per element. Upstream calls time out after **20 seconds**.

**Flat price: $0.003 per call** ($0.002 base + the $0.001 transaction fee). No payment header → HTTP 402 quoting the exact price; add an x402 payment header (a wallet signature) → the result, settled in USDC on Base. Hot, low-volatility reads (`eth_chainId`, `eth_getTransactionReceipt`, `getTransaction`, …) are served from a short TTL cache — the `X-Cache: HIT|MISS` response header tells you which; writes and time-sensitive reads (`eth_sendRawTransaction`, `eth_gasPrice`, `getLatestBlockhash`) are never cached.

:::info{title="402 quotes the price"}
A request with no payment header returns `402 Payment Required` with the exact $0.003 quote (`price.amount: "0.0030"`, scaled ×N for a batch) and Base USDC instructions. The x402 requirements are in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (base64) and `WWW-Authenticate: X402 requirements="…"`. Re-send with the signed authorization in `X-Payment` (or `Payment-Signature`) to get the result.
:::

## Supported networks (40+)

EVM and non-EVM, one path each. A selection:

| Network | `{network}` slug | Aliases |
|---------|------------------|---------|
| Ethereum | `ethereum` | `eth` |
| Base | `base` | |
| Solana | `solana` | `sol` |
| Polygon | `polygon` | `matic`, `pol` |
| BNB Smart Chain | `bsc` | `bnb`, `binance` |
| Arbitrum One | `arbitrum` | `arb`, `arbitrum-one` |
| Optimism | `optimism` | `op` |
| Avalanche | `avalanche` | `avax` |
| zkSync | `zksync` | |
| Bitcoin | `bitcoin` | `btc` |
| Bitcoin Cash | `bitcoin-cash` | `bch` |
| Litecoin | `litecoin` | `ltc` |
| Dogecoin | `dogecoin` | `doge` |
| XRP Ledger | `ripple` | `xrp`, `xrpl` |
| Near | `near` | |
| Sui | `sui` | |
| Polkadot | `polkadot` | `dot` |
| Zcash | `zcash` | `zec` |

…and more. Slugs are case-insensitive. A **malformed** `{network}` (anything other than `[a-z0-9-]`, up to 41 chars) returns `400` with the full curated list in `supportedNetworks`. A well-formed slug that is not in the curated list is still attempted as `<slug>-mainnet` against the upstream gateway (forward-compatible with newly added chains); if the chain does not exist there, the upstream `404` is relayed to you and nothing is charged. The live list is in `/openapi.json`, `/.well-known/x402`, and on [/services/rpc](https://blockrun.ai/services/rpc).

## Example

```bash
# Ethereum block number
curl -X POST https://blockrun.ai/api/v1/rpc/ethereum \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'
# → 402 with price $0.0030 + Base USDC payment instructions
# Re-send with the x402 X-Payment header → {"jsonrpc":"2.0","id":1,"result":"0x..."}
#   response headers: X-Network: ethereum · X-Cache: HIT|MISS · X-Payment-Receipt: <tx hash> · X-Payment-Response: <base64>
```

```bash
# Solana slot
curl -X POST https://blockrun.ai/api/v1/rpc/solana \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getSlot","id":1}'
```

## Solana-only endpoint

There is also a cheaper Solana-only passthrough to public mainnet-beta:

```
POST /api/v1/solana/rpc
```

Same JSON-RPC body and x402 flow, **$0.0015 per call** ($0.0005 base + the $0.001 transaction fee), batches priced per element, 15-second upstream timeout. `/api/v1/rpc/solana` ($0.003) routes through the multi-chain gateway instead; either works for standard Solana JSON-RPC.

## Errors

| Status | Body `error` | Meaning | Charged? |
|--------|--------------|---------|----------|
| `400` | `Bad Request` | Malformed `{network}` (with `supportedNetworks`), or — once a payment header is present — a body that is not a JSON-RPC request/array with a `method` | No |
| `402` | `Payment Required` | No payment header; body carries `price`, `endpoint`, `network`, `paymentInfo` | No |
| `402` | `Payment verification failed` | Signature/amount mismatch. `code` is `PAYMENT_INVALID`, `PAYMENT_UNFUNDED` (insufficient USDC or expired window) or `PAYMENT_BLOCKHASH_STALE`; `message` explains when known | No |
| `402` | `Payment authorization already used` | `code: "PAYMENT_REPLAY"` — sign a fresh authorization per request | No |
| `402` | `Payment settlement failed` | Upstream answered but settlement did not go through | No |
| `4xx` | `Bad Request` | The chain rejected your JSON-RPC (relayed status + `details`) | No |
| `502` | `Upstream provider error` | Upstream timeout (20 s) or fault — including an upstream auth/quota problem that is ours, not yours, and a stale slug on a known chain. Sent with `Retry-After: 30`. Your single-use authorization is **released**, so retrying with the same signed header verifies cleanly | No |
| `503` | `Service temporarily unavailable` | The RPC partner is paused or not configured | No |

Every non-2xx body states "Payment was NOT charged" where it applies; settlement only happens after the upstream returns 2xx.

## MCP

Via the BlockRun MCP server, agents call the `blockrun_rpc` tool: `{ network, method, params }`.

## What's next?

::::cards

:::card{title="x402 endpoints" href="../x402/endpoints.md" icon="Route"}
The full paid endpoint table — every service you can call from one wallet.
:::

:::card{title="BlockRun vs Alchemy" href="https://blockrun.ai/vs-alchemy" icon="Zap"}
When to use pay-per-call RPC versus a traditional node-provider plan.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Cross-service status codes and the `PAYMENT_*` error codes.
:::

::::
