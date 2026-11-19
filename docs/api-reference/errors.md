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
| 400 | Bad Request - invalid parameters, unknown model, or an upstream rejection of one of your parameters (surfaced as 400, never 500) |
| 402 | Payment Required - sign and retry with payment; or a payment that failed verification or did not settle (carries a `code`, see below) |
| 413 | Body too large (over 25 MB on chat) - refused before anything else |
| 429 | Rate limited - upstream capacity for that model, or the per-IP free-tier limit; honor `Retry-After` |
| 500 | Server Error - something unexpected went wrong; nothing settled |
| 502 | The upstream failed after your payment had already settled - the body says you were charged; do not pay again |
| 503 | Model unavailable / upstream configuration problem - nothing settled; honor `Retry-After` when present, or fail over |
| 504 | Upstream timed out (120s) - nothing settled; retry |

## Error Response Format

Gateway errors use the OpenAI envelope, with `message` and `code` mirrored at the top level for older clients. `debug` appears only when the fault is yours to fix — a `4xx` such as an upstream rejecting one of your parameters — and then carries the upstream's description of it, **redacted**: credentials, URLs, deployment and account identifiers, and any routing infrastructure we do not sell under its own name are removed. A `429` or `5xx` never carries upstream text: it describes our capacity or an upstream fault, which you cannot act on, so the body has just `code` and `message` (we keep the full text in our logs — quote the `x-blockrun-gateway-request-id` response header when you report one).

```json
{
  "error": {
    "message": "Invalid request parameter — Email hello@blockrun.ai for help.",
    "type": "invalid_request_error",
    "code": "INVALID_PARAMETER",
    "param": null
  },
  "message": "Email hello@blockrun.ai for help.",
  "code": "INVALID_PARAMETER",
  "debug": "<the upstream's description of the rejected parameter, redacted>"
}
```

`error.type` is one of `invalid_request_error`, `rate_limit_error`, `api_error`, `payment_required`. The Anthropic-compatible `/v1/messages` endpoint answers in Anthropic's `{"type":"error","error":{"type","message"}}` shape and `/v1/responses` in OpenAI's `{"error":{"message","type","param","code"}}` shape instead.

## Error codes

| `code` | Status | Meaning |
|--------|--------|---------|
| `INVALID_JSON` | 400 | Body is not valid JSON |
| `INVALID_REQUEST_BODY` | 400 | Schema validation failed; `details` lists the offending paths |
| `EMPTY_CONVERSATION` | 400 | `messages` had only `system` entries |
| `UNSUPPORTED_PARAMETER` | 400 | A parameter the quote cannot price: `n` or `best_of` above 1, an unknown `service_tier`, a non-empty `plugins`. Refused before payment |
| `INVALID_PARAMETER` | 400 | Upstream rejected one of your sampling/tool parameters |
| `UPSTREAM_INVALID_REQUEST` | 400 | Upstream answered 400/413/422 to your request; its redacted reason is in `message` |
| `CONTEXT_LENGTH_EXCEEDED` | 400 | Prompt does not fit the model's context window |
| `INPUT_TOO_LARGE` | 400 | `max_tokens` out of the model's range |
| `INVALID_IMAGE_URL` | 400 | An `image_url` could not be fetched |
| `IMAGE_INPUT_UNSUPPORTED` | 400 | An image sent to a model that cannot read it. Refused before payment |
| `CONTENT_FILTERED` | 400 | Upstream safety filter blocked the request |
| `STREAM_UNSUPPORTED` | 400 | `stream: true` on a model that only serves non-streaming |
| `SEARCH_UNSUPPORTED_MODEL`, `SEARCH_STREAM_UNSUPPORTED` | 400 | `search_parameters` on a non-`xai/*` model, or with `stream: true` |
| `REASONING_FORMAT_ERROR`, `TOOL_ID_FORMAT_ERROR`, `INVALID_REQUEST` | 400 | Message-history shape problems |
| `PAYMENT_INVALID`, `PAYMENT_UNFUNDED`, `PAYMENT_BLOCKHASH_STALE`, `PAYMENT_REPLAY` | 402 | Payment verification failed — see below |
| `PAYMENT_NOT_SETTLED` | 402 | The payment verified but did not settle, so the request was stopped and nothing was delivered. Sign a fresh payment to retry |
| `REQUEST_TOO_LARGE` | 413 | Body over 25 MB |
| `RATE_LIMITED` | 429 | Upstream capacity for that model exhausted; `Retry-After` + `X-RateLimit-Source` set |
| `FREE_TIER_RATE_LIMITED` | 429 | Per-IP free-tier limit (30/min, 300/hour) |
| `STREAM_FAILED`, `FREE_MODEL_FAILED` | 429 | Free-model capacity exhausted; `Retry-After: 30` |
| `INTERNAL_ERROR` | 500 | Anything unclassified |
| `UPSTREAM_FAILED_AFTER_SETTLE` | 502 | The upstream failed after your payment settled. You were charged; do not pay again. The call is booked for a manual refund |
| `MODEL_UNAVAILABLE` | 503 | The model is paused after repeated recent failures, or the upstream reports it missing, overloaded, or at capacity. `Retry-After` and `retry_after_seconds` are set when the gateway knows when to retry |
| `PROVIDER_CONFIG_ERROR` | 503 | Upstream credential/quota problem on our side |
| `TIMEOUT` | 504 | Upstream did not answer within 120s, or answered 504 itself |

### Errors after a stream has started

Once a `stream: true` response has begun, the status is already `200`, so a failure arrives as a final SSE error event instead. Its message is fixed text ending in a code, never upstream text:

| Code | Meaning |
|------|---------|
| `(code: deadline)` | The response ran past the gateway's time limit and was cut off |
| `(code: stall)` | The upstream stopped sending data and the stream was cut off |
| `(code: rate_limited)` | The upstream hit its rate limit mid-response; retry shortly |
| `(code: upstream_error)` | The upstream failed before completing the response |
| `Upstream rejected the request (4xx): …` | The upstream refused one of your parameters; the redacted reason follows, as with `debug` above |

Billing for a cut-off stream follows the settlement rules for that endpoint: see the `X-Payment-*` response headers.

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
  "accepts": [{"scheme": "exact", "network": "eip155:8453", "amount": "259143", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300}],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {"amount": "0.259143", "currency": "USD"},
  "paymentInfo": {"network": "base", "asset": "USDC", "x402Version": 2}
}
```

The signed requirements travel in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (and `WWW-Authenticate: X402 requirements="…"`), and — since 2026-08-30 — are mirrored at the top level of the JSON body too (`x402Version`, `accepts`), byte-identical to the decoded header. This is for v1-era x402 clients (early `x402-fetch`/`x402-axios` and third-party wrappers) that only parse the body and silently fail to auto-pay when there's no top-level `accepts`. `price.amount` equals the signed amount, including the flat $0.001 transaction fee. On chat, an `exact` payment is quoted and settled at input plus your full `max_tokens` as output (8192 when unset); see [How the quote is computed](chat-completions.md#payment-required-402).

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
  "message": "Rate limited — …",
  "code": "RATE_LIMITED",
  "source": "openai",
  "retry_after_seconds": 60
}
```

Headers: `Retry-After: 60`, `X-RateLimit-Source: <model family>`. Free models add `FREE_TIER_RATE_LIMITED` with `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`. See [Rate Limits](rate-limits.md).

### 503 - Model Unavailable

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 42
```

```json
{
  "error": {"message": "Model unavailable — this model failed repeatedly in the last few minutes and is paused; retry after 42s or fail over to a same-tier model on a different provider — Email hello@blockrun.ai for help.", "type": "api_error", "code": "MODEL_UNAVAILABLE", "param": null},
  "message": "Email hello@blockrun.ai for help.",
  "code": "MODEL_UNAVAILABLE",
  "retry_after_seconds": 42
}
```

When the gateway has paused a model after a run of recent failures, the call is refused before it reaches any upstream, and `Retry-After` / `retry_after_seconds` give the seconds until the pause lifts (1–300). An upstream 502/503 answers the same code with `Retry-After: 30`. Other `MODEL_UNAVAILABLE` answers carry no retry hint. Retry after the hint, or fail over to a same-tier model from a different family. Not settled. The Anthropic-compatible `/v1/messages` answers a paused model with `503` `overloaded_error` and the same `Retry-After`.

### 500 - Server Error

```json
{
  "error": {"message": "Unexpected error — Email hello@blockrun.ai for help.", "type": "api_error", "code": "INTERNAL_ERROR", "param": null},
  "message": "Email hello@blockrun.ai for help.",
  "code": "INTERNAL_ERROR"
}
```

**Causes:**
- Unclassified upstream error
- Temporary service issue

Settlement happens only once the upstream has produced output, so a `500`/`503`/`504` never charges you. The one exception is `502` `UPSTREAM_FAILED_AFTER_SETTLE`: on a few models a non-streaming call still running at 45 seconds settles then, and if the upstream fails after that the body says `payment_status: "charged"` and the call is booked for a manual refund.

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
4. `PAYMENT_INVALID` → confirm you signed exactly the `accepts` entry you chose from the header (network, asset, amount, `payTo`) and that the wallet is on the right network

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
