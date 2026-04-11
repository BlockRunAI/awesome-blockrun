# BlockRun

**The Discovery Layer for AI Agent Payments**

[![Website](https://img.shields.io/badge/Website-blockrun.ai-blue)](https://blockrun.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@BlockRunAI-1DA1F2)](https://x.com/BlockRunAI)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4)](https://t.me/+mroQv4-4hGgzOGUx)
[![Research](https://img.shields.io/badge/Research-State%20of%20x402-orange)](./research/State_of_x402_2025.pdf)

> **BlockRun** is the payment rail for AI — a service marketplace where AI agents autonomously discover, route, and pay for APIs using USDC via the x402 protocol. BlockRun provides pay-per-request access to 41+ large language models (including GPT-5, Claude, Gemini, Grok, DeepSeek, and Kimi), image generation, neural web search (Exa), DEX data, trading signals, and prediction market data. No API keys, no subscriptions, no vendor lock-in.
>
> **For Claude Code users:** Add BlockRun in one command — access 41 models, DEX data, trading signals, and more without managing any API keys.
> ```bash
> claude mcp add blockrun npx @blockrun/mcp
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
results = client.search("latest AI agent frameworks")  # $0.01/search on Base or Solana
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
| **LLM Chat** | `/v1/chat/completions` | Per token | OpenAI-compatible, 41+ models, streaming, tool calling |
| **Image Generation** | `/v1/images/generations` | $0.02–0.15/image | DALL-E 3, GPT Image 1, Nano Banana, Nano Banana Pro |
| **Image Editing** | `/v1/images/image2image` | Per request | AI-powered inpainting and image-to-image |
| **Web Search** | `/api/v1/exa/*` | $0.01/search | Neural web search, find-similar, page contents, AI answers (Exa) |
| **DEX Data** | `/v1/dex/*` | Free | Real-time token prices, volume, liquidity across chains (DexScreener) |
| **Prediction Markets** | `/v1/pm/*` | $0.001–0.005 | Polymarket, Kalshi, dFlow, Binance Futures |
| **Models** | `/v1/models` | Free | List all available models with pricing |
| **Pricing** | `/v1/pricing` | Free | Detailed pricing for all models |
| **Balance** | `/v1/balance` | Free | Check USDC wallet balance |

### Prediction Markets

Real-time prediction market data powered by Predexon:

| Market | Endpoints | Price |
|--------|-----------|-------|
| **Polymarket** | Markets, events, trades, orderbooks, leaderboards, positions | $0.001–0.005 |
| **Kalshi** | Markets, trades, orderbooks | $0.001 |
| **dFlow** | Trades, positions, P&L | $0.001–0.005 |
| **Binance Futures** | Candles, ticks | $0.005 |

---

## Supported Models

**41 models** across 9 providers. All accessible through a single OpenAI-compatible API.

### LLMs

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| **OpenAI** | GPT-5.4, GPT-5.4 Pro, GPT-5.3, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-5.4 Mini, GPT-5 Mini, GPT-5.4 Nano, o1, o1-mini, o3, o3-mini | $0.05–$30.00 / $0.40–$180.00 |
| **Anthropic** | Claude Opus 4.6, Claude Opus 4.5, Claude Sonnet 4.6, Claude Haiku 4.5 | $1.00–$5.00 / $5.00–$25.00 |
| **Google** | Gemini 3.1 Pro, Gemini 3 Pro Preview, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3.1 Flash Lite, Gemini 2.5 Flash Lite | $0.10–$2.00 / $0.40–$12.00 |
| **DeepSeek** | DeepSeek Chat (V3.2), DeepSeek Reasoner (V3.2 thinking) | $0.28 / $0.42 |
| **Z.AI** | GLM-5, GLM-5 Turbo | $0.001/request (limited promotion) |
| **Moonshot** | Kimi K2.5 (262K context, MoE) | $0.60 / $3.00 |
| **MiniMax** | MiniMax M2.7 (204K context, reasoning) | $0.30 / $1.20 |
| **NVIDIA** | GPT-OSS 120B, GPT-OSS 20B, Kimi K2.5 | **Free** |

### Reasoning

| Model | Price (input/output per 1M) |
|-------|---------------------------|
| OpenAI o1 | $15.00 / $60.00 |
| OpenAI o3 | $2.00 / $8.00 |
| OpenAI o1-mini, o3-mini | $1.10 / $4.40 |
| DeepSeek Reasoner | $0.28 / $0.42 |

### Image Generation

| Model | Price per image |
|-------|----------------|
| OpenAI GPT Image 1 | $0.02–0.04 |
| OpenAI DALL-E 3 | $0.04–0.08 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10–0.15 |

> Full pricing: `GET /v1/pricing` or see [Pricing docs](./docs/products/intelligence/pricing.md)

---

## Networks

BlockRun runs on two networks with separate gateways:

| Network | Gateway | Asset | Status |
|---------|---------|-------|--------|
| **Base** | `blockrun.ai` | USDC | ✅ Live (41 models) |
| **Solana** | `sol.blockrun.ai` | USDC | ✅ Live |
| **Base Sepolia** | `testnet.blockrun.ai` | USDC (testnet) | ✅ Testnet |
| **Solana Devnet** | `devnet-sol.blockrun.ai` | USDC (devnet) | ✅ Testnet |

**Payment protocol:** x402 (HTTP 402 "Payment Required") — wallet signs payment, no accounts or API keys needed.

---

## SDKs

| Language | Install | Features | Repository |
|:--------:|---------|----------|:----------:|
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | `pip install blockrun-llm` | Chat, Images, Search, Prediction Markets, Smart Routing, Solana | [GitHub](https://github.com/blockrunai/blockrun-llm) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | `npm i blockrun-llm` | Chat, Images, Search, OpenAI-compatible drop-in, Smart Routing, Solana | [GitHub](https://github.com/blockrunai/blockrun-llm-ts) |
| ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) | `go get github.com/blockrunai/blockrun-llm-go` | Chat | [GitHub](https://github.com/blockrunai/blockrun-llm-go) |

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

**[blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)** is the primary entry point for Claude Code developers. One command gives Claude access to 41 models, real-time market data, trading signals, image generation, and more — with no API keys and no accounts.

```bash
claude mcp add blockrun npx @blockrun/mcp
```

**Who it's for:** Developers who don't want to manage 7 different provider accounts and API keys. Pay per request with USDC, one wallet covers everything.

**14 tools included:**

| Tool | What it does |
|------|-------------|
| `blockrun_chat` | Chat with 41+ models (GPT-5, Claude, Gemini, DeepSeek, and more) |
| `blockrun_models` | List available models with pricing |
| `blockrun_wallet` | Manage wallet, set budgets, track spending |
| `blockrun_image` | Generate or edit images (DALL-E 3, Flux, Nano Banana) |
| `blockrun_dex` | Real-time DEX token prices, volume, liquidity (free) |
| `blockrun_signal` | Trading signals with RSI + MACD + EMA indicators |
| `blockrun_analyze` | Combined DEX + whale data with AI synthesis |
| `blockrun_whale` | Track large ETH transfers |
| `blockrun_swap` | Token swaps on Base via 0x aggregator |
| `blockrun_search` | Real-time web + news search with AI summaries |
| `blockrun_exa` | Neural semantic search |
| `blockrun_markets` | Prediction market data (Polymarket, Kalshi, Binance) |

### ClawRouter — Cost Optimizer for Existing API Key Users

**[ClawRouter](https://github.com/BlockRunAI/ClawRouter)** is for developers who already have API keys and want to cut costs. It routes each request to the cheapest capable model in <1ms, 100% locally.

**Who it's for:** Power users already paying for Claude/GPT/Gemini who want 40-92% cost reduction without changing their workflow.

> **blockrun-mcp vs ClawRouter:**
> - New to multi-model access? → Start with **blockrun-mcp** (no API keys needed)
> - Already have API keys, want to save money? → Add **ClawRouter** (smart routing)
> - Both installed? → Maximum coverage: zero-friction access + cost optimization

---

## Smart Routing

[ClawRouter](https://github.com/BlockRunAI/ClawRouter) — routes to the cheapest capable model in <1ms, 100% local, no API calls.

| Profile | Strategy | Example Models |
|---------|----------|----------------|
| `free` | Free models only | NVIDIA GPT-OSS 120B/20B |
| `eco` | Cheapest capable | DeepSeek, Gemini Flash Lite |
| `auto` | Balanced cost/quality | GPT-5 Mini, Gemini Flash |
| `premium` | Best quality | Claude Opus 4.6, GPT-5.4 |

Built into both Python and TypeScript SDKs. Also available as standalone: [ClawRouter](https://github.com/BlockRunAI/ClawRouter)

---

## Framework Integrations

| Framework | Status | Integration |
|-----------|:------:|-------------|
| [Continue](https://github.com/continuedev/continue) | ✅ Released | [Native provider](https://github.com/continuedev/continue/pull/11751) — ClawRouter as built-in LLM provider (32K+ ⭐) |
| [OpenClaw](https://github.com/openclaw/openclaw) | ✅ Released | [ClawRouter](https://github.com/BlockRunAI/ClawRouter) - Smart LLM router, 78% cost savings |
| [ElizaOS](https://github.com/elizaOS/eliza) | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [Claude Code](https://claude.ai/code) | ✅ Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) |
| [GOAT SDK](https://github.com/crossmint/goat) | 🔄 In Review | Agent framework integration |
| [AgentKit](https://github.com/coinbase/agentkit) | 📋 Planned | Coinbase agent framework |
| [LangChain](https://github.com/langchain-ai/langchain) | 📋 Planned | Custom LLM provider |

---

## Projects Built with BlockRun

| Project | Category | Description |
|---------|:--------:|-------------|
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction Markets | Prediction market analysis platform with multi-AI provider support |
| [Polymarket AI Agent](https://github.com/BlockRunAI/polymarket-agent) | Prediction Markets | Autonomous AI trading agent using 3-model LLM consensus |
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

### Data Partners

| Partner | Product | Description |
|---------|---------|-------------|
| [Exa](https://exa.ai) | Web Search | Neural web search, find-similar, page contents, AI-grounded answers |
| [Predexon](https://predexon.com) | Prediction Markets | Polymarket, Kalshi, dFlow, Binance Futures data |
| [Modal](https://modal.com) | Sandbox Compute | Managed Python sandboxes for isolated code execution |

### x402 Facilitators

BlockRun aggregates services from the x402 facilitator network:

| Facilitator | Network |
|-------------|---------|
| [Coinbase CDP](https://coinbase.com/cloud) | Base, Ethereum |
| [PayAI](https://payai.network) | Base, Solana |
| [thirdweb](https://thirdweb.com) | Base, Ethereum |
| [QuestFlow](https://questflow.ai) | Base |
| [AnySpend](https://anyspend.com) | Base |
| [AurraCloud](https://aurracloud.com) | Base |

### Protocol Partner

| Partner | Relationship |
|---------|--------------|
| [x402 Foundation](https://x402.org) | Protocol development |

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
| LLM Gateway | Now | Pay-per-request access to 41+ AI models |
| Premium Data | Now | Neural web search (Exa), prediction markets, DEX data, image generation |
| Agent Wallets | Q2 2026 | Per-agent budgets, spending enforcement, cost attribution |
| Multi-Chain | Now | Base + Solana gateways live |
| Trust | Q2 2026 | Service ratings, uptime tracking, smart routing |

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
| **Resources** | [Pricing](./docs/products/intelligence/pricing.md) &#x2022; [FAQ](./docs/resources/faq.md) &#x2022; [Changelog](./docs/resources/changelog.md) |

---

## Frequently Asked Questions

### What is BlockRun?
BlockRun is the payment rail for AI — a service marketplace where AI agents discover, route, and pay for APIs using USDC via the x402 protocol. It provides access to 41+ LLMs, image generation, neural web search (Exa), and prediction market data without requiring API keys or subscriptions.

### How do AI agents pay for APIs?
AI agents pay using the x402 protocol — an HTTP-native payment standard. When an agent makes a request, BlockRun returns HTTP 402 with the price. The agent signs a USDC payment locally (private key never leaves the machine), retries with the payment header, and receives the response. Settlement is non-custodial and instant on Base or Solana.

### What is ClawRouter?
ClawRouter is an open-source (MIT licensed) smart LLM router built for autonomous agents. It analyzes each request across 15 dimensions and routes to the cheapest capable model in under 1ms, entirely locally. ClawRouter can reduce LLM API costs by up to 92% compared to using premium models directly.

### How does BlockRun compare to OpenRouter?
BlockRun is agent-native — it uses wallet signatures for authentication instead of API keys, and USDC micropayments instead of credit cards. This means AI agents can operate autonomously without human intervention. BlockRun also includes ClawRouter for smart routing, a data marketplace, and multi-chain support (Base + Solana).

### What is the x402 protocol?
The x402 protocol is an HTTP-native payment standard based on HTTP status code 402 ("Payment Required"). It allows any HTTP request to include a cryptographic USDC payment, enabling machine-to-machine payments without accounts, credit cards, or KYC verification. BlockRun is a leading implementation of x402.

### How much does BlockRun cost?
BlockRun uses pay-per-request pricing with no minimums or subscriptions. Prices start at $0.0002 per request for budget models. Provider cost plus 30% margin. $5 in USDC is enough for thousands of requests.

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
