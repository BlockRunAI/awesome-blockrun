---
title: XRPL SDK (Python) — deprecated
description: The BlockRun XRPL SDK (pay-on-XRPL with RLUSD) is deprecated and its gateway is offline. Use Base or Solana for new integrations.
---

# XRPL SDK (Python)

:::danger{title="Deprecated — gateway offline"}
The XRPL pay-on-XRPL SDK (`blockrun-llm-xrpl`, RLUSD settlement on the XRP Ledger) has been **sunset**. As of 2026-08-29 the gateway it talks to, `https://xrpl.blockrun.ai/api`, no longer serves requests (`/v1/models` and `/v1/chat/completions` return HTTP 404), and the gateway repository [`BlockRunAI/blockrun-xrpl`](https://github.com/BlockRunAI/blockrun-xrpl) is archived on GitHub. The last SDK release is **0.2.0** (2026-06-25); there is no testnet mode — the gateway only ever ran against XRPL mainnet (`xrpl:0`). Calls made with this SDK will fail.

Use the [Python SDK](python.md) or [TypeScript SDK](typescript.md) on **Base** or **Solana** instead — same models, same API, actively maintained. Read-only XRP/XRPL access via [Multi-chain RPC](../api-reference/multi-chain-rpc.md) (`xrp` network) is unaffected and stays supported.

This page remains for reference for existing XRPL integrations. Everything below describes SDK 0.2.0 as shipped.
:::

The Python SDK for BlockRun on the XRP Ledger, using RLUSD for micropayments — pay per call, no API keys. It only covered chat (`/v1/chat/completions`); image, video and music generation were always Base-chain-only.

::::steps

:::step{title="Install"}
```bash
pip install blockrun-llm-xrpl   # 0.2.0, Python 3.9+
```
:::

:::step{title="Make your first call"}
```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient()  # Uses BLOCKRUN_XRPL_SEED from env
response = client.chat("openai/gpt-5.5", "Hello!")
print(response)
```

The SDK handles x402 payment with RLUSD automatically.
:::

::::

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BLOCKRUN_XRPL_SEED` | Your XRPL wallet seed (required unless passed to the constructor) |
| `BLOCKRUN_CHAT_TIMEOUT` | Default request timeout in seconds (default `600`; reasoning models can need 200–300s+) |

### Client Options

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient(
    seed="sEd...",                           # Wallet seed (or use env var)
    api_url="https://xrpl.blockrun.ai/api",  # Optional (offline — see banner)
    rpc_url="https://xrplcluster.com",       # XRPL RPC used for balance reads
    timeout=600.0                            # Request timeout in seconds
)
```

## How It Works

1. You send a request to BlockRun's XRPL API
2. The API returns `HTTP 402 Payment Required` with the price
3. The SDK automatically signs an RLUSD payment on XRPL
4. The request is retried with the payment proof
5. The t54.ai facilitator settles the payment on-chain
6. You receive the AI response

:::warning{title="Your seed stays local"}
Your seed never leaves your machine — it's only used for local signing. Never commit it to version control or share it in logs.
:::

## Methods

### `chat(model, message, system=None, max_tokens=1024, temperature=None)`

Simple one-line chat interface.

```python
response = client.chat(
    "openai/gpt-5.5",
    "Explain quantum computing",
    system="You are a physics teacher.",  # Optional system prompt
    max_tokens=500,                        # Optional max output (default 1024)
    temperature=0.7                        # Optional temperature
)
```

**Returns:** `str` - The assistant's response text

### `chat_completion(model, messages, max_tokens=1024, temperature=None, top_p=None)`

Full OpenAI-compatible chat completion.

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]

result = client.chat_completion(
    "openai/gpt-5.5",
    messages,
    max_tokens=100,
    temperature=0.7,
    top_p=0.9
)

print(result.choices[0].message.content)
print(f"Tokens used: {result.usage.total_tokens}")
```

**Returns:** `ChatResponse` object

### `get_balance()`

Get your RLUSD balance (read from `rpc_url`, so it works even while the gateway is offline).

```python
balance = client.get_balance()
print(f"RLUSD Balance: {balance}")
```

### `get_spending()`

Check how much you've spent in the current session.

```python
spending = client.get_spending()
print(f"Spent ${spending['total_usd']:.4f} across {spending['calls']} calls")
```

### `address`

The wallet address being used (a property, not a method).

```python
print(f"Paying from: {client.address}")
```

## Smart Routing (ClawRouter)

**Save up to 94% on LLM costs automatically.**

The `smart_chat()` method routes each request with a port of ClawRouter's 14-dimension rule-based classifier — token count, code presence, reasoning markers, technical and creative vocabulary, agentic patterns and more. Decisions run locally in <1ms — your prompts never leave your machine for routing, and no extra model call is made to decide.

:::note{title="Routing tables are frozen at 0.2.0"}
The model ids below are pinned inside SDK 0.2.0's `router.py` and were last synced in April 2026. Several (for example `moonshot/kimi-k2.5`, `xai/grok-4-1-fast-reasoning`, `google/gemini-3-pro-preview`, `nvidia/gpt-oss-120b`) are no longer in the live BlockRun catalog. They are documented here as shipped, not as recommendations.
:::

### Basic Usage

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient()

# Let ClawRouter pick the model automatically
result = client.smart_chat("What is 2+2?")

print(result.response)           # "4"
print(result.model)              # "moonshot/kimi-k2.5" (AUTO profile, SIMPLE tier)
print(result.routing.tier)       # "SIMPLE"
print(result.routing.savings)    # 0.94 (94% savings vs baseline)
```

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"free"` | Always uses free NVIDIA-hosted models | Development, testing |
| `"eco"` | Maximizes cost savings | Bulk processing |
| `"auto"` | Balances quality and cost (default) | Production workloads |
| `"premium"` | Always uses top-tier models | Critical tasks |

```python
# Force free models (great for development)
result = client.smart_chat(
    "Explain recursion",
    routing_profile="free"
)
print(result.model)  # "nvidia/gpt-oss-120b"

# Maximum savings mode
result = client.smart_chat(
    "Summarize this article: ...",
    routing_profile="eco"
)

# Premium mode for critical tasks
result = client.smart_chat(
    "Review this contract for legal issues...",
    routing_profile="premium"
)
print(result.model)  # "anthropic/claude-opus-4.5"
```

### 4-Tier Model Selection

ClawRouter classifies prompts into four tiers. Primary model per profile as pinned in 0.2.0:

| Tier | `auto` | `eco` | `premium` | `free` | Use Case |
|------|--------|-------|-----------|--------|----------|
| **SIMPLE** | moonshot/kimi-k2.5 | moonshot/kimi-k2.5 | google/gemini-2.5-flash | nvidia/gpt-oss-120b | Q&A, summaries, simple tasks |
| **MEDIUM** | xai/grok-code-fast-1 | deepseek/deepseek-chat | openai/gpt-4o | nvidia/deepseek-v3.2 | Analysis, writing, coding |
| **COMPLEX** | google/gemini-3-pro-preview | xai/grok-4-0709 | anthropic/claude-opus-4.5 | nvidia/qwen3-next-80b-a3b-thinking | Advanced reasoning, research |
| **REASONING** | xai/grok-4-1-fast-reasoning | deepseek/deepseek-reasoner | openai/o3 | nvidia/qwen3-next-80b-a3b-thinking | Math, logic, proofs |

### Routing Decision Details

```python
result = client.smart_chat("Prove that sqrt(2) is irrational")

# Access full routing decision
routing = result.routing
print(f"Model: {routing.model}")           # "xai/grok-4-1-fast-reasoning"
print(f"Tier: {routing.tier}")             # "REASONING"
print(f"Confidence: {routing.confidence}") # 0.97
print(f"Method: {routing.method}")         # "rules"
print(f"Reasoning: {routing.reasoning}")   # "Detected: math proof..."
print(f"Estimated cost: ${routing.cost_estimate:.4f}")
print(f"Baseline cost: ${routing.baseline_cost:.4f}")
print(f"Savings: {routing.savings:.0%}")   # "97%"
```

### Async Smart Routing

```python
import asyncio
from blockrun_llm_xrpl import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        result = await client.smart_chat(
            "What's the weather like?",
            routing_profile="eco"
        )
        print(result.response)

asyncio.run(main())
```

## Wallet Setup

### Create a New Wallet

```python
from blockrun_llm_xrpl import create_wallet

address, seed = create_wallet()
print(f"Address: {address}")
print(f"Seed: {seed}")  # Save this securely!
```

### Fund Your Wallet

::::steps

:::step{title="Get XRP for fees"}
Get XRP for transaction fees (~1 XRP is plenty).
:::

:::step{title="Set up a trust line"}
Set up a trust line to the RLUSD issuer (`rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De`, exported as `blockrun_llm_xrpl.RLUSD_ISSUER`).
:::

:::step{title="Acquire RLUSD"}
Acquire RLUSD from a DEX or exchange.
:::

:::step{title="Export your seed"}
Export your seed: `export BLOCKRUN_XRPL_SEED=sEd...`
:::

::::

### Secure Setup

```bash
# .env (add to .gitignore!)
BLOCKRUN_XRPL_SEED=sEd...your_seed_here
```

```python
# app.py
import os
from blockrun_llm_xrpl import LLMClient
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("BLOCKRUN_XRPL_SEED"):
    raise ValueError("BLOCKRUN_XRPL_SEED not set")

client = LLMClient()  # Reads from environment
```

### Balance Helpers

Standalone helpers that read the ledger directly (no gateway involved):

```python
from blockrun_llm_xrpl import get_xrp_balance, get_rlusd_balance, get_balances

print(get_xrp_balance(client.address))
print(get_rlusd_balance(client.address))
print(get_balances(client.address))   # {"xrp": ..., "rlusd": ...}
```

## Async Client

For async/await usage:

```python
import asyncio
from blockrun_llm_xrpl import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        # Single request
        response = await client.chat("openai/gpt-5.5", "Hello!")

        # Concurrent requests
        tasks = [
            client.chat("openai/gpt-5.5", "What is 2+2?"),
            client.chat("anthropic/claude-sonnet-4.6", "What is 3+3?"),
        ]
        responses = await asyncio.gather(*tasks)

asyncio.run(main())
```

## Error Handling

```python
from blockrun_llm_xrpl import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-5.5", "Hello!")
except PaymentError as e:
    print(f"Payment failed: {e}")
    # Check your RLUSD balance
except APIError as e:
    print(f"API error ({e.status_code}): {e}")
    print(f"Details: {e.response}")
```

## Response Types

### ChatResponse

```python
class ChatResponse:
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: Optional[ChatUsage]

class ChatChoice:
    index: int
    message: ChatMessage
    finish_reason: Optional[str]

class ChatMessage:
    role: Literal["system", "user", "assistant"]
    content: str

class ChatUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
```

### Smart Routing Types

```python
from blockrun_llm_xrpl import (
    RoutingDecision,   # model, tier, confidence, method, reasoning, cost_estimate, baseline_cost, savings
    SmartChatResponse, # response, model, routing
)
```

`routing_profile` is a plain string: `"free" | "eco" | "auto" | "premium"`; `tier` is `"SIMPLE" | "MEDIUM" | "COMPLEX" | "REASONING"`.

## Available Models

The XRPL gateway mirrored the main BlockRun catalog (last catalog sync in the gateway repo: 2026-06-06). Model ids were identical to the Base gateway's — see [Models Reference](../api-reference/models.md) for the live list and pricing. Ids current in the live catalog today include:

| Provider | Models |
|----------|--------|
| **OpenAI** | gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna, gpt-5.5, gpt-5.4, gpt-5.4-pro, gpt-5.2, gpt-5.4-mini, gpt-5-mini, gpt-5.4-nano, o1, o3, o3-mini |
| **Anthropic** | claude-fable-5, claude-opus-5, claude-opus-4.8, claude-opus-4.7, claude-sonnet-5, claude-sonnet-4.6, claude-haiku-4.5 |
| **Google** | gemini-3.1-pro, gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite |
| **xAI** | grok-4.3, grok-4.5, grok-build-0.1 |
| **DeepSeek** | deepseek-chat, deepseek-reasoner, deepseek-v4-pro |
| **FREE tier** | nemotron-3-ultra-550b, nemotron-3.5-lightning, nemotron-3-nano-30b, nemotron-3-nano-omni-30b-a3b-reasoning, llama-3.2-11b-vision, north-mini-code, laguna-xs-2.1 |

See [Intelligence Pricing](../products/intelligence/pricing.md) for full pricing details.

## Why XRPL?

- **Instant settlement**: Transactions confirm in 3-5 seconds
- **Low fees**: ~0.00001 XRP per transaction
- **RLUSD**: Ripple's regulated stablecoin with enterprise compliance
- **Non-custodial**: Your seed stays on your machine

## Security

- **Seed stays local**: Your seed is only used for signing on your machine
- **No custody**: BlockRun never holds your funds
- **Verify transactions**: All payments are on-chain and verifiable on XRPL
- **Input validation**: All inputs are validated before API requests

## Links

- **PyPI**: [blockrun-llm-xrpl](https://pypi.org/project/blockrun-llm-xrpl/)
- **GitHub**: [github.com/BlockRunAI/blockrun-llm-xrpl](https://github.com/BlockRunAI/blockrun-llm-xrpl)
- **Gateway (archived)**: [github.com/BlockRunAI/blockrun-xrpl](https://github.com/BlockRunAI/blockrun-xrpl)
- **XRPL Explorer**: [xrpscan.com](https://xrpscan.com)

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet with USDC and make your first paid call in under five minutes.
:::

:::card{title="Models & pricing" href="../api-reference/models.md" icon="Brain"}
Browse all 74 models with live pricing to pick the right one for each call.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, on-chain settlement, and why there are no API keys.
:::

::::
