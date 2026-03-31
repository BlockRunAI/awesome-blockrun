# Exa Web Search

Real-time neural web search for AI agents. Four endpoints that give your agent a live internet connection — search, read, synthesize, and discover.

## The Problem Exa Solves

LLMs have a knowledge cutoff. When an agent needs to answer "what happened last week" or "which projects are using x402 right now", the LLM either hallucinates or says it doesn't know.

Exa gives agents a live internet connection with structured, grounded results — not HTML soup, but clean text ready to feed into your next LLM call.

**A complete research workflow costs $0.03:**
- 1 search ($0.01) → find relevant URLs
- 5 page reads ($0.01) → get full content
- 1 synthesized answer ($0.01) → grounded conclusion

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/exa/search` | POST | $0.01 | Neural web search — find relevant URLs for a query |
| `/api/v1/exa/answer` | POST | $0.01 | Get a cited, synthesized answer to any question |
| `/api/v1/exa/contents` | POST | $0.002/URL | Fetch full Markdown text from a list of URLs |
| `/api/v1/exa/find-similar` | POST | $0.01 | Find pages similar to a given URL |

---

## POST /api/v1/exa/search

Neural (semantic) search across the live web. Unlike keyword search, Exa understands meaning — searching "x402 payment implementation" returns implementations, not pages that mention those words.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `numResults` | integer | No | Number of results to return (default: 10, max: 100) |
| `category` | string | No | Restrict to a content category (see below) |
| `startPublishedDate` | string | No | Only include pages published after this date (ISO 8601) |
| `endPublishedDate` | string | No | Only include pages published before this date (ISO 8601) |
| `includeDomains` | array | No | Only search within these domains |
| `excludeDomains` | array | No | Exclude these domains from results |

### Category Options

Narrow your search to a specific type of content:

| Category | Description |
|----------|-------------|
| `github` | GitHub repositories and code |
| `news` | News articles from major outlets |
| `research paper` | Academic papers and preprints |
| `linkedin profile` | LinkedIn profile pages |
| `personal site` | Personal and portfolio sites |
| `tweet` | Twitter/X posts |
| `financial report` | Earnings reports and financial filings |
| `pdf` | PDF documents |
| `company` | Company websites and about pages |

### Response

```json
{
  "data": {
    "requestId": "d581de9ed6d77165",
    "resolvedSearchType": "neural",
    "results": [
      {
        "id": "https://github.com/example/x402-impl",
        "title": "x402 Payment Protocol — Reference Implementation",
        "url": "https://github.com/example/x402-impl",
        "publishedDate": "2026-03-15T00:00:00.000Z",
        "score": 0.94
      }
    ],
    "searchTime": 860,
    "costDollars": { "total": 0.007 }
  }
}
```

---

## POST /api/v1/exa/answer

Ask a factual question, get a synthesized answer with citations. Like Perplexity in an API — grounded in real sources, not hallucinated.

Best for: "What is X?", "How does Y work?", "What's the current state of Z?"

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | The question to answer |

### Response

```json
{
  "data": {
    "requestId": "601e412c9b1d0891",
    "answer": "x402 is an open payment standard built around the HTTP 402 status code...",
    "citations": [
      {
        "id": "https://x402.org",
        "title": "x402 - Payment Required | Internet-Native Payments Standard",
        "url": "https://www.x402.org"
      }
    ]
  }
}
```

---

## POST /api/v1/exa/contents

Fetch the full text content from a list of URLs. Returns clean Markdown — no HTML, no boilerplate — ready to drop into an LLM context window.

**This is the cheapest way to read web pages:** $0.002 per URL. Fetching 10 pages costs $0.02.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | array | Yes | List of URLs to fetch (up to 100) |

### Response

```json
{
  "data": {
    "results": [
      {
        "id": "https://x402.org",
        "url": "https://x402.org",
        "title": "x402 - Payment Required",
        "text": "x402 is an open, neutral standard for internet-native payments...",
        "author": null
      }
    ],
    "costDollars": { "total": 0.002 }
  }
}
```

---

## POST /api/v1/exa/find-similar

Given a URL, find semantically similar pages. Useful for discovering competitors, alternatives, or related resources.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | The reference URL to find similar pages for |
| `numResults` | integer | No | Number of results (default: 10, max: 100) |
| `excludeSourceDomain` | boolean | No | Exclude pages from the same domain (default: false) |

### Response

Same format as `/exa/search`.

---

## Use Cases

### 1. Research Agent — Full Grounded Analysis

An agent asked to analyze a topic. Cost: ~$0.03.

```typescript
// Step 1: Find relevant sources
const search = await client.exaSearch("x402 protocol adoption 2026", {
  numResults: 5,
  category: "news"
});

// Step 2: Read full content of top results
const urls = search.results.map(r => r.url);
const pages = await client.exaContents(urls);

// Step 3: Feed into LLM for analysis
const analysis = await client.chat("anthropic/claude-opus-4-6", [
  { role: "system", content: "Analyze based only on the provided sources." },
  { role: "user", content: `Sources:\n${pages.results.map(p => p.text).join("\n---\n")}\n\nQuestion: What is driving x402 adoption?` }
]);
```

### 2. Fact-Checking Agent — No Hallucinations

Agent needs a reliable answer to a factual question. Cost: $0.01.

```typescript
const result = await client.exaAnswer(
  "How many x402 transactions happened in the last 30 days?"
);
// answer is grounded in real web sources with citations
console.log(result.answer);
console.log("Sources:", result.citations.map(c => c.url));
```

### 3. Competitive Intelligence — Find Similar Projects

Discover what's being built in your space. Cost: $0.01.

```typescript
const similar = await client.exaFindSimilar("https://blockrun.ai", {
  numResults: 10,
  excludeSourceDomain: true
});
// Returns pages semantically similar to blockrun.ai — competitors, partners, alternatives
```

### 4. Developer Agent — Find Code Examples

AI coding agent looking for real implementation examples. Cost: $0.012.

```typescript
// Find GitHub repos implementing a specific pattern
const repos = await client.exaSearch(
  "x402 payment middleware implementation Next.js",
  { numResults: 5, category: "github" }
);

// Read the README of the most relevant repo
const readmes = await client.exaContents([repos.results[0].url]);
// Feed into coding agent context
```

### 5. Monitoring Agent — Track News About a Topic

Weekly check on what's happening. Cost: $0.01/run.

```typescript
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const news = await client.exaSearch("Coinbase x402 announcement", {
  category: "news",
  startPublishedDate: lastWeek.toISOString()
});
```

---

## SDK Usage

### TypeScript

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });

// Search
const results = await client.exaSearch("x402 payment protocol", { numResults: 5 });

// Get a cited answer
const answer = await client.exaAnswer("What is the x402 protocol?");

// Read page contents
const pages = await client.exaContents(["https://x402.org", "https://blockrun.ai"]);

// Find similar pages
const similar = await client.exaFindSimilar("https://blockrun.ai", { numResults: 10 });
```

### Python

```python
from blockrun_llm import LLMClient

client = LLMClient()

# Search
results = client.exa_search("x402 payment protocol", num_results=5)

# Get a cited answer
answer = client.exa_answer("What is the x402 protocol?")
print(answer["answer"])

# Read page contents (batch URL fetching)
pages = client.exa_contents(["https://x402.org", "https://blockrun.ai"])

# Find similar pages
similar = client.exa_find_similar("https://blockrun.ai", num_results=10)
```

### cURL

```bash
# Step 1: Request returns 402 with payment instructions
curl -X POST https://blockrun.ai/api/v1/exa/search \
  -H "Content-Type: application/json" \
  -d '{"query": "x402 protocol implementations", "numResults": 5}'

# Step 2: Pay and retry (SDK handles this automatically)
curl -X POST https://blockrun.ai/api/v1/exa/search \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <signed-payment-payload>" \
  -d '{"query": "x402 protocol implementations", "numResults": 5}'
```

---

## Pricing

| Endpoint | Price per call |
|----------|---------------|
| `/exa/search` | $0.01 |
| `/exa/answer` | $0.01 |
| `/exa/find-similar` | $0.01 |
| `/exa/contents` | $0.002 per URL |

Payment is in USDC on Base or Solana via x402. No account needed — your wallet is your identity.

---

## vs. Other Options

| | BlockRun Exa | Exa directly | Google Search API |
|--|-------------|-------------|-------------------|
| Payment | USDC per call | Subscription | Subscription |
| Account required | No | Yes | Yes |
| Works for autonomous agents | ✅ | ❌ (needs API key) | ❌ |
| Clean Markdown output | ✅ | ✅ | ❌ |
| Same wallet as LLM calls | ✅ | N/A | N/A |

---

## Error Handling

| Code | Description |
|------|-------------|
| 402 | Payment required — sign and retry |
| 400 | Invalid request parameters |
| 404 | Unknown endpoint path |
| 503 | Exa integration not configured |
| 502 | Exa upstream error |

## Links

- [Chat Completions](chat-completions.md)
- [Search (Grok live search)](search.md)
- [Error Handling](errors.md)
