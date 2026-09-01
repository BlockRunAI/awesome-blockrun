---
title: Agent Developers
description: Build AI agents that pay for their own intelligence — 74 models via x402 micropayments. Use Franklin, the SDKs, or the MCP; integrate with frameworks if you already use one.
---

# Agent Developers

Build AI agents that pay for their own intelligence.

This guide is for agent developers. The primary paths are **[Franklin](../products/franklin.md)** (our autonomous agent), the **[SDKs](../sdks/python.md)**, and the **[BlockRun MCP](../mcp/blockrun-mcp.md)** — all on one wallet, 74 models via x402 micropayments. Already using a framework (ElizaOS, AgentKit, GOAT, LangChain)? See [Community integrations](../frameworks/elizaos.md).

:::tip{title="Fastest path: Franklin"}
Want an agent that already spends autonomously? [Franklin](../products/franklin.md) is one install (`npm install -g @blockrun/franklin`) and runs free out of the box — fund a wallet to unlock everything.
:::

## Why BlockRun for Agents?

| Traditional | With BlockRun |
|-------------|---------------|
| Manage API keys for each provider | One wallet for all models |
| Prepaid credits or subscriptions | Pay-per-request |
| Credential rotation headaches | Just fund and go |
| Complex billing reconciliation | On-chain transparency |

## Quick Start

Install the SDK for your language:

::::tabs
:::tab{label="Python"}
```bash
pip install blockrun-llm
```
:::
:::tab{label="TypeScript"}
```bash
npm install @blockrun/llm
```
:::
::::

Then set up a wallet and make your first call:

::::steps

:::step{title="Set up the wallet"}
```python
from blockrun_llm import setup_agent_wallet

client = setup_agent_wallet()  # Creates ~/.blockrun/.session if none exists, prints a funding QR
print(f"Wallet address: {client.get_wallet_address()}")
```

Fund this address with USDC on Base network. (Solana: `pip install "blockrun-llm[solana]"` and `setup_agent_solana_wallet()`.)
:::

:::step{title="Use any model"}
```python
# OpenAI
response = client.chat("openai/gpt-5.4", "Analyze this market data...")

# Anthropic
response = client.chat("anthropic/claude-sonnet-4.6", "Review this code...")

# DeepSeek (~20x cheaper)
response = client.chat("deepseek/deepseek-chat", "Summarize these documents...")
```
:::

::::

## Framework Integrations

| Framework | Status | Guide |
|-----------|--------|-------|
| [ElizaOS](../frameworks/elizaos.md) | Released | Full plugin |
| [AgentKit](../frameworks/agentkit.md) | Compatible | SDK integration |
| [GOAT SDK](../frameworks/goat.md) | In Review | Planned plugin |
| [LangChain](../frameworks/langchain.md) | Available | LiteLLM adapter or custom LLM class |

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Your Agent Framework               │
│         (ElizaOS, AgentKit, LangChain)          │
├─────────────────────────────────────────────────┤
│               BlockRun SDK                       │
│         (Handles x402 payments)                 │
├─────────────────────────────────────────────────┤
│               BlockRun API                       │
│         (Routes to providers)                   │
├─────────────────────────────────────────────────┤
│            AI Providers                          │
│   OpenAI • Anthropic • Google • DeepSeek • ...  │
└─────────────────────────────────────────────────┘
```

## Common Patterns

### Multi-Model Decision Making

Get multiple perspectives on important decisions:

```python
def get_consensus(question: str) -> str:
    models = [
        "openai/gpt-5.4",
        "anthropic/claude-sonnet-4.6",
        "deepseek/deepseek-chat"
    ]

    opinions = []
    for model in models:
        response = client.chat(model, question)
        opinions.append(f"{model}: {response}")

    # Synthesize
    return client.chat(
        "openai/gpt-5.4",
        f"Synthesize these opinions:\n{chr(10).join(opinions)}"
    )
```

### Cost-Optimized Routing

Use cheap models for routine tasks, premium for important ones:

```python
def smart_route(task: str, importance: str) -> str:
    if importance == "high":
        model = "openai/gpt-5.4"  # $2.50/M
    elif importance == "medium":
        model = "anthropic/claude-haiku-4.5"  # $1.00/M
    else:
        model = "deepseek/deepseek-chat"  # $0.14/M

    return client.chat(model, task)
```

Or let the SDK's built-in router classify each request locally and pick the cheapest capable model, with a fallback chain walked on 429/5xx:

```python
result = client.smart_chat(task)                      # routing_profile: "auto" | "eco" | "premium" | "free"
print(result.model, result.routing.tier, result.routing.savings)

# Same thing from any chat call — one string change
client.chat("blockrun/auto", task)
```

### Spend Limits

Cap what an agent session can sign for. A quote above the ceiling is refused *before* payment, so nothing settles:

```python
from blockrun_llm import LLMClient, SpendLimitError

client = LLMClient(max_cost_per_call=0.50, max_session_cost=10.00)  # or BLOCKRUN_MAX_* env vars

try:
    response = client.chat("openai/o1", expensive_prompt)
except SpendLimitError:
    # Fallback to cheaper model
    response = client.chat("deepseek/deepseek-chat", expensive_prompt)
```

### Async Operations

For high-throughput agents:

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

## Available Models

### Speed-Optimized
- `google/gemini-3-flash-preview` — Fastest with thinking mode
- `google/gemini-3.1-flash-lite` — Ultra-fast and cheapest
- `anthropic/claude-haiku-4.5` — Fast, good quality

### Cost-Optimized
- `google/gemini-2.5-flash-lite` — Best value ($0.10/$0.40 per 1M)
- `deepseek/deepseek-chat` — Great value ($0.14/$0.28 per 1M)
- `nvidia/nemotron-3.5-lightning` — Free (open-weight)

### Quality-Optimized
- `openai/gpt-5.4` — Best all-around
- `anthropic/claude-opus-5` — Best for nuanced tasks

### Reasoning
- `openai/o3` — Advanced reasoning
- `openai/o1` — Complex logic
- `deepseek/deepseek-reasoner` — Cheaper reasoning

Full list: [Models Reference](../api-reference/models.md)

## Pricing

Pay only for what you use, at the per-token price in the live catalog (`client.list_models()` or `GET https://blockrun.ai/api/v1/models`).

Example costs per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| `deepseek/deepseek-chat` | $0.14 | $0.28 |
| `openai/gpt-5.4` | $2.50 | $15.00 |
| `anthropic/claude-opus-5` | $5.00 | $25.00 |

Full pricing: [Intelligence Pricing](../products/intelligence/pricing.md)

## Wallet Management

### Environment Variable

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

### Programmatic

```python
from blockrun_llm import LLMClient, setup_agent_wallet

# Create new (or load the existing ~/.blockrun/.session)
client = setup_agent_wallet()

# Use existing key
client = LLMClient(private_key="0x...")   # LLMClient() alone raises ValueError if no wallet is configured

# Check balance
balance = client.get_balance()
print(f"${balance} USDC")

# Get address to fund
print(client.get_wallet_address())
```

### Security

- Private key stored locally (`~/.blockrun/.session`, mode 0600; Solana: `~/.blockrun/.solana-session`)
- Only signatures sent to API
- All payments verifiable on [Basescan](https://basescan.org)
- A failed paid request is never retried with a second payment — the SDK refuses to advance its fallback chain once a signature has gone out

:::warning
Never commit `BLOCKRUN_WALLET_KEY` to git or share your private key. Use a dedicated agent wallet funded with only what the session needs.
:::

## Error Handling

```python
from blockrun_llm import (
    LLMClient,
    PaymentError,
    SpendLimitError,
    APIError,
)

try:
    response = client.chat(model, prompt)
except SpendLimitError:
    print("Over the agent's spend limit — nothing was charged")
except PaymentError:
    print("Need to fund wallet")
except APIError as e:
    if e.status_code == 429:
        print("Too many requests, backing off")
    else:
        print(f"API error {e.status_code}: {e}")   # e.g. unknown model id
```

## Best Practices

1. **Start with cheap models** — Test with DeepSeek before using GPT-4o
2. **Set session budgets** — Prevent runaway spending
3. **Use async for batch operations** — Better throughput
4. **Monitor balance** — Set up alerts when low
5. **Log model usage** — Track costs per task type

## What's next?

::::cards

:::card{title="ElizaOS Integration" href="../frameworks/elizaos.md" icon="Boxes"}
Drop the BlockRun plugin into an ElizaOS agent.
:::

:::card{title="SDK reference" href="sdk-developers.md" icon="Code"}
Full Python, TypeScript, and Go SDK APIs, config, and error handling.
:::

:::card{title="Set up your wallet" href="wallet-setup.md" icon="Wallet"}
Fund on Base or Solana, manage budgets, and understand settlement.
:::

::::
