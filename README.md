# BlockRun

**The Discovery Layer for AI Agent Payments**

[![Website](https://img.shields.io/badge/Website-blockrun.ai-blue)](https://blockrun.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@BlockRunAI-1DA1F2)](https://x.com/BlockRunAI)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4)](https://t.me/+mroQv4-4hGgzOGUx)
[![Research](https://img.shields.io/badge/Research-State%20of%20x402-orange)](./research/State_of_x402_2025.pdf)

> **BlockRun** is the routing & payment layer for AI — one endpoint where AI agents autonomously discover, route, and pay for APIs using USDC via the x402 protocol. BlockRun provides pay-per-request access to <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> large language models (including GPT-5, Claude, Gemini, Grok, DeepSeek, and Kimi), image generation, neural web search (Exa), DEX data, trading signals, and prediction market data. No API keys, no subscriptions, no vendor lock-in.
>
> **For Claude Code users:** Add BlockRun in one command — access <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> models, DEX data, trading signals, and more without managing any API keys.
> ```bash
> claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
> ```

---

## Table of Contents

- [Quick Start](#quick-start)
- [API Products](#api-products)
- [Supported Models](#supported-models)
- [Networks](#networks)
- [SDKs](#sdks)
- [MCP Tools](#mcp-tools)
- [Smart Routing](#smart-routing)
- [Framework Integrations](#framework-integrations)
- [Projects Built with BlockRun](#projects-built-with-blockrun)
- [Ecosystem](#ecosystem)
- [Research](#research)
- [Vision](#vision)
- [Community](#community)

---

## Quick Start

```python
from blockrun_llm import LLMClient

client = LLMClient(private_key="0x...")

# Chat with any model — payment handled via x402
response = client.chat("Hello!")

# Smart routing — auto-picks cheapest capable model
response = client.smart_chat("Summarize this article", profile="eco")

# Image generation
from blockrun_llm import ImageClient
img = ImageClient(private_key="0x...")
result = img.generate("A cyberpunk city at sunset", model="openai/gpt-image-1")

# Neural web search via Exa
results = client.search("latest AI agent frameworks")  # $0.011/search on Base or Solana
```

```typescript
import { LLMClient, ImageClient } from 'blockrun-llm';

const client = new LLMClient({ privateKey: '0x...' });

// Chat with any model
const response = await client.chat('Hello!');

// Smart routing
const smart = await client.smartChat('Summarize this', { profile: 'eco' });


```

---

## API Products

BlockRun is a unified API gateway — pay per request with USDC, no API keys needed.

| Product | Endpoint | Pricing | Description |
|---------|----------|---------|-------------|
| **LLM Chat** | `/v1/chat/completions` | Per token | OpenAI-compatible, <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> models, streaming, tool calling |
| **Anthropic-Compat** | `/v1/messages` | Per token | Drop-in for Claude's Messages API |
| **Image Generation** | `/v1/images/generations` | $0.015–0.15/image | GPT Image 1/2, Nano Banana / 2 / Pro, Grok Imagine / Pro, Seedream 5.0 Pro, CogView-4 |
| **Image Editing** | `/v1/images/image2image` | Per request | AI-powered inpainting and image-to-image |
| **Video Generation** | `/v1/videos/generations` | Per M tokens | Seedance 1.5 Pro, 2.0 Fast, 2.0 Pro, 2.5 (with BytePlus RealFace support); Grok Imagine Video |
| **Music Generation** | `/v1/audio/generations` | Per track | Suno-powered text-to-music |
| **Voice Calls** | `/v1/voice/call` | $0.541/call (flat, ≤30min) | Outbound AI conversation calls — Bland.ai upstream |
| **Phone Numbers** | `/v1/phone/numbers/*` | $5.001/30 days | Wallet-owned US/CA numbers — Twilio upstream |
| **Surf Crypto Data** | `/api/v1/surf/*` | $0.0085 | 83 endpoints: CEX, on-chain SQL, prediction markets, wallet labels, social mindshare, news, search (asksurf.ai) |
| **Web Search** | `/api/v1/exa/*` | $0.011/search | Neural web search, find-similar, page contents, AI answers (Exa) |
| **DEX Aggregation** | `/api/v1/zerox/*` | Free | 0x Swap V2 + Gasless V2 across 100+ venues |
| **Sandbox Runtime** | `/api/v1/modal/*` | Per run | Secure isolated Python execution (Modal) |
| **Prediction Markets** | `/v1/pm/*` | $0.0085 | Polymarket, Kalshi, Limitless, Opinion, Predict.Fun, Binance Futures (Predexon) |
| **Trading Markets** | `/v1/stocks/{market}/*` | $0.002 | Equity tickers across US, KR, JP, CN, etc. (Pyth) |
| **Models** | `/v1/models` | Free | List all available models with pricing |
| **Pricing** | `/v1/pricing` | Free | Detailed pricing for all models |
| **Balance** | `/v1/balance` | Free | Check USDC wallet balance |

### Prediction Markets

Real-time prediction market data powered by Predexon:

| Market | Endpoints | Price |
|--------|-----------|-------|
| **Polymarket** | Markets, events, trades, orderbooks, leaderboards, positions, crypto | $0.0085 |
| **Kalshi** | Markets, trades, orderbooks | $0.0085 |
| **Limitless** | Markets, orderbooks | $0.0085 |
| **Opinion** | Markets, orderbooks | $0.0085 |
| **Predict.Fun** | Markets, orderbooks | $0.0085 |
| **Binance Futures** | Candles, ticks | $0.0085 |
| **UMA oracle** | Proposed and settled markets | $0.0085 |
| **Wallet intelligence** | Identity resolution, on-chain cluster | $0.0085 |
| **Cross-venue** | `markets/search` — Polymarket, Kalshi, Limitless, Opinion, Predict.Fun in one call | $0.0085 |

> **dFlow was removed 2026-08-04.** All three `dflow/*` paths return upstream
> route-not-found; the category no longer exists in Predexon v2. `sports/*` is
> temporarily withheld — it returns an upstream `500` and is excluded from
> discovery until the partner restores it.

---

## Supported Models

**<!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> models** across 11 providers — 5 of them free and keyless. All accessible through a single OpenAI-compatible API.

### LLMs

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| **OpenAI** | GPT-5.6 Sol / Sol Pro / Terra / Terra Pro / Luna / Luna Pro, GPT-5.5, GPT-5.5 Pro, GPT-5.4, GPT-5.4 Pro, GPT-5.4 Mini, GPT-5.4 Nano, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-5 Mini, ChatGPT Instant, GPT-4.1 / Mini / Nano, GPT-4o / Mini, o1, o3, o3-mini, o4-mini | $0.10–$30.00 / $0.40–$180.00 |
| **Anthropic** | Claude Fable 5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.5, Claude Sonnet 5, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Haiku 4.5 | $1.00–$10.00 / $5.00–$50.00 |
| **Google** | Gemini 3.6 Flash, Gemini 3.5 Flash, Gemini 3.5 Flash Lite, Gemini 3.1 Pro, Gemini 3.1 Flash Lite, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite | $0.10–$2.00 / $0.40–$12.00 |
| **DeepSeek** | DeepSeek V4 Flash Chat, DeepSeek V4 Flash Reasoner, DeepSeek V4 Pro | $0.14–$0.435 / $0.28–$0.87 |
| **Z.AI** | GLM-5.3, GLM-5.3 Flash, GLM-5.2, GLM-5.1, GLM-5, GLM-5 Turbo, GLM-5 Code | $0.15–$1.40 / $0.50–$5.00 |
| **Moonshot** | Kimi K3 (1M context, 2.8T open MoE, flagship) | $3.00 / $15.00 |
| **MiniMax** | MiniMax M3, MiniMax M2.7 (204K context, reasoning) | $0.30 / $1.20 |
| **Qwen** | Qwen3.7 Max (1M context, Alibaba flagship), Qwen3.7 Plus, Qwen3.7 Flash | $0.03–$1.48 / $0.13–$4.43 |
| **Tencent** | Hy3 | $0.132 / $0.528 |
| **Xiaomi** | MiMo-V2.5 Pro | $0.435 / $0.87 |
| **NVIDIA** | Step 3.7 Flash, Nemotron 3 Nano Omni, Nemotron Nano 9B v2, Nemotron Nano 12B v2 VL, Mistral Nemotron (5 free models, keyless — no wallet needed) | **Free** |

### Reasoning

| Model | Price (input/output per 1M) |
|-------|---------------------------|
| OpenAI o1 | $15.00 / $60.00 |
| OpenAI o3 | $2.00 / $8.00 |
| OpenAI o3-mini, o4-mini | $1.10 / $4.40 |
| DeepSeek V4 Flash Reasoner | $0.14 / $0.28 |

### Image Generation

| Model | Price per image |
|-------|----------------|
| OpenAI GPT Image 1 | $0.02–0.04 |
| OpenAI ChatGPT Images 2.0 | $0.06–0.12 |
| Nano Banana | $0.05 |
| Nano Banana 2 | $0.09 |
| Nano Banana Pro | $0.10–0.15 |
| Grok Imagine | $0.02 |
| Grok Imagine Pro | $0.07 |
| Seedream 5.0 Pro | $0.045–0.09 |
| CogView-4 | $0.015–0.02 |

> Full pricing: `GET /v1/pricing` or see [Pricing docs](./docs/products/intelligence/pricing.md)

---

## Networks

BlockRun runs on two networks with separate gateways:

| Network | Gateway | Asset | Status |
|---------|---------|-------|--------|
| **Base** | `blockrun.ai` | USDC | ✅ Live (<!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> models) |
| **Solana** | `sol.blockrun.ai` | USDC | ✅ Live |
| **Polygon / Arbitrum / Optimism / Unichain** | `nano.blockrun.ai` | USDC via Circle Gateway (gas-free, batched) | ✅ Live |
| **Base Sepolia** | `testnet.blockrun.ai` | USDC (testnet) | ✅ Testnet |

**Payment protocol:** x402 (HTTP 402 "Payment Required") — wallet signs payment, no accounts or API keys needed. Per-token chat carries no platform margin — only a flat $0.001 transaction fee per request; media generation and Live Search carry 5%.

**Enterprise (coming soon):** `user.blockrun.ai` — API keys (`brk_live_…`) + wire billing, billed post-hoc at exact usage with no per-call minimum. Sign-in is not yet open; ask on [Telegram](https://t.me/+mroQv4-4hGgzOGUx).

---

## SDKs

| Language | Install | Features | Repository |
|:--------:|---------|----------|:----------:|
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | `pip install blockrun-llm` | Chat, Images, Search, Prediction Markets, Smart Routing, Solana | [GitHub](https://github.com/blockrunai/blockrun-llm) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | `npm i blockrun-llm` | Chat, Images, Search, OpenAI-compatible drop-in, Smart Routing, Solana | [GitHub](https://github.com/blockrunai/blockrun-llm-ts) |
| ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) | `go get github.com/blockrunai/blockrun-llm-go` | Chat, Images, Video, Music, Speech, Voice, Search, Market Data, Prediction Markets, DeFi/DEX, Multi-chain RPC, Solana | [GitHub](https://github.com/blockrunai/blockrun-llm-go) |
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | `pip install blockrun-llm-vip` | Native Anthropic + OpenAI passthrough — subclasses the official SDKs, responses verbatim, zero model substitution | [GitHub](https://github.com/BlockRunAI/blockrun-llm-vip) |
| ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) | `go get github.com/BlockRunAI/blockrun-llm-go-vip` | Native Anthropic + OpenAI passthrough — official `anthropic-sdk-go` / `openai-go` client types | [GitHub](https://github.com/BlockRunAI/blockrun-llm-go-vip) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | `npm i @blockrun/nano-client` | Same catalog via `nano.blockrun.ai` — gas-free batched USDC (Circle Gateway) on Polygon, Arbitrum, Optimism, Unichain | [GitHub](https://github.com/BlockRunAI/blockrun-nano-client) |
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | `pip install blockrun-litellm` | LiteLLM adapter — custom provider or local OpenAI-compatible proxy, Base + Solana | [GitHub](https://github.com/BlockRunAI/blockrun-litellm) |
| ![CLI](https://img.shields.io/badge/-CLI-000000?logo=gnubash&logoColor=white) | `npm i -g @blockrun/cli` | `blockrun` umbrella CLI + `@blockrun/core` kernel — one wallet, generic `api`/`pay` for any x402 endpoint | [GitHub](https://github.com/BlockRunAI/blockrun-cli) |

### Solana Support

```python
from blockrun_llm import SolanaLLMClient

client = SolanaLLMClient(private_key="your-solana-private-key")
response = client.chat("Hello from Solana!")
# Pays with USDC on Solana via x402
```

```bash
pip install blockrun-llm[solana]
```

---

## MCP Tools

### blockrun-mcp — Zero API Key Access for Claude Code Users

**[blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)** is the primary entry point for Claude Code developers. One command gives Claude access to <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> models, real-time market data, image/video/music generation, AI voice calls, crypto data, and more — with no API keys and no accounts.

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

**Who it's for:** Developers who don't want to manage 7 different provider accounts and API keys. Pay per request with USDC, one wallet covers everything.

**<!-- br:mcp.tools -->20<!-- /br:mcp.tools --> tools included:**

| Tool | What it does |
|------|-------------|
| `blockrun_chat` | <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> AI models (GPT-5.5, Claude, Gemini, Grok, DeepSeek, Kimi, and more) |
| `blockrun_image` | Image generation — gpt-image-2, Nano Banana Pro, Grok Imagine, CogView-4 |
| `blockrun_video` | Video generation — Sora 2, Seedance 2.0, Grok Imagine Video |
| `blockrun_realface` | Enroll a real person (liveness) or AI character (Virtual Portrait) for Seedance video |
| `blockrun_music` | MiniMax music generation |
| `blockrun_speech` | ElevenLabs text-to-speech + cinematic sound effects |
| `blockrun_search` | Live web and news search (Grok-grounded) |
| `blockrun_exa` | Neural semantic search + grounded answers |
| `blockrun_markets` | Polymarket, Kalshi, sports markets |
| `blockrun_polymarket` | Place real USDC-settled Polymarket orders (CLOB V2 on Polygon) — discover markets with `blockrun_markets` first |
| `blockrun_surf` | 83 crypto data endpoints (CEX, on-chain SQL, social, wallet labels) |
| `blockrun_price` | Pyth quotes: crypto, FX, commodities, stocks |
| `blockrun_dex` | Live DEX prices and liquidity via DexScreener (free) |
| `blockrun_rpc` | Raw JSON-RPC on <!-- br:chains.rpc -->40<!-- /br:chains.rpc --> chains — Ethereum, Base, Solana, Bitcoin, Sui, NEAR (Tatum gateway) |
| `blockrun_defi` | DefiLlama — protocol TVL, chain TVL, yield pools (APY), token prices |
| `blockrun_modal` | Sandboxed code execution — disposable container, optional GPU |
| `blockrun_phone` | AI voice calls + wallet-owned US/CA numbers |
| `blockrun_models` | List all models with live pricing |
| `blockrun_wallet` | USDC balance, agent budgets, setup |

### ClawRouter — Cost Optimizer for Existing API Key Users

**[ClawRouter](https://github.com/BlockRunAI/ClawRouter)** is for developers who already have API keys and want to cut costs. It routes each request to the cheapest capable model in <1ms, 100% locally.

**Who it's for:** Power users already paying for Claude/GPT/Gemini who want 40-92% cost reduction without changing their workflow.

> **blockrun-mcp vs ClawRouter:**
> - New to multi-model access? → Start with **blockrun-mcp** (no API keys needed)
> - Already have API keys, want to save money? → Add **ClawRouter** (smart routing)
> - Both installed? → Maximum coverage: zero-friction access + cost optimization

### ClawRouter ports and other official repos

| Repo | What it is | Install |
|------|------------|---------|
| [router-core](https://github.com/BlockRunAI/router-core) | The routing engine behind ClawRouter, Franklin, Hermes and dsh-clawrouter — deterministic, constraint-first, <1ms, no inference call | library |
| [XClawRouter](https://github.com/BlockRunAI/XClawRouter) | ClawRouter powered by the OKX OnchainOS wallet — OpenClaw plugin, USDC on Base & Solana | `curl -fsSL https://blockrun.ai/XClawRouter-update \| bash` |
| [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) | ClawRouter for NousResearch Hermes — Python plugin wrapping the proxy | `pip install hermes-plugin-clawrouter` |
| [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) | DeepSeek Harness safety gate — a stronger model reviews dangerous tool calls before they run, plus vision and the full catalog | `dsh plugin --profile web add dsh-clawrouter` |
| [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) | OpenAI Codex ↔ BlockRun bridge over the Responses API, wallet-signed, zero API keys | `npx @blockrun/clawrouter-codex up` |
| [blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin) | Claude Code media plugin — spend confirmation, cost meter, balance status line | `claude --plugin-dir` |
| [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) | Codex port of the media plugin — spend gate + real-ledger cost meter | `codex plugin marketplace add BlockRunAI/blockrun-codex-plugin` |
| [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) | OpenCode plugin — chat, images, auto-generated wallet | `"plugin": ["@blockrun/opencode"]` in `opencode.json` |
| [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) | BlockRun skill for the lobster.cash OpenClaw plugin — paid with Solana USDC | `install.sh` in repo |
| [Franklin](https://github.com/BlockRunAI/Franklin) | The AI agent with a wallet — spends USDC autonomously to get real work done | `npm i -g @blockrun/franklin` |
| [Franklin-Trading](https://github.com/BlockRunAI/Franklin-Trading) | Wallet-native trading agent — persona debate, Backtest → Paper → Live, x402 receipt per fill | `npm i -g @blockrun/franklin-trading` |
| [franklin-canvas](https://github.com/BlockRunAI/franklin-canvas) | Node-based AI media studio — image, video, music on an infinite canvas | `git clone` + `npm start` |
| [franklin-bet](https://github.com/BlockRunAI/franklin-bet) | Frontier models research, read live odds, and bet on every 2026 World Cup match — reproducible pipeline | `npm run generate -- --agent` |
| [Claude-Code-GPT-IMAGE2-SeeDance-BlockRun](https://github.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun) | `/headshot`, `/dance`, `/poster`, `/launch-film` — 848 prompt cases as one-line Claude Code commands | `install.sh` in repo |
| [awesome-OpenClaw-Money-Maker](https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker) | Curated ways to make money with OpenClaw | — |

Full directory with one line per public repo: [Ecosystem docs](./docs/resources/ecosystem.md).

---

## Smart Routing

[ClawRouter](https://github.com/BlockRunAI/ClawRouter) — routes to the cheapest capable model in <1ms, 100% local, no API calls.

| Profile | Strategy | Example Models |
|---------|----------|----------------|
| `free` | Free models only | Step 3.7 Flash (NVIDIA-hosted free tier, no wallet needed) |
| `eco` | Cheapest capable | DeepSeek, Gemini Flash Lite |
| `auto` | Balanced cost/quality | GPT-5 Mini, Gemini Flash |
| `premium` | Best quality | Claude Opus 5, GPT-5.6 Sol |

Built into both Python and TypeScript SDKs. Also available as standalone: [ClawRouter](https://github.com/BlockRunAI/ClawRouter)

---

## Framework Integrations

| Framework | Status | Integration |
|-----------|:------:|-------------|
| [Continue](https://github.com/continuedev/continue) | ✅ Released | [Native provider](https://github.com/continuedev/continue/pull/11751) — ClawRouter as built-in LLM provider (32K+ ⭐) |
| [OpenClaw](https://github.com/openclaw/openclaw) | ✅ Released | [ClawRouter](https://github.com/BlockRunAI/ClawRouter) - Smart LLM router, 78% cost savings |
| [ElizaOS](https://github.com/elizaOS/eliza) | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [Claude Code](https://claude.ai/code) | ✅ Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) · [blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin) |
| [OpenAI Codex](https://github.com/openai/codex) | ✅ Released | [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) · [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) |
| [Hermes](https://github.com/NousResearch/hermes-agent) | ✅ Released | [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) |
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | ✅ Released | [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) |
| [OpenCode](https://opencode.ai) | ✅ Released | [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) |
| [LiteLLM](https://github.com/BerriAI/litellm) | ✅ Released | [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) |
| [OKX OnchainOS](https://web3.okx.com) | ✅ Released | [XClawRouter](https://github.com/BlockRunAI/XClawRouter) — ClawRouter with the OKX Agentic Wallet |
| [lobster.cash](https://lobster.cash) | ✅ Released | [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) |
| [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) | ✅ Released | [AgentCore Payments](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-payments-is-now-generally-available-enabling-agents-to-transact-safely-and-autonomously-at-scale/) — managed x402 wallet for Strands, LangGraph and OpenClaw agents; BlockRun is a launch partner |
| [GOAT SDK](https://github.com/crossmint/goat) | 🔄 In Review | Agent framework integration |
| [AgentKit](https://github.com/coinbase/agentkit) | 📋 Planned | Coinbase agent framework |
| [LangChain](https://github.com/langchain-ai/langchain) | 📋 Planned | Custom LLM provider |

---

## Projects Built with BlockRun

| Project | Category | Description |
|---------|:--------:|-------------|
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction Markets | Prediction market analysis platform with multi-AI provider support |
| [Polymarket AI Agent](https://github.com/BlockRunAI/polymarket-agent) | Prediction Markets | Autonomous AI trading agent using 3-model LLM consensus |
| [franklin-bet](https://github.com/BlockRunAI/franklin-bet) | Prediction Markets | Frontier-model council researches and bets on every 2026 World Cup match |
| [LLM_trader](https://github.com/qrak/LLM_trader) | Crypto Trading | AI crypto trading bot with multi-provider support and chart analysis |
| [Spraay](https://github.com/plagtech/spraay-x402-gateway) | x402 Gateway | Multi-chain x402 payment gateway with dual-provider AI inference (BlockRun + OpenRouter) |
| [NoFx](https://github.com/NoFxAiOS/nofx) | Crypto Trading | Personal AI trading assistant - any market, any model, pay with USDC |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track how AI models reference your brand across ChatGPT, Claude, Gemini & more |

> Built something with BlockRun? [Add it here!](https://github.com/blockrunai/awesome-blockrun/issues)

---

## Ecosystem

### Alliance Partners

| Partner | Description |
|---------|-------------|
| [![Circle](https://img.shields.io/badge/Circle-Alliance_Partner-00D4AA)](https://partners.circle.com/partner/blockrunai) | Official Circle Alliance Partner powering USDC payments on Base |
| [![AWS](https://img.shields.io/badge/AWS-AgentCore_Payments_Launch_Partner-FF9900)](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-payments-is-now-generally-available-enabling-agents-to-transact-safely-and-autonomously-at-scale/) | Launch partner for Amazon Bedrock AgentCore Payments (GA Aug 2026) — agents on AWS pay for BlockRun's pay-per-use endpoints via x402 |

### Data Partners

| Partner | Product | Description |
|---------|---------|-------------|
| [Exa](https://exa.ai) | Web Search | Neural web search, find-similar, page contents, AI-grounded answers |
| [Predexon](https://predexon.com) | Prediction Markets | Polymarket, Kalshi, Limitless, Opinion, Predict.Fun, Binance Futures data |
| [Modal](https://modal.com) | Sandbox Compute | Managed Python sandboxes for isolated code execution |
| [Surf](https://asksurf.ai) | Crypto Data | 83 endpoints — CEX, on-chain SQL, wallet labels, social, news |
| [Tatum](https://tatum.io) | Multi-chain RPC | JSON-RPC across <!-- br:chains.rpc -->40<!-- /br:chains.rpc --> chains |
| [Pyth](https://pyth.network) | Market Data | Crypto, FX, commodity and equity prices |

### x402 Facilitators

BlockRun aggregates services from the x402 facilitator network:

| Facilitator | Network |
|-------------|---------|
| [Coinbase CDP](https://coinbase.com/cloud) | Base, Ethereum |
| [Circle Gateway](https://developers.circle.com/gateway/nanopayments) | Polygon, Arbitrum, Optimism, Unichain (batched nanopayments via `nano.blockrun.ai`) |
| [PayAI](https://payai.network) | Base, Solana |
| [thirdweb](https://thirdweb.com) | Base, Ethereum |
| [QuestFlow](https://questflow.ai) | Base |
| [AnySpend](https://anyspend.com) | Base |
| [AurraCloud](https://aurracloud.com) | Base |

### Protocol Partner

| Partner | Relationship |
|---------|--------------|
| [x402 Foundation](https://x402.org) | Protocol development |

### Events

| Event | Where | About |
|-------|-------|-------|
| [Building the Agentic Economy with Fireblocks, Circle & BlockRun](https://luma.com/lon7mu2d) | New York (5 Penn Plaza) | Co-hosted with Circle, Fireblocks and Dynamic — panel + live demos on how agents access services and transact via Circle's Agent Stack and x402 |

See [ECOSYSTEM.md](./ECOSYSTEM.md) for full partner directory.

---

## Research

### State of x402 2025

| Format | Link |
|--------|------|
| Full Report (PDF) | [State of x402 2025](./research/State_of_x402_2025.pdf) |
| Web Version | [Markdown](./research/WEB_STATE_OF_X402.md) |
| Presentation | [Deck](https://blockrun.ai/state-x402-2025-deck.pdf) |

**Key Findings:**
- Average transaction: $0.12 (true micropayments impossible on traditional rails)
- 53% of volume is organic business activity
- Base dominates with 53.3% of services, Solana at 36.6%
- 76% of services priced at $0.10 or below

See [research/](./research/) for methodology.

---

## Vision

**AI agents can't pay for services.** Traditional payment rails require account creation, credit cards, and KYC verification - none of which agents can do.

But agents have something better: **wallets**.

The **x402 protocol** (HTTP 402 "Payment Required") lets any HTTP request include a cryptographic payment. Pay and get response. One step.

### Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| LLM Gateway | Now | Pay-per-request access to <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> AI models |
| Premium Data | Now | Neural web search (Exa), prediction markets (Predexon), Surf crypto data, DEX, image / video / music generation, voice calls |
| Agent Wallets | Now | Per-agent delegation budgets (blockrun-mcp), Franklin agent wallet, spend confirmation plugins |
| Multi-Chain | Now | Base + Solana gateways live; Polygon / Arbitrum / Optimism / Unichain via Circle Gateway (`nano.blockrun.ai`) |
| Trust | In progress | Smart routing shipped (router-core); service ratings and uptime tracking next |

See [VISION.md](./VISION.md) | [ROADMAP.md](./ROADMAP.md) for full details.

---

## Community

[![Telegram](https://img.shields.io/badge/Telegram-Join_Community-26A5E4?logo=telegram)](https://t.me/+mroQv4-4hGgzOGUx)
[![GitHub](https://img.shields.io/badge/GitHub-Issues-181717?logo=github)](https://github.com/blockrunai/awesome-blockrun/issues)

### Contributing

| Area | What You Can Do |
|------|-----------------|
| **Code** | Add features, fix bugs, improve SDKs |
| **Docs** | Improve documentation, add examples |
| **Integrations** | Build plugins for agent frameworks |
| **Feedback** | Report bugs, request features |

All contributors will be recognized in [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Documentation

| Section | Links |
|---------|-------|
| **Getting Started** | [Claude Code](./docs/getting-started/claude-code.md) &#x2022; [Agent Developers](./docs/getting-started/agent-developers.md) &#x2022; [SDK Developers](./docs/getting-started/sdk-developers.md) &#x2022; [Wallet Setup](./docs/getting-started/wallet-setup.md) |
| **API Reference** | [Chat Completions](./docs/api-reference/chat-completions.md) &#x2022; [Images](./docs/api-reference/image-generation.md) &#x2022; [Search](./docs/api-reference/search.md) &#x2022; [Prediction Markets](./docs/api-reference/prediction-markets.md) &#x2022; [Models](./docs/api-reference/models.md) &#x2022; [Errors](./docs/api-reference/errors.md) |
| **x402 Protocol** | [How It Works](./docs/x402/how-it-works.md) &#x2022; [Payment Flow](./docs/x402/payment-flow.md) &#x2022; [Security](./docs/x402/security.md) |
| **Resources** | [Pricing](./docs/products/intelligence/pricing.md) &#x2022; [FAQ](./docs/resources/faq.md) &#x2022; [Ecosystem](./docs/resources/ecosystem.md) &#x2022; [Examples](./docs/resources/examples.md) &#x2022; [x402 Endpoints](./docs/x402/endpoints.md) &#x2022; [Changelog](./docs/resources/changelog.md) |

---

## Frequently Asked Questions

### What is BlockRun?
BlockRun is the routing & payment layer for AI — one endpoint where AI agents discover, route, and pay for APIs using USDC via the x402 protocol. It provides access to <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> LLMs, image generation, neural web search (Exa), and prediction market data without requiring API keys or subscriptions.

### How do AI agents pay for APIs?
AI agents pay using the x402 protocol — an HTTP-native payment standard. When an agent makes a request, BlockRun returns HTTP 402 with the price. The agent signs a USDC payment locally (private key never leaves the machine), retries with the payment header, and receives the response. Settlement is non-custodial and instant on Base or Solana.

### What is ClawRouter?
ClawRouter is an open-source (MIT licensed) smart LLM router built for autonomous agents. It analyzes each request across 15 dimensions and routes to the cheapest capable model in under 1ms, entirely locally. ClawRouter reduces LLM API costs by <!-- br:savings.autoVsBaselinePct -->88<!-- /br:savings.autoVsBaselinePct -->% versus pinning one flagship for every request.

### How does BlockRun compare to OpenRouter?
BlockRun is agent-native — it uses wallet signatures for authentication instead of API keys, and USDC micropayments instead of credit cards. This means AI agents can operate autonomously without human intervention. BlockRun also includes ClawRouter for smart routing, third-party data & runtime services, and multi-chain support (Base + Solana).

### What is the x402 protocol?
The x402 protocol is an HTTP-native payment standard based on HTTP status code 402 ("Payment Required"). It allows any HTTP request to include a cryptographic USDC payment, enabling machine-to-machine payments without accounts, credit cards, or KYC verification. BlockRun is a leading implementation of x402.

### How much does BlockRun cost?
BlockRun uses pay-per-request pricing with no subscriptions. Per-token chat is billed at provider cost with no platform margin — only a flat $0.001 transaction fee is added per request; media generation and Live Search carry a 5% margin. Prices start at $0.002 per request for the cheapest data endpoints. $5 in USDC is enough for thousands of requests.

---

<p align="center">
  <a href="https://blockrunai.github.io/branding/">Brand Kit</a>
  &nbsp;·&nbsp;
  <a href="https://blockrun.ai">Website</a>
  &nbsp;·&nbsp;
  <a href="https://x.com/BlockRunAI">Twitter</a>
  &nbsp;·&nbsp;
  <a href="https://t.me/+mroQv4-4hGgzOGUx">Telegram</a>
</p>

<p align="center">
  <b>BlockRun: Let AI agents pay for AI.</b>
</p>
