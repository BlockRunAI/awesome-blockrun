# Intelligence Pricing

Pay only for what you use. Provider cost + 5%.

## Pricing Formula

```
Your cost = Provider cost + 5%
```

The 5% margin covers:
- x402 settlement infrastructure
- Smart routing and reliability
- No API key management
- Instant on-chain payments

## What $1 Gets You

| Model | Approximate Usage |
|-------|------------------|
| GPT-4o | ~400K input tokens |
| DeepSeek V3 | ~7M input tokens |
| Gemini Flash | ~13M input tokens |
| DALL-E 3 | ~20 images |

## Full Price List

### OpenAI

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| GPT-5.2 | $5.25 | $15.75 |
| GPT-4o | $2.63 | $10.50 |
| GPT-4o-mini | $0.16 | $0.63 |
| o1 | $15.75 | $63.00 |
| o1-mini | $3.15 | $12.60 |
| o3-mini | $1.16 | $4.62 |

### Anthropic

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Claude Opus 4 | $15.75 | $78.75 |
| Claude Sonnet 4 | $3.15 | $15.75 |
| Claude Haiku 4.5 | $0.84 | $4.20 |

### Google

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Gemini 3 Pro | $1.31 | $5.25 |
| Gemini 2.5 Pro | $1.31 | $5.25 |
| Gemini 2.5 Flash | $0.08 | $0.32 |

### xAI

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Grok 4 Fast | $5.25 | $26.25 |

### DeepSeek

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| DeepSeek V3 | $0.15 | $0.29 |
| DeepSeek R1 | $0.58 | $2.30 |

### Meta (via Together/Fireworks)

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Llama 3.3 70B | $0.42 | $0.42 |
| Llama 3.1 405B | $3.15 | $3.15 |

### Qwen

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Qwen 2.5 72B | $0.42 | $0.42 |

### Mistral

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Mistral Large | $2.10 | $6.30 |

## Image Generation

| Model | Price per Image |
|-------|-----------------|
| DALL-E 3 Standard (1024x1024) | $0.04 |
| DALL-E 3 HD (1024x1792) | $0.08 |
| DALL-E 3 HD Wide (1792x1024) | $0.12 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10 |

## Cost Comparison: BlockRun vs Direct

| Provider | Direct Pricing | BlockRun | Difference |
|----------|---------------|----------|------------|
| OpenAI GPT-4o | $2.50/$10.00 | $2.63/$10.50 | +5% |
| Anthropic Claude | $3.00/$15.00 | $3.15/$15.75 | +5% |
| DeepSeek | $0.14/$0.28 | $0.15/$0.29 | +5% |

You pay 5% more, but you get:
- No API key management
- No monthly invoices
- No prepaid credits
- One wallet for all providers
- Instant per-request settlement

## Budget Management

### Session Budgets

```python
from blockrun_llm import LLMClient

# Limit spending per session
client = LLMClient(session_budget=5.00)
```

### Check Balance

```python
balance = client.get_balance()
print(f"${balance} USDC remaining")
```

### Track Spending

```python
# Get usage stats
usage = client.get_usage()
print(f"Spent: ${usage['total_spent']}")
print(f"Requests: {usage['request_count']}")
```

## Cost Optimization Tips

### 1. Use Cheaper Models for Routine Tasks

```python
# Expensive
response = client.chat("openai/gpt-4o", "Summarize this text")

# 50x cheaper, similar quality
response = client.chat("deepseek/deepseek-v3", "Summarize this text")
```

### 2. Use Flash Models for Speed

```python
# For quick, simple tasks
response = client.chat("google/gemini-2.5-flash", prompt)
```

### 3. Match Model to Task

| Task | Recommended Model | Why |
|------|------------------|-----|
| Bulk processing | DeepSeek V3 | Cheapest |
| Quick responses | Gemini Flash | Fast + cheap |
| Complex reasoning | o1, Claude Opus | Best quality |
| Code generation | GPT-4o, Claude Sonnet | Good balance |
| Real-time data | Grok | X/Twitter access |

### 4. Optimize Prompts

Shorter prompts = fewer input tokens = lower cost.

## No Hidden Fees

- **No subscriptions**
- **No minimums**
- **No prepaid credits**
- **No overage charges**
- **No rate limit fees**

Just: `provider_cost × 1.05`

## Payment Details

- **Currency:** USDC on Base
- **Settlement:** Instant, on-chain
- **Verification:** [Basescan](https://basescan.org)

## Next Steps

- [Models Reference](../../api-reference/models.md)
- [Intelligence Overview](overview.md)
- [Wallet Setup](../../getting-started/wallet-setup.md)
