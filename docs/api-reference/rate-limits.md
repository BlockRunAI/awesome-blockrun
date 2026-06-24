---
title: Rate Limits
description: Paid inference has no BlockRun-side quota — your only ceiling is the upstream RPM/TPM behind the model, surfaced as a 429 with a Retry-After hint.
---

# Rate Limits

BlockRun's rate-limiting model is intentionally minimal: **paid inference endpoints have no platform-side quota.** You pay per call in USDC via x402, and the cost of a paid request is the only cap on call volume. The effective rate limit your code will see comes from the upstream capacity behind the model you called — not from BlockRun's gateway.

:::info{title="No platform quota on paid inference"}
There is **no per-wallet quota, no daily cap, no TPM/RPM limit** imposed by BlockRun on paid inference. The economic cost of each call (settled in USDC at request time) is the abuse boundary. Only discovery/metadata endpoints carry small per-IP limits.
:::

## Summary

| Surface | Platform quota | Notes |
|---------|----------------|-------|
| `POST /v1/chat/completions` (paid LLMs) | none | upstream limit applies |
| `POST /v1/messages` (Anthropic-compatible) | none | upstream limit applies |
| `POST /v1/images/generations` | none | upstream limit applies |
| `POST /v1/videos/generations` | none | upstream limit applies |
| `POST /v1/audio/generations` | none | upstream limit applies |
| `POST /v1/voice/call` | none | upstream limit applies |
| `GET /v1/models`, `/v1/{image,video,audio}/models` | 100 req / hour per IP | metadata endpoints |
| `GET /api/pricing` | 100 req / hour per IP | metadata endpoint |
| `GET /api/health/*` | 60 req / minute per IP | infrastructure health |

There is **no per-wallet quota, no daily cap, no TPM/RPM limit imposed by BlockRun on paid inference.** The economic cost of each call (settled in USDC at request time) is the abuse mitigation.

## How upstream rate limits surface

When an upstream rate-limits a request, BlockRun returns a `429 Rate Limited` response **with a source tag and a retry hint**, so your client can either retry or fail over to a same-tier model.

### Response shape

```json
{
  "error": "Rate limited",
  "code": "RATE_LIMITED",
  "source": "<source-tag>",
  "retry_after_seconds": 60,
  "details": "<upstream error message>"
}
```

### Response headers

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Source: <source-tag>
```

- `Retry-After` — RFC-7231 compliant; seconds to wait before retrying. BlockRun extracts this from the upstream error when available, otherwise defaults to `60`.
- `X-RateLimit-Source` — an opaque source tag for the capacity pool that hit the limit. Treat it as a coarse failover hint, not a stable identifier.
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
| Free tier (`nvidia/*` open-weight) | ~60 RPM per IP | varies | per-source IP throttling on the free tier; high-concurrency callers should use a paid model |
| Video (`bytedance/*`, `*/sora-2`) | varies per model | varies | generation jobs are async; throttling typically surfaces as long queue waits, not `429` |
| Music / speech / voice | per-job | n/a | per-job or per-account concurrency caps |

## Why no platform quota?

BlockRun's pay-per-call model uses **economic pricing as the abuse boundary** instead of platform quotas:

- Every paid request costs USDC settled at request time via x402.
- A bad actor running 10,000 calls/sec costs themselves 10,000× the per-call price — at flagship-model prices that's actual money out of their wallet, not free abuse.
- Hard quotas would force every customer into the same bucket regardless of willingness-to-pay, defeating the value proposition.

If you need **guaranteed capacity** (dedicated key pool, reserved provider TPM, custom 429 behavior, or an SLA), reach out about **enterprise dedicated capacity** — we'll provision isolated capacity outside the shared pool. Email `care@blockrun.ai` or DM `@bc1max` on Telegram.

## Discovery endpoint quotas (metadata only)

The IP-throttled endpoints listed at the top of this page protect against discovery-endpoint scraping. Real product traffic should never hit these limits.

If you exceed them you'll get:

```json
{ "error": "Rate limit exceeded" }
```

with HTTP 429 and `X-RateLimit-Reset: <unix-ms>`. Wait until reset, then retry.

## Need higher limits?

- **Paid inference:** there is no platform cap; the upstream provider's per-model RPM/TPM is your ceiling. Concurrency above that ceiling requires either fail-over to other providers or enterprise dedicated capacity.
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
