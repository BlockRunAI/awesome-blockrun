---
title: Error Handling
description: HTTP status codes, error response shapes, and SDK error classes for BlockRun — including why 402 Payment Required is part of the normal x402 flow.
---

# Error Handling

BlockRun uses standard HTTP status codes and returns detailed error information.

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - invalid parameters, unknown model, oversized body, or an upstream rejection of one of your parameters (surfaced as 400, never 500) |
| 402 | Payment Required - sign and retry with payment; or a payment that failed verification (carries a `code`, see below) |
| 429 | Rate limited - upstream capacity for that model, or the per-IP free-tier limit; honor `Retry-After` |
| 503 | Model unavailable / upstream configuration problem - retry or fail over |
| 500 | Server Error - something unexpected went wrong |
| 504 | Upstream timed out (120s) - nothing settled; retry |

## Error Response Format

Gateway errors use the OpenAI envelope, with `message` and `code` mirrored at the top level for older clients. `debug` carries the raw upstream text when there is one.

```json
{
  "error": {
    "message": "Invalid request parameter — Message @bc1max on Telegram for help.",
    "type": "invalid_request_error",
    "code": "INVALID_PARAMETER",
    "param": null
  },
  "message": "Message @bc1max on Telegram for help.",
  "code": "INVALID_PARAMETER",
  "debug": "<upstream error text>"
}
```

`error.type` is one of `invalid_request_error`, `rate_limit_error`, `api_error`, `payment_required`. The Anthropic-compatible `/v1/messages` endpoint answers in Anthropic's `{"type":"error","error":{"type","message"}}` shape and `/v1/responses` in OpenAI's `{"error":{"message","type","param","code"}}` shape instead.

## Error codes

| `code` | Status | Meaning |
|--------|--------|---------|
| `INVALID_JSON` | 400 | Body is not valid JSON |
| `INVALID_REQUEST_BODY` | 400 | Schema validation failed; `details` lists the offending paths |
| `EMPTY_CONVERSATION` | 400 | `messages` had only `system` entries |
| `INVALID_PARAMETER` | 400 | Upstream rejected one of your sampling/tool parameters |
| `CONTEXT_LENGTH_EXCEEDED` | 400 | Prompt does not fit the model's context window |
| `INVALID_IMAGE_URL` | 400 | An `image_url` could not be fetched |
| `REQUEST_TOO_LARGE` | 400 | Body over the size limit |
| `CONTENT_FILTERED` | 400 | Upstream safety filter blocked the request |
| `STREAM_UNSUPPORTED` | 400 | `stream: true` on a model that only serves non-streaming |
| `REASONING_FORMAT_ERROR`, `TOOL_ID_FORMAT_ERROR`, `INVALID_REQUEST` | 400 | Message-history shape problems |
| `PAYMENT_INVALID`, `PAYMENT_UNFUNDED`, `PAYMENT_BLOCKHASH_STALE`, `PAYMENT_REPLAY` | 402 | Payment verification failed — see below |
| `RATE_LIMITED` | 429 | Upstream capacity for that model exhausted; `Retry-After` + `X-RateLimit-Source` set |
| `FREE_TIER_RATE_LIMITED` | 429 | Per-IP free-tier limit (30/min, 300/hour) |
| `STREAM_FAILED`, `FREE_MODEL_FAILED` | 429 | Free-model capacity exhausted; `Retry-After: 30` |
| `MODEL_UNAVAILABLE` | 503 | Upstream reports the model missing, overloaded, or at capacity |
| `PROVIDER_CONFIG_ERROR` | 503 | Upstream credential/quota problem on our side |
| `TIMEOUT` | 504 | Upstream did not answer within 120s |
| `INTERNAL_ERROR` | 500 | Anything unclassified |

## Common Errors

### 400 - Invalid Request

```json
{
  "error": {"message": "Invalid request body", "type": "invalid_request_error", "code": "INVALID_REQUEST_BODY", "param": null},
  "message": "Invalid request body",
  "code": "INVALID_REQUEST_BODY",
  "details": [
    {"path": ["model"], "message": "Required"}
  ]
}
```

An unknown model is a plain-string error that suggests live IDs:

```json
{"error": "Unknown model: openai/gpt-4. Try one of: openai/gpt-5.6-sol, …. Full list: GET /v1/models"}
```

**Causes:**
- Missing required fields (`model`, `messages`)
- Invalid model ID
- Malformed JSON
- A parameter the upstream model rejects (`INVALID_PARAMETER`) — the gateway surfaces these as 400, not 500

### 402 - Payment Required

```json
{
  "x402Version": 2,
  "accepts": [{"scheme": "exact", "network": "eip155:8453", "amount": "25685", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300}],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {"amount": "0.025685", "currency": "USD"},
  "paymentInfo": {"network": "base", "asset": "USDC", "x402Version": 2}
}
```

The signed requirements travel in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (and `WWW-Authenticate: X402 requirements="…"`), and — since 2026-08-30 — are mirrored at the top level of the JSON body too (`x402Version`, `accepts`), byte-identical to the decoded header. This is for v1-era x402 clients (early `x402-fetch`/`x402-axios` and third-party wrappers) that only parse the body and silently fail to auto-pay when there's no top-level `accepts`. `price.amount` equals the signed amount, including the flat $0.001 transaction fee.

:::info{title="402 is not an error"}
A `402 Payment Required` is part of the normal x402 flow — the gateway is quoting a price. Sign and retry with payment and the SDKs handle this round-trip automatically.
:::

### 402 - Payment Rejected

A `PAYMENT-SIGNATURE` that fails verification is answered with `402` and a machine-readable `code` (since 2026-08-26, on every BlockRun-native paid endpoint):

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_UNFUNDED",
  "message": "The payment authorization could not be executed on-chain. The usual cause is an insufficient USDC balance on Base for the quoted amount — …",
  "debug": "<facilitator reason>",
  "payer": "0x…"
}
```

| `code` | Meaning | Fix |
|--------|---------|-----|
| `PAYMENT_UNFUNDED` | Transfer simulation reverted — usually insufficient USDC (an authorization outside its `validAfter`/`validBefore` window reverts the same way) | Fund the wallet; re-sign if your clock is off |
| `PAYMENT_BLOCKHASH_STALE` | Solana-signed payment pinned to an expired blockhash. Nothing was charged | Re-sign against a current blockhash and resend |
| `PAYMENT_REPLAY` | That authorization nonce was already used | Sign a fresh authorization per request. (On image endpoints a replay of a paid-but-lost response returns the job you already paid for instead) |
| `PAYMENT_INVALID` | Any other verification failure — bad signature, wrong network or asset, malformed payload | Sign exactly the requirements from the 402 header |

Verification always runs before settlement, so none of these charged you. On the Solana gateway `PAYMENT_VERIFICATION_UNAVAILABLE` means the facilitator was unreachable — retry the same signed payment.

### 429 - Rate Limited

```json
{
  "error": {"message": "Rate limited — … retry after 60s, or fail over to a same-tier model on a different provider.", "type": "rate_limit_error", "code": "RATE_LIMITED", "param": null},
  "code": "RATE_LIMITED",
  "source": "openai",
  "retry_after_seconds": 60
}
```

Headers: `Retry-After: 60`, `X-RateLimit-Source: <model family>`. Free models add `FREE_TIER_RATE_LIMITED` with `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`. See [Rate Limits](rate-limits.md).

### 503 - Model Unavailable

```json
{
  "error": {"message": "Model unavailable — Message @bc1max on Telegram for help.", "type": "api_error", "code": "MODEL_UNAVAILABLE", "param": null},
  "code": "MODEL_UNAVAILABLE",
  "debug": "<upstream text>"
}
```

Retry, or fail over to a same-tier model from a different family. Not settled.

### 500 - Server Error

```json
{
  "error": {"message": "Unexpected error — Message @bc1max on Telegram for help.", "type": "api_error", "code": "INTERNAL_ERROR", "param": null},
  "message": "Message @bc1max on Telegram for help.",
  "code": "INTERNAL_ERROR",
  "debug": "<error text>"
}
```

**Causes:**
- Unclassified upstream error
- Temporary service issue

Settlement happens only after a successful upstream response, so a `500`/`503`/`504` never charges you.

## SDK Error Classes

::::tabs

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-5.5", "Hello!")
except PaymentError as e:
    # Payment failed - check USDC balance
    print(f"Payment error: {e}")
except APIError as e:
    # API returned an error
    print(f"API error ({e.status_code}): {e}")
    print(f"Response: {e.response}")
except Exception as e:
    # Network or other error
    print(f"Error: {e}")
```
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient, APIError, PaymentError } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

try {
  const response = await client.chat('openai/gpt-5.5', 'Hello!');
} catch (error) {
  if (error instanceof PaymentError) {
    // Payment failed - check USDC balance
    console.error('Payment error:', error.message);
  } else if (error instanceof APIError) {
    // API returned an error
    console.error(`API error (${error.statusCode}):`, error.message);
  } else {
    // Network or other error
    console.error('Error:', error);
  }
}
```
:::

::::

## Troubleshooting

### "Payment verification failed"

1. Read the `code`: `PAYMENT_UNFUNDED` → top up USDC on Base (or on Solana for `sol.blockrun.ai`)
2. `PAYMENT_REPLAY` → your client reused a nonce; sign a fresh authorization per request
3. `PAYMENT_BLOCKHASH_STALE` → re-sign; the Solana blockhash expired between signing and sending
4. `PAYMENT_INVALID` → confirm you signed the exact `accepts[0]` entry from the header (network, asset, amount, `payTo`) and that the wallet is on the right network

### "Unknown model"

1. Check the model ID matches exactly (e.g., `openai/gpt-5.5`)
2. See [available models](models.md) for valid IDs

### "Timeout"

1. Increase the timeout in client options
2. Try a faster model (e.g., `gpt-5.4-mini` instead of a `-pro` reasoning tier), or lower `max_tokens` — the gateway's own upstream timeout is 120s per call

### "Network error"

1. Check your internet connection
2. Verify `blockrun.ai/api` is accessible

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Code"}
The OpenAI-compatible endpoint where most errors surface — request shape and the 402 flow.
:::

:::card{title="Available models" href="models.md" icon="Brain"}
Valid model IDs to avoid "Unknown model" errors, with pricing and context windows.
:::

::::
