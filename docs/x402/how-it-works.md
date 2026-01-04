# How x402 Works

x402 is a protocol for HTTP-native micropayments. It extends HTTP with payment capabilities using the `402 Payment Required` status code.

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
  |  4. POST /api + X-Payment header       |
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

## Learn More

- [Payment Flow](payment-flow.md) - Step-by-step payment process
- [Security](security.md) - Security model and best practices
- [x402 Specification](https://x402.org) - Full protocol specification
