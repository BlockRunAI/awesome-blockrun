---
title: Chat Completions
description: OpenAI-compatible Chat Completions endpoint for 75 LLMs, paid per request in USDC over x402 — no API keys, no subscriptions.
---

# Chat Completions

The Chat Completions API is OpenAI-compatible, making it easy to migrate existing code. Point your client at BlockRun, pick a model, and pay per request in USDC over x402.

## Endpoint

```
POST https://blockrun.ai/api/v1/chat/completions
```

`/api/v1/...` is the canonical namespace and the one `/api/openapi` and
`/.well-known/x402` publish. `/v1/...` is served as an alias for every route —
`POST https://blockrun.ai/v1/chat/completions` reaches the same handler with the
same body, headers and payment flow — because a great deal of published material
named that path first. Prefer the canonical form in new code.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `PAYMENT-SIGNATURE` | Conditional | Base64-encoded x402 payment payload (required after 402, x402 v2). `X-Payment` is accepted as an alias for v1-era clients |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model ID (e.g., `openai/gpt-5.5`) |
| `messages` | array | Yes | Array of message objects |
| `max_tokens` | integer | No | Maximum tokens to generate. Default when omitted: the smaller of the model's `max_output` and 8192. Always clamped to the model ceiling and to the remaining context window — when the served value is smaller than what you asked for, the response carries `X-Max-Tokens-Capped: true`, `X-Max-Tokens-Requested`, and `X-Max-Tokens-Effective` |
| `temperature` | number | No | Sampling temperature (0-2) |
| `top_p` | number | No | Nucleus sampling parameter |
| `stream` | boolean | No | Stream the response as SSE chunks (default: `false`) |
| `tools` | array | No | Tool/function definitions (OpenAI tool-calling format) |
| `tool_choice` | string \| object | No | Tool selection strategy (`auto`, `none`, `required`, or a specific tool) |
| `response_format` | object | No | Output format, e.g. `{"type":"json_object"}` or `{"type":"json_schema","json_schema":{…}}` (see Structured outputs below) |
| `stop` | string \| array | No | Stop sequence(s) |
| `reasoning_effort` | string | No | Reasoning depth for GPT-5.x / o-series (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`) |
| `thinking` | object | No | Anthropic extended thinking, e.g. `{"type":"enabled","budget_tokens":2048}` or `{"type":"disabled"}` |
| `prompt_cache` | boolean | No | Opt in to Anthropic prompt caching (Anthropic models only). Consumed by the gateway, never forwarded |
| `search_parameters` | object | No | xAI Live Search on `xai/*` models: `{"mode":"auto"\|"on"\|"off","sources":[…],"return_citations":true,"from_date":"YYYY-MM-DD","to_date":"YYYY-MM-DD","max_search_results":≤50}`. Adds $0.025 per source to the quote (estimated at `max_search_results`, default 10) plus a 5% margin on that search leg |

Unknown parameters (`seed`, `n`, `logprobs`, `top_k`, …) are kept and forwarded verbatim to OpenAI-compatible upstreams. `stream_options` is the one exception: it is never forwarded — the gateway sets its own `stream_options.include_usage` because billing needs the usage frame.

### Message Object

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | One of: `system`, `user`, `assistant`, `tool` (`function` is accepted for legacy clients) |
| `content` | string \| array \| null | Text, or an array of content parts (`{"type":"text","text":…}`, `{"type":"image_url","image_url":{"url":…}}` on vision models). `null` is allowed on assistant turns that only carry `tool_calls` |
| `tool_calls` | array | Assistant turns: `[{"id","type":"function","function":{"name","arguments"}}]` |
| `tool_call_id` | string | Required on `tool` messages — the id of the call being answered |
| `name` | string | Optional tool/function name on `tool` messages |

A `messages` array with only `system` entries is rejected with `400` / `EMPTY_CONVERSATION` — at least one `user`, `assistant`, or `tool` message is required.

## Response

### Success (200)

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1703123456,
  "model": "gpt-5.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  }
}
```

### Usage Fields

| Field | Always present | Notes |
|-------|---|---|
| `prompt_tokens` | yes | Full prompt size; cache reads already folded in |
| `completion_tokens` | yes | Output tokens; includes thinking/reasoning for all providers |
| `total_tokens` | yes | Sum of prompt + completion |
| `prompt_tokens_details.cached_tokens` | when cache hit | Prompt tokens read from cache (OpenAI convention) |
| `prompt_tokens_details.cached_creation_tokens` | when cache write | Prompt tokens written to cache this turn (BlockRun extension) |
| `cache_read_input_tokens` | when cache hit | Same as `prompt_tokens_details.cached_tokens` — Anthropic-native label |
| `cache_creation_input_tokens` | when cache write | Same as `prompt_tokens_details.cached_creation_tokens` — Anthropic-native label |
| `completion_tokens_details.reasoning_tokens` | when reasoning | GPT-5.x / o-series only; forwarded verbatim. Not surfaced for Anthropic Claude models (thinking tokens are already included in `completion_tokens`) |

### Reasoning in its own field

Reasoning models (DeepSeek, Z.AI GLM, MiniMax, Moonshot Kimi, Claude with thinking enabled, open-weight reasoning models) return their chain of thought on `message.reasoning_content`, separate from `content`. The field is optional and absent when the model produced no reasoning.

- **Non-streaming** (since 2026-08-27): `choices[0].message.reasoning_content` carries the reasoning; `content` carries the answer.
- **Streaming**: reasoning arrives as `delta.reasoning_content` chunks alongside `delta.content`.
- **Tool-call turns**: an assistant message that carries `tool_calls` has `content: ""` — that is the OpenAI shape for "answered by calling a tool". The gateway no longer promotes reasoning into `content` on those turns; it lives on `reasoning_content` only. If you echo assistant turns back into history, echo `reasoning_content` too — some thinking models require it on prior tool-call turns.
- A reply whose `content` would otherwise be empty on a **non**-tool turn still receives the reasoning text as `content`, so a paying caller never gets a blank string.

```json
{
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "",
      "reasoning_content": "The user wants the weather, so I should call get_weather…",
      "tool_calls": [{"id": "call_abc", "type": "function", "function": {"name": "get_weather", "arguments": "{\"city\":\"SF\"}"}}]
    },
    "finish_reason": "tool_calls"
  }]
}
```

### Response headers

| Header | When | Meaning |
|--------|------|---------|
| `PAYMENT-RESPONSE` | every paid call | Base64 JSON `{"success","transaction","network","payer"}` — the x402 v2 settlement receipt |
| `X-Payment-Receipt` | when settlement landed | The on-chain transaction hash |
| `X-Payment-Settled: false` | when settlement did not land in time | The response was served (verification is the gate; settlement is bookkeeping). `X-Payment-Settle-Error-Class` names the failure class |
| `X-Max-Tokens-Capped` / `-Requested` / `-Effective` | when `max_tokens` was clamped | See `max_tokens` above |
| `X-Context-Truncated: true` | when the prompt was trimmed to fit the context window | `X-Messages-Removed` gives the count |
| `X-Free-Model: true` | free-tier models | No payment was required |
| `X-Fallback-Used: true` | when the requested model failed over | `X-Original-Model` / `X-Fallback-Model` name both sides |

**Protocol naming convention:**
- **Claude native `/v1/messages`**: `usage.input_tokens`, `usage.output_tokens`, `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`
- **OpenAI-compat `/v1/chat/completions`**: `usage.prompt_tokens_details.cached_tokens` (reads), `usage.prompt_tokens_details.cached_creation_tokens` (writes), `usage.completion_tokens_details.reasoning_tokens` (reasoning)

**Enabling prompt caching on Anthropic models:**
Pass `"prompt_cache": true` in the request body, or embed `cache_control` blocks in your message content directly — both are honored.

:::note{title="No phantom identity tokens in your billed input"}
BlockRun does **not** prepend a hidden identity/system directive to your prompt by default. The `input_tokens` (`prompt_tokens`) you are billed for reflect exactly the messages you sent — there are no extra phantom input tokens added by the gateway.
:::

:::info{title="Structured outputs (response_format)"}
`response_format` is forwarded to the model. Two shapes are accepted:
- `{"type":"json_object"}` — JSON mode. Honored on all models (emulated for Claude/Gemini, native on OpenAI-compatible models).
- `{"type":"json_schema","json_schema":{ "name":…, "schema":{…} }}` — OpenAI structured outputs, forwarded verbatim. Schema-guaranteed output is enforced natively on OpenAI (GPT) models; on other providers it is passed through and honored on a best-effort basis where the upstream supports it.
:::

:::info{title="Claude-native context_management requires the anthropic-beta header"}
If you use the Claude-native `POST /v1/messages` endpoint with the `context_management` field, you **must** also send the matching `anthropic-beta` header. A `context_management` body without that header is rejected at the edge with a `400` (rather than silently ignored).
:::

:::note{title="Sampling params on Claude Opus 5 / 4.8 / 4.7, Fable 5 and Sonnet 5"}
`temperature`, `top_p`, and `top_k` are **not honored** for `anthropic/claude-opus-5`, `anthropic/claude-fable-5`, `anthropic/claude-sonnet-5`, `anthropic/claude-opus-4.8`, and `anthropic/claude-opus-4.7` — these models reject sampling params upstream, so the gateway strips them so your request still succeeds (it does not fail). Set behavior through your prompt instead.
:::

### Payment Required (402)

When you first make a request without payment, you'll receive:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
X-Payment-Required: <base64 payment requirements>
PAYMENT-REQUIRED: <same value>
WWW-Authenticate: X402 requirements="<same value>"
```

```json
{
  "x402Version": 2,
  "accepts": [{"scheme": "exact", "network": "eip155:8453", "amount": "25685", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300}],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {"amount": "0.025685", "currency": "USD"},
  "paymentInfo": {"network": "base", "asset": "USDC", "x402Version": 2}
}
```

`price.amount` is the exact amount the header signs, transaction fee included. `x402Version`/`accepts` at the top level mirror the header's challenge in the body, for clients that only parse the body. Decoded, the header is:

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "25685",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x…",
    "maxTimeoutSeconds": 300,
    "extra": {"name": "USD Coin", "version": "2"}
  }],
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "description": "GPT-5.5 API call (~17 input, 8192 max output tokens)",
    "mimeType": "application/json"
  },
  "extensions": {"bazaar": {…}}
}
```

**How the quote is computed.** Estimated input tokens at the model's input rate, plus **10% of `max_tokens`** at the output rate — most calls use a small fraction of their ceiling. Per-token chat carries **no platform margin** (list price, since 2026-08-07); the quote is floored at $0.001 and then the flat **$0.001 per-request transaction fee** is added. `amount` is in micro-USDC (6 decimals). The settled amount is the signed amount — there is no post-hoc refund when the model uses fewer tokens, so set `max_tokens` to what you need. Prompts at or above a model's long-context threshold re-price the whole request at that model's long-context rates.

### Payment rejected (402 with a `code`)

If you send a `PAYMENT-SIGNATURE` that does not verify, the response is still `402` but carries a machine-readable `code` so a client can branch instead of parsing prose:

```json
{
  "error": "Payment verification failed",
  "code": "PAYMENT_UNFUNDED",
  "message": "The payment authorization could not be executed on-chain. The usual cause is an insufficient USDC balance on Base for the quoted amount — …",
  "debug": "<facilitator reason>",
  "payer": "0x…"
}
```

| `code` | Meaning | What to do |
|--------|---------|------------|
| `PAYMENT_UNFUNDED` | The transfer simulation reverted — usually not enough USDC for the quoted amount (an expired or not-yet-valid authorization window reverts the same way) | Fund the wallet, or re-sign if your clock is off |
| `PAYMENT_BLOCKHASH_STALE` | Solana-signed payments: the transaction was pinned to a blockhash that has since expired (they stay valid for roughly a minute). Nothing was charged | Sign a fresh authorization against a current blockhash and resend |
| `PAYMENT_REPLAY` | The authorization nonce was already used | Sign a fresh authorization for each request |
| `PAYMENT_INVALID` | Any other verification failure (bad signature, wrong network/asset, malformed payload) | Check the signed requirements match the header you were given |

Verification runs strictly before settlement, so a `402` with any of these codes means nothing was charged. The Solana gateway (`sol.blockrun.ai`) uses the same envelope with `PAYMENT_INVALID`, `PAYMENT_REPLAY`, and `PAYMENT_VERIFICATION_UNAVAILABLE` (the facilitator itself was unreachable — retry the same signed payment). The Anthropic-compatible `/v1/messages` and `/v1/responses` endpoints keep their vendor error envelopes and do not carry these codes.

:::info{title="402 is the normal flow, not an error"}
The first request returns `402 Payment Required` with a price quote. Sign it and retry with the `PAYMENT-SIGNATURE` header to get your completion. The SDKs do this round-trip automatically.
:::

### Other status codes

| Status | `code` | When |
|--------|--------|------|
| 400 | `INVALID_JSON`, `INVALID_REQUEST_BODY` (with `details`), `EMPTY_CONVERSATION`, `INVALID_PARAMETER`, `CONTEXT_LENGTH_EXCEEDED`, `CONTENT_FILTERED`, `INVALID_IMAGE_URL`, `REQUEST_TOO_LARGE`, `STREAM_UNSUPPORTED` | Caller-side problems, including upstream rejections of your parameters (surfaced as 400, not 500) |
| 400 | — | Unknown model: `{"error":"Unknown model: <id>. Try one of: …. Full list: GET /v1/models"}` |
| 429 | `RATE_LIMITED` | Upstream capacity exhausted for that model — `Retry-After` and `X-RateLimit-Source` set; see [Rate Limits](rate-limits.md) |
| 429 | `FREE_TIER_RATE_LIMITED` | Free models only: per-IP limit of 30 requests/minute or 300 requests/hour hit — `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` set |
| 503 | `MODEL_UNAVAILABLE`, `PROVIDER_CONFIG_ERROR` | Upstream is down or over capacity; retry or fail over |
| 504 | `TIMEOUT` | Upstream did not answer within the 120s per-call timeout. Not settled |

Errors use the OpenAI envelope — `error.message`, `error.type`, `error.code`, `error.param` — with `message` and `code` mirrored at the top level for older clients. Full details in [Error Handling](errors.md).

### Timeouts

- Each upstream call has a **120s** timeout (non-streaming, and time-to-first-byte / stall between chunks when streaming).
- A streaming response has an overall deadline of **500s**; a stream that hits it is terminated.
- Payment authorizations are valid for **300s** (`maxTimeoutSeconds`); settlement happens after the response (non-streaming) or after the last chunk (streaming), so the whole call has to finish inside that window.

## Example

::::tabs

:::tab{label="cURL"}
```bash
# Step 1: Get price (will return 402)
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-5.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Step 2: Sign payment and retry (SDK handles this automatically)
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{
    "model": "openai/gpt-5.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```
:::

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()

# Simple chat
response = client.chat("openai/gpt-5.5", "Hello!")

# Full completion with options
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]
result = client.chat_completion(
    "openai/gpt-5.5",
    messages,
    max_tokens=100,
    temperature=0.7
)
print(result.choices[0].message.content)
```
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Simple chat
const response = await client.chat('openai/gpt-5.5', 'Hello!');

// Full completion with options
const messages = [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'What is 2+2?' }
];
const result = await client.chatCompletion('openai/gpt-5.5', messages, {
  maxTokens: 100,
  temperature: 0.7
});
console.log(result.choices[0].message.content);
```
:::

::::

## What's next?

::::cards

:::card{title="Browse all models" href="models.md" icon="Brain"}
75 chat models with live pricing — pick the right model and ID for your call.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes, error shapes, and how the SDKs surface payment failures.
:::

::::
