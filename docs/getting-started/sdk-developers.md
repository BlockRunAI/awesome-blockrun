# SDK Developers

Direct API integration with Python, TypeScript, or Go.

This guide is for developers who want to integrate BlockRun directly into their applications using our SDKs.

## Quick Start

### Python

```bash
pip install blockrun-llm
```

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Uses BLOCKRUN_WALLET_KEY env var
response = client.chat("openai/gpt-4o", "Hello!")
print(response)
```

### TypeScript

```bash
npm install @blockrun/llm
```

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();
const response = await client.chat('openai/gpt-4o', 'Hello!');
console.log(response);
```

### Go

```bash
go get github.com/blockrunai/blockrun-llm-go
```

```go
package main

import (
    "fmt"
    blockrun "github.com/blockrunai/blockrun-llm-go"
)

func main() {
    client := blockrun.NewClient("")
    response, _ := client.Chat("openai/gpt-4o", "Hello!")
    fmt.Println(response)
}
```

## Configuration

### Environment Variables

```bash
# Required: Your wallet private key
export BLOCKRUN_WALLET_KEY=0x...

# Optional: Custom wallet path
export BLOCKRUN_WALLET_PATH=~/.blockrun/wallet.json

# Optional: API endpoint (default: https://blockrun.ai/api)
export BLOCKRUN_API_URL=https://blockrun.ai/api
```

### Programmatic Configuration

```python
client = LLMClient(
    private_key="0x...",           # Or use env var
    api_url="https://blockrun.ai/api",
    session_budget=10.00           # Optional spending limit
)
```

## API Methods

### Chat Completion

```python
# Simple
response = client.chat("openai/gpt-4o", "Hello!")

# With options
response = client.chat(
    model="openai/gpt-4o",
    prompt="Explain quantum computing",
    temperature=0.7,
    max_tokens=1000
)
```

### Chat with Messages

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is x402?"}
]

response = client.chat_messages("openai/gpt-4o", messages)
```

### Image Generation

```python
image_url = client.generate_image(
    prompt="A futuristic city at sunset",
    model="dall-e-3",
    size="1024x1024"
)
```

### Wallet Operations

```python
# Get address
address = client.get_address()

# Check balance
balance = client.get_balance()
print(f"${balance} USDC")

# Get usage stats
usage = client.get_usage()
print(f"Spent: ${usage['total_spent']}")
```

## Available Models

### By Provider

```python
# OpenAI
client.chat("openai/gpt-5.2", prompt)
client.chat("openai/gpt-4o", prompt)
client.chat("openai/o1", prompt)

# Anthropic
client.chat("anthropic/claude-opus-4", prompt)
client.chat("anthropic/claude-sonnet-4", prompt)

# Google
client.chat("google/gemini-3-pro", prompt)
client.chat("google/gemini-2.5-flash", prompt)

# DeepSeek
client.chat("deepseek/deepseek-v3", prompt)
client.chat("deepseek/deepseek-r1", prompt)

# xAI
client.chat("xai/grok-4-fast", prompt)
```

### Model Selection Tips

| Use Case | Recommended Model |
|----------|-------------------|
| General purpose | `openai/gpt-4o` |
| Cheapest | `deepseek/deepseek-v3` |
| Fastest | `google/gemini-2.5-flash` |
| Best reasoning | `openai/o1` |
| Real-time X data | `xai/grok-4-fast` |
| Best for code | `anthropic/claude-sonnet-4` |

## Error Handling

```python
from blockrun_llm import (
    LLMClient,
    InsufficientBalanceError,
    ModelNotFoundError,
    RateLimitError,
    APIError
)

try:
    response = client.chat("openai/gpt-4o", prompt)
except InsufficientBalanceError:
    print("Need to fund wallet")
    print(f"Address: {client.get_address()}")
except ModelNotFoundError as e:
    print(f"Invalid model: {e.model}")
except RateLimitError:
    print("Too many requests, waiting...")
    time.sleep(60)
except APIError as e:
    print(f"API error: {e.message}")
```

## Async Support

### Python

```python
import asyncio

async def main():
    response = await client.achat("openai/gpt-4o", "Hello!")
    print(response)

asyncio.run(main())
```

### TypeScript

```typescript
const response = await client.chat('openai/gpt-4o', 'Hello!');
```

## Streaming (Coming Soon)

```python
# Planned API
for chunk in client.chat_stream("openai/gpt-4o", prompt):
    print(chunk, end="", flush=True)
```

## Session Budgets

Limit spending per session:

```python
client = LLMClient(session_budget=10.00)  # Max $10

# Will raise InsufficientBudgetError if exceeded
response = client.chat("openai/gpt-4o", prompt)
```

## Batch Processing

```python
import asyncio

async def process_batch(items: list) -> list:
    tasks = [
        client.achat("deepseek/deepseek-v3", f"Process: {item}")
        for item in items
    ]
    return await asyncio.gather(*tasks)

results = asyncio.run(process_batch(my_items))
```

## OpenAI-Compatible API

BlockRun's API is OpenAI-compatible. You can use the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://blockrun.ai/api/v1",
    api_key=os.environ["BLOCKRUN_WALLET_KEY"]
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Direct HTTP

```bash
curl https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BLOCKRUN_WALLET_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Pricing

Pay per request: provider cost + 5%.

| Model | Input/1M | Output/1M |
|-------|----------|-----------|
| GPT-4o | $2.63 | $10.50 |
| DeepSeek V3 | $0.15 | $0.29 |
| Gemini Flash | $0.08 | $0.32 |

Full pricing: [Intelligence Pricing](../products/intelligence/pricing.md)

## SDK Documentation

- [Python SDK](../sdks/python.md)
- [TypeScript SDK](../sdks/typescript.md)
- [Go SDK](../sdks/go.md)

## API Reference

- [Chat Completions](../api-reference/chat-completions.md)
- [Image Generation](../api-reference/image-generation.md)
- [Models](../api-reference/models.md)
- [Error Handling](../api-reference/errors.md)

## Next Steps

- [Wallet Setup](wallet-setup.md)
- [Models Reference](../api-reference/models.md)
- [Pricing](../products/intelligence/pricing.md)
