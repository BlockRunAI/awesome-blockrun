# Agent Developers

Build AI agents that pay for their own intelligence.

This guide is for developers using agent frameworks like ElizaOS, AgentKit, GOAT SDK, or LangChain. BlockRun provides the intelligence layer — 33+ AI models via x402 micropayments.

## Why BlockRun for Agents?

| Traditional | With BlockRun |
|-------------|---------------|
| Manage API keys for each provider | One wallet for all models |
| Prepaid credits or subscriptions | Pay-per-request |
| Credential rotation headaches | Just fund and go |
| Complex billing reconciliation | On-chain transparency |

## Quick Start

### 1. Install the SDK

```bash
# Python
pip install blockrun-llm

# TypeScript
npm install @blockrun/llm
```

### 2. Setup Wallet

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Creates wallet if none exists
print(f"Wallet address: {client.get_address()}")
```

Fund this address with USDC on Base network.

### 3. Use Any Model

```python
# OpenAI
response = client.chat("openai/gpt-5.4", "Analyze this market data...")

# Anthropic
response = client.chat("anthropic/claude-sonnet-4.6", "Review this code...")

# DeepSeek (50x cheaper)
response = client.chat("deepseek/deepseek-chat", "Summarize these documents...")
```

## Framework Integrations

| Framework | Status | Guide |
|-----------|--------|-------|
| [ElizaOS](../frameworks/elizaos.md) | Released | Full plugin |
| [AgentKit](../frameworks/agentkit.md) | Compatible | SDK integration |
| [GOAT SDK](../frameworks/goat.md) | In Review | Planned plugin |
| [LangChain](../frameworks/langchain.md) | Planned | Custom LLM class |

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
        model = "deepseek/deepseek-chat"  # $0.28/M

    return client.chat(model, task)
```

### Session Budgets

Limit spending per agent session:

```python
client = LLMClient(session_budget=10.00)  # Max $10

try:
    response = client.chat("openai/o1", expensive_prompt)
except InsufficientBudgetError:
    # Fallback to cheaper model
    response = client.chat("deepseek/deepseek-chat", expensive_prompt)
```

### Async Operations

For high-throughput agents:

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

## Available Models

### Speed-Optimized
- `google/gemini-3-flash-preview` — Fastest with thinking mode
- `google/gemini-3.1-flash-lite` — Ultra-fast and cheapest
- `anthropic/claude-haiku-4.5` — Fast, good quality

### Cost-Optimized
- `google/gemini-2.5-flash-lite` — Best value ($0.10/$0.40 per 1M)
- `deepseek/deepseek-chat` — Great value ($0.28/$0.42 per 1M)
- `nvidia/gpt-oss-120b` — Free (NVIDIA-hosted)

### Quality-Optimized
- `openai/gpt-5.4` — Best all-around
- `anthropic/claude-opus-4.6` — Best for nuanced tasks

### Reasoning
- `openai/o3` — Advanced reasoning
- `openai/o1` — Complex logic
- `deepseek/deepseek-reasoner` — Cheaper reasoning

Full list: [Models Reference](../api-reference/models.md)

## Pricing

Pay only for what you use:

```
Your cost = Provider cost + 5%
```

Example costs per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| DeepSeek Chat | $0.29 | $0.44 |
| GPT-5.4 | $2.63 | $15.75 |
| Claude Opus 4.6 | $5.25 | $26.25 |

Full pricing: [Intelligence Pricing](../products/intelligence/pricing.md)

## Wallet Management

### Environment Variable

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

### Programmatic

```python
# Create new
client = LLMClient()  # Auto-generates if none exists

# Use existing
client = LLMClient(private_key="0x...")

# Check balance
balance = client.get_balance()
print(f"${balance} USDC")

# Get address to fund
print(client.get_address())
```

### Security

- Private key stored locally (`~/.blockrun/wallet.json`)
- Only signatures sent to API
- All payments verifiable on [Basescan](https://basescan.org)

## Error Handling

```python
from blockrun_llm import (
    LLMClient,
    InsufficientBalanceError,
    ModelNotFoundError,
    RateLimitError
)

try:
    response = client.chat(model, prompt)
except InsufficientBalanceError:
    print("Need to fund wallet")
except ModelNotFoundError:
    print("Invalid model ID")
except RateLimitError:
    print("Too many requests, backing off")
```

## Best Practices

1. **Start with cheap models** — Test with DeepSeek before using GPT-4o
2. **Set session budgets** — Prevent runaway spending
3. **Use async for batch operations** — Better throughput
4. **Monitor balance** — Set up alerts when low
5. **Log model usage** — Track costs per task type

## Next Steps

- [ElizaOS Integration](../frameworks/elizaos.md)
- [AgentKit Integration](../frameworks/agentkit.md)
- [Python SDK](../sdks/python.md)
- [TypeScript SDK](../sdks/typescript.md)
- [Wallet Setup](wallet-setup.md)
