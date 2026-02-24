# Search API

Real-time search across X/Twitter, web, and news using Grok AI.

## Endpoint

```
POST https://blockrun.ai/api/v1/search
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `PAYMENT-SIGNATURE` | Conditional | Base64-encoded x402 payment payload (required after 402, x402 v2) |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query text (1-1000 characters) |
| `sources` | array | No | Sources to search (default: `["x", "web"]`) |
| `max_results` | integer | No | Maximum results per source, 1-50 (default: 10) |
| `from_date` | string | No | Start date filter (`YYYY-MM-DD`) |
| `to_date` | string | No | End date filter (`YYYY-MM-DD`) |

### Source Types

| Source | Description |
|--------|-------------|
| `x` | Real-time X/Twitter posts and threads |
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
      "url": "https://x.com/user/status/123",
      "title": "AI Startup raises $50M Series B",
      "source": "x"
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
| `citations[].source` | string | Source type (`x`, `web`, `news`) |
| `sources_used` | integer | Number of sources actually queried |
| `model` | string | Model used for search (currently `xai/grok-3-mini`) |

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

The `X-Payment-Required` header contains the full payment requirements.

## Pricing

Search pricing is per-source with a 5% BlockRun margin:

- **Base cost:** $0.025 per source
- **Margin:** 5%
- **Formula:** `max_results × $0.025 × 1.05`

| max_results | Base Cost | With Margin |
|-------------|-----------|-------------|
| 1 | $0.025 | $0.02625 |
| 5 | $0.125 | $0.13125 |
| 10 (default) | $0.250 | $0.26250 |
| 25 | $0.625 | $0.65625 |
| 50 | $1.250 | $1.31250 |

## Examples

### cURL

```bash
# Step 1: Get price (will return 402)
curl -X POST https://blockrun.ai/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI funding rounds",
    "sources": ["x", "web", "news"],
    "max_results": 10
  }'

# Step 2: Sign payment and retry (SDK handles this automatically)
curl -X POST https://blockrun.ai/api/v1/search \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{
    "query": "latest AI funding rounds",
    "sources": ["x", "web", "news"],
    "max_results": 10
  }'
```

### Python

```python
from blockrun_llm import LLMClient

client = LLMClient()

# Basic search
results = client.search("latest AI funding rounds")
print(results["summary"])

# Advanced search with date filtering
results = client.search(
    "OpenAI announcements",
    sources=["x", "news"],
    max_results=25,
    from_date="2026-01-01",
    to_date="2026-02-24"
)
print(results["summary"])
for cite in results["citations"]:
    print(f"  - {cite['title']}: {cite['url']}")
```

### TypeScript

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Basic search
const results = await client.search('latest AI funding rounds');
console.log(results.summary);

// Advanced search with date filtering
const results = await client.search('OpenAI announcements', {
  sources: ['x', 'news'],
  maxResults: 25,
  fromDate: '2026-01-01',
  toDate: '2026-02-24'
});
console.log(results.summary);
results.citations.forEach(cite =>
  console.log(`  - ${cite.title}: ${cite.url}`)
);
```

## Chat Completions Alternative

You can also access Grok's live search through the Chat Completions API by including `search_parameters` in your request:

```json
{
  "model": "xai/grok-3-mini",
  "messages": [{"role": "user", "content": "What's trending in AI today?"}],
  "search_parameters": {
    "mode": "on",
    "sources": [{"type": "x"}, {"type": "web"}],
    "max_search_results": 10,
    "return_citations": true
  }
}
```

This gives you the raw chat completion response with search-augmented context. The `/v1/search` endpoint provides a more structured search-specific response format.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad query or parameters) |
| 402 | Payment required or payment verification failed |
| 429 | Rate limit exceeded |
| 500 | Server error |

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

## Links

- [Chat Completions](chat-completions.md)
- [Intelligence Pricing](../products/intelligence/pricing.md)
- [Error Handling](errors.md)
