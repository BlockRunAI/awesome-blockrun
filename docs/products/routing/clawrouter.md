# ClawRouter

**Save 78% on LLM costs. Automatically.**

ClawRouter is a smart LLM router for OpenClaw that routes every request to the cheapest model that can handle it. One wallet, 33+ models, zero API keys.

## Overview

ClawRouter analyzes your prompt and automatically picks the right model tier:

- **Simple questions** → Cheap models (DeepSeek, Gemini Flash)
- **Medium complexity** → Balanced models (GPT-4o-mini, Claude Haiku)
- **Complex reasoning** → Premium models (Claude Opus, GPT-5.5)
- **Code generation** → Specialized models (Claude Sonnet, DeepSeek Coder)

**Result:** 78% average cost savings with no quality loss.

## Quick Start

### Installation (2 minutes)

```bash
# 1. Install ClawRouter
curl -fsSL https://raw.githubusercontent.com/BlockRunAI/ClawRouter/main/scripts/reinstall.sh | bash

# 2. Fund wallet with USDC on Base ($5 is enough for thousands of requests)

# 3. Restart OpenClaw
openclaw gateway restart
```

### Enable Smart Routing

In any OpenClaw conversation:

```
/model blockrun/auto
```

ClawRouter will now automatically route all requests to the optimal model.

## How It Works

ClawRouter does **not** pick "the cheapest model that can handle the prompt" — that framing was tested in v0.12.47 and reverted within 24 hours when fast/cheap models started giving shallow answers on hard tasks. The real architecture is **tier-first, model-second**, with a multi-objective scoring system optimized across quality, cost, and latency simultaneously.

For the full technical deep-dive, see [Inside ClawRouter's Decision Layer](https://blockrun.ai/signal/clawrouter-quality-vs-cost-real-time-routing). The summary:

### The Decision Pipeline (<1ms, fully local)

```
1. Lexical scoring        → 14 weighted dimensions, score ∈ [-1, 1] each
2. Tier mapping           → SIMPLE / MEDIUM / COMPLEX / REASONING
3. Confidence calibration → sigmoid; below 0.7 → AMBIGUOUS → defaults to MEDIUM
4. Profile resolution     → auto / eco / premium → primary + ordered fallback
5. Capability filtering   → context window, tool calling, vision
```

No external API calls. No LLM inference in the classification step. Pure keyword matching and arithmetic.

### 14-Dimension Scoring

The classifier reads the prompt and scores it across 14 weighted dimensions. Weights sum to 1.0:

| Dimension | Weight | Detects |
|---|---|---|
| reasoningMarkers | 0.18 | "prove", "theorem", "step by step" |
| codePresence | 0.15 | "function", "class", "import", backticks |
| multiStepPatterns | 0.12 | "first…then", numbered lists, "step N" |
| technicalTerms | 0.10 | "algorithm", "kubernetes", "distributed" |
| tokenCount | 0.08 | <50 tokens vs >500 tokens |
| creativeMarkers | 0.05 | "story", "poem", "brainstorm" |
| questionComplexity | 0.05 | >3 question marks |
| agenticTask | 0.04 | "edit", "deploy", "fix", "debug" |
| constraintCount | 0.04 | "at most", "within", "O()" |
| imperativeVerbs | 0.03 | "build", "create", "implement" |
| outputFormat | 0.03 | "json", "yaml", "table", "csv" |
| simpleIndicators | 0.02 | "what is", "hello", "define" |
| referenceComplexity | 0.02 | "the code above", "the API docs" |
| domainSpecificity | 0.02 | "quantum", "FPGA", "genomics" |

**Multilingual:** Every keyword list ships in 9 languages (EN, ZH, JA, RU, DE, ES, PT, KO, AR). "证明这个定理" triggers the same reasoning classification as "prove this theorem."

### Tier Mapping

The weighted score lands on a single axis with three boundaries:

```
SIMPLE  <  0.0  <  MEDIUM  <  0.3  <  COMPLEX  <  0.5  <  REASONING
```

We classify the *request*, not the model. Tier first, model second.

### Sigmoid Confidence Calibration

When a score lands near a tier boundary, we don't trust it. The router runs:

```
confidence = 1 / (1 + exp(-12 × distance_from_boundary))
```

If confidence drops below 0.7, the request is reclassified as AMBIGUOUS and **defaults to MEDIUM, never SIMPLE.** The router fails upward, never downward — under uncertainty we'd rather spend a bit more than ship a bad result.

### Quality-First Fallback Chains

Each tier × profile combination resolves to a primary model plus an ordered fallback chain. Fallback ordering is the most important property of the system — the primary handles the happy path, the fallback handles reality (rate limits, outages, payment failures).

We descend by **quality first**, then trade quality for speed. Example COMPLEX-tier fallback under `auto`:

```
gemini-3-pro-preview      IQ 48, 1,352ms  ← primary
gemini-3-flash-preview    IQ 46, 1,398ms
grok-4-0709               IQ 41, 1,348ms
gemini-2.5-pro                   1,294ms
claude-sonnet-4.6         IQ 52, 2,110ms
deepseek-chat             IQ 32, 1,431ms
gemini-2.5-flash          IQ 20, 1,238ms
gpt-5.4                   IQ 57, 6,213ms  ← last resort
```

GPT-5.4 sits last despite the highest IQ — its 6.2s latency creates a worse compounded experience across multi-step workflows than a slightly-lower-IQ model that completes in 1.4s.

### Runtime Capability Filtering

Before any model is dispatched, the candidate set is filtered against three hard constraints:

1. **Context window fit** — must hold (input + estimated output) × 1.10 safety buffer
2. **Tool calling** — if request includes tools, only function-calling models stay
3. **Vision** — if request includes images, only vision-capable models stay

A "cheaper" model lacking a required capability is removed from the candidate set, **never silently substituted.** This prevents the classic multi-step failure mode where a tool-call step gets routed to a model that can't actually call tools.

### Per-Request x402 Isolation

Every request is its own settled x402 transaction. There is no session state to corrupt. A provider failure on step 7 of a 20-step workflow doesn't cascade — the proxy walks the fallback chain in isolation for that single request, settles the call, and the workflow continues. Stale-session-state failure modes don't exist for ClawRouter, because we don't have sessions.

### 4-Tier Model Selection

| Tier | Model | Cost | Use Case |
|------|-------|------|----------|
| **SIMPLE** | nvidia/kimi-k2.5 | FREE | Q&A, summaries, simple tasks |
| **MEDIUM** | deepseek/deepseek-chat | $0.42/M | Analysis, writing, coding |
| **COMPLEX** | google/gemini-3.1-pro-preview | $12.00/M | Advanced reasoning, research |
| **REASONING** | xai/grok-4-1-fast-reasoning | $15.00/M | Math, logic, proofs |

*Prices shown are output costs per 1M tokens (after 5% BlockRun markup)*

## Smart Routing Examples

| Prompt | Routed To | Cost | Savings |
|--------|-----------|------|---------|
| "What is 2+2?" | DeepSeek | $0.27/M | 99% |
| "Summarize this article" | GPT-4o-mini | $0.60/M | 99% |
| "Build a React component" | Claude Sonnet | $15.00/M | 80% |
| "Prove this theorem" | DeepSeek-R | $0.42/M | 99% |
| "Run 50 parallel searches" | Kimi K2.5 | $2.40/M | 97% |

## Features

### 100% Local Routing

- 14-dimension weighted scoring runs on your machine in <1ms
- No external API calls for routing decisions
- Full privacy - your prompts never leave your machine for routing

### 33+ Models

Access all major providers through one wallet:

- **OpenAI**: GPT-5.5, GPT-5.4, GPT-5.2, o1, o3
- **Anthropic**: Claude Opus 4.7, Sonnet 4.6, Haiku 4.5
- **Google**: Gemini 3 Pro, Gemini 2.5 Pro/Flash
- **DeepSeek**: DeepSeek V3, DeepSeek Reasoner
- **xAI**: Grok 4.20, Grok 4 Fast (2M context)
- **Moonshot**: Kimi K2.6 (flagship, vision + reasoning), Kimi K2.5
- **NVIDIA**: GPT-OSS 120B (FREE)

[View all models →](../intelligence/pricing.md)

### x402 Micropayments

- Pay per request with USDC on Base
- Non-custodial - you control your wallet
- No API keys needed
- No subscriptions or prepaid credits

### Open Source

- MIT licensed
- Fully inspectable routing logic
- No black boxes
- [View on GitHub →](https://github.com/BlockRunAI/ClawRouter)

## Usage

### Basic Usage

Once installed and enabled with `/model blockrun/auto`, ClawRouter works automatically:

```
You: Explain quantum computing in simple terms

ClawRouter: [Routes to nvidia/kimi-k2.5 - FREE]
Response: Quantum computing uses quantum mechanics...
```

### Manual Model Selection

You can still override routing for specific requests:

```
/model openai/gpt-5.5
```

### View Routing Decision

ClawRouter logs show which model was selected and why:

```
[ClawRouter] Prompt complexity: LOW → Tier: SIMPLE → Model: nvidia/kimi-k2.5
[ClawRouter] Cost: $0.0000 (saved $0.0150 vs. Claude Opus)
```

## Why ClawRouter?

### vs. OpenRouter / LiteLLM

|  | OpenRouter / LiteLLM | ClawRouter |
|--|---------------------|------------|
| **Setup** | Human creates account | Agent generates wallet |
| **Auth** | API key (shared secret) | Wallet signature (cryptographic) |
| **Payment** | Prepaid balance (custodial) | Per-request (non-custodial) |
| **Routing** | Proprietary / closed | Open source, client-side |
| **Agent-friendly** | No - needs human setup | Yes - agents can self-provision |

**ClawRouter is built for AI agents**, not developers.

- No account creation needed
- No API keys to manage
- Agents can fund their own wallets
- Cryptographic authentication (no shared secrets)

## Cost Comparison

### Without ClawRouter

Using Claude Opus 4 for everything:

```
100 requests × 1000 tokens = 100K tokens
100K / 1M × $75 = $7.50
```

### With ClawRouter

Smart routing to appropriate models:

```
70 simple requests → DeepSeek ($0.42/M) = $0.03
20 medium requests → Claude Haiku ($5.00/M) = $0.10
10 complex requests → Claude Opus ($75.00/M) = $0.75

Total: $0.88 (saved $6.62 = 88% savings)
```

## Supported Models

ClawRouter has access to all models available through BlockRun Intelligence:

### Chat Models

- **OpenAI GPT-5.5 Family**: GPT-5.5
- **OpenAI GPT-5.4 Family**: GPT-5.4, GPT-5.4 Pro
- **OpenAI GPT-5 Family**: GPT-5.2, GPT-5 Mini, GPT-5 Nano
- **OpenAI GPT-4 Family**: GPT-4.1, GPT-4o, GPT-4o-mini
- **OpenAI O-Series**: o1, o1-mini, o3, o3-mini
- **Anthropic Claude**: Opus 4/4.5, Sonnet 4, Haiku 4.5
- **Google Gemini**: 3 Pro, 2.5 Pro, 2.5 Flash
- **DeepSeek**: V3 Chat, V3 Reasoner
- **xAI Grok**: Grok 3, Grok 4 (2M context), Grok Mini
- **Moonshot**: Kimi K2.6 flagship (256K, vision + reasoning), Kimi K2.5 legacy
- **NVIDIA Free**: GPT-OSS 120B, GPT-OSS 20B

### Image Generation

- DALL-E 3
- Nano Banana
- Flux 1.1 Pro

[View full pricing →](../intelligence/pricing.md)

## SDK Integration

Use ClawRouter's smart routing directly in your code with the `smart_chat()` method:

### Python SDK

```python
from blockrun_llm import LLMClient

client = LLMClient()

# Auto-route to optimal model
result = client.smart_chat("What is 2+2?")
print(result.response)        # "4"
print(result.model)           # "deepseek/deepseek-chat"
print(result.routing.tier)    # "SIMPLE"
print(result.routing.savings) # 0.94 (94% savings)

# Use routing profiles
result = client.smart_chat("Complex reasoning task...", routing_profile="premium")
```

[Python SDK Documentation](../../sdks/python.md#smart-routing-clawrouter)

### TypeScript SDK

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Auto-route to optimal model
const result = await client.smartChat('What is 2+2?');
console.log(result.response);        // "4"
console.log(result.model);           // "deepseek/deepseek-chat"
console.log(result.routing.tier);    // "SIMPLE"
console.log(result.routing.savings); // 0.94

// Use routing profiles
const result2 = await client.smartChat('Complex reasoning task...', {
  routingProfile: 'premium'
});
```

[TypeScript SDK Documentation](../../sdks/typescript.md#smart-routing-clawrouter)

### XRPL SDK (RLUSD)

```python
from blockrun_llm_xrpl import LLMClient

client = LLMClient()  # Uses BLOCKRUN_XRPL_SEED

# Smart routing works the same on XRPL
result = client.smart_chat("Prove that sqrt(2) is irrational")
print(result.model)  # "xai/grok-4-1-fast-reasoning"
print(result.routing.tier)  # "REASONING"
```

[XRPL SDK Documentation](../../sdks/xrpl.md#smart-routing-clawrouter)

### Routing Profiles

All SDKs support the same routing profiles:

| Profile | Behavior | Best For |
|---------|----------|----------|
| `free` | Always uses free NVIDIA models | Development, testing |
| `eco` | Maximizes cost savings | Bulk processing |
| `auto` | Balances quality and cost (default) | Production workloads |
| `premium` | Always uses top-tier models | Critical tasks |

## Configuration

### Environment Variables

ClawRouter reads your wallet configuration from OpenClaw:

```bash
# Set in OpenClaw settings
BASE_CHAIN_WALLET_KEY=0x...
```

### Advanced Settings

Edit `~/.openclaw/clawrouter.config.json`:

```json
{
  "costWeight": 0.7,        // How much to prioritize cost (0-1)
  "qualityWeight": 0.3,     // How much to prioritize quality (0-1)
  "enableFreeModels": true, // Use NVIDIA free models when appropriate
  "maxCostPerRequest": 0.10 // Maximum cost per request in USD
}
```

## Troubleshooting

### ClawRouter not routing

Check installation:

```bash
openclaw gateway status
```

Should show:

```
✓ ClawRouter plugin loaded
✓ Connected to BlockRun Intelligence
✓ Wallet: 0x123...789 (funded)
```

### Wrong model selected

View routing logs:

```bash
tail -f ~/.openclaw/logs/clawrouter.log
```

### High costs

Check your settings:

```bash
openclaw gateway config show
```

Adjust cost weight:

```bash
openclaw gateway config set costWeight 0.9
```

## FAQ

### Do I need API keys?

No. ClawRouter uses x402 micropayments with USDC on Base. Just fund your wallet.

### How much should I fund my wallet?

$5 USDC is enough for thousands of requests. Average request costs $0.001-0.01.

### Can I use specific models?

Yes. Use `/model <model-id>` to override smart routing for specific requests.

### Is my data sent to BlockRun?

Only your prompts are sent to the AI provider you're routed to. Routing decisions happen locally.

### Can I see the routing algorithm?

Yes. ClawRouter is [fully open source](https://github.com/BlockRunAI/ClawRouter) under MIT license.

### Does it work offline?

No. AI model access requires internet. But routing decisions are made locally.

## Next Steps

- [View All Models](../intelligence/overview.md)
- [Check Pricing](../intelligence/pricing.md)
- [Setup Wallet](../../getting-started/wallet-setup.md)
- [View on GitHub](https://github.com/BlockRunAI/ClawRouter)

## Support

- **GitHub Issues**: [Report a bug](https://github.com/BlockRunAI/ClawRouter/issues)
- **Telegram**: [Join community](https://t.me/+mroQv4-4hGgzOGUx)
- **Documentation**: [BlockRun Docs](https://blockrun.ai/docs)
