---
title: Intelligence Pricing
description: BlockRun Intelligence pricing — provider cost plus 5%, a full per-token price list, image rates, and a free NVIDIA tier of 10 models.
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
| GPT-4o | ~400K input tokens |
| DeepSeek V3 | ~7M input tokens |
| Gemini Flash | ~13M input tokens |
| Image generation | ~20–65 images |
| **NVIDIA free tier** (DeepSeek V4 Pro/Flash, Nemotron Nano Omni, Qwen3, Llama 4, GLM-4.7, Mistral — 9 models) | **Unlimited (FREE)** |

:::tip{title="Start with the free tier"}
The NVIDIA tier costs $0 — reasoning, coding, and vision models with no per-token charge. You still need a funded wallet for the x402 handshake, but these calls don't draw it down.
:::

## Full Price List

### OpenAI

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| GPT-5.5 | $5.25 | $31.50 |
| GPT-5.4 | $2.63 | $15.75 |
| GPT-5.4 Pro | $31.50 | $189.00 |
| GPT-5.2 | $1.84 | $14.70 |
| GPT-5.2 Codex | $1.84 | $14.70 |
| GPT-4o | $2.63 | $10.50 |
| GPT-4o-mini | $0.16 | $0.63 |
| o1 | $15.75 | $63.00 |
| o1-mini | $3.15 | $12.60 |
| o3-mini | $1.16 | $4.62 |

### Anthropic

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Claude Opus 4.6 | $5.25 | $26.25 |
| Claude Opus 4.5 | $5.25 | $26.25 |
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

| Model | Input (per 1M) | Output (per 1M) | Context |
|-------|---------------|-----------------|---------|
| Grok 3 | $3.15 | $15.75 | 131K |
| Grok 3 Fast | $5.25 | $26.25 | 131K |
| Grok 3 Mini | $0.32 | $0.53 | 131K |
| Grok 4.1 Fast (Reasoning) | $0.21 | $0.53 | 2M |
| Grok 4.1 Fast (Direct) | $0.21 | $0.53 | 2M |
| Grok 4 Fast (Reasoning) | $0.21 | $0.53 | 2M |
| Grok 4 Fast (Direct) | $0.21 | $0.53 | 2M |
| Grok Code Fast 1 | $0.21 | $1.58 | 256K |
| Grok 4 (0709) | $3.15 | $15.75 | 256K |
| Grok 2 Vision | $2.10 | $10.50 | 32K |

### DeepSeek

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| DeepSeek V3 | $0.15 | $0.29 |
| DeepSeek R1 | $0.58 | $2.30 |

### NVIDIA (Free Tier)

Last refreshed 2026-06-14. The free tier runs on NVIDIA's on-demand NIM
deployments, which retire/recover unpredictably; a self-healing health gate
routes around any model whose upstream is down and auto-recovers it. The list
below is the current live lineup. Models that NVIDIA retired upstream
(DeepSeek V4 Flash/Pro, Qwen3 Coder 480B, Devstral 2, Qwen3-Next Thinking,
GLM-4.7) are auto-rerouted to a healthy free model, so existing calls still work.

| Model | Input (per 1M) | Output (per 1M) | Notes |
|-------|---------------|-----------------|-------|
| `nvidia/qwen3-next-80b-a3b-instruct` | **FREE** | **FREE** | 3B active MoE, 262K context — reasoning + coding flagship, fast |
| `nvidia/qwen3.5-122b-a10b` | **FREE** | **FREE** | 10B active MoE — balanced reasoning + coding |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | **FREE** | **FREE** | 31B / 3.2B active, 256K context — vision-capable (images, video) |
| `nvidia/mistral-large-3-675b` | **FREE** | **FREE** | Mistral's flagship 675B — free |
| `nvidia/mistral-nemotron` | **FREE** | **FREE** | Mistral × NVIDIA — fast free chat |
| `nvidia/seed-oss-36b` | **FREE** | **FREE** | ByteDance Seed-OSS — open-source coder |
| `nvidia/step-3.7-flash` | **FREE** | **FREE** | StepFun Step 3.7 Flash — fast lightweight reasoning |
| `nvidia/nemotron-nano-9b-v2` | **FREE** | **FREE** | Compact + fast, for high-volume light tasks |
| `nvidia/nemotron-nano-12b-v2-vl` | **FREE** | **FREE** | Vision-language, compact |
| `nvidia/llama-4-maverick` | **FREE** | **FREE** | Meta Llama 4 Maverick MoE — fast general-purpose |

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
| GPT Image 1 (1024x1024) | $0.02 |
| GPT Image 1 (wide/tall) | $0.04 |
| ChatGPT Images 2.0 (1024x1024) | $0.06 |
| ChatGPT Images 2.0 (wide/tall) | $0.12 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10 |
| CogView-4 | $0.015 |
| Grok Imagine | $0.02 |

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
response = client.chat("google/gemini-2.5-flash-lite", prompt)
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
