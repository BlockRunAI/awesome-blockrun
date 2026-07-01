---
title: Intelligence
description: BlockRun Intelligence gives your agent 60+ LLMs through one OpenAI-compatible API, paid per request in USDC — no API keys, no subscriptions.
---

# Intelligence

AI accesses any LLM. 60+ models, pay-per-request.

BlockRun's Intelligence product gives your AI agent access to models from OpenAI, Anthropic, Google, xAI, DeepSeek, Z.AI, Moonshot, MiniMax, and more — without managing API keys or subscriptions.

## How It Works

Your agent requests a model via the OpenAI-compatible API. BlockRun handles:

1. **Routing** — Sends request to the right provider
2. **Payment** — x402 micropayment per request
3. **Response** — Returns the completion

No API keys. No monthly bills. Just usage-based payments in USDC.

## Available Models

Reference provider rates per 1M tokens (BlockRun adds a 5% margin at billing — see [Pricing](pricing.md) for exact list prices).

### OpenAI
| Model | Input | Output |
|-------|-------|--------|
| GPT-5.5 (flagship) | $5.00/M | $30.00/M |
| GPT-5.4 | $2.50/M | $15.00/M |
| GPT-5.4 Pro | $30.00/M | $180.00/M |
| GPT-5.2 | $1.75/M | $14.00/M |

### Anthropic
| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4.8 (flagship) | $5.00/M | $25.00/M |
| Claude Opus 4.7 | $5.00/M | $25.00/M |
| Claude Opus 4.5 | $5.00/M | $25.00/M |
| Claude Sonnet 5 | $3.00/M | $15.00/M |
| Claude Sonnet 4.6 | $3.00/M | $15.00/M |
| Claude Haiku 4.5 | $0.80/M | $4.00/M |

### Google
| Model | Input | Output |
|-------|-------|--------|
| Gemini 3.1 Pro | $2.00/M | $12.00/M |
| Gemini 3.5 Flash | $0.50/M | $3.00/M |

### Z.AI
| Model | Input | Output |
|-------|-------|--------|
| GLM-5.2 (flagship, 1M context) | $1.40/M | $4.40/M |
| GLM-5.1 | $1.40/M | $4.40/M |
| GLM-5 | $0.60/M | $1.92/M |
| GLM-5 Turbo | $1.20/M | $4.00/M |

### Moonshot
| Model | Input | Output |
|-------|-------|--------|
| Kimi K2.7 (256K context, image + video input) | $0.95/M | $4.00/M |

### MiniMax
| Model | Input | Output |
|-------|-------|--------|
| MiniMax M3 | $0.30/M | $1.20/M |

### DeepSeek
| Model | Input | Output |
|-------|-------|--------|
| DeepSeek V4 Flash Chat | $0.20/M | $0.40/M |
| DeepSeek V4 Pro | $0.435/M | $0.87/M |

### Free tier
10 free models with no per-token charge (you still need a funded wallet for the x402 handshake, but these calls don't draw it down).

*M = million tokens. Reference provider rates; the 5% BlockRun margin is applied at billing.*

See [Pricing](pricing.md) for complete list and calculator.

## Pricing Model

```
Your cost = Provider cost + 5%
```

The 5% covers:
- USDC settlement infrastructure
- Smart routing and load balancing
- Uptime and reliability
- No API key management

**No subscriptions. No minimums. No prepaid credits.**

:::tip{title="Cut costs automatically"}
Don't want to pick models by hand? [ClawRouter](../routing/clawrouter.md) routes each request to the cheapest model that can handle it — up to 78% lower cost.
:::

## Quick Start

::::tabs

:::tab{label="Claude Code"}
```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

Then:

```
Use GPT-5 to review this code
```

```
Ask DeepSeek to optimize this for cost
```
:::

:::tab{label="Python SDK"}
```python
from blockrun_llm import LLMClient

client = LLMClient()  # Uses BLOCKRUN_WALLET_KEY

# OpenAI model
response = client.chat("openai/gpt-5.5", "Explain quantum computing")

# DeepSeek (50x cheaper)
response = client.chat("deepseek/deepseek-chat", "Explain quantum computing")
```
:::

:::tab{label="Direct API"}
```bash
curl https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BLOCKRUN_WALLET_KEY" \
  -d '{
    "model": "openai/gpt-5.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```
:::

::::

## Use Cases

### Cost Optimization

Use DeepSeek for routine tasks:
```
Process these 500 files using DeepSeek
```

DeepSeek costs a fraction of the flagship models for similar quality on many routine tasks.

**Want automatic cost optimization?** Try [ClawRouter](../routing/clawrouter.md) — it saves 78% by routing each request to the cheapest model that can handle it.

### Second Opinion

Get another model's perspective:
```
What does GPT-5 think about this approach?
```

### Real-Time Data

Access Grok for live X/Twitter data:
```
What's trending on X about AI right now?
```

### Specialized Tasks

- **Reasoning:** DeepSeek Reasoner or GPT-5.4 for complex logic
- **Speed:** Gemini Flash for quick responses
- **Cost:** DeepSeek for bulk processing
- **Quality:** Claude Opus 4.8 for nuanced writing

## Features

### OpenAI-Compatible API

Drop-in replacement for existing integrations. Change the base URL and you're done.

### Automatic Routing

If a model is rate-limited or down, BlockRun can route to alternatives (opt-in).

### Session Budgets

Set spending limits per session:

```python
client = LLMClient(session_budget=5.00)  # Max $5 per session
```

### All Providers, One Wallet

No need for separate accounts at OpenAI, Anthropic, Google, etc. One USDC wallet covers everything.

## What's next?

::::cards

:::card{title="Pricing details" href="pricing.md" icon="Zap"}
Full per-token price list, the free tier, and a what-$1-gets-you breakdown.
:::

:::card{title="Smart routing" href="../routing/clawrouter.md" icon="Route"}
Let ClawRouter pick the cheapest capable model on every request.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana to start calling models.
:::

::::
