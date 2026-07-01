---
title: Intelligence Pricing
description: BlockRun Intelligence pricing — provider cost plus 5%, a full per-token price list, image rates, and a free tier of 10 models.
---

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
| GPT-5.5 | ~200K input tokens |
| DeepSeek V4 Flash Chat | ~5M input tokens |
| Gemini 3.5 Flash | ~2M input tokens |
| Image generation | ~10–65 images |
| **Free tier** (10 models — reasoning, coding, and vision) | **Unlimited (FREE)** |

:::tip{title="Start with the free tier"}
The free tier costs $0 — 10 reasoning, coding, and vision models with no per-token charge. You still need a funded wallet for the x402 handshake, but these calls don't draw it down.
:::

## Full Price List

### OpenAI

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| GPT-5.5 (flagship) | $5.25 | $31.50 |
| GPT-5.4 | $2.63 | $15.75 |
| GPT-5.4 Pro | $31.50 | $189.00 |
| GPT-5.2 | $1.84 | $14.70 |

### Anthropic

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Claude Opus 4.8 (flagship) | $5.25 | $26.25 |
| Claude Opus 4.7 | $5.25 | $26.25 |
| Claude Opus 4.5 | $5.25 | $26.25 |
| Claude Sonnet 5 | $3.15 | $15.75 |
| Claude Sonnet 4.6 | $3.15 | $15.75 |
| Claude Haiku 4.5 | $0.84 | $4.20 |

### Google

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Gemini 3.1 Pro | $2.10 | $12.60 |
| Gemini 3.5 Flash | $0.53 | $3.15 |

### Z.AI

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| GLM-5.2 (flagship) | $1.47 | $4.62 | 1M |
| GLM-5.1 | $1.47 | $4.62 | 200K |
| GLM-5 | $0.63 | $2.02 | 200K |
| GLM-5 Turbo | $1.26 | $4.20 | 200K |

### Moonshot

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| Kimi K2.7 | $1.00 | $4.20 | 256K |

### MiniMax

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| MiniMax M3 | $0.32 | $1.26 |

### DeepSeek

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| DeepSeek V4 Flash Chat | $0.21 | $0.42 |
| DeepSeek V4 Pro | $0.46 | $0.91 |

### Free Tier (10 models)

The free tier is 10 reasoning, coding, and vision models with no per-token
charge. The lineup is kept current by a self-healing health gate that routes
around any model whose upstream is temporarily unavailable and auto-recovers
it, so existing calls keep working. All free-tier models are `FREE` for both
input and output — call `GET /api/v1/models` for the current live list.

## Image Generation

| Model | Price per Image |
|-------|-----------------|
| GPT Image 1 (1024x1024) | $0.02 |
| GPT Image 1 (wide/tall) | $0.04 |
| ChatGPT Images 2.0 (1024x1024) | $0.06 |
| ChatGPT Images 2.0 (wide/tall) | $0.12 |
| Nano Banana | $0.05 |
| Nano Banana Pro (up to 2048²) | $0.10 |
| Nano Banana Pro (4K) | $0.15 |
| CogView-4 | $0.015 |
| Grok Imagine | $0.02 |
| Grok Imagine Pro | $0.07 |

Other media: video from **$0.05/sec**, music **$0.15/track**, text-to-speech **$0.05–$0.10 per 1k characters**, sound effects **$0.05/generation**.

## Cost Comparison: BlockRun vs Direct

| Provider | Direct Pricing | BlockRun | Difference |
|----------|---------------|----------|------------|
| OpenAI GPT-5.4 | $2.50/$15.00 | $2.63/$15.75 | +5% |
| Anthropic Claude Sonnet 5 | $3.00/$15.00 | $3.15/$15.75 | +5% |
| Anthropic Claude Sonnet 4.6 | $3.00/$15.00 | $3.15/$15.75 | +5% |
| DeepSeek V4 Flash Chat | $0.20/$0.40 | $0.21/$0.42 | +5% |

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

### 0. Use ClawRouter for Automatic Savings

**Save 78% on average** with [ClawRouter](../routing/clawrouter.md) — it automatically routes each request to the cheapest model that can handle it.

```
/model blockrun/auto
```

ClawRouter does all the optimization below automatically.

### 1. Use Cheaper Models for Routine Tasks

```python
# Expensive
response = client.chat("openai/gpt-5.5", "Summarize this text")

# 50x cheaper, similar quality
response = client.chat("deepseek/deepseek-chat", "Summarize this text")
```

### 2. Use Flash Models for Speed

```python
# For quick, simple tasks
response = client.chat("google/gemini-3.5-flash", prompt)
```

### 3. Match Model to Task

| Task | Recommended Model | Why |
|------|------------------|-----|
| Bulk processing | DeepSeek | Cheapest |
| Quick responses | Gemini 3.5 Flash | Fast + cheap |
| Complex reasoning | DeepSeek Reasoner, Claude Opus 4.8 | Best quality |
| Code generation | GPT-5.4, Claude Sonnet 4.6 | Good balance |
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

## What's next?

::::cards

:::card{title="Intelligence overview" href="overview.md" icon="Brain"}
How the OpenAI-compatible API works and which model fits each task.
:::

:::card{title="Smart routing" href="../routing/clawrouter.md" icon="Route"}
Save 78% on average by routing each request to the cheapest capable model.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana to start calling models.
:::

::::
