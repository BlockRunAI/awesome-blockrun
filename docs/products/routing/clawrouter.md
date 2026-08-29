---
title: ClawRouter
description: ClawRouter is a smart LLM router for OpenClaw that picks the optimal model per prompt — materially lower cost with no API keys.
---

# ClawRouter

**88% cheaper than pinning one flagship for every request — 98% on `eco`. Automatically.**

ClawRouter is a smart LLM router for OpenClaw that routes every request to the cheapest model that can handle it. One wallet, 71 models, zero API keys.

:::tip{title="In a hurry?"}
Install, fund a wallet, then run `/model blockrun/auto` in any OpenClaw conversation — that's it. Current release: **v0.12.253** (August 29, 2026).
:::

## Overview

ClawRouter analyzes your prompt and automatically picks the right model tier:

- **Simple questions** → Cheap models (Gemini 2.5 Flash on `auto`; a free NVIDIA-hosted model on `eco`)
- **Medium complexity** → Balanced models (Kimi K2.7)
- **Complex reasoning** → Premium models (Gemini 3.1 Pro on `auto`; Claude Fable 5 on `premium`)
- **Math, logic, proofs** → Reasoning models (Grok 4.1 Fast Reasoning)
- **Turns that need their tools** → Agent-tuned models (Kimi K2.7, Claude Sonnet 4.6) — selected automatically in any profile

**Result:** 88% average cost savings on the auto profile (98% on eco) versus pinning Claude Opus 5, with no quality loss.

## Quick Start

### Installation (2 minutes)

```bash
# 1. Install ClawRouter (registers the plugin, syncs the model list, writes the auth profile, sets up a wallet)
curl -fsSL https://blockrun.ai/ClawRouter-update | bash

# 2. Fund wallet with USDC on Solana or Base ($5 is enough for thousands of requests) — optional, skip for the free tier

# 3. Restart OpenClaw
openclaw gateway restart
```

Prefer plain npm? Install the package, then **run `clawrouter setup`** — a bare `npm install -g` only puts the package on disk and leaves OpenClaw unregistered:

```bash
npm install -g @blockrun/clawrouter
clawrouter setup            # finishes OpenClaw integration — REQUIRED
openclaw gateway restart
```

New installs default to the **Solana** payment chain; existing installs stay on **Base**, where their USDC already lives. Switch any time with `/wallet solana` or `/wallet base`.

### Enable Smart Routing

In any OpenClaw conversation:

```
/model blockrun/auto
```

ClawRouter will now automatically route all requests to the optimal model.

### Standalone (no OpenClaw)

ClawRouter also runs as a local OpenAI-compatible proxy on port 8402 for continue.dev, Cursor, VS Code, ElizaOS, or any OpenAI SDK:

```bash
npx @blockrun/clawrouter
```

Then point your client at `http://localhost:8402` with model `blockrun/auto` and any API key (e.g. `x402`). For continue.dev, `apiBase` must end with `/v1/`.

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8402", api_key="x402")
response = client.chat.completions.create(model="blockrun/auto", messages=[...])
```

## How It Works

ClawRouter does **not** pick "the cheapest model that can handle the prompt" — that framing was tested in v0.12.47 and reverted within 24 hours when fast/cheap models started giving shallow answers on hard tasks. The real architecture is **constraint-first**: hard requirements decide which models may compete, and a multi-objective ranker optimized across quality, cost, speed and reliability decides which one wins.

Since v0.12.242 the decision itself is made by [Router Core](https://github.com/BlockRunAI/router-core) (`@blockrun/router-core`, **V3.4**) — the routing engine extracted from ClawRouter and now shared by every BlockRun product (ClawRouter, Franklin, the `@blockrun/llm` SDKs, ClawRouter-Hermes). ClawRouter inlines it at build time, pinned to an exact commit, and injects its live model catalog at startup.

For the full technical deep-dive, see [Inside ClawRouter's Decision Layer](https://blockrun.ai/signal/clawrouter-quality-vs-cost-real-time-routing) and the [constraint-first router report](https://blockrun.ai/signal/router-v3-4-constraint-first-auto-routing). The summary:

### The Decision Pipeline (<1ms, fully local)

```
1. Classify  → 15-dimension lexical scorer → tier (SIMPLE / MEDIUM / COMPLEX / REASONING)
             → task classifier → shape (chat / extraction / code_edit / code_agent /
               tool_agent / tool_agent_parallel / debug / reasoning / reasoning_math /
               long_context / vision / …)
2. Filter    → hard constraints (tools · vision · context · max-output · structured output ·
               present in the live catalog) remove every model that cannot serve the request
3. Rank      → survivors scored on task quality × capability × cost × speed × reliability,
               with per-profile weights
4. Recover   → winner + the whole ranked list as an ordered fallback chain
```

No external API calls. No LLM inference in the classification step. Pure keyword matching and arithmetic — a warm decision costs about 0.05 ms.

Steps 1 and 3 are the V3 portfolio layer: the tier says how much capability the request needs, the task type says what *kind* of work it is, and the portfolio ranks the eligible models against calibrated per-task evidence. The tier primary is a starting point, not the answer — a code-agent turn and a multiple-choice question in the same tier get different models.

### 15-Dimension Scoring

The classifier reads the prompt and scores it across 15 weighted dimensions:

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
| negationComplexity | 0.01 | "don't", "avoid", "except", "without" |

**Multilingual:** Every keyword list ships in 9 languages (EN, ZH, JA, RU, DE, ES, PT, KO, AR). "证明这个定理" triggers the same reasoning classification as "prove this theorem."

### Tier Mapping

The weighted score lands on a single axis with three boundaries:

```
SIMPLE  <  0.0  <  MEDIUM  <  0.3  <  COMPLEX  <  0.5  <  REASONING
```

We classify the *request*, not the model. Tier first, model second. Two overrides apply on top of the scorer: conversations above 100K tokens are forced to COMPLEX, and structured-output requests (JSON/YAML) are lifted to at least MEDIUM.

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
google/gemini-3.1-pro           ← primary
google/gemini-3-flash-preview
xai/grok-4-0709
google/gemini-2.5-pro
anthropic/claude-sonnet-5
anthropic/claude-sonnet-4.6
deepseek/deepseek-chat
google/gemini-2.5-flash
openai/gpt-5.6-terra
openai/gpt-5.5
openai/gpt-5.4                  ← last resort
```

GPT-5.4 sits last despite the highest IQ — its 6.2s latency creates a worse compounded experience across multi-step workflows than a slightly-lower-IQ model that completes in 1.4s.

Full chains for every profile, plus the per-profile ranking weights, live in the repo's [routing-profiles.md](https://github.com/BlockRunAI/ClawRouter/blob/main/docs/routing-profiles.md).

### Runtime Capability Filtering

Before any model is scored, the candidate set is filtered against six hard constraints:

1. **Context window fit** — must hold (input + estimated output) × 1.10 safety buffer, measured against the *whole* conversation, not the last message
2. **Output length** — must be able to emit the requested `max_tokens`
3. **Tool calling** — if the turn actually needs its tools, only function-calling models stay (`tool_choice: "none"` is authoritative; host tool *descriptions* alone do not trigger it)
4. **Vision** — if request includes images, only vision-capable models stay
5. **Structured output** — an incompatible JSON/structured-output path disqualifies the model
6. **Catalog presence** — a model absent from the live catalog, or one the proxy has observed dead at the gateway (400/404/410), is removed from every chain before selection

A "cheaper" model lacking a required capability is removed from the candidate set, **never silently substituted.** This prevents the classic multi-step failure mode where a tool-call step gets routed to a model that can't actually call tools.

### Per-Request x402 Isolation

Every request is its own settled x402 transaction. There is no session state to corrupt. A provider failure on step 7 of a 20-step workflow doesn't cascade — the proxy walks the fallback chain in isolation for that single request, settles the call, and the workflow continues. Stale-session-state failure modes don't exist for ClawRouter, because we don't have sessions.

### 4-Tier Model Selection

Curated primaries per tier and profile (prices are input/output $/M tokens, as published in the ClawRouter README):

| Tier | ECO Model | AUTO Model | PREMIUM Model | AGENTIC Model ‡ |
|---|---|---|---|---|
| **SIMPLE** | step-3.7-flash (**FREE**) | gemini-2.5-flash ($0.30/$2.50) | kimi-k2.7 † ($0.95/$4.00) | gpt-4o-mini ($0.15/$0.60) |
| **MEDIUM** | gemini-3.1-flash-lite ($0.25/$1.50) | kimi-k2.7 † ($0.95/$4.00) | gpt-5.3-codex ($1.75/$14.00) | kimi-k2.7 † ($0.95/$4.00) |
| **COMPLEX** | gemini-3.1-flash-lite ($0.25/$1.50) | gemini-3.1-pro ($2/$12) | claude-fable-5 ($10/$50) | claude-sonnet-4.6 ($3/$15) |
| **REASONING** | grok-4-1-fast-reasoning † ($0.20/$0.50) | grok-4-1-fast-reasoning † ($0.20/$0.50) | claude-sonnet-4.6 ($3/$15) | claude-sonnet-4.6 ($3/$15) |

† Withheld from `/v1/models` — the router still calls it by direct ID, but you will not find it on the public pricing page. The published savings claim is priced on visible models only, which makes it conservative.
‡ Not a profile you pick — auto-selected in any profile when the turn actually needs its attached tools; prefers models that keep going instead of stopping to ask. Force or disable with `routing.overrides.agenticMode`.

The primary is where the tier starts, not where the request necessarily lands: the portfolio ranks every capability-eligible candidate for the detected task, so a tool-calling turn and a proof in the same tier resolve to different models. `/model free` is an alias rather than a routed profile: it pins the free default (`free/step-3.7-flash`, the same model that opens ECO SIMPLE) and walks the other free models as fallbacks, for $0 routing across the 5 free models.

### Router Core V3.4: measured, with limits

On router-core's frozen three-arm agent benchmark (τ-bench, BrowseComp, Terminal-Bench — three arms per task: the previous rules router, the constraint-first router, and a pinned flagship) the V3.4 policy completed **57%** of tasks vs **49%** for the previous rules router, at **6.4%** lower cost per successful task, and spent **8.9%** of the tokens a pinned flagship would have — while giving up 10 points of success against that flagship. The paired 95% interval on the quality gain is −1.9 to +15.5 points and crosses zero, so the router is not statistically proven better across the production distribution; the scorecard records `releaseEligible: false`. See [Routing Benchmarks](./benchmarks.md).

Two levers exist if you disagree with the new policy: `routing.strategy: "rules"` restores the V2 primary-first selector, and `routing.shadow` compares both strategies locally on a sample of requests without a second paid call.

## Smart Routing Examples

Real decisions from Router Core's bundled defaults on `auto` (prices are output $/M from the ClawRouter README):

| Prompt | Tier / task | Routed To | Output $/M |
|--------|-------------|-----------|------------|
| "What is the capital of France?" | SIMPLE / chat | google/gemini-2.5-flash | $2.50 |
| "Prove that the sum of two odd integers is even, step by step." | REASONING / reasoning | deepseek/deepseek-v4-pro | $0.87 |
| "Cancel order B-42 and book the 9am flight to SFO." (tools attached) | AGENTIC / tool_agent_parallel | anthropic/claude-opus-4.8 | $25.00 |

Note the second row: the REASONING primary is Grok 4.1 Fast Reasoning, but the portfolio ranked DeepSeek V4 Pro higher for this task shape. The tier primary is a starting point. Add `/model eco` and the SIMPLE row becomes a free NVIDIA-hosted model at $0.

## Features

### 100% Local Routing

- 15-dimension weighted scoring runs on your machine in <1ms
- No external API calls for routing decisions
- Full privacy - your prompts never leave your machine for routing

### 71 Models

Access all major providers through one wallet:

- **OpenAI**: GPT-5.6 (Terra, Luna, Sol, and their Pro modes), GPT-5.5, GPT-5.5 Pro, GPT-5.4, GPT-5.4 Pro, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-4.1, GPT-4o, o3, o4-mini
- **Anthropic**: Claude Fable 5, Claude Opus 5, Claude Opus 4.8, Sonnet 5, Sonnet 4.6, Haiku 4.5
- **Google**: Gemini 3.1 Pro, Gemini 3.6 Flash, Gemini 3.5 Flash, Gemini 3.5 Flash Lite, Gemini 2.5 Pro, Gemini 2.5 Flash
- **DeepSeek**: DeepSeek V4 Pro, DeepSeek V4 Flash Chat, DeepSeek Reasoner
- **xAI**: Grok 4.5, Grok 4.3, Grok Build 0.1
- **Z.AI**: GLM-5.2 (flagship, 1M context), GLM-5.1, GLM-5, GLM-5 Turbo
- **Moonshot**: Kimi K3 (flagship, 1M context)
- **Qwen**: Qwen3.7 Max, Qwen3.7 Plus, Qwen3.7 Flash
- **MiniMax**: MiniMax M3, MiniMax M2.7
- **Tencent / Xiaomi**: Hy3, MiMo-V2.5 Pro
- **Free tier (all FREE)**: 5 NVIDIA-hosted chat, reasoning and vision models with no per-token charge

[View all models →](../intelligence/pricing.md)

### x402 Micropayments

- Pay per request with USDC on Solana or Base — both wallets derive from one BIP-39 mnemonic
- Non-custodial - you control your wallet
- No API keys needed
- No subscriptions or prepaid credits

### Open Source

- MIT licensed
- Fully inspectable routing logic — the engine is its own repo, [router-core](https://github.com/BlockRunAI/router-core), pinned by commit
- No black boxes
- [View on GitHub →](https://github.com/BlockRunAI/ClawRouter)

## Usage

### Basic Usage

Once installed and enabled with `/model blockrun/auto`, ClawRouter works automatically:

```
You: Explain quantum computing in simple terms

ClawRouter: [Routes to google/gemini-2.5-flash - SIMPLE tier]
Response: Quantum computing uses quantum mechanics...
```

### Manual Model Selection

You can still override routing for specific requests:

```
/model openai/gpt-5.5
```

Shortcuts also work: `/model grok`, `/model br-sonnet`, `/model gpt5`, `/model o3`, `/model free`.

### Slash Commands

```
/wallet                 # Balance and address (both chains)
/wallet export          # Export mnemonic + keys for backup
/wallet recover         # Restore wallet from mnemonic on a new machine
/wallet solana          # Switch to Solana USDC payments
/wallet base            # Switch to Base (EVM) USDC payments
/stats                  # View usage and savings
/exclude add <model>    # Block a model from routing (aliases work: "grok-4", "free")
/exclude remove <model> # Unblock a model
```

Exclusions persist across restarts (`~/.openclaw/blockrun/exclude-models.json`). If every model in a tier is excluded, the safety net ignores the filter so routing never breaks.

### View Routing Decision

OpenClaw's log shows the tier, the model and the cost of every request:

```bash
openclaw logs --follow
```

```
[plugins] [SIMPLE] google/gemini-2.5-flash $0.0012 (saved 99%)
[plugins] [MEDIUM] deepseek/deepseek-chat $0.0003 (saved 99%)
[plugins] [REASONING] deepseek/deepseek-reasoner $0.0005 (saved 99%)
```

Non-streaming responses also carry `x-clawrouter-profile`, `x-clawrouter-tier`, `x-clawrouter-model`, `x-clawrouter-confidence` and `x-clawrouter-reasoning` headers (set `CLAWROUTER_DEBUG_HEADERS=off` to suppress them).

## Beyond Chat

The same wallet pays for the rest of the gateway through the proxy. Prices as published in the ClawRouter README:

- **Image generation** — `/cr-imagegen a dog dancing on the beach` (`--model`, `--size`). Nine models from $0.015/image (CogView-4) to $0.10/image (Nano Banana Pro); default `gpt-image` at $0.02/image.
- **Image editing** — `/img2img --image ~/photo.png change the background to a starry sky`, with optional `--mask`.
- **Video generation** — `/videogen a red apple slowly spinning` (`--model`, `--duration`), or `POST /v1/videos/generations`. Seedance 1.5 Pro / 2.0 Fast / 2.0 / 2.5, Sora 2, and Grok Imagine; the MP4 is downloaded to local disk so it survives the upstream's temporary bucket.
- **Phone and voice** — `/cr-call +14155552671 "Confirm tomorrow's 3pm meeting"` places a real outbound AI voice call ($0.54 flat, up to 30 minutes); `clawrouter phone lookup|fraud|numbers ...` handles carrier lookup ($0.01), fraud signals ($0.05) and 30-day number leases ($5).
- **Crypto data (Surf)** — `/v1/surf/*` is whitelisted through the proxy: 83 endpoints at a flat $0.0085 per call including the transaction fee, including ad-hoc on-chain SQL.

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

Using Claude Opus 5 for everything:

```
100 requests × 1000 tokens = 100K tokens
100K / 1M × $25 = $2.50
```

### With ClawRouter

Smart routing to appropriate models:

```
70 simple requests → DeepSeek ($0.28/M) = $0.02
20 medium requests → DeepSeek V4 Pro ($0.87/M) = $0.02
10 complex requests → Claude Opus 5 ($25.00/M) = $0.25

Total: $0.29 (saved $2.21 = 88% savings)
```

## Supported Models

ClawRouter has access to all models available through BlockRun Intelligence:

### Chat Models

- **OpenAI**: GPT-5.6 Terra / Luna / Sol (+ Pro), GPT-5.5, GPT-5.5 Pro, GPT-5.4, GPT-5.4 Pro, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-4.1, GPT-4o, o1, o3, o4-mini
- **Anthropic Claude**: Fable 5, Opus 5, Opus 4.8, Sonnet 5, Sonnet 4.6, Haiku 4.5
- **Google Gemini**: 3.1 Pro, 3.6 Flash, 3.5 Flash, 3.5 Flash Lite, 2.5 Pro, 2.5 Flash, 2.5 Flash Lite
- **DeepSeek**: V4 Pro, V4 Flash Chat, Reasoner
- **xAI Grok**: Grok 4.5, Grok 4.3, Grok Build 0.1
- **Z.AI**: GLM-5.2 (1M context), GLM-5.1, GLM-5, GLM-5 Turbo
- **Moonshot**: Kimi K3 flagship (1M context)
- **Qwen**: Qwen3.7 Max, Plus, Flash
- **MiniMax**: MiniMax M3, M2.7
- **Tencent / Xiaomi**: Hy3, MiMo-V2.5 Pro
- **Free tier**: 5 models, no per-token charge

### Image Generation

- GPT Image 1 / GPT Image 2
- Nano Banana / Nano Banana 2 / Nano Banana Pro
- Seedream 5
- Grok Imagine / Grok Imagine Pro
- CogView-4

[View full pricing →](../intelligence/pricing.md)

## SDK Integration

Use ClawRouter's smart routing directly in your code with the `smart_chat()` method. The SDKs run the same Router Core engine — the Python SDK carries a line-by-line port, pinned to the same upstream commit, so an identical request routes identically in both languages:

::::tabs

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()

# Auto-route to optimal model
result = client.smart_chat("What is 2+2?")
print(result.response)        # "4"
print(result.model)           # "google/gemini-2.5-flash"
print(result.routing.tier)    # "SIMPLE"
print(result.routing.savings) # 0.94 (94% savings)

# Use routing profiles
result = client.smart_chat("Complex reasoning task...", routing_profile="premium")
```

[Python SDK Documentation](../../sdks/python.md#smart-routing-router-core)
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

// Auto-route to optimal model
const result = await client.smartChat('What is 2+2?');
console.log(result.response);        // "4"
console.log(result.model);           // "google/gemini-2.5-flash"
console.log(result.routing.tier);    // "SIMPLE"
console.log(result.routing.savings); // 0.94

// Use routing profiles
const result2 = await client.smartChat('Complex reasoning task...', {
  routingProfile: 'premium'
});
```

[TypeScript SDK Documentation](../../sdks/typescript.md#smart-routing-router-core-v3)
:::

::::

### Routing Profiles

All SDKs support the same routing profiles:

| Profile | Behavior | Best For |
|---------|----------|----------|
| `eco` | Maximizes cost savings — opens on the free tier | Bulk processing |
| `auto` | Balances quality and cost (default) | Production workloads |
| `premium` | Always uses top-tier models | Critical tasks |

## Other Harnesses

- **OpenClaw** — the plugin above (slash commands, usage reports, image/video/voice commands).
- **Any OpenAI-compatible client** — continue.dev, Cursor, VS Code extensions, ElizaOS, custom agents — via the standalone proxy on `http://localhost:8402`.
- **NousResearch Hermes** — [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) (`pip install hermes-plugin-clawrouter`) supervises a local ClawRouter proxy for `hermes-agent`; same wallet, same routing engine.
- **Claude Code** — use [BRCC](https://github.com/BlockRunAI/brcc), which is purpose-built for Claude Code with the same smart routing and x402 payments.
- **OKX Agentic Wallet** — [XClawRouter](https://github.com/BlockRunAI/XClawRouter) is the same router with the wallet held in OKX's TEE instead of a local key: `curl -fsSL https://blockrun.ai/XClawRouter-update | bash`, then `npx @blockrun/xclawrouter setup` for an email + OTP login. No local private key is stored.

## Configuration

### Environment Variables

For basic usage, no configuration is needed. For advanced options:

| Variable | Default | Description |
|---|---|---|
| `BLOCKRUN_WALLET_KEY` | auto-generated | Your wallet private key (a saved `~/.openclaw/blockrun/wallet.key` takes priority) |
| `BLOCKRUN_PROXY_PORT` | `8402` | Local proxy port |
| `CLAWROUTER_PAYMENT_CHAIN` | persisted selection | `solana` or `base`; overrides the saved payment chain |
| `CLAWROUTER_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint for balance checks |
| `CLAWROUTER_DISABLED` | `false` | Disable smart routing (pass requests through as-is) |
| `CLAWROUTER_DEBUG_HEADERS` | `on` | Set to `off` to suppress `x-clawrouter-*` debug response headers |
| `CLAWROUTER_TOOL_CALL_PROSE` | `on` | Set to `off` to blank assistant prose on tool-calling turns (the pre-v0.12.248 behavior) |
| `BLOCKRUN_WEB_SEARCH` | auto-enabled | Set to `off` to skip registering BlockRun's Exa web search provider with OpenClaw |

### Advanced Settings

Routing overrides live in the plugin block of `~/.openclaw/openclaw.yaml` and are merged over Router Core's defaults — override just one tier without redefining the other three:

```yaml
plugins:
  - id: "@blockrun/clawrouter"
    config:
      maxCostPerRun: 0.50          # USD per session; default: no limit
      maxCostPerRunMode: graceful  # graceful = downgrade premium → auto → eco → free; strict = 429 at the cap
      routing:
        strategy: portfolio        # "rules" rolls back to the V2 primary-first selector
        # shadow: { strategy: rules, sampleRate: 0.1 }   # compare locally, no second paid call
        tiers:
          COMPLEX:
            primary: "anthropic/claude-sonnet-5"
            fallback: ["google/gemini-3.1-pro", "openai/gpt-5.6-terra"]
        # ecoTiers / premiumTiers / agenticTiers take the same shape; `agenticTiers: null` disables agentic switching
        classifier:
          confidenceThreshold: 0.7
        overrides:
          maxTokensForceComplex: 100000
          structuredOutputMinTier: MEDIUM
          ambiguousDefaultTier: MEDIUM
          # agenticMode: true | false   # force / disable the agentic tier set
```

Image generation bypasses `maxCostPerRun` — it is charged per x402 payment and not tracked per session. Full reference: [configuration.md](https://github.com/BlockRunAI/ClawRouter/blob/main/docs/configuration.md).

## Troubleshooting

### ClawRouter not routing

Run the checklist:

```bash
cat ~/.openclaw/extensions/clawrouter/package.json | grep version   # should be 0.12+
curl http://localhost:8402/health                                   # proxy up, wallet, chain, balance
```

Then, in a conversation, `/wallet` for both addresses and the balance. If you installed with `npm install -g` and `/models` shows only OpenClaw's handful of defaults, run `clawrouter setup`.

For anything else, the doctor collects diagnostics and asks a model to analyze them:

```bash
npx @blockrun/clawrouter doctor                     # Sonnet, ~$0.003
npx @blockrun/clawrouter doctor opus "why is my request failing?"   # Opus, ~$0.01
```

### Wrong model selected

Watch the decision per request:

```bash
openclaw logs --follow
```

Then either pin a model (`/model <id>`), block one (`/exclude add <model>`), or override the tier's chain in `openclaw.yaml` (see above). `x-clawrouter-reasoning` on a non-streaming response explains the pick.

### High costs

Check what you spent and on what:

```
/stats
```

Set a session cap with `maxCostPerRun`, switch to `/model eco`, or `/exclude add gpt-5.4` to keep expensive models out of the chains.

### Updating

```bash
npx @blockrun/clawrouter@latest
openclaw gateway restart
```

## FAQ

### Do I need API keys?

No. ClawRouter uses x402 micropayments with USDC on Solana or Base. Just fund your wallet — or stay on the 5 free models with no wallet at all.

### How much should I fund my wallet?

$5 USDC is enough for thousands of requests. Average request costs $0.001-0.01.

### Can I use specific models?

Yes. Use `/model <model-id>` to override smart routing for specific requests.

### Is my data sent to BlockRun?

Routing decisions happen locally. The prompt itself is sent through the BlockRun gateway to the model you're routed to; nothing is sent anywhere to decide the route.

### Can I see the routing algorithm?

Yes. ClawRouter is [fully open source](https://github.com/BlockRunAI/ClawRouter) under MIT license, and the routing engine is its own MIT repo, [router-core](https://github.com/BlockRunAI/router-core).

### Does it work offline?

No. AI model access requires internet. But routing decisions are made locally.

## What's next?

::::cards

:::card{title="View all models" href="../intelligence/overview.md" icon="Brain"}
71 LLMs across OpenAI, Anthropic, Google, xAI, DeepSeek, Z.AI, Moonshot, MiniMax, and the free tier.
:::

:::card{title="Check pricing" href="../intelligence/pricing.md" icon="Zap"}
Per-token pricing, the free tier, and a what-$1-gets-you breakdown.
:::

:::card{title="Set up your wallet" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana and start routing in minutes.
:::

::::

## Support

- **GitHub Issues**: [Report a bug](https://github.com/BlockRunAI/ClawRouter/issues)
- **Telegram**: [Join community](https://t.me/blockrunAI)
- **Documentation**: [BlockRun Docs](https://blockrun.ai/docs)
