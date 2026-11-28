---
title: Intelligence Pricing
description: BlockRun Intelligence pricing — token prices at the vendor's list price plus a 5% platform fee, a full price list, image rates, and a free tier of 9 models.
---

# Intelligence Pricing

Per-token chat is billed at **the vendor's list price, plus a 5% platform fee**. The 402 quotes input plus output at your `max_tokens`. An `exact` payment settles that quote, so set `max_tokens` to what you need. Pay with `upto` (Base) or batch settlement (Solana) and you are charged only the tokens produced. See [How the quote is computed](../../api-reference/chat-completions.md#payment-required-402).

## Pricing Formula

```
Your cost = Provider list price    (per-token chat; on exact: input + your
                                     full max_tokens)
              × 1.05                 (5% platform fee, before the $0.001 minimum)
              + $0.001 / request     (flat x402 transaction fee)
```

The per-token rates on this page, `/api/pricing` and `/v1/models` stay at the vendor's list price; the fee is published beside them (`chatPlatformFeePercent`, `platform_fee_percent`). No platform fee on free models, the Live Search surcharge or Decisions. Media generation carries a 5% margin. Together they cover:
- x402 settlement infrastructure
- Smart routing and reliability
- No API key management
- Instant on-chain payments

## What $1 Gets You

| Model | Approximate Usage |
|-------|------------------|
| GPT-5.5 | ~190K input tokens |
| DeepSeek V4.1 Flash | ~6.8M input tokens |
| Gemini 3.5 Flash | ~635K input tokens |
| Image generation | ~2–60 images |
| **Free tier** (9 models — reasoning, coding, and vision) | **Unlimited (FREE)** |

:::tip{title="Start with the free tier"}
The free tier costs $0 — 9 reasoning, coding, and vision models with no per-token charge. You still need a funded wallet for the x402 handshake, but these calls don't draw it down.
:::

## Full Price List

**Cached input** is the rate for prompt tokens the provider serves from its prompt cache — a repeated system prompt, a long conversation prefix. The provider decides what is a cache hit and reports it in the response usage (`prompt_tokens_details.cached_tokens`). A dash means the provider publishes no separate cached rate, so cached tokens bill at the input rate.

How the cached rate reaches an x402 payment depends on the scheme the client signs:

- **`upto`** — the client signs a ceiling and is charged actual usage after the call. On DeepSeek models, cached tokens are charged at the cached rate; other models bill cached tokens at the input rate. Offered on DeepSeek and Anthropic models, and it needs no ETH (the USDC approval is a gasless signature).
- **`exact`** — the client signs the price quoted before the call. Nobody knows about a cache hit yet, so the quote uses the full input rate. On GPT-6.2, which writes a prompt cache by default at 1.25x input, it uses that write rate; `upto` adds the write premium only on the tokens actually written.

### OpenAI

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| GPT-6.2 Astra (flagship) | $8.00 | $40.00 | $0.40 |
| GPT-6.2 Sol | $2.00 | $10.00 | $0.10 |
| GPT-6 Astra | $10.00 | $50.00 | $1.00 |
| GPT-6.1 Sol | $2.00 | $10.00 | $0.10 |
| GPT-6.1 Terra | $1.00 | $5.00 | $0.05 |
| GPT-6 Sol | $2.00 | $10.00 | $0.20 |
| GPT-6 Luna | $0.10 | $0.50 | $0.01 |
| GPT-5.6 Sol | $4.00 | $20.00 | $0.40 |
| GPT-5.6 Sol Pro | $4.00 | $20.00 | $0.40 |
| GPT-5.6 Terra | $2.00 | $12.00 | $0.20 |
| GPT-5.6 Terra Pro | $2.00 | $12.00 | $0.20 |
| GPT-5.6 Luna | $0.20 | $1.20 | $0.02 |
| GPT-5.6 Luna Pro | $0.20 | $1.20 | $0.02 |
| GPT-5.5 | $5.00 | $30.00 | $0.50 |
| GPT-5.5 Pro | $30.00 | $180.00 | — |
| GPT-5.4 | $2.50 | $15.00 | $0.25 |
| GPT-5.4 Pro | $30.00 | $180.00 | — |
| GPT-5.4 Mini | $0.75 | $4.50 | $0.075 |
| GPT-5.4 Nano | $0.20 | $1.25 | $0.02 |
| GPT-5.3 Codex | $1.75 | $14.00 | $0.175 |
| GPT-5.2 | $1.75 | $14.00 | $0.175 |
| GPT-5.2 Pro | $21.00 | $168.00 | — |
| GPT-5.1 | $1.25 | $10.00 | $0.125 |
| GPT-5 Mini | $0.25 | $2.00 | $0.025 |
| GPT-4.1 | $2.00 | $8.00 | $0.50 |
| GPT-4.1 Mini | $0.40 | $1.60 | $0.10 |
| GPT-4o | $2.50 | $10.00 | $1.25 |
| GPT-4o Mini | $0.15 | $0.60 | $0.075 |
| o3 | $2.00 | $8.00 | $0.50 |

`openai/chat-latest` (ChatGPT Instant, GPT-5.5) bills at GPT-5.5's rates.

### Anthropic

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Claude Fable 5.2 (most capable) | $8.00 | $40.00 | $0.20 |
| Claude Fable 5.1 | $10.00 | $50.00 | $0.25 |
| Claude Fable 5 | $10.00 | $50.00 | $1.00 |
| Claude Opus 5.5 (flagship) | $4.00 | $20.00 | $0.20 |
| Claude Opus 5 (previous flagship) | $5.00 | $25.00 | $0.50 |
| Claude Opus 4.8 | $5.00 | $25.00 | $0.50 |
| Claude Opus 4.7 | $5.00 | $25.00 | $0.50 |
| Claude Opus 4.5 | $5.00 | $25.00 | $0.50 |
| Claude Sonnet 5.5 | $2.00 | $10.00 | $0.10 |
| Claude Sonnet 5 | $2.00 | $10.00 | $0.20 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 |
| Claude Sonnet 4.5 | $3.00 | $15.00 | $0.30 |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 |

### Google

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Gemini 4 Neon | $3.00 | $15.00 | $0.15 |
| Gemini 4 Carbon | $4.00 | $20.00 | $0.20 |
| Gemini 4 Argon | $4.00 | $20.00 | $0.20 |
| Gemini 4 Hydrogen | $1.50 | $7.50 | $0.075 |
| Gemini 3.1 Pro | $2.00 | $12.00 | $0.20 |
| Gemini 2.5 Pro | $1.25 | $10.00 | $0.125 |
| Gemini 3.8 Flash | $0.75 | $3.75 | $0.075 |
| Gemini 3.6 Flash | $0.75 | $3.75 | $0.075 |
| Gemini 3.5 Flash | $1.50 | $9.00 | $0.15 |
| Gemini 3 Flash Preview | $0.50 | $3.00 | — |
| Gemini 2.5 Flash | $0.30 | $2.50 | $0.03 |
| Gemini 3.5 Flash Lite | $0.30 | $2.50 | $0.03 |
| Gemini 3.1 Flash Lite | $0.25 | $1.50 | $0.025 |
| Gemini 2.5 Flash Lite | $0.10 | $0.40 | $0.01 |

Gemini 4 Carbon and Argon moved to $4.00 / $20.00 (cached $0.20) on 2026-12-01, when Google's introductory $2.00 / $10.00 rate ended; Gemini 4 Neon and Hydrogen have no announced change. Gemini 3.1 Pro and 2.5 Pro double the input rate and add 50% to the output rate above 200K prompt tokens (the whole request reprices), mirroring Google's official long-context pricing — e.g. Gemini 2.5 Pro is $2.50 in · $15.00 out above the threshold. Flash tiers are flat.

### xAI Grok

| Model | Input (per 1M) | Output (per 1M) | Context | Cached input (per 1M) |
|-------|----------------|-----------------|---------|-----------------------|
| Grok 4.7 (flagship) | $2.00 | $6.00 | 500K | $0.50 |
| Grok 4.6 | $2.00 | $6.00 | 500K | $0.50 |
| Grok 4.5 | $2.00 | $6.00 | 500K | $0.30 |
| Grok 4.3 | $1.25 | $2.50 | 1M | $0.20 |
| Grok Build 0.1 | $1.00 | $2.00 | 256K | $0.20 |

Grok doubles the per-token rates above 200K prompt tokens (the whole request reprices — e.g. Grok 4.7, 4.6 and 4.5 are $4.00 in · $12.00 out above the threshold), mirroring xAI's official long-context tier. Live Search adds one flat surcharge per call: $0.30 on Grok 4.5 / 4.6 / 4.7 / 4.20, $0.12 on Grok 4.3 and below.

### Z.AI

| Model | Input (per 1M) | Output (per 1M) | Context | Cached input (per 1M) |
|-------|----------------|-----------------|---------|-----------------------|
| GLM-5.3 | $1.40 | $4.40 | 1M | $0.26 |
| GLM-5.3 Flash | $0.15 | $0.50 | 1M | $0.03 |
| GLM-5.2 | $1.40 | $4.40 | 1M | $0.26 |
| GLM-5.1 | $1.40 | $4.40 | 200K | $0.26 |
| GLM-5 | $1.00 | $3.20 | 200K | $0.20 |
| GLM-5 Turbo | $1.20 | $4.00 | 200K | — |

### Moonshot

| Model | Input (per 1M) | Output (per 1M) | Context | Cached input (per 1M) |
|-------|----------------|-----------------|---------|-----------------------|
| Kimi K3.1 Pro | $2.00 | $10.00 | 1M | $0.20 |

### MiniMax

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| MiniMax M3 | $0.30 | $1.20 | — |
| MiniMax M2.7 | $0.30 | $1.20 | — |

### Qwen

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Qwen3.8 Max | $2.00 | $6.00 | — |
| Qwen3.7 Max | $1.48 | $4.43 | — |
| Qwen3.7 Plus | $0.32 | $1.28 | — |
| Qwen3.7 Flash | $0.03 | $0.13 | — |
| Qwen3.8 Flash | $0.15 | $0.47 | — |

Qwen3.7 Plus reprices to $0.96 in · $3.84 out from 256K prompt tokens; Qwen3.7 Flash steps to $0.10 · $0.40 from 32K and $0.20 · $0.80 from 256K (the whole request reprices).

### Tencent

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Tencent Hy4 Preview | $0.834 | $2.501 | — |

### Poolside

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Laguna S 2.1 | $0.09 | $0.18 | — |

### Xiaomi

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| MiMo V2.5 | $0.14 | $0.28 | — |
| Xiaomi MiMo-V2.5 Pro | $0.435 | $0.87 | — |

### Mistral

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| Mistral Large 4 | $1.36 | $4.18 | — |

### DeepSeek

| Model | Input (per 1M) | Output (per 1M) | Cached input (per 1M) |
|-------|----------------|-----------------|-----------------------|
| DeepSeek V4.1 Flash | $0.14 | $0.28 | $0.006 |
| DeepSeek Chat (V4.1 Flash, compatibility id) | $0.14 | $0.28 | $0.006 |
| DeepSeek Reasoner (V4.1 Flash, thinking on) | $0.14 | $0.28 | $0.006 |
| DeepSeek V4 Flash Vision (image input) | $0.30 | $1.20 | $0.006 |
| DeepSeek V4 Pro | $1.32 | $3.96 | $0.044 |

### Free Tier (9 models)

The free tier is 9 reasoning, coding, and vision models with no per-token
charge. The lineup is kept current by a self-healing health gate that routes
around any model whose upstream is temporarily unavailable and auto-recovers
it, so existing calls keep working. All free-tier models are `FREE` for both
input and output — call `GET /api/v1/models` for the current live list.

## Image Generation

Image prices include the 5% media margin; the flat $0.001 transaction fee is added per call.

| Model | Price per Image |
|-------|-----------------|
| GPT Image 1 (1024x1024) | $0.021 |
| GPT Image 1 (wide/tall) | $0.042 |
| ChatGPT Images 2.0 (1024x1024) | $0.063 |
| ChatGPT Images 2.0 (wide/tall) | $0.126 |
| GPT Image 2.5 Flare / Sunburst (1024x1024) | $0.294 |
| GPT Image 2.5 Flare / Sunburst (wide/tall) | $0.588 |
| Nano Banana | $0.0525 |
| Nano Banana 2 | $0.0945 |
| Nano Banana 2 Lite | $0.0525 |
| Nano Banana 2.1 | $0.0735 |
| Nano Banana Pro (up to 2048²) | $0.1785 |
| Nano Banana Pro (4K) | $0.315 |
| Seedream 5.0 Pro (up to 2048x1024) | $0.04725 |
| Seedream 5.0 Pro (2K and above) | $0.0945 |
| CogView-4 (up to 1344x768) | $0.01575 |
| CogView-4 (1440x1440) | $0.021 |
| Grok Imagine | $0.021 |
| Grok Imagine 2.0 | $0.042 |
| Grok Imagine Pro | $0.063 |

Other media, before the $0.001 fee: video from **$0.05/sec**, music **$0.199/track**, text-to-speech from **$0.0525 per 1k characters**, sound effects **$0.0525/generation**. See [Models](../../api-reference/models.md) for every media SKU.

## Decisions (typed judgments)

[Decisions](../../api-reference/decisions.md) answers yes/no, choice and rubric questions about one input with a probability for each. Only input tokens are billed; there is no output charge.

| Model | Input (per 1M tokens) | Output | Questions per call |
|-------|----------------------|--------|--------------------|
| Gemini Decision 1 (`gemini-decision-1`, Google) | $0.10 | not billed | up to 1,000 |
| gpt-6-luna (`gpt-6-luna`, OpenAI) | $0.10 ($0.20 past 272K tokens) | not billed | up to 64 |

Paying per call adds the $0.001 per-call fee to the quoted token cost, and a Gemini Decision 1 call costs at most $0.027215. With an API key on api.blockrun.ai, the reported input tokens are paid from credit plus your account margin, with no per-call fee.

## Cost Comparison: BlockRun vs Direct

| Provider | Direct Pricing | BlockRun | Difference |
|----------|---------------|----------|------------|
| OpenAI GPT-5.4 | $2.50/$15.00 | $2.50/$15.00 | +5% platform fee + $0.001/request |
| Anthropic Claude Opus 5.5 | $4.00/$20.00 | $4.00/$20.00 | +5% platform fee + $0.001/request |
| Anthropic Claude Sonnet 5.5 | $2.00/$10.00 | $2.00/$10.00 | +5% platform fee + $0.001/request |
| Anthropic Claude Sonnet 5 | $2.00/$10.00 | $2.00/$10.00 | +5% platform fee + $0.001/request |
| Anthropic Claude Sonnet 4.6 | $3.00/$15.00 | $3.00/$15.00 | +5% platform fee + $0.001/request |
| DeepSeek V4.1 Flash | $0.14/$0.28 | $0.14/$0.28 | +5% platform fee + $0.001/request |

Chat is billed at the provider's list rate, plus a 5% platform fee and a flat $0.001 transaction fee per request, and you get:
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
response = client.chat("google/gemini-3.6-flash", prompt)
```

### 3. Match Model to Task

| Task | Recommended Model | Why |
|------|------------------|-----|
| Bulk processing | DeepSeek | Cheapest |
| Quick responses | Gemini 3.5 Flash | Fast + cheap |
| Complex reasoning | DeepSeek Reasoner, Claude Opus 5.5 | Best quality |
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

The rates on this page are the providers' own published prices. Chat adds a 5%
platform fee on tokens and the flat $0.001 transaction fee per request. Media
generation carries 5%.

## Payment Details

- **Currency:** USDC on Base or Solana
- **Settlement:** On-chain. Base payments and Solana exact payments settle on-chain per call; Solana batch payments settle together in periodic sweeps.
- **Verification:** [Basescan](https://basescan.org) / [Solscan](https://solscan.io)

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
