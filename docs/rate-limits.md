# Rate Limits

BlockRun is a pass-through gateway: for **paid** model calls it does **not** add
its own per-request throttle. The rate limits you may hit are the **upstream
provider's** capacity limits (tokens-per-minute / requests-per-minute on the
provider tier backing that model). When an upstream provider throttles a
request, BlockRun surfaces it to you transparently as an HTTP `429` so you can
back off or fail over.

## The `429` response

When an upstream provider rate-limits a request, BlockRun returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Source: anthropic
Content-Type: application/json
```

```json
{
  "error": "Rate limited",
  "message": "Upstream provider rate limit hit — retry after 60s, or fail over to a same-tier model on a different provider.",
  "code": "RATE_LIMITED",
  "source": "anthropic",
  "retry_after_seconds": 60
}
```

| Field / Header | Meaning |
|----------------|---------|
| `Retry-After` (header) | Seconds to wait before retrying. Honor this. |
| `X-RateLimit-Source` (header) | Which upstream provider throttled (`anthropic`, `openai`, …). |
| `code` | Always `RATE_LIMITED` for this case. |
| `retry_after_seconds` | Same value as `Retry-After`, in the body for convenience. |

This applies to both the standard (`POST /api/v1/chat/completions`) and Anthropic-compatible (`POST /api/v1/messages`) endpoints, for streaming and non-streaming requests. For streaming, the `429` is returned **before** the first SSE byte (no partial stream is emitted).

## Recommended client handling

1. **Honor `Retry-After`** — wait the indicated seconds, then retry (exponential backoff on repeats).
2. **Or fail over to a same-tier model on a different provider** — e.g. if `anthropic/claude-sonnet-4.6` is throttled, retry on `openai/gpt-5.4` or `google/gemini-3-pro-preview`. Different providers have independent rate-limit pools, so a cross-provider retry usually succeeds immediately.

```python
import time
resp = client.chat(...)
if resp.status_code == 429:
    time.sleep(int(resp.headers.get("Retry-After", 60)))
    resp = client.chat(...)            # retry
    # or: client.chat(model="openai/gpt-5.4", ...)  # cross-provider failover
```

## Provider notes

- **Claude (`anthropic/*`)** is served through **AWS Bedrock** (cross-region inference) with a **fallback to the direct Anthropic API**. A `429` here means *both* pools were saturated; back off or fail over to another provider.
- **GPT (`openai/*`)** mainline chat models are served **Azure-first** with a fallback to direct OpenAI.

In both cases the failover is automatic and internal — you only see a `429` when every backing pool for that model is exhausted.

## Other endpoints

Some non-LLM endpoints (image generation, async job submission, wallet reconciliation, RealFace init) carry small per-IP limits to bound abuse and real upstream cost. When exceeded they also return `429`; the same `Retry-After` guidance applies.

## Links

- [Chat Completions](api-reference/chat-completions.md)
- [Models](api-reference/models.md)
- [x402 Endpoints](x402/endpoints.md)
