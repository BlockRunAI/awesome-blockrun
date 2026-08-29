---
title: Rate Limits
description: BlockRun adds no throttle on paid model calls — you only hit the upstream provider's TPM/RPM, surfaced transparently as a 429 with Retry-After.
---

# Rate Limits

BlockRun is a pass-through gateway: for **paid** model calls it does **not** add
its own per-request throttle. The rate limits you may hit are the **upstream
provider's** capacity limits (tokens-per-minute / requests-per-minute on the
provider tier backing that model). When an upstream provider throttles a
request, BlockRun surfaces it to you transparently as an HTTP `429` so you can
back off or fail over.

:::info{title="No platform throttle on paid calls"}
For paid model calls there is no BlockRun-side per-request limit — your only ceiling is the upstream provider's TPM/RPM. Free chat models are limited to **30 requests/minute and 300 requests/hour per IP**, and a few non-LLM endpoints (metadata catalogs, wallet reconciliation, RealFace init, onramp link minting) carry small per-IP limits to bound abuse and real upstream cost.
:::

## The `429` response

When an upstream provider rate-limits a request, BlockRun returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json
```

```json
{
  "error": {
    "message": "Rate limited — … Upstream provider rate limit hit — retry after 60s, or fail over to a same-tier model on a different provider.",
    "type": "rate_limit_error",
    "code": "RATE_LIMITED",
    "param": null
  },
  "code": "RATE_LIMITED",
  "source": "anthropic",
  "retry_after_seconds": 60
}
```

| Field / Header | Meaning |
|----------------|---------|
| `Retry-After` (header) | Seconds to wait before retrying. Honor this. Taken from the upstream when it says; otherwise 60. |
| `X-RateLimit-Source` (header) / `source` | The model family whose capacity is exhausted — a failover hint. |
| `code` | Always `RATE_LIMITED` for this case. |
| `retry_after_seconds` | Same value as `Retry-After`, in the body for convenience. |

This applies to both the standard (`POST /api/v1/chat/completions`) and Anthropic-compatible (`POST /api/v1/messages`) endpoints, for streaming and non-streaming requests. For streaming, the `429` is returned **before** the first SSE byte (no partial stream is emitted).

## Recommended client handling

1. **Honor `Retry-After`** — wait the indicated seconds, then retry (exponential backoff on repeats).
2. **Or fail over to a same-tier model from a different family** — e.g. if `anthropic/claude-sonnet-4.6` is throttled, retry on `openai/gpt-5.5` or `google/gemini-3.1-pro`. Different model families draw on independent capacity pools, so a cross-family retry usually succeeds immediately.

```python
import time
resp = client.chat(...)
if resp.status_code == 429:
    time.sleep(int(resp.headers.get("Retry-After", 60)))
    resp = client.chat(...)            # retry
    # or: client.chat(model="openai/gpt-5.5", ...)  # cross-family failover
```

## Behind the gateway

BlockRun serves each model through its own gateway and may route a single model id across multiple backing capacity pools, failing over automatically and internally. You only ever see a `429` when **every** backing pool for that model is exhausted — at which point backing off or failing over to another model family is the fastest path through.

## Free models

Free chat models (`"billing_mode": "free"` in `GET /v1/models`) take no payment, so they are throttled per source IP: **30 requests/minute** and **300 requests/hour**. Over the limit you get `429` with `code: "FREE_TIER_RATE_LIMITED"`, `Retry-After`, and `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` (unix ms). Paid requests from the same IP are never counted. When the free pool itself is out of capacity the code is `STREAM_FAILED` / `FREE_MODEL_FAILED` with `Retry-After: 30`.

## Other endpoints

The metadata catalogs (`GET /v1/models` and the image/video/audio model lists, `/api/pricing`: 100/hour per IP; `/api/health`: 60/minute), per-wallet lookups (reconciliation, portraits, RealFace status: 120/hour), `POST /v1/realface/init` (10/hour) and `POST /v1/onramp/token` (30/hour per IP, 10/hour per wallet) carry small per-IP limits to bound abuse and real upstream cost. When exceeded they return `429` with `{"error":"Rate limit exceeded"}` and an `X-RateLimit-Reset` header (unix ms). The full table is in the [API reference](api-reference/rate-limits.md).

## What's next?

::::cards

:::card{title="Chat Completions" href="api-reference/chat-completions.md" icon="Brain"}
The paid LLM endpoint where upstream provider limits apply.
:::

:::card{title="Models" href="api-reference/models.md" icon="Boxes"}
The full model catalog with live pricing and context windows.
:::

:::card{title="x402 Endpoints" href="x402/endpoints.md" icon="Zap"}
The full list of x402-gated endpoints and their pricing.
:::

::::
