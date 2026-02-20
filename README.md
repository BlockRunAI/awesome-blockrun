# BlockRun

**The Discovery Layer for AI Agent Payments**

[![Website](https://img.shields.io/badge/Website-blockrun.ai-blue)](https://blockrun.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@BlockRunAI-1DA1F2)](https://x.com/BlockRunAI)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4)](https://t.me/+mroQv4-4hGgzOGUx)
[![Research](https://img.shields.io/badge/Research-State%20of%20x402-orange)](./research/State_of_x402_2025.pdf)

---

## Table of Contents

- [Quick Start](#quick-start)
- [SDKs](#sdks)
- [MCP Tools](#mcp-tools)
- [Framework Integrations](#framework-integrations)
- [Supported Models](#supported-models)
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
response = client.chat("Hello!")
# Payment handled automatically via x402
```

```typescript
import { LLMClient } from 'blockrun-llm';

const client = new LLMClient({ privateKey: '0x...' });
const response = await client.chat('Hello!');
```

---

## SDKs

| Language | Install | Repository |
|:--------:|---------|:----------:|
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | `pip install blockrun-llm` | [GitHub](https://github.com/blockrunai/blockrun-llm) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | `npm i blockrun-llm` | [GitHub](https://github.com/blockrunai/blockrun-llm-ts) |
| ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) | `go get github.com/blockrunai/blockrun-llm-go` | [GitHub](https://github.com/blockrunai/blockrun-llm-go) |
| ![XRPL](https://img.shields.io/badge/-XRPL-23292F?logo=xrp&logoColor=white) | `pip install blockrun-llm-xrpl` | [GitHub](https://github.com/BlockRunAI/blockrun-llm-xrpl) |

---

## MCP Tools

| Tool | Description |
|------|-------------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP Server for Claude Code - Access 30+ AI models with zero API keys |
| [blockrun-agent-wallet](https://github.com/BlockRunAI/blockrun-agent-wallet) | Agent wallet - Give AI agents a wallet to pay for GPT, Grok, DALL-E and more |

---

## Framework Integrations

| Framework | Status | Integration |
|-----------|:------:|-------------|
| [OpenClaw](https://github.com/openclaw/openclaw) | ✅ Released | [ClawRouter](https://github.com/BlockRunAI/ClawRouter) - Smart LLM router, 78% cost savings |
| [ElizaOS](https://github.com/elizaOS/eliza) | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [Claude Code](https://claude.ai/code) | ✅ Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) |
| [GOAT SDK](https://github.com/crossmint/goat) | 🔄 In Review | Agent framework integration |
| [AgentKit](https://github.com/coinbase/agentkit) | 🔄 In Review | Coinbase agent framework |
| [Rig](https://github.com/0xPlaygrounds/rig) | 🔄 [In Review](https://github.com/0xPlaygrounds/rig/pull/1294) | Rust LLM framework |

---

## Supported Models

| Category | Models |
|----------|--------|
| **LLMs** | GPT-4o, GPT-5, Claude, Gemini, DeepSeek, Kimi K2.5, Llama |
| **Reasoning** | o1, o3, Grok, DeepSeek-R1 |
| **Image** | DALL-E, Stable Diffusion, Flux, Nano Banana |
| **Voice** | ElevenLabs, OpenAI TTS |

### New: Moonshot Kimi K2.5

[Kimi K2.5](https://kimi.ai) — Optimized for agentic workflows:
- **Agent Swarm** — 100 parallel agents, 4.5x faster execution
- **Extended Tool Chains** — 200-300 sequential calls without drift
- **Vision-to-Code** — UI mockups to production React
- **Pricing** — $0.60/M input, $3.00/M output

---

## Projects Built with BlockRun

| Project | Category | Description |
|---------|:--------:|-------------|
| [X Portal](https://llm.xprtlai.com/) | LLM Gateway | LLM chat interface powered by BlockRun |
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction Markets | Prediction market analysis platform with multi-AI provider support |
| [Polymarket AI Agent](https://github.com/BlockRunAI/polymarket-agent) | Prediction Markets | Autonomous AI trading agent using 3-model LLM consensus |
| [Nano Banana](https://github.com/BlockRunAI/nano-banana-blockrun) | Image Generation | Claude Code skill for AI image generation via x402 |
| [LLM_trader](https://github.com/qrak/LLM_trader) | Crypto Trading | AI crypto trading bot with multi-provider support and chart analysis |

> Built something with BlockRun? [Add it here!](https://github.com/blockrunai/awesome-blockrun/issues)

---

## Ecosystem

### Alliance Partners

| Partner | Description |
|---------|-------------|
| [![Circle](https://img.shields.io/badge/Circle-Alliance_Partner-00D4AA)](https://partners.circle.com/partner/blockrunai) | Official Circle Alliance Partner powering USDC payments on Base |

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
| Gateway | Now | Pay-per-request access to AI models |
| Trust | Q1 2026 | Service ratings, uptime tracking, smart routing |
| Universal Routing | Q2 2026+ | Price/latency optimization, automatic failover |

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
| **API Reference** | [Chat Completions](./docs/api-reference/chat-completions.md) &#x2022; [Models](./docs/api-reference/models.md) &#x2022; [Errors](./docs/api-reference/errors.md) |
| **x402 Protocol** | [How It Works](./docs/x402/how-it-works.md) &#x2022; [Payment Flow](./docs/x402/payment-flow.md) &#x2022; [Security](./docs/x402/security.md) |
| **Resources** | [Pricing](./docs/products/intelligence/pricing.md) &#x2022; [FAQ](./docs/resources/faq.md) &#x2022; [Changelog](./docs/resources/changelog.md) |

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
