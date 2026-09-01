---
title: How x402 Works
description: x402 is an HTTP-native micropayment protocol — agents pay per request in USDC by signing a local authorization, no API keys or subscriptions.
---

# How x402 Works

x402 is a protocol for HTTP-native micropayments. It extends HTTP with payment capabilities using the `402 Payment Required` status code.

:::info{title="The one-line version"}
Your client requests a service, gets a `402` with a price, signs a USDC authorization locally, and retries — payment settles on-chain in the same round-trip. No keys leave your machine.
:::

## The Problem

Traditional API payments have friction:

- **API Keys** - Need to register, manage, rotate keys
- **Prepaid Credits** - Must buy in bulk, unused credits expire
- **Subscriptions** - Pay monthly even if you don't use the service
- **Invoicing** - Manual billing for enterprise customers

## The Solution

x402 enables pay-per-request:

1. **No Registration** - Your wallet is your identity
2. **Pay What You Use** - Per-request pricing
3. **Instant Settlement** - On-chain, no invoices
4. **Non-Custodial** - Your funds, your control

## Protocol Overview

```
Client                                   Server
  |                                        |
  |  1. POST /api (no payment)             |
  |--------------------------------------->|
  |                                        |
  |  2. 402 Payment Required               |
  |     + X-Payment-Required header        |
  |<---------------------------------------|
  |                                        |
  |  3. Sign payment locally               |
  |  (private key never sent)              |
  |                                        |
  |  4. POST /api + PAYMENT-SIGNATURE      |
  |--------------------------------------->|
  |                                        |
  |  5. Verify signature                   |
  |  6. Execute request                    |
  |  7. Settle payment on-chain            |
  |                                        |
  |  8. 200 OK + response                  |
  |<---------------------------------------|
```

## Key Concepts

### 402 Payment Required

When you make a request without payment, the server returns HTTP 402 with:

- **Price** - How much the request costs (`amount` in micro-USDC, transaction fee included)
- **Payment Address** - Where to send funds (`payTo`)
- **Asset** - Which token (USDC)
- **Network** - Which blockchain (`eip155:8453` on Base, `solana:…` on the Solana gateway)
- **Validity** - `maxTimeoutSeconds` (300 on most endpoints; longer on async media jobs)

The requirements are base64-encoded in three equivalent headers — `PAYMENT-REQUIRED` (x402 v2), `X-Payment-Required`, and `WWW-Authenticate: X402 requirements="…"` — and the JSON body repeats the price as `price.amount` in USD, plus the challenge itself (`x402Version`, `accepts`) mirrored at the top level for clients that only read the body.

On BlockRun the price for chat is the model's list rate — estimated input tokens plus 10% of `max_tokens` output — with no platform margin, plus a flat **$0.001 transaction fee** per paid call. Media generation (image, video, music, speech) and Live Search carry a 5% margin on top of their list rate, plus the same fee.

### Payment Authorization

Instead of sending funds directly, you sign an **authorization** that allows the server to claim the funds. This uses [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) `transferWithAuthorization`.

Benefits:
- **Gasless** - User doesn't pay gas
- **Revocable** - Authorization expires
- **Atomic** - Payment and service delivery are linked

### Facilitator

The CDP (Coinbase Developer Platform) Facilitator verifies and settles payments:

1. **Verify** - Check the signature is valid (before any upstream work; a rejection is a `402` with a machine-readable `code` — `PAYMENT_UNFUNDED`, `PAYMENT_BLOCKHASH_STALE`, `PAYMENT_REPLAY`, `PAYMENT_INVALID`)
2. **Settle** - Execute the on-chain transfer, after the request has been served

Because verification precedes settlement, a rejected payment never costs anything, and a request that fails on our side — upstream `4xx`/`5xx`, a timeout, or a JSON-RPC `-32603` — is never settled. A request the provider rejects because of what you sent still settles: we made the round trip. See [Security](/docs/x402/security) for the exact split.

## x402 v2 Payload

The payment payload includes:

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "description": "GPT-5.5 API call (~17 input, 8192 max output tokens)",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "25685",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300,
    "extra": {"name": "USD Coin", "version": "2"}
  },
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "25685",
      "validAfter": "1234567890",
      "validBefore": "1234568190",
      "nonce": "0x..."
    }
  }
}
```

Send it base64-encoded in the `PAYMENT-SIGNATURE` header (`X-Payment` is accepted as an alias). The `accepted` block must match one `accepts[]` entry from the 402 byte-for-byte — amount, asset, network, and `payTo` — and `authorization.value` must equal `amount`.

## Why x402?

### For Users

- **Simple** - One wallet for all x402 services
- **Transparent** - See exact costs before paying
- **Secure** - Private key stays local

### For Developers

- **Easy Integration** - Standard HTTP, no special infrastructure
- **Instant Payments** - No invoicing or collections
- **Global** - Works anywhere crypto works

## What's next?

::::cards

:::card{title="Payment Flow" href="payment-flow.md" icon="Route"}
Step-by-step breakdown of the request, signature, and settlement.
:::

:::card{title="Security" href="security.md" icon="Wallet"}
The threat model, non-custodial guarantees, and best practices.
:::

:::card{title="x402 Specification" href="https://x402.org" icon="Book"}
The full protocol specification.
:::

::::
