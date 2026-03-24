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
response = client.chat("openai/gpt-5.4", "Hello!")
print(response)
```

### TypeScript

```bash
npm install @blockrun/llm
```

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();
const response = await client.chat('openai/gpt-5.4', 'Hello!');
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
    response, _ := client.Chat("openai/gpt-5.4", "Hello!")
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
response = client.chat("openai/gpt-5.4", "Hello!")

# With options
response = client.chat(
    model="openai/gpt-5.4",
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

response = client.chat_messages("openai/gpt-5.4", messages)
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
client.chat("openai/gpt-5.4", prompt)
client.chat("openai/gpt-5.2", prompt)
client.chat("openai/o1", prompt)

# Anthropic
client.chat("anthropic/claude-opus-4.6", prompt)
client.chat("anthropic/claude-sonnet-4.6", prompt)

# Google
client.chat("google/gemini-3.1-pro", prompt)
client.chat("google/gemini-3-flash-preview", prompt)
client.chat("google/gemini-2.5-flash-lite", prompt)

# DeepSeek
client.chat("deepseek/deepseek-chat", prompt)
client.chat("deepseek/deepseek-reasoner", prompt)

# Moonshot
client.chat("moonshot/kimi-k2.5", prompt)
```

### Model Selection Tips

| Use Case | Recommended Model |
|----------|-------------------|
| General purpose | `openai/gpt-5.4` |
| Cheapest | `google/gemini-2.5-flash-lite` or `nvidia/gpt-oss-120b` (free) |
| Fastest | `google/gemini-3-flash-preview` |
| Best reasoning | `openai/o3` |
| Best for code | `openai/gpt-5.3-codex` or `anthropic/claude-sonnet-4.6` |
| Best quality | `anthropic/claude-opus-4.6` |

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
    response = client.chat("openai/gpt-5.4", prompt)
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
    response = await client.achat("openai/gpt-5.4", "Hello!")
    print(response)

asyncio.run(main())
```

### TypeScript

```typescript
const response = await client.chat('openai/gpt-5.4', 'Hello!');
```

## Streaming (Coming Soon)

```python
# Planned API
for chunk in client.chat_stream("openai/gpt-5.4", prompt):
    print(chunk, end="", flush=True)
```

## Session Budgets

Limit spending per session:

```python
client = LLMClient(session_budget=10.00)  # Max $10

# Will raise InsufficientBudgetError if exceeded
response = client.chat("openai/gpt-5.4", prompt)
```

## Batch Processing

```python
import asyncio

async def process_batch(items: list) -> list:
    tasks = [
        client.achat("deepseek/deepseek-chat", f"Process: {item}")
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
    model="openai/gpt-5.4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Direct HTTP

```bash
curl https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BLOCKRUN_WALLET_KEY" \
  -d '{
    "model": "openai/gpt-5.4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Pricing

Pay per request: provider cost + 5%.

| Model | Input/1M | Output/1M |
|-------|----------|-----------|
| GPT-5.4 | $2.63 | $15.75 |
| DeepSeek Chat | $0.29 | $0.44 |
| Gemini Flash | $0.32 | $2.63 |

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
