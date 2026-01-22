# BlockRun

**The Discovery Layer for AI Agent Payments**

> The Discovery Layer for AI Agent Payments

[![Website](https://img.shields.io/badge/Website-blockrun.ai-blue)](https://blockrun.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@BlockRunAI-1DA1F2)](https://x.com/BlockRunAI)
[![Research](https://img.shields.io/badge/Research-State%20of%20x402-orange)](./research/State_of_x402_2025.pdf)

---

## Integrations

| Project | Status | Description |
|---------|--------|-------------|
| [ElizaOS](https://github.com/elizaOS/eliza) | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [Claude Code](https://claude.ai/code) | ✅ Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) MCP Server |
| [GOAT SDK](https://github.com/crossmint/goat) | In Review | Agent framework integration |
| [AgentKit](https://github.com/coinbase/agentkit) | In Review | Coinbase agent framework |
| [Rig](https://github.com/0xPlaygrounds/rig) | [In Review](https://github.com/0xPlaygrounds/rig/pull/1294) | Rust LLM framework |

## Projects Built with BlockRun

| Project | Description | Category |
|---------|-------------|----------|
| [X Portal](https://llm.xprtlai.com/) | LLM chat interface powered by BlockRun | LLM Gateway |
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction market analysis platform with multi-AI provider support | Prediction Markets |
| [Polymarket AI Agent](https://github.com/BlockRunAI/polymarket-agent) | Autonomous AI trading agent using 3-model LLM consensus | Prediction Markets |
| [Polymarket Trading Bot](https://github.com/BlackSky-Jose/PolyMarket-trading-AI-model) | AI-powered trading bot using LangChain and superforecasting | Prediction Markets |
| [AsterDEX Trading Bot](https://github.com/BlackSky-Jose/AsterDEX-trading-watermellon) | Crypto futures bot with Grok sentiment + Claude decisions | Futures Trading |
| [Nano Banana](https://github.com/BlockRunAI/nano-banana-blockrun) | Claude Code skill for AI image generation via x402 | Image Generation |
| [LLM_trader](https://github.com/qrak/LLM_trader) | AI crypto trading bot with multi-provider support and chart analysis | Crypto Trading |

*Built something with BlockRun? [Add it here!](https://github.com/blockrunai/awesome-blockrun/issues)*

---

## Ecosystem

### Alliance Partners

| Partner | Type | Description |
|---------|------|-------------|
| [![Circle](https://img.shields.io/badge/Circle-Alliance_Partner-00D4AA)](https://partners.circle.com/partner/blockrunai) | Infrastructure | Official Circle Alliance Partner. Part of Circle's global ecosystem powering USDC payments and stablecoin infrastructure on Base. |

### Strategic Integrators

| Project | Status | Description |
|---------|--------|-------------|
| *Announcements coming soon* | 🔜 | Projects committed to building with x402 |

### x402 Facilitators

BlockRun aggregates services from the x402 facilitator network:

| Facilitator | Network | Status |
|-------------|---------|--------|
| [Coinbase CDP](https://coinbase.com/cloud) | Base, Ethereum | Live |
| [PayAI](https://payai.network) | Base, Solana | Live |
| [thirdweb](https://thirdweb.com) | Base, Ethereum | Live |
| [QuestFlow](https://questflow.ai) | Base | Live |
| [AnySpend](https://anyspend.com) | Base | Live |
| [AurraCloud](https://aurracloud.com) | Base | Live |

### Partners

| Partner | Relationship |
|---------|--------------|
| [x402 Foundation](https://x402.org) | Protocol development |

See [ECOSYSTEM.md](./ECOSYSTEM.md) for full partner directory.

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

## For Developers

### SDKs

| Language | Install | Docs |
|----------|---------|------|
| Python | `pip install blockrun-llm` | [Python SDK](./docs/sdks/python.md) |
| TypeScript | `npm i blockrun-llm` | [TypeScript SDK](./docs/sdks/typescript.md) |
| Go | `go get github.com/blockrunai/blockrun-llm-go` | [GitHub](https://github.com/blockrunai/blockrun-llm-go) |

### Quick Start

```python
from blockrun_llm import LLMClient

client = LLMClient(private_key="0x...")
response = client.chat("Hello!")
# Payment handled automatically via x402
```

### Documentation

**Getting Started:** [Installation](./docs/getting-started/installation.md) | [Quick Start](./docs/getting-started/quick-start.md) | [Authentication](./docs/getting-started/authentication.md)

**API Reference:** [Chat Completions](./docs/api-reference/chat-completions.md) | [Models](./docs/api-reference/models.md) | [Errors](./docs/api-reference/errors.md)

**x402 Protocol:** [How It Works](./docs/x402/how-it-works.md) | [Payment Flow](./docs/x402/payment-flow.md) | [Security](./docs/x402/security.md)

**Resources:** [Pricing](./docs/resources/pricing.md) | [FAQ](./docs/resources/faq.md) | [Changelog](./docs/resources/changelog.md)

### Supported Models

| Category | Models |
|----------|--------|
| LLMs | GPT-4o, GPT-5, Claude, Gemini, DeepSeek, Llama, Qwen |
| Reasoning | o1, o3, Grok |
| Image | DALL-E, Stable Diffusion, Flux |
| Voice | ElevenLabs, OpenAI TTS |

---

## Research

| Report | Description |
|--------|-------------|
| [State of x402 2025](./research/State_of_x402_2025.pdf) | Full research report (PDF) |
| [Web Version](./research/WEB_STATE_OF_X402.md) | Markdown version |
| [Presentation Deck](https://blockrun.ai/state-x402-2025-deck.pdf) | Slides |

Key findings:
- Average transaction: $0.12 (true micropayments impossible on traditional rails)
- 53% of volume is organic business activity
- Base dominates with 53.3% of services, Solana at 36.6%
- 76% of services priced at $0.10 or below

See [research/](./research/) for methodology.

---

## Community

**Join us:** [Telegram](https://t.me/+mroQv4-4hGgzOGUx) | [GitHub Issues](https://github.com/blockrunai/awesome-blockrun/issues)

### Contribute

| Contribution | What You Can Do |
|--------------|-----------------|
| Code | Add features, fix bugs, improve SDKs |
| Docs | Improve documentation, add examples |
| Integrations | Build plugins for agent frameworks |
| Feedback | Report bugs, request features |

All contributors will be recognized in [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

**BlockRun: Let AI agents pay for AI.**
