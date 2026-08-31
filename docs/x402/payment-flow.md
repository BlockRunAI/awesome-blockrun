---
title: Payment Flow
description: Step-by-step breakdown of an x402 payment — request, 402 response, EIP-3009 signature, retry, verify, execute, and on-chain settlement.
---

# Payment Flow

Step-by-step breakdown of how x402 payments work — from the first unpaid request to on-chain settlement.

## Overview

Every x402 payment follows this sequence:

1. Client sends request without payment
2. Server returns 402 with payment requirements
3. Client signs payment authorization
4. Client retries with signed payment
5. Server verifies, executes, and settles

## Detailed Flow

::::steps

:::step{title="Initial Request"}
Client sends a normal API request:

```bash
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-5.4", "messages": [...]}'
```
:::

:::step{title="402 Response"}
Server returns payment requirements:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
PAYMENT-REQUIRED: <base64-encoded-requirements>
X-Payment-Required: <same value>
WWW-Authenticate: X402 requirements="<same value>"

{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "25685",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300,
    "extra": {"name": "USD Coin", "version": "2"}
  }],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {"amount": "0.025685", "currency": "USD"},
  "paymentInfo": {"network": "base", "asset": "USDC", "x402Version": 2}
}
```

`x402Version` and `accepts` at the top of the body are the same challenge as the headers, mirrored in JSON since 2026-08-30 — early x402 clients (pre-v2 `x402-fetch`/`x402-axios` and some third-party wrappers) only ever parsed the body, found no `accepts` there, and silently gave up instead of auto-paying. A route's own fields win on any key collision, so this never shadows `price` or `paymentInfo`.

The three headers carry the full requirements as the same base64 value (`resource` and `extensions` included, which the body mirror omits). Decoded:

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "25685",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300,
    "extra": {"name": "USD Coin", "version": "2"}
  }],
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "description": "GPT-5.4 API call (~17 input, 8192 max output tokens)",
    "mimeType": "application/json"
  },
  "extensions": {"bazaar": {…}}
}
```

`amount` is micro-USDC (6 decimals) and already includes the flat $0.001 transaction fee; `extra` is the EIP-712 domain to sign against. `resource.description` states the token estimate the quote was built from.
:::

:::step{title="Sign Authorization"}
The client creates an EIP-3009 `TransferWithAuthorization` signature:

```typescript
const authorization = {
  from: walletAddress,
  to: paymentDetails.payTo,
  value: paymentDetails.amount,
  validAfter: Math.floor(Date.now() / 1000) - 600,
  validBefore: Math.floor(Date.now() / 1000) + 300,
  nonce: randomBytes32()
};

const signature = await wallet.signTypedData({
  domain: USDC_DOMAIN,
  types: TRANSFER_WITH_AUTHORIZATION_TYPES,
  primaryType: 'TransferWithAuthorization',
  message: authorization
});
```

The domain and types are the standard EIP-3009 definition for USDC. On **Base** (chain `eip155:8453`):

```typescript
const USDC_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: 8453,
  verifyingContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
};

const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from',        type: 'address' },
    { name: 'to',          type: 'address' },
    { name: 'value',       type: 'uint256' }, // amount in micro-USDC (6 decimals)
    { name: 'validAfter',  type: 'uint256' }, // unix seconds
    { name: 'validBefore', type: 'uint256' }, // unix seconds
    { name: 'nonce',       type: 'bytes32' }, // random 32 bytes, single-use
  ],
};
```

Key points:
- Private key never leaves the client
- Authorization expires in 5 minutes (`validBefore`)
- Clock skew tolerance of 10 minutes (`validAfter`)
- `value` is micro-USDC and must equal the `amount` you were quoted: `$0.025685` → `"25685"`
- The header value is the **base64 of the JSON payment payload** shown in the next step (`btoa(JSON.stringify(payload))`)

:::note{title="Paying on Solana"}
On the Solana gateway (`sol.blockrun.ai`, network `solana:…`) the 402 advertises USDC-SPL (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, 6 decimals) and the authorization is signed for the SPL transfer instead of EIP-3009. The SDKs pick the right scheme automatically from the `accepts[]` entry.
:::

:::step{title="Retry with Payment"}
Client sends the request again with the `PAYMENT-SIGNATURE` header (x402 v2):

```bash
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{"model": "openai/gpt-5.4", "messages": [...]}'
```

The payment payload contains:

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
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
:::

:::step{title="Verify, Execute, Settle"}
The server:

1. **Verifies** the payment signature with the Facilitator (up to three attempts on transient facilitator errors; a definitive rejection is returned at once as a `402` with a `code`)
2. **Claims the nonce** so the same authorization cannot be replayed into a second inference (`402` / `PAYMENT_REPLAY` otherwise)
3. **Executes** the API request (calls the AI model)
4. **Settles** the payment on-chain — after the response for non-streaming calls, after the final chunk for streaming calls. Async media jobs settle when the job completes.

The successful response carries `PAYMENT-RESPONSE` (base64 JSON `{"success","transaction","network","payer"}`) and `X-Payment-Receipt: <tx hash>`. If the facilitator could not land the settlement in time, the response is still served and carries `X-Payment-Settled: false` — verification is the gate, settlement is bookkeeping.

```
Server                          Facilitator                    Blockchain
  |                                 |                              |
  |  1. Verify signature            |                              |
  |-------------------------------->|                              |
  |                                 |                              |
  |  2. Signature valid             |                              |
  |<--------------------------------|                              |
  |                                 |                              |
  |  3. Execute AI request          |                              |
  |  (route to the model)           |                              |
  |                                 |                              |
  |  4. Settle payment              |                              |
  |-------------------------------->|                              |
  |                                 |  5. Execute transfer         |
  |                                 |----------------------------->|
  |                                 |                              |
  |  6. Settlement confirmed        |                              |
  |<--------------------------------|                              |
  |                                 |                              |
  |  7. Return response to client   |                              |
```
:::

::::

## SDK Handling

The SDKs handle this entire flow automatically:

::::tabs

:::tab{label="Python"}
```python
# Python - all 5 steps happen behind the scenes
response = client.chat("openai/gpt-5.4", "Hello!")
```
:::

:::tab{label="TypeScript"}
```typescript
// TypeScript - all 5 steps happen behind the scenes
const response = await client.chat('openai/gpt-5.4', 'Hello!');
```
:::

::::

## Error Scenarios

Every verification failure is a `402` with `error: "Payment verification failed"` and a machine-readable `code`; nothing has been charged when you see one.

### Insufficient Balance

If your wallet doesn't have enough USDC, the on-chain simulation reverts:

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_UNFUNDED",
  "message": "The payment authorization could not be executed on-chain. The usual cause is an insufficient USDC balance on Base for the quoted amount — …",
  "debug": "<facilitator reason>",
  "payer": "0x…"
}
```

An authorization whose `validAfter`/`validBefore` window has already closed (or not yet opened) reverts the same way, so check your clock before topping up.

### Replayed Authorization

Each nonce is single-use. Sending the same signed payload twice:

```json
{
  "error": "Payment authorization already used",
  "message": "Sign a fresh payment authorization for each request.",
  "code": "PAYMENT_REPLAY",
  "payer": "0x…"
}
```

(On image endpoints, replaying the header of a response you lost returns the job you already paid for instead of a second charge.)

### Stale Solana Blockhash

A Solana-signed transaction is pinned to a recent blockhash and stays valid for roughly a minute:

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_BLOCKHASH_STALE",
  "message": "The payment transaction was signed against a Solana blockhash that has since expired. Nothing was charged. Sign a fresh payment authorization against a current blockhash and send the request again."
}
```

### Invalid Signature

Anything else — a signature that doesn't match, the wrong network or asset, a malformed payload:

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_INVALID",
  "message": "Message @bc1max on Telegram for help.",
  "debug": "<facilitator reason>"
}
```

The Anthropic-compatible `/v1/messages` and `/v1/responses` endpoints report the same failures inside their vendor error envelopes (`"Payment verification failed: …"`) without the `code` field.

## Timing

Typical payment flow timing:

| Step | Time |
|------|------|
| Initial 402 response | ~50ms |
| Client signing | ~10ms |
| Signature verification | ~100ms (facilitator round-trip; retried up to 3× on transient errors) |
| AI model execution | 1-30s (varies) |
| On-chain settlement | ~2s, after the response is ready |
| **Total overhead** | **~200ms** |

The payment overhead is minimal compared to AI model execution time. The authorization is valid for 300s (`maxTimeoutSeconds`), so the whole exchange — including a long stream — has to settle inside that window; the gateway caps a single streamed response at 500s and each upstream call at 120s.

## What's next?

::::cards

:::card{title="How x402 Works" href="how-it-works.md" icon="Zap"}
The protocol concepts behind this flow — 402, authorizations, facilitator.
:::

:::card{title="Security" href="security.md" icon="Wallet"}
Why signing an authorization keeps your funds non-custodial.
:::

:::card{title="Endpoints" href="endpoints.md" icon="Boxes"}
Every x402-enabled endpoint and the networks each gateway accepts.
:::

::::
