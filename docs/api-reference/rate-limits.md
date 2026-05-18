# Rate Limits

BlockRun's rate-limiting model is intentionally minimal: **paid inference endpoints have no platform-side quota.** You pay per call in USDC via x402, and the cost of a paid request is the only cap on call volume. The effective rate limit your code will see comes from the upstream provider whose model you called (OpenAI, Anthropic, Google, etc.) — not from BlockRun's gateway.

## Summary

| Surface | Platform quota | Notes |
|---------|----------------|-------|
| `POST /v1/chat/completions` (paid LLMs) | none | upstream provider limit applies |
| `POST /v1/messages` (Anthropic-compatible) | none | Anthropic upstream limit applies |
| `POST /v1/images/generations` | none | upstream provider limit applies |
| `POST /v1/videos/generations` | none | token360 upstream limit applies |
| `POST /v1/audio/generations` | none | Suno upstream limit applies |
| `POST /v1/voice/call` | none | Bland.ai upstream limit applies |
| `GET /v1/models`, `/v1/{image,video,audio}/models` | 100 req / hour per IP | metadata endpoints |
| `GET /api/pricing` | 100 req / hour per IP | metadata endpoint |
| `GET /api/health/*` | 60 req / minute per IP | infrastructure health |

There is **no per-wallet quota, no daily cap, no TPM/RPM limit imposed by BlockRun on paid inference.** The economic cost of each call (settled in USDC at request time) is the abuse mitigation.

## How upstream rate limits surface

When the upstream provider rate-limits a request, BlockRun returns a `429 Rate Limited` response **with the upstream provider name and a retry hint**, so your client can either retry or fail over to a same-tier model on a different provider.

### Response shape

```json
{
  "error": "Rate limited",
  "code": "RATE_LIMITED",
  "source": "openai",
  "retry_after_seconds": 60,
  "details": "<upstream provider's error message>"
}
```

### Response headers

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Source: openai
```

- `Retry-After` — RFC-7231 compliant; seconds to wait before retrying. BlockRun extracts this from the upstream provider's error when available, otherwise defaults to `60`.
- `X-RateLimit-Source` — which provider hit the limit (`openai`, `anthropic`, `google`, `deepseek`, `xai`, `nvidia`, `moonshot`, `minimax`, `zai`, `token360`, `suno`, `bland`, etc.).
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

  // Option B: fail over to a same-tier model on a different provider
  // e.g. openai/gpt-5.4 (8K out) -> anthropic/claude-sonnet-4.6 (200K out)
  if (source === 'openai') {
    return callWithModel('anthropic/claude-sonnet-4.6');
  }
}
```

## Per-provider upstream limits (reference)

These are the upstream provider tiers BlockRun currently routes through. They are **not contractual** and change as we re-tier with each provider; treat them as orders of magnitude, not SLAs.

| Provider | Typical RPM | Typical TPM | Notes |
|---|---|---|---|
| OpenAI (tier 5) | ~10,000 / model | ~2M / model | shared key pool across all paid traffic |
| Anthropic | ~4,000 / model | ~400K / model | shared key pool |
| Google Gemini | ~1,000 / model | ~4M / model | shared key pool |
| DeepSeek | ~10,000+ | generous | shared key pool |
| xAI (Grok) | ~3,000 / model | ~1M / model | shared key pool |
| NVIDIA (free models) | ~60 RPM per IP | varies | NVIDIA enforces per-source IP throttling on the free tier; high-concurrency callers should consider a paid model |
| Moonshot, MiniMax, ZAI | provider-specific | provider-specific | usually generous (no observed throttling at current traffic) |
| token360 (video) | varies per model | varies | Seedance generation jobs are async; throttling typically surfaces as long queue waits, not 429 |
| Suno (music) | provider-specific | n/a | per-job quotas |
| Bland.ai (voice) | provider-specific | n/a | per-account concurrency cap |

## Why no platform quota?

BlockRun's pay-per-call model uses **economic pricing as the abuse boundary** instead of platform quotas:

- Every paid request costs USDC settled at request time via x402.
- A bad actor running 10,000 calls/sec costs themselves 10,000× the per-call price — at OpenAI/Anthropic prices that's actual money out of their wallet, not free abuse.
- Hard quotas would force every customer into the same bucket regardless of willingness-to-pay, defeating the value proposition.

If you need **guaranteed capacity** (dedicated key pool, reserved provider TPM, custom 429 behavior, or an SLA), reach out about **enterprise dedicated capacity** — we'll provision isolated capacity outside the shared pool. Email `vicky.fuyu@gmail.com` or DM `@bc1max` on Telegram.

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
