---
title: Search API
description: Real-time search across web and news via Grok Live Search — pay per source in USDC over x402, no API key.
---

# Search API

Real-time search across web and news using Grok AI.

## Endpoint

```
POST https://blockrun.ai/api/v1/search
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `PAYMENT-SIGNATURE` | Conditional | Base64-encoded x402 payment payload (required after 402, x402 v2). `X-PAYMENT` is accepted as an alias. |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query text (1-1000 characters) |
| `sources` | array | No | Sources to search (default: `["web"]`) |
| `max_results` | integer | No | Maximum results per source, 1-50 (default: 10) |
| `from_date` | string | No | Start date filter (`YYYY-MM-DD`) |
| `to_date` | string | No | End date filter (`YYYY-MM-DD`) |

### Source Types

| Source | Description |
|--------|-------------|
| `web` | General web search results |
| `news` | News articles from major outlets |

## Response

### Success (200)

```json
{
  "query": "latest AI funding rounds",
  "summary": "Several major AI companies have announced significant funding rounds...",
  "citations": [
    {
      "url": "https://techcrunch.com/ai-startup-series-b",
      "title": "AI Startup raises $50M Series B",
      "source": "web"
    }
  ],
  "sources_used": 10,
  "model": "xai/grok-3-mini"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | The original search query |
| `summary` | string | AI-generated summary of search results with citations |
| `citations` | array | Array of source citations |
| `citations[].url` | string | URL of the cited source |
| `citations[].title` | string | Title or description of the source |
| `citations[].source` | string | Source type (`web`, `news`) |
| `sources_used` | integer | Number of sources actually queried (falls back to `max_results` when upstream does not report it) |
| `model` | string | Model used for search (currently `xai/grok-3-mini`) |

Successful responses also carry two headers: `PAYMENT-RESPONSE` (the x402 v2 settlement receipt — base64 JSON with `success`, `transaction`, `network`, `payer`) and `X-Payment-Receipt` (the on-chain settlement transaction hash).

### Payment Required (402)

When you first make a request without payment, you'll receive:

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {
    "amount": "0.2625",
    "currency": "USD",
    "perSourceCost": 0.025,
    "maxResults": 10
  },
  "paymentInfo": {
    "network": "base",
    "asset": "USDC",
    "x402Version": 2
  }
}
```

The full x402 v2 payment requirements are in the `X-Payment-Required` and `PAYMENT-REQUIRED` headers (base64 JSON, identical content) and in `WWW-Authenticate: X402 requirements="..."`. Sign against the header, not the body: `price.amount` in the body is the per-source cost plus margin **before** the flat $0.001 transaction fee, while `accepts[0].amount` in the header is the exact USDC (6-decimal) amount you will be charged — for the default 10 sources that is `263500`, i.e. $0.2635. Payment authorizations are valid for `maxTimeoutSeconds: 300`.

A `GET` to the same URL returns a 402 quoting the default price (10 sources) — useful for discovery.

### Payment verification failed (402)

If a payment header is present but does not verify, the body carries a machine-readable `code` so a client can branch on it instead of parsing `details`:

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_UNFUNDED",
  "message": "The payment authorization could not be executed on-chain. ...",
  "details": "<raw verifier error>"
}
```

| `code` | Meaning |
|--------|---------|
| `PAYMENT_INVALID` | Signature, amount, network or recipient did not match the requirements (default when nothing more specific applies; `message` is omitted) |
| `PAYMENT_UNFUNDED` | The authorization could not execute on-chain — usually insufficient USDC on Base, or an expired `validAfter`/`validBefore` window |
| `PAYMENT_BLOCKHASH_STALE` | Solana-gateway only: signed against an expired blockhash — re-sign against a current one |
| `PAYMENT_REPLAY` | The same authorization was already used (`error: "Payment authorization already used"`). Sign a fresh authorization for every request |

A `402` with `error: "Payment settlement failed"` means the search ran but settlement did not complete; nothing was charged.

## Pricing

Search pricing is per-source with a 5% BlockRun margin, plus the flat $0.001 per-transaction fee charged on every paid call:

- **Base cost:** $0.025 per source
- **Margin:** 5%
- **Transaction fee:** $0.001 per request (flat)
- **Formula:** `max_results × $0.025 × 1.05 + $0.001`

| max_results | Base Cost | With Margin | Charged (incl. fee) |
|-------------|-----------|-------------|---------------------|
| 1 | $0.025 | $0.02625 | $0.02725 |
| 5 | $0.125 | $0.13125 | $0.13225 |
| 10 (default) | $0.250 | $0.26250 | $0.26350 |
| 25 | $0.625 | $0.65625 | $0.65725 |
| 50 | $1.250 | $1.31250 | $1.31350 |

The price depends only on `max_results`, not on how many sources you list in `sources` or how many the search actually used.

## Examples

::::tabs

:::tab{label="cURL"}
```bash
# Step 1: Get price (will return 402)
curl -X POST https://blockrun.ai/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI funding rounds",
    "sources": ["web", "news"],
    "max_results": 10
  }'

# Step 2: Sign payment and retry (SDK handles this automatically)
curl -X POST https://blockrun.ai/api/v1/search \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{
    "query": "latest AI funding rounds",
    "sources": ["web", "news"],
    "max_results": 10
  }'
```
:::

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()

# Basic search
results = client.search("latest AI funding rounds")
print(results["summary"])

# Advanced search with date filtering
results = client.search(
    "OpenAI announcements",
    sources=["web", "news"],
    max_results=25,
    from_date="2026-01-01",
    to_date="2026-02-24"
)
print(results["summary"])
for cite in results["citations"]:
    print(f"  - {cite['title']}: {cite['url']}")
```
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Basic search
const results = await client.search('latest AI funding rounds');
console.log(results.summary);

// Advanced search with date filtering
const results = await client.search('OpenAI announcements', {
  sources: ['web', 'news'],
  maxResults: 25,
  fromDate: '2026-01-01',
  toDate: '2026-02-24'
});
console.log(results.summary);
results.citations.forEach(cite =>
  console.log(`  - ${cite.title}: ${cite.url}`)
);
```
:::

::::

## Chat Completions Alternative

You can also access Grok's live search through the Chat Completions API by including `search_parameters` in your request:

```json
{
  "model": "xai/grok-3-mini",
  "messages": [{"role": "user", "content": "What's trending in AI today?"}],
  "search_parameters": {
    "mode": "on",
    "sources": [{"type": "web"}, {"type": "news"}],
    "max_search_results": 10,
    "return_citations": true
  }
}
```

This gives you the raw chat completion response with search-augmented context. The `/v1/search` endpoint provides a more structured search-specific response format.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request — body is not JSON (`code: "INVALID_JSON"`) or fails validation (`error: "Invalid request body"` with Zod `details`) |
| 402 | Payment required, payment verification failed (see `code` above), replayed authorization (`PAYMENT_REPLAY`), or settlement failed |
| 500 | Server error (`error: "Internal server error"`, with `details`) — includes upstream search failures |

Upstream calls are made only after payment verifies; settlement happens after the search returns, so a failed search is never charged.

### Error Response

```json
{
  "error": "Invalid request body",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["query"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Add `search_parameters` to any chat call for search-augmented context.
:::

:::card{title="Intelligence Pricing" href="../products/intelligence/pricing.md" icon="TrendingUp"}
Per-token model pricing alongside the per-source search cost.
:::

:::card{title="Error Handling" href="errors.md" icon="Code"}
The gateway-wide error envelope and 402 / 429 handling.
:::

::::
