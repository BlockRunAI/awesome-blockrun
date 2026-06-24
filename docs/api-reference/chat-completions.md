---
title: Chat Completions
description: OpenAI-compatible Chat Completions endpoint for 60+ LLMs, paid per request in USDC over x402 — no API keys, no subscriptions.
---

# Chat Completions

The Chat Completions API is OpenAI-compatible, making it easy to migrate existing code. Point your client at BlockRun, pick a model, and pay per request in USDC over x402.

## Endpoint

```
POST https://blockrun.ai/api/v1/chat/completions
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
| `model` | string | Yes | Model ID (e.g., `openai/gpt-5.5`) |
| `messages` | array | Yes | Array of message objects |
| `max_tokens` | integer | No | Maximum tokens to generate (default: 1024) |
| `temperature` | number | No | Sampling temperature (0-2) |
| `top_p` | number | No | Nucleus sampling parameter |

### Message Object

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | One of: `system`, `user`, `assistant` |
| `content` | string | The message content |

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

**Protocol naming convention:**
- **Claude native `/v1/messages`**: `usage.input_tokens`, `usage.output_tokens`, `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`
- **OpenAI-compat `/v1/chat/completions`**: `usage.prompt_tokens_details.cached_tokens` (reads), `usage.prompt_tokens_details.cached_creation_tokens` (writes), `usage.completion_tokens_details.reasoning_tokens` (reasoning)

**Enabling prompt caching on Anthropic models:**
Pass `"prompt_cache": true` in the request body, or embed `cache_control` blocks in your message content directly — both are honored.

:::note{title="No phantom identity tokens in your billed input"}
BlockRun does **not** prepend a hidden identity/system directive to your prompt by default. The `input_tokens` (`prompt_tokens`) you are billed for reflect exactly the messages you sent — there are no extra phantom input tokens added by the gateway.
:::

:::info{title="Claude-native context_management requires the anthropic-beta header"}
If you use the Claude-native `POST /v1/messages` endpoint with the `context_management` field, you **must** also send the matching `anthropic-beta` header. A `context_management` body without that header is rejected at the edge with a `400` (rather than silently ignored).
:::

:::note{title="Sampling params on Claude Opus 4.7 / 4.8"}
`temperature`, `top_p`, and `top_k` are **not honored** for `anthropic/claude-opus-4.7` and `anthropic/claude-opus-4.8` — these models reject sampling params upstream, so the gateway strips them so your request still succeeds (it does not fail). Set behavior through your prompt instead.
:::

### Payment Required (402)

When you first make a request without payment, you'll receive:

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {
    "amount": "0.001000",
    "currency": "USD",
    "breakdown": {
      "inputCost": "0.000012",
      "outputCost": "0.000600",
      "margin": "0%"
    }
  },
  "paymentInfo": {
    "network": "base",
    "asset": "USDC",
    "x402Version": 2
  }
}
```

The `X-Payment-Required` header contains the full payment requirements.

:::info{title="402 is the normal flow, not an error"}
The first request returns `402 Payment Required` with a price quote. Sign it and retry with the `PAYMENT-SIGNATURE` header to get your completion. The SDKs do this round-trip automatically.
:::

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
60+ chat models with live pricing — pick the right model and ID for your call.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes, error shapes, and how the SDKs surface payment failures.
:::

::::
