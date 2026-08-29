---
title: Rate Limits
description: Paid inference has no BlockRun-side quota — your only ceiling is the upstream RPM/TPM behind the model, surfaced as a 429 with a Retry-After hint.
---

# Rate Limits

BlockRun's rate-limiting model is intentionally minimal: **paid inference endpoints have no platform-side quota.** You pay per call in USDC via x402, and the cost of a paid request is the only cap on call volume. The effective rate limit your code will see comes from the upstream capacity behind the model you called — not from BlockRun's gateway.

:::info{title="No platform quota on paid inference"}
There is **no per-wallet quota, no daily cap, no TPM/RPM limit** imposed by BlockRun on paid inference. The economic cost of each call (settled in USDC at request time) is the abuse boundary. Only the **free-tier chat models** and a few discovery/metadata endpoints carry per-IP limits.
:::

## Summary

| Surface | Platform quota | Notes |
|---------|----------------|-------|
| `POST /v1/chat/completions` (paid LLMs) | none | upstream limit applies |
| `POST /v1/chat/completions` (**free** models, `billing_mode: "free"`) | **30 req / minute and 300 req / hour per IP** | `429` + `FREE_TIER_RATE_LIMITED`, see below |
| `POST /v1/messages` (Anthropic-compatible) | none | upstream limit applies |
| `POST /v1/responses` | none | upstream limit applies |
| `POST /v1/images/generations`, `/v1/images/image2image` | none | upstream limit applies |
| `POST /v1/videos/generations` | none | upstream limit applies |
| `POST /v1/audio/generations`, `/v1/audio/speech`, `/v1/audio/sound-effects` | none | upstream limit applies |
| `POST /v1/voice/call`, `/v1/phone/*` | none | upstream limit applies |
| `GET /v1/models`, `/v1/{images,video,audio}/models` | 100 req / hour per IP | metadata endpoints |
| `GET /api/pricing` | 100 req / hour per IP | metadata endpoint |
| `GET /api/health` | 60 req / minute per IP | infrastructure health |
| `GET /v1/wallet/{address}/reconciliation` (and `/portraits`, `/realfaces`), `GET /v1/realface/status` | 120 req / hour per IP | per-wallet lookups |
| `POST /v1/realface/init` | 10 req / hour per IP | each init has real upstream cost |
| `POST /v1/onramp/token` | 30 req / hour per IP, 10 req / hour per wallet | free ($0) link minting |

There is **no per-wallet quota, no daily cap, no TPM/RPM limit imposed by BlockRun on paid inference.** The economic cost of each call (settled in USDC at request time) is the abuse mitigation.

## Free-tier limits

Free chat models (the ones `GET /v1/models` lists with `"billing_mode": "free"`) need no wallet and no payment, so they are the one place BlockRun throttles per source IP: **30 requests per minute** (burst) and **300 requests per hour** (sustained). Paid requests are never counted against these buckets, even from the same IP.

Over the limit you get:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 42
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1756486200000
```

```json
{
  "error": {
    "message": "Free tier rate limit reached (30 requests/minute per IP). Retry after 42s, or use a paid model — pricing starts at $0.002/request with no signup.",
    "type": "rate_limit_error",
    "code": "FREE_TIER_RATE_LIMITED",
    "param": null
  }
}
```

`X-RateLimit-Reset` is a unix timestamp in **milliseconds**. Integrators whose end users share one egress IP should route sustained traffic to a paid model — the cheapest paid call is $0.002 all-in.

Separately, when the free model pool itself is out of capacity (every free rung is throttled or unhealthy upstream), the response is `429` with `code: "STREAM_FAILED"` (streaming) or `"FREE_MODEL_FAILED"` (non-streaming) and `Retry-After: 30`. That is capacity, not your quota — back off or use a paid model.

## How upstream rate limits surface

When an upstream rate-limits a request, BlockRun returns a `429 Rate Limited` response **with a source tag and a retry hint**, so your client can either retry or fail over to a same-tier model.

### Response shape

```json
{
  "error": {
    "message": "Rate limited — … Upstream provider rate limit hit — retry after 60s, or fail over to a same-tier model on a different provider.",
    "type": "rate_limit_error",
    "code": "RATE_LIMITED",
    "param": null
  },
  "message": "…",
  "code": "RATE_LIMITED",
  "source": "<source-tag>",
  "retry_after_seconds": 60,
  "debug": "<upstream error message>"
}
```

### Response headers

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Source: <source-tag>
```

- `Retry-After` — RFC-7231 compliant; seconds to wait before retrying. BlockRun extracts this from the upstream error when available, otherwise defaults to `60`.
- `X-RateLimit-Source` — the model-family prefix of the model you called (e.g. `openai`, `anthropic`), i.e. the capacity pool that hit the limit. Treat it as a coarse failover hint, not a stable identifier.
- `source` field in JSON body — same value, mirrored for clients that prefer body parsing over headers.

### Recommended client behavior

```ts
const res = await fetch(url, { method: 'POST', ... });

if (res.status === 429) {
  const retryAfter = parseInt(res.headers.get('retry-after') ?? '60', 10);
  const source = res.headers.get('x-ratelimit-source') ?? 'unknown';

  // Option A: same provider, exponential backoff
  await sleep(retryAfter * 1000);
  return retry();

  // Option B: fail over to a same-tier model
  // e.g. openai/gpt-5.4 -> anthropic/claude-sonnet-4.6 (200K out)
  return callWithModel('anthropic/claude-sonnet-4.6');
}
```

## Upstream capacity (reference)

These are the orders of magnitude BlockRun's shared capacity currently runs at, by model family. They are **not contractual** and change as we re-tier capacity; treat them as ballpark, not SLAs.

| Model family | Typical RPM | Typical TPM | Notes |
|---|---|---|---|
| Flagship chat (`openai/*`, `anthropic/*`, `google/*`) | thousands / model | hundreds of K–millions / model | shared capacity across all paid traffic |
| Cost-efficient chat (`deepseek/*`, `xai/*`, `moonshot/*`, `minimax/*`, `zai/*`) | thousands+ / model | generous | usually no observed throttling at current traffic |
| Free tier (`billing_mode: "free"` open-weight models) | 30 RPM / 300 per hour per IP | varies | gateway-enforced per-IP limit (above); high-concurrency callers should use a paid model |
| Video (`bytedance/*`, `*/sora-2`) | varies per model | varies | generation jobs are async; throttling typically surfaces as long queue waits, not `429` |
| Music / speech / voice | per-job | n/a | per-job or per-account concurrency caps |

## Why no platform quota?

BlockRun's pay-per-call model uses **economic pricing as the abuse boundary** instead of platform quotas:

- Every paid request costs USDC settled at request time via x402.
- A bad actor running 10,000 calls/sec costs themselves 10,000× the per-call price — at flagship-model prices that's actual money out of their wallet, not free abuse.
- Hard quotas would force every customer into the same bucket regardless of willingness-to-pay, defeating the value proposition.

If you need **guaranteed capacity** (dedicated key pool, reserved provider TPM, custom 429 behavior, or an SLA), reach out about **enterprise dedicated capacity** — we'll provision isolated capacity outside the shared pool. Email `care@blockrun.ai` or DM `@bc1max` on Telegram.

## Discovery endpoint quotas (metadata only)

The IP-throttled metadata endpoints listed at the top of this page protect against discovery-endpoint scraping. Real product traffic should never hit these limits.

If you exceed them you'll get:

```json
{ "error": "Rate limit exceeded" }
```

with HTTP 429 and `X-RateLimit-Reset: <unix-ms>` (no `Retry-After` on these). Wait until reset, then retry. Client IP is taken from the edge's connecting-IP header, so `X-Forwarded-For` cannot be used to rotate identities.

## Need higher limits?

- **Paid inference:** there is no platform cap; the upstream provider's per-model RPM/TPM is your ceiling. Concurrency above that ceiling requires either fail-over to other providers or enterprise dedicated capacity.
- **Free tier:** the per-IP limits are fixed; move sustained or multi-user traffic to a paid model.
- **Discovery endpoints:** cache locally — `/v1/models` updates only when we ship a model change.
- **Enterprise dedicated capacity:** isolated key pools, reserved provider TPM, custom SLAs. Contact us.

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
The paid LLM endpoint — where upstream RPM/TPM limits actually apply.
:::

:::card{title="Error Handling" href="errors.md" icon="Code"}
The full gateway error envelope, including the 429 shape.
:::

:::card{title="Models" href="models.md" icon="Boxes"}
The discovery endpoint to cache locally and avoid the per-IP metadata limit.
:::

::::
