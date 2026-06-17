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

- **Price** - How much the request costs
- **Payment Address** - Where to send funds
- **Asset** - Which token (USDC)
- **Network** - Which blockchain

### Payment Authorization

Instead of sending funds directly, you sign an **authorization** that allows the server to claim the funds. This uses [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) `transferWithAuthorization`.

Benefits:
- **Gasless** - User doesn't pay gas
- **Revocable** - Authorization expires
- **Atomic** - Payment and service delivery are linked

### Facilitator

The CDP (Coinbase Developer Platform) Facilitator verifies and settles payments:

1. **Verify** - Check the signature is valid
2. **Settle** - Execute the on-chain transfer

## x402 v2 Payload

The payment payload includes:

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "description": "GPT-4o API call",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "1000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x..."
  },
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "1000",
      "validAfter": "1234567890",
      "validBefore": "1234568190",
      "nonce": "0x..."
    }
  }
}
```

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
