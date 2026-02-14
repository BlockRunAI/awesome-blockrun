# XRPL SDK (Python)

The official Python SDK for BlockRun on the XRP Ledger, using RLUSD for micropayments.

## Installation

```bash
pip install blockrun-llm-xrpl
```

## Quick Start

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient()  # Uses BLOCKRUN_XRPL_SEED from env
response = client.chat("openai/gpt-4o", "Hello!")
print(response)
```

That's it. The SDK handles x402 payment with RLUSD automatically.

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BLOCKRUN_XRPL_SEED` | Your XRPL wallet seed |

### Client Options

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient(
    seed="sEd...",                           # Wallet seed (or use env var)
    api_url="https://xrpl.blockrun.ai/api",  # Optional
    timeout=60.0                             # Request timeout in seconds
)
```

## How It Works

1. You send a request to BlockRun's XRPL API
2. The API returns `HTTP 402 Payment Required` with the price
3. The SDK automatically signs an RLUSD payment on XRPL
4. The request is retried with the payment proof
5. The t54.ai facilitator settles the payment on-chain
6. You receive the AI response

**Your seed never leaves your machine** — it's only used for local signing.

## Methods

### `chat(model, prompt, **options)`

Simple one-line chat interface.

```python
response = client.chat(
    "openai/gpt-4o",
    "Explain quantum computing",
    system="You are a physics teacher.",  # Optional system prompt
    max_tokens=500,                        # Optional max output
    temperature=0.7                        # Optional temperature
)
```

**Returns:** `str` - The assistant's response text

### `chat_completion(model, messages, **options)`

Full OpenAI-compatible chat completion.

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]

result = client.chat_completion(
    "openai/gpt-4o",
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

Get your RLUSD balance.

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

### `get_wallet_address()`

Get the wallet address being used.

```python
address = client.get_wallet_address()
print(f"Paying from: {address}")
```

## Smart Routing (ClawRouter)

**Save up to 94% on LLM costs automatically.**

The `smart_chat()` method uses ClawRouter's 14-dimension scoring algorithm to route each request to the optimal model. Routing decisions run locally in <1ms — your prompts never leave your machine for routing.

### Basic Usage

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient()

# Let ClawRouter pick the best model automatically
result = client.smart_chat("What is 2+2?")

print(result.response)           # "4"
print(result.model)              # "nvidia/kimi-k2.5" (cheap model)
print(result.routing.tier)       # "SIMPLE"
print(result.routing.savings)    # 0.94 (94% savings vs baseline)
```

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"free"` | Always uses free NVIDIA models | Development, testing |
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

ClawRouter classifies prompts into four tiers:

| Tier | Models | Use Case |
|------|--------|----------|
| **SIMPLE** | Kimi K2.5, DeepSeek | Q&A, summaries, simple tasks |
| **MEDIUM** | Grok Code, GPT-4o | Analysis, writing, coding |
| **COMPLEX** | Gemini 3 Pro, Claude Opus | Advanced reasoning, research |
| **REASONING** | Grok 4.1, DeepSeek-R1 | Math, logic, proofs |

### Routing Decision Details

```python
result = client.smart_chat("Prove that sqrt(2) is irrational")

# Access full routing decision
routing = result.routing
print(f"Model: {routing.model}")           # "xai/grok-4-1-fast-reasoning"
print(f"Tier: {routing.tier}")             # "REASONING"
print(f"Confidence: {routing.confidence}") # 0.97
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

1. Get XRP for transaction fees (~1 XRP is plenty)
2. Set up a trust line to the RLUSD issuer
3. Acquire RLUSD from a DEX or exchange
4. Export your seed: `export BLOCKRUN_XRPL_SEED=sEd...`

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

## Async Client

For async/await usage:

```python
import asyncio
from blockrun_llm_xrpl import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        # Single request
        response = await client.chat("openai/gpt-4o", "Hello!")

        # Concurrent requests
        tasks = [
            client.chat("openai/gpt-4o", "What is 2+2?"),
            client.chat("anthropic/claude-sonnet-4", "What is 3+3?"),
        ]
        responses = await asyncio.gather(*tasks)

asyncio.run(main())
```

## Error Handling

```python
from blockrun_llm_xrpl import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-4o", "Hello!")
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
    usage: ChatUsage

class ChatChoice:
    index: int
    message: ChatMessage
    finish_reason: str

class ChatMessage:
    role: str
    content: str

class ChatUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
```

### Smart Routing Types

```python
from blockrun_llm_xrpl import (
    RoutingProfile,    # Literal["free", "eco", "auto", "premium"]
    RoutingTier,       # Literal["SIMPLE", "MEDIUM", "COMPLEX", "REASONING"]
    RoutingDecision,   # Full routing details
    SmartChatResponse, # Response + model + routing
)
```

## Available Models

All models from BlockRun Intelligence are available:

| Provider | Models |
|----------|--------|
| **OpenAI** | gpt-5.2, gpt-5-mini, gpt-4o, gpt-4o-mini, o1, o3, o4-mini |
| **Anthropic** | claude-opus-4.5, claude-opus-4, claude-sonnet-4, claude-haiku-4.5 |
| **Google** | gemini-3-pro-preview, gemini-2.5-pro, gemini-2.5-flash |
| **xAI** | grok-4.1, grok-4, grok-3, grok-3-fast, grok-code-fast-1 |
| **DeepSeek** | deepseek-chat, deepseek-reasoner |
| **NVIDIA** | gpt-oss-120b (FREE), kimi-k2.5 |

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
- **XRPL Explorer**: [xrpscan.com](https://xrpscan.com)
