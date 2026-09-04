---
title: Intelligence Pricing
description: BlockRun Intelligence pricing — per-token chat at provider cost with no platform margin, a full price list, image rates, and a free tier of 5 models.
---

# Intelligence Pricing

Pay only for what you use. Per-token chat is billed at **provider cost** — no platform margin.

## Pricing Formula

```
Your cost = Provider cost          (per-token chat — no platform margin)
              + $0.001 / request     (flat x402 transaction fee)
```

Media generation and Live Search still carry a 5% platform margin, which covers:
- x402 settlement infrastructure
- Smart routing and reliability
- No API key management
- Instant on-chain payments

## What $1 Gets You

| Model | Approximate Usage |
|-------|------------------|
| GPT-5.5 | ~200K input tokens |
| DeepSeek V4 Flash Chat | ~7M input tokens |
| Gemini 3.5 Flash | ~635K input tokens |
| Image generation | ~10–65 images |
| **Free tier** (5 models — reasoning, coding, and vision) | **Unlimited (FREE)** |

:::tip{title="Start with the free tier"}
The free tier costs $0 — 5 reasoning, coding, and vision models with no per-token charge. You still need a funded wallet for the x402 handshake, but these calls don't draw it down.
:::

## Full Price List

### OpenAI

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| GPT-5.6 Sol (flagship) | $5.00 | $30.00 |
| GPT-5.6 Sol Pro | $5.00 | $30.00 |
| GPT-5.6 Terra | $2.00 | $12.00 |
| GPT-5.6 Terra Pro | $2.00 | $12.00 |
| GPT-5.6 Luna | $0.20 | $1.20 |
| GPT-5.6 Luna Pro | $0.20 | $1.20 |
| GPT-5.5 | $5.00 | $30.00 |
| GPT-5.5 Pro | $30.00 | $180.00 |
| GPT-5.4 | $2.50 | $15.00 |
| GPT-5.4 Pro | $30.00 | $180.00 |
| GPT-5.2 | $1.75 | $14.00 |

### Anthropic

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Claude Fable 5 (most capable) | $10.00 | $50.00 |
| Claude Opus 5 (flagship) | $5.00 | $25.00 |
| Claude Opus 4.8 (previous flagship) | $5.00 | $25.00 |
| Claude Opus 4.7 | $5.00 | $25.00 |
| Claude Opus 4.5 | $5.00 | $25.00 |
| Claude Sonnet 5 | $3.00 | $15.00 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 |

### Google

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Gemini 3.1 Pro | $2.00 | $12.00 |
| Gemini 3.8 Flash | $0.75 | $3.75 |
| Gemini 3.6 Flash | $0.75 | $3.75 |
| Gemini 3.5 Flash | $1.50 | $9.00 |
| Gemini 3.5 Flash Lite | $0.30 | $2.50 |

Gemini Pro models double the input rate and add 50% to the output rate above 200K prompt tokens (the whole request reprices), mirroring Google's official long-context pricing — e.g. Gemini 2.5 Pro is $2.50 in · $15.00 out above the threshold. Flash tiers are flat.

### xAI Grok

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| Grok 4.5 (flagship) | $2.00 | $6.00 | 500K |
| Grok 4.3 | $1.25 | $2.50 | 1M |
| Grok Build 0.1 | $1.00 | $2.00 | 256K |

Grok doubles the per-token rates above 200K prompt tokens (the whole request reprices — e.g. Grok 4.5 is $5.00 in · $18.00 out above the threshold), mirroring xAI's official long-context tier. Live Search adds $0.025 per source used.

### Z.AI

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| GLM-5.3 | $1.40 | $4.40 | 1M |
| GLM-5.3 Flash | $0.15 | $0.50 | 1M |
| GLM-5.2 | $1.40 | $4.40 | 1M |
| GLM-5.1 | $1.40 | $4.40 | 200K |
| GLM-5 | $1.00 | $3.20 | 200K |
| GLM-5 Turbo | $1.20 | $4.00 | 200K |

### Moonshot

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| Kimi K3 | $3.00 | $15.00 | 1M |

### MiniMax

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| MiniMax M3 | $0.30 | $1.20 |

### Qwen

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Qwen3.7 Max | $1.48 | $4.43 |
| Qwen3.7 Plus | $0.32 | $1.28 |
| Qwen3.7 Flash | $0.03 | $0.13 |

### DeepSeek

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| DeepSeek V4 Flash Chat | $0.14 | $0.28 |
| DeepSeek V4 Flash Reasoner | $0.14 | $0.28 |
| DeepSeek V4 Flash Vision (image input) | $0.44 | $1.32 |
| DeepSeek V4 Pro | $1.32 | $3.96 |

### Free Tier (5 models)

The free tier is 5 reasoning, coding, and vision models with no per-token
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
| Nano Banana 2 | $0.09 |
| Nano Banana Pro (up to 2048²) | $0.10 |
| Nano Banana Pro (4K) | $0.15 |
| Seedream 5.0 Pro (up to 2048x1024) | $0.045 |
| Seedream 5.0 Pro (2K and above) | $0.09 |
| CogView-4 | $0.015 |
| Grok Imagine | $0.02 |
| Grok Imagine Pro | $0.07 |

Other media: video from **$0.05/sec**, music **$0.15/track**, text-to-speech **$0.05–$0.10 per 1k characters**, sound effects **$0.0535/generation**.

## Cost Comparison: BlockRun vs Direct

| Provider | Direct Pricing | BlockRun | Difference |
|----------|---------------|----------|------------|
| OpenAI GPT-5.4 | $2.50/$15.00 | $2.50/$15.00 | 0% + $0.001/request |
| Anthropic Claude Sonnet 5 | $3.00/$15.00 | $3.00/$15.00 | 0% + $0.001/request |
| Anthropic Claude Sonnet 4.6 | $3.00/$15.00 | $3.00/$15.00 | 0% + $0.001/request |
| DeepSeek V4 Flash Chat | $0.14/$0.28 | $0.14/$0.28 | 0% + $0.001/request |

Chat is billed at the provider's list rate with no margin, plus a flat $0.001 transaction fee per request, and you get:
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
client = LLMClient(max_session_cost=5.00)
```

### Check Balance

```python
balance = client.get_balance()
print(f"${balance} USDC remaining")
```

### Track Spending

```python
# Get usage stats
usage = client.get_spending()
print(f"Spent: ${usage['total_usd']}")
print(f"Requests: {usage['calls']}")
```

## Cost Optimization Tips

### 0. Use ClawRouter for Automatic Savings

**Save 84% on average** with [ClawRouter](../routing/clawrouter.md) — it automatically routes each request to the cheapest model that can handle it.

```
/model blockrun/auto
```

ClawRouter does all the optimization below automatically.

### 1. Use Cheaper Models for Routine Tasks

```python
# Expensive
response = client.chat("openai/gpt-5.5", "Summarize this text")

# ~36x cheaper, similar quality
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
| Complex reasoning | DeepSeek Reasoner, Claude Opus 5 | Best quality |
| Code generation | GPT-5.4, Claude Sonnet 4.6 | Good balance |
| Real-time data | Grok | Web & news access |

### 4. Optimize Prompts

Shorter prompts = fewer input tokens = lower cost.

## What you don't pay

- **No subscriptions**
- **No prepaid credits**
- **No minimum top-up**
- **No overage charges**
- **No rate limit fees**

The rates on this page are the providers' own published prices; chat tokens carry
no margin — only the flat $0.001 transaction fee per request. Media generation and
Live Search carry 5%.

## Payment Details

- **Currency:** USDC on Base or Solana
- **Settlement:** Instant, on-chain
- **Verification:** [Basescan](https://basescan.org)

## What's next?

::::cards

:::card{title="Intelligence overview" href="overview.md" icon="Brain"}
How the OpenAI-compatible API works and which model fits each task.
:::

:::card{title="Smart routing" href="../routing/clawrouter.md" icon="Route"}
Save 84% on average by routing each request to the cheapest capable model.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana to start calling models.
:::

::::
