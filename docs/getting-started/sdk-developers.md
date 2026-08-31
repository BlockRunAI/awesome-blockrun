---
title: SDK Developers
description: Integrate BlockRun directly with the Python, TypeScript, or Go SDKs — chat, images, wallet ops, async, and an OpenAI-compatible API.
---

# SDK Developers

Direct API integration with Python, TypeScript, or Go.

This guide is for developers who want to integrate BlockRun directly into their applications using our SDKs.

:::note{title="What you need"}
A wallet private key in `BLOCKRUN_WALLET_KEY`, a wallet file at `~/.blockrun/.session`, or one created for you by `setup_agent_wallet()` — funded with a few dollars of USDC on Base (or Solana). See [Wallet Setup](wallet-setup.md).
:::

## Quick Start

::::tabs

:::tab{label="Python"}
```bash
pip install blockrun-llm              # add [solana] for USDC on Solana
```

```python
from blockrun_llm import LLMClient

client = LLMClient()  # BLOCKRUN_WALLET_KEY env var or ~/.blockrun/.session
response = client.chat("openai/gpt-5.4", "Hello!")
print(response)
```
:::

:::tab{label="TypeScript"}
```bash
npm install @blockrun/llm
```

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();
const response = await client.chat('openai/gpt-5.4', 'Hello!');
console.log(response);
```
:::

:::tab{label="Go"}
```bash
go get github.com/BlockRunAI/blockrun-llm-go
```

```go
package main

import (
    "context"
    "fmt"
    blockrun "github.com/BlockRunAI/blockrun-llm-go"
)

func main() {
    client, _ := blockrun.NewLLMClient("") // "" reads BLOCKRUN_WALLET_KEY
    response, _ := client.Chat(context.Background(), "openai/gpt-5.4", "Hello!")
    fmt.Println(response)
}
```
:::

::::

## Configuration

### Environment Variables

```bash
# Your Base wallet private key (falls back to ~/.blockrun/.session if unset)
export BLOCKRUN_WALLET_KEY=0x...

# Solana instead: bs58 key for SolanaLLMClient (falls back to ~/.blockrun/.solana-session)
export SOLANA_WALLET_KEY=...

# Optional: API endpoint (default: https://blockrun.ai/api)
export BLOCKRUN_API_URL=https://blockrun.ai/api

# Optional: client-side spend limits in USD (refused before any payment is signed)
export BLOCKRUN_MAX_COST_PER_CALL=0.25
export BLOCKRUN_MAX_SESSION_COST=10

# Optional: chat timeout in seconds (default 600) and a per-call transaction log
export BLOCKRUN_CHAT_TIMEOUT=600
export BLOCKRUN_TX_LOG=1
```

### Programmatic Configuration

```python
client = LLMClient(
    private_key="0x...",                # Or use env var / wallet file
    api_url="https://blockrun.ai/api",
    max_cost_per_call=0.25,             # Optional USD ceiling per request
    max_session_cost=10.00,             # Optional USD ceiling per client session
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

result = client.chat_completion("openai/gpt-5.4", messages)
print(result.choices[0].message.content)
```

`chat_completion()` also takes `tools` / `tool_choice`, `response_format`, `stop` and `fallback_models`.

### Smart Routing

Let Router Core pick the cheapest capable model and keep the rest as a fallback chain — or opt in from any chat call with the `blockrun/auto` virtual model id:

```python
result = client.smart_chat("Summarize this changelog in one line")
print(result.model, result.routing.savings)

result = client.chat_completion("blockrun/auto", messages)   # also blockrun/eco, blockrun/premium
```

### Image Generation

Media lives in dedicated clients that share the same wallet resolution:

```python
from blockrun_llm import ImageClient

img = ImageClient()
res = img.generate("A futuristic city at sunset", model="google/nano-banana", size="1024x1024")
print(res.data[0].url)
```

`VideoClient`, `MusicClient`, `SpeechClient`, `SearchClient`, `PriceClient`, `RpcClient` and more follow the same pattern — see the [Python SDK reference](../sdks/python.md#specialized-clients).

### Wallet Operations

```python
# Get address
address = client.get_wallet_address()

# Check balance
balance = client.get_balance()
print(f"${balance} USDC")

# Session spend
spent = client.get_spending()
print(f"Spent: ${spent['total_usd']:.4f} across {spent['calls']} calls")
```

## Available Models

### By Provider

```python
# OpenAI
client.chat("openai/gpt-5.4", prompt)
client.chat("openai/gpt-5.2", prompt)
client.chat("openai/o1", prompt)

# Anthropic
client.chat("anthropic/claude-opus-5", prompt)
client.chat("anthropic/claude-sonnet-4.6", prompt)

# Google
client.chat("google/gemini-3.1-pro", prompt)
client.chat("google/gemini-3-flash-preview", prompt)
client.chat("google/gemini-2.5-flash-lite", prompt)

# DeepSeek
client.chat("deepseek/deepseek-chat", prompt)
client.chat("deepseek/deepseek-reasoner", prompt)

# Moonshot
client.chat("moonshot/kimi-k3", prompt)
```

### Model Selection Tips

| Use Case | Recommended Model |
|----------|-------------------|
| General purpose | `openai/gpt-5.4` |
| Cheapest | `google/gemini-2.5-flash-lite` or `nvidia/nemotron-3.5-lightning` (free) |
| Fastest | `google/gemini-3-flash-preview` |
| Best reasoning | `openai/o3` |
| Best for code | `openai/gpt-5.3-codex` or `anthropic/claude-sonnet-4.6` |
| Best quality | `anthropic/claude-opus-5` |

## Error Handling

```python
from blockrun_llm import (
    LLMClient,
    PaymentError,
    SpendLimitError,
    APIError,
)

try:
    response = client.chat("openai/gpt-5.4", prompt)
except SpendLimitError as e:
    print(f"Quote ${e.quoted_usd} over your {e.scope} limit ${e.limit_usd} — nothing was charged")
except PaymentError as e:
    print(f"Payment failed: {e}")            # e.g. insufficient USDC
    print(f"Fund: {client.get_wallet_address()}")
except APIError as e:
    if e.status_code == 429:
        print("Too many requests, backing off")
    else:
        print(f"API error {e.status_code}: {e}")
```

`SpendLimitError` subclasses `PaymentError`; every SDK exception derives from `BlockrunError`. A 429 or 5xx walks `fallback_models` automatically when you pass one.

## Async Support

::::tabs

:::tab{label="Python"}
```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        response = await client.chat("openai/gpt-5.4", "Hello!")
        print(response)

asyncio.run(main())
```
:::

:::tab{label="TypeScript"}
```typescript
const response = await client.chat('openai/gpt-5.4', 'Hello!');
```
:::

::::

## Streaming

```python
for chunk in client.chat_completion_stream("openai/gpt-5.4", [{"role": "user", "content": prompt}]):
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="", flush=True)
```

Payment is signed once before the stream opens; `AsyncLLMClient` exposes the same method for `async for`.

## Spend Limits

Cap spending per request or per client session — a quote above the ceiling is refused before anything is signed, so nothing settles:

```python
from blockrun_llm import LLMClient, SpendLimitError

client = LLMClient(max_cost_per_call=0.25, max_session_cost=10.00)

try:
    response = client.chat("openai/gpt-5.4", prompt)
except SpendLimitError as e:
    print(e.scope, e.quoted_usd, e.limit_usd)
```

## Batch Processing

```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def process_batch(items: list) -> list:
    async with AsyncLLMClient() as client:
        tasks = [
            client.chat("deepseek/deepseek-chat", f"Process: {item}")
            for item in items
        ]
        return await asyncio.gather(*tasks)

results = asyncio.run(process_batch(my_items))
```

## OpenAI-Compatible API

BlockRun's request and response shapes are OpenAI-compatible, but authentication is an x402 payment, not a bearer token — a paid model answers `402 Payment Required` until a signed USDC authorization is attached, and your private key must never be sent as an API key. Two ways to keep the official SDK surface:

- **Free models** need no payment, so the plain `openai` SDK works against `https://blockrun.ai/api/v1` with any placeholder `api_key` for `nvidia/*` free models (per-IP rate limits apply).
- **Paid models**: use `blockrun-llm` (`AnthropicClient` wraps the official `anthropic` SDK; `pip install "blockrun-llm[anthropic]"`), or [`blockrun-llm-vip`](https://pypi.org/project/blockrun-llm-vip/), which subclasses the official `anthropic` and `openai` SDKs and only swaps the transport to add x402 signing.

```python
from blockrun_llm_vip import OpenAI   # pip install blockrun-llm-vip

client = OpenAI()                     # wallet from BLOCKRUN_WALLET_KEY / ~/.blockrun/.session
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Direct HTTP

A free model can be called with plain HTTP and no credentials:

```bash
curl https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/nemotron-3.5-lightning",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

A paid model returns `402` with the price and a `payment-required` header describing what to sign; see [How payment works](../x402/how-it-works.md) if you want to implement the x402 handshake yourself rather than use an SDK.

## Pricing

Pay per request at the per-token price listed in the live catalog (`GET https://blockrun.ai/api/v1/models`, or `client.list_models()`).

| Model | Input/1M | Output/1M |
|-------|----------|-----------|
| `openai/gpt-5.4` | $2.50 | $15.00 |
| `deepseek/deepseek-chat` | $0.14 | $0.28 |
| `google/gemini-2.5-flash` | $0.30 | $2.50 |

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

## What's next?

::::cards

:::card{title="Set up your wallet" href="wallet-setup.md" icon="Wallet"}
Fund on Base or Solana, configure keys, and run on testnet.
:::

:::card{title="Models reference" href="../api-reference/models.md" icon="Brain"}
Every model ID, context window, and live price.
:::

:::card{title="Pricing" href="../products/intelligence/pricing.md" icon="TrendingUp"}
Per-token prices from the live catalog, no subscriptions or minimums.
:::

::::
