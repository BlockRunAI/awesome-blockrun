# Intelligence

AI accesses any LLM. 30+ models, pay-per-request.

BlockRun's Intelligence product gives your AI agent access to models from OpenAI, Anthropic, Google, xAI, DeepSeek, Meta, and more — without managing API keys or subscriptions.

## How It Works

Your agent requests a model via the OpenAI-compatible API. BlockRun handles:

1. **Routing** — Sends request to the right provider
2. **Payment** — x402 micropayment per request
3. **Response** — Returns the completion

No API keys. No monthly bills. Just usage-based payments in USDC.

## Available Models

### OpenAI
| Model | Input | Output |
|-------|-------|--------|
| GPT-5.2 | $5.00/M | $15.00/M |
| GPT-4o | $2.50/M | $10.00/M |
| o1 | $15.00/M | $60.00/M |
| o1-mini | $3.00/M | $12.00/M |

### Anthropic
| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4 | $15.00/M | $75.00/M |
| Claude Sonnet 4 | $3.00/M | $15.00/M |
| Claude Haiku 4.5 | $0.80/M | $4.00/M |

### Google
| Model | Input | Output |
|-------|-------|--------|
| Gemini 3 Pro | $1.25/M | $5.00/M |
| Gemini 2.5 Pro | $1.25/M | $5.00/M |
| Gemini 2.5 Flash | $0.075/M | $0.30/M |

### xAI
| Model | Input | Output |
|-------|-------|--------|
| Grok 4 Fast | $5.00/M | $25.00/M |

### DeepSeek
| Model | Input | Output |
|-------|-------|--------|
| DeepSeek V3 | $0.14/M | $0.28/M |
| DeepSeek R1 | $0.55/M | $2.19/M |

### Meta
| Model | Input | Output |
|-------|-------|--------|
| Llama 3.3 70B | $0.40/M | $0.40/M |
| Llama 3.1 405B | $3.00/M | $3.00/M |

*M = million tokens. Prices include 5% BlockRun margin.*

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

## Quick Start

### Claude Code Users

```bash
claude mcp add blockrun -- npx @blockrun/mcp
```

Then:

```
Use GPT-5 to review this code
```

```
Ask DeepSeek to optimize this for cost
```

### SDK Users

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Uses BLOCKRUN_WALLET_KEY

# OpenAI model
response = client.chat("openai/gpt-4o", "Explain quantum computing")

# DeepSeek (50x cheaper)
response = client.chat("deepseek/deepseek-v3", "Explain quantum computing")
```

### Direct API

```bash
curl https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BLOCKRUN_WALLET_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Use Cases

### Cost Optimization

Use DeepSeek for routine tasks:
```
Process these 500 files using DeepSeek
```

DeepSeek V3 costs ~1/50th of GPT-4o for similar quality on many tasks.

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

- **Reasoning:** o1 for complex logic
- **Speed:** Gemini Flash for quick responses
- **Cost:** DeepSeek for bulk processing
- **Quality:** Claude Opus for nuanced writing

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

## Next Steps

- [Pricing Details](pricing.md)
- [Models List](../../api-reference/models.md)
- [SDK Documentation](../../sdks/python.md)
- [Wallet Setup](../../getting-started/wallet-setup.md)
