# Chat Completions

The Chat Completions API is OpenAI-compatible, making it easy to migrate existing code.

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
| `model` | string | Yes | Model ID (e.g., `openai/gpt-4o`) |
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
  "model": "gpt-4o",
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

## Example

### Using cURL

```bash
# Step 1: Get price (will return 402)
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Step 2: Sign payment and retry (SDK handles this automatically)
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Using the SDK

**Python:**
```python
from blockrun_llm import LLMClient

client = LLMClient()

# Simple chat
response = client.chat("openai/gpt-4o", "Hello!")

# Full completion with options
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]
result = client.chat_completion(
    "openai/gpt-4o",
    messages,
    max_tokens=100,
    temperature=0.7
)
print(result.choices[0].message.content)
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Simple chat
const response = await client.chat('openai/gpt-4o', 'Hello!');

// Full completion with options
const messages = [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'What is 2+2?' }
];
const result = await client.chatCompletion('openai/gpt-4o', messages, {
  maxTokens: 100,
  temperature: 0.7
});
console.log(result.choices[0].message.content);
```
