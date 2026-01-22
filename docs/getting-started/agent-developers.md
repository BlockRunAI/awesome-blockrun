# Agent Developers

Build AI agents that pay for their own intelligence.

This guide is for developers using agent frameworks like ElizaOS, AgentKit, GOAT SDK, or LangChain. BlockRun provides the intelligence layer — 30+ AI models via x402 micropayments.

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
response = client.chat("openai/gpt-4o", "Analyze this market data...")

# Anthropic
response = client.chat("anthropic/claude-sonnet-4", "Review this code...")

# DeepSeek (50x cheaper)
response = client.chat("deepseek/deepseek-v3", "Summarize these documents...")
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
        "openai/gpt-4o",
        "anthropic/claude-sonnet-4",
        "deepseek/deepseek-v3"
    ]

    opinions = []
    for model in models:
        response = client.chat(model, question)
        opinions.append(f"{model}: {response}")

    # Synthesize
    return client.chat(
        "openai/gpt-4o",
        f"Synthesize these opinions:\n{chr(10).join(opinions)}"
    )
```

### Cost-Optimized Routing

Use cheap models for routine tasks, premium for important ones:

```python
def smart_route(task: str, importance: str) -> str:
    if importance == "high":
        model = "openai/gpt-4o"  # $2.50/M
    elif importance == "medium":
        model = "anthropic/claude-haiku-4.5"  # $0.80/M
    else:
        model = "deepseek/deepseek-v3"  # $0.14/M

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
    response = client.chat("deepseek/deepseek-v3", expensive_prompt)
```

### Async Operations

For high-throughput agents:

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

## Available Models

### Speed-Optimized
- `google/gemini-2.5-flash` — Fastest, cheapest
- `anthropic/claude-haiku-4.5` — Fast, good quality

### Cost-Optimized
- `deepseek/deepseek-v3` — Best value
- `meta/llama-3.3-70b` — Good open-source option

### Quality-Optimized
- `openai/gpt-4o` — Best all-around
- `anthropic/claude-opus-4` — Best for nuanced tasks

### Reasoning
- `openai/o1` — Complex logic
- `deepseek/deepseek-r1` — Cheaper reasoning

### Real-Time Data
- `xai/grok-4-fast` — Live X/Twitter access

Full list: [Models Reference](../api-reference/models.md)

## Pricing

Pay only for what you use:

```
Your cost = Provider cost + 5%
```

Example costs per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| DeepSeek V3 | $0.15 | $0.29 |
| GPT-4o | $2.63 | $10.50 |
| Claude Opus | $15.75 | $78.75 |

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
