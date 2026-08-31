---
title: Exa Web Search
description: Real-time neural web search for AI agents — search, read, synthesize, and discover across the live web, paid per call in USDC over x402.
---

# Exa Web Search

Real-time neural web search for AI agents. Four endpoints that give your agent a live internet connection — search, read, synthesize, and discover.

## The Problem Exa Solves

LLMs have a knowledge cutoff. When an agent needs to answer "what happened last week" or "which projects are using x402 right now", the LLM either hallucinates or says it doesn't know.

Exa gives agents a live internet connection with structured, grounded results — not HTML soup, but clean text ready to feed into your next LLM call.

**A complete research workflow costs $0.033:**
- 1 search ($0.011) → find relevant URLs
- 5 page reads in one call ($0.002/URL + $0.001 per-request fee → $0.011) → get full content
- 1 synthesized answer ($0.011) → grounded conclusion

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/exa/search` | POST | $0.011 | Neural web search — find relevant URLs for a query |
| `/api/v1/exa/answer` | POST | $0.011 | Get a cited, synthesized answer to any question |
| `/api/v1/exa/contents` | POST | $0.002/URL + $0.001/request | Fetch full Markdown text from a list of URLs |
| `/api/v1/exa/find-similar` | POST | $0.011 | Find pages similar to a given URL |

All four are `POST` only. Any other path under `/api/v1/exa/` returns `404` with an `available` list. Requests are forwarded to Exa with a 30-second timeout.

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
```

The gateway returns Exa's JSON body verbatim — there is no `data` wrapper.

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
```

---

## POST /api/v1/exa/contents

Fetch the full text content from a list of URLs. Returns clean Markdown — no HTML, no boilerplate — ready to drop into an LLM context window.

**This is the cheapest way to read web pages:** $0.002 per URL, plus the $0.001
per-request fee charged once no matter how many URLs you pass. Fetching 10 pages
costs $0.021; a single page costs $0.003.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | array | Yes | List of URLs to fetch (up to 100) |

### Response

```json
{
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

An agent asked to analyze a topic. Cost: ~$0.036.

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
const analysis = await client.chat("anthropic/claude-opus-5", [
  { role: "system", content: "Analyze based only on the provided sources." },
  { role: "user", content: `Sources:\n${pages.results.map(p => p.text).join("\n---\n")}\n\nQuestion: What is driving x402 adoption?` }
]);
```

### 2. Fact-Checking Agent — No Hallucinations

Agent needs a reliable answer to a factual question. Cost: $0.011.

```typescript
const result = await client.exaAnswer(
  "How many x402 transactions happened in the last 30 days?"
);
// answer is grounded in real web sources with citations
console.log(result.answer);
console.log("Sources:", result.citations.map(c => c.url));
```

### 3. Competitive Intelligence — Find Similar Projects

Discover what's being built in your space. Cost: $0.011.

```typescript
const similar = await client.exaFindSimilar("https://blockrun.ai", {
  numResults: 10,
  excludeSourceDomain: true
});
// Returns pages semantically similar to blockrun.ai — competitors, partners, alternatives
```

### 4. Developer Agent — Find Code Examples

AI coding agent looking for real implementation examples. Cost: $0.014 (one search at $0.011 + one URL of contents at $0.003).

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

Weekly check on what's happening. Cost: $0.011/run.

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

::::tabs

:::tab{label="cURL"}
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
:::

:::tab{label="Python"}
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
:::

:::tab{label="TypeScript"}
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
:::

::::

---

## Pricing

| Endpoint | Price per call |
|----------|---------------|
| `/exa/search` | $0.011 |
| `/exa/answer` | $0.011 |
| `/exa/find-similar` | $0.011 |
| `/exa/contents` | $0.002 per URL + $0.001 per request |

Every price above already includes the flat $0.001 per-transaction fee (base $0.01 per call, or $0.002 per URL for `/contents`). Payment is in USDC on Base or Solana via x402. No account needed — your wallet is your identity.

### The 402 response

An unpaid request returns `402` with the exact charge in the body and the signable x402 v2 requirements in the `X-Payment-Required` / `PAYMENT-REQUIRED` headers (base64 JSON; also mirrored in `WWW-Authenticate`), plus the same challenge mirrored into the body as `x402Version`/`accepts`. For `/contents` the body is read first, so `price.amount` reflects `urls.length`:

```json
{
  "x402Version": 2,
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "amount": "5000", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300 }],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "endpoint": "/api/v1/exa/contents",
  "method": "POST",
  "description": "Extract full text content from specific URLs. ...",
  "price": { "amount": "0.0050", "currency": "USD" },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

Send the signed payload back in `X-PAYMENT` (or `PAYMENT-SIGNATURE`). A `GET` on any of the four paths returns a discovery 402 whose `paymentInfo.price` is the **per-unit** base rate; for `/contents` it also carries `pricingUnit: "per-url"` and a `pricingNote`.

Successful responses carry `X-Payment-Response` (x402 v2 settlement receipt) and `X-Payment-Receipt` (the settlement transaction hash).

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
| 402 | Payment required — sign and retry. Also returned when a payment header is present but fails verification (`error: "Payment verification failed"`, see codes below), when an authorization is reused (`code: "PAYMENT_REPLAY"`), or when settlement fails after the call (`error: "Payment settlement failed"`) |
| 400–499 | Exa rejected the request — the upstream status is passed through unchanged with `error: "Bad Request"`, `status`, and Exa's own error in `details`. **Payment was NOT charged.** |
| 404 | Unknown endpoint path (`available` lists the four valid paths) |
| 502 | Exa returned a 5xx (`error: "Upstream provider error"`). Payment was NOT charged |
| 503 | Exa integration not configured, or temporarily paused |
| 500 | Gateway error (`error: "Internal server error"`), including a 30-second upstream timeout |

Payment is verified before the upstream call and settled only after Exa answers, so a failed or rejected request never costs anything.

### Payment verification codes

A verification `402` spreads a machine-readable `code` so clients can branch without parsing the human-readable `details`:

| `code` | Meaning |
|--------|---------|
| `PAYMENT_INVALID` | Signature, amount, network or recipient did not match the requirements (default; `message` omitted) |
| `PAYMENT_UNFUNDED` | The authorization could not execute on-chain — usually insufficient USDC on Base, or an expired `validAfter`/`validBefore` window |
| `PAYMENT_BLOCKHASH_STALE` | Solana gateway only: signed against an expired blockhash — re-sign and retry |
| `PAYMENT_REPLAY` | That authorization was already used. Sign a fresh one for each request |

## What's next?

::::cards

:::card{title="Search (Grok live search)" href="search.md" icon="Search"}
Real-time web and news search via Grok Live Search.
:::

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Feed grounded search results into any of 73 LLMs for synthesis.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes and how the SDKs surface payment and upstream failures.
:::

::::
