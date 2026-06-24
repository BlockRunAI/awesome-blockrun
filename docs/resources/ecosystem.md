---
title: Ecosystem
description: Products, SDKs, framework integrations, networks, x402 facilitators, partners, AI providers, and community projects building with BlockRun.
---

# Ecosystem

Projects, integrations, and partners building with BlockRun and x402.

## Official Products

| Product | Description | Link |
|---------|-------------|------|
| [alpha-mcp](https://github.com/BlockRunAI/alpha-mcp) | AI crypto trading for Claude | [GitHub](https://github.com/BlockRunAI/alpha-mcp) |
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP server (v0.4.2) for 60+ AI models, images, video, music, voice, prediction markets, crypto data, sandbox runtime, smart routing | [GitHub](https://github.com/BlockRunAI/blockrun-mcp) |
| [nano-banana](https://github.com/BlockRunAI/nano-banana-blockrun) | Image generation skill | [GitHub](https://github.com/BlockRunAI/nano-banana-blockrun) |

## API Products

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token | ✅ Live |
| **Anthropic-Compat** | `/v1/messages` | Per token | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.015–0.10/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Video Generation** | `/v1/videos/generations` | Per M tokens | ✅ Live |
| **Music Generation** | `/v1/audio/generations` | $0.15/track | ✅ Live |
| **Text-to-Speech** | `/v1/audio/speech` | $0.05–0.10/1k chars | ✅ Live |
| **Sound Effects** | `/v1/audio/sound-effects` | $0.05/generation | ✅ Live |
| **Voice Calls** | `/v1/voice/call` | $0.54 flat | ✅ Live |
| **Phone Numbers** | `/v1/phone/numbers/*` | $5/30 days | ✅ Live |
| **Surf Crypto Data** | `/api/v1/surf/*` (83 endpoints) | $0.001–0.02 | ✅ Live |
| **Search** | `/v1/search` | $0.025/source | ✅ Live |
| **Exa Web Search** | `/api/v1/exa/*` | $0.002–0.01 | ✅ Live |
| **0x Swap (DEX)** | `/api/v1/zerox/*` | Free | ✅ Live |
| **Multi-chain RPC** | `/api/v1/rpc/{network}` (40+ chains) | $0.002/call | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.001–0.005 | ✅ Live |
| **Trading Markets** | `/api/v1/markets/*` | $0.001 | ✅ Live |
| **Modal Sandbox** | `/v1/modal/*` | $0.001–0.01 | ✅ Live |
| **Models** | `/v1/models` | Free | ✅ Live |
| **Pricing** | `/v1/pricing` | Free | ✅ Live |
| **Balance** | `/v1/balance` | Free | ✅ Live |

## SDKs

| Language | Repository | Features | Status |
|----------|------------|----------|--------|
| Python | [blockrun-llm](https://github.com/blockrunai/blockrun-llm) | Chat, Images, Search, Prediction Markets, Smart Routing, Solana | Stable |
| TypeScript | [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts) | Chat, Images, Search, OpenAI drop-in, Smart Routing, Solana | Stable |
| Go | [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go) | Chat | Stable |

## Framework Integrations

| Framework | Status | Link |
|-----------|--------|------|
| OpenClaw | Released | [ClawRouter](https://github.com/BlockRunAI/ClawRouter) - Smart LLM router |
| ElizaOS | Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| Claude Code | Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) |
| GOAT SDK | In Review | [GitHub Issue](https://github.com/crossmint/goat) |
| AgentKit | Planned | [Integration Guide](../frameworks/agentkit.md) |
| LangChain | Planned | [Custom LLM Guide](../frameworks/langchain.md) |

## Community Projects

Projects built by the community using BlockRun.

| Project | Category | Description |
|---------|----------|-------------|
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction Markets | Prediction market analysis with multi-AI provider support |
| [Polymarket AI Agent](https://github.com/BlockRunAI/polymarket-agent) | Prediction Markets | Autonomous trading agent using 3-model LLM consensus |
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading with Visual Cortex chart analysis |
| [Spraay](https://github.com/plagtech/spraay-x402-gateway) | x402 Gateway | Multi-chain x402 payment gateway with dual-provider AI inference |
| [NoFx](https://github.com/NoFxAiOS/nofx) | Crypto Trading | Personal AI trading assistant - any market, any model, pay with USDC |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track AI brand mentions across multiple models |

## Networks

| Network | Gateway | Asset | Status |
|---------|---------|-------|--------|
| Base | `blockrun.ai` | USDC | ✅ Live |
| Solana | `sol.blockrun.ai` | USDC | ✅ Live |
| Base Sepolia | `testnet.blockrun.ai` | USDC (testnet) | ✅ Testnet |
| Solana Devnet | `devnet-sol.blockrun.ai` | USDC (devnet) | ✅ Testnet |

## x402 Facilitators

BlockRun works with the x402 facilitator network:

| Facilitator | Network | Link |
|-------------|---------|------|
| Coinbase CDP | Base, Ethereum | [coinbase.com/cloud](https://coinbase.com/cloud) |
| PayAI | Base, Solana | [payai.network](https://payai.network) |
| QuestFlow | Base | [questflow.ai](https://questflow.ai) |
| AnySpend | Base | [anyspend.com](https://anyspend.com) |
| AurraCloud | Base | [aurracloud.com](https://aurracloud.com) |
| thirdweb | Base, Ethereum | [thirdweb.com](https://thirdweb.com) |

## Partners

| Partner | Relationship |
|---------|--------------|
| [Circle](https://partners.circle.com/partner/blockrunai) | Alliance Partner — USDC payments on Base |
| [Coinbase CDP](https://coinbase.com/cloud) | x402 facilitator infrastructure |
| [x402 Foundation](https://x402.org) | Protocol development |
| [thirdweb](https://thirdweb.com) | Wallet & payment infrastructure |
| [Predexon](https://predexon.com) | Prediction market data |
| [Modal](https://modal.com) | Sandbox compute (isolated code execution) |
| [Surf (asksurf.ai)](https://asksurf.ai) | Crypto data — 83 endpoints (CEX, on-chain SQL, prediction markets, wallet labels, social, news) |
| [Bland.ai](https://bland.ai) | Conversational voice AI — outbound calls |
| [Twilio](https://twilio.com) | Phone-number provisioning (wallet-owned US/CA numbers) |
| [Exa](https://exa.ai) | Neural web search |
| [0x](https://0x.org) | DEX aggregation (Swap V2 + Gasless V2) |

## AI Providers

BlockRun routes to these providers via x402:

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| OpenAI | GPT-5.5, GPT-5.4, GPT-5.4 Pro, GPT-5.2 | $1.75–$30.00 / $14.00–$180.00 |
| Anthropic | Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.5, Claude Sonnet 4.6, Claude Haiku 4.5 | $0.80–$5.00 / $4.00–$25.00 |
| Google | Gemini 3.1 Pro, Gemini 3.5 Flash | $0.50–$2.00 / $3.00–$12.00 |
| DeepSeek | DeepSeek V4 Flash Chat, DeepSeek V4 Pro, DeepSeek Reasoner | $0.20–$0.44 / $0.40–$0.87 |
| xAI | Grok 4.3, Grok 4 Fast, Grok Code Fast 1 | $0.20–$3.00 / $0.50–$15.00 |
| Z.AI | GLM-5.2 (1M context), GLM-5.1, GLM-5, GLM-5 Turbo | $0.60–$1.40 / $1.92–$4.40 |
| Moonshot | Kimi K2.7 (256K, image + video input) | $0.95 / $4.00 |
| MiniMax | MiniMax M3 (1M context) | $0.30 / $1.20 |
| Free tier | 10 reasoning, coding, and vision models | **Free** |

### Image Models

| Model | Price per image |
|-------|----------------|
| OpenAI GPT Image 1 | $0.02–0.04 |
| OpenAI ChatGPT Images 2.0 | $0.06–0.12 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10–0.15 |
| CogView-4 | $0.015–0.02 |
| Grok Imagine / Grok Imagine Pro | $0.02 / $0.07 |

## x402 Protocol

The x402 protocol is open and can be implemented by anyone:

| Resource | Description | Link |
|----------|-------------|------|
| x402 Library | Official TypeScript library | [github.com/coinbase/x402](https://github.com/coinbase/x402) |
| Protocol Spec | Technical specification | [x402.org](https://x402.org) |
| CDP Docs | Facilitator documentation | [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com) |

## Add Your Project

Building with BlockRun? We'd love to feature your project!

1. Open a PR to [awesome-blockrun](https://github.com/blockrunai/awesome-blockrun)
2. Open an [issue](https://github.com/blockrunai/awesome-blockrun/issues)
3. Tag [@BlockRunAI](https://x.com/BlockRunAI) on X

## Become a Partner

Interested in partnering with BlockRun?

- **Facilitators** — Integrate your x402 facilitator
- **Agent Frameworks** — Add BlockRun as an LLM provider
- **AI Providers** — Get listed on our gateway
- **Data Providers** — Monetize your API via x402

Contact: [Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or [Telegram](https://t.me/+mroQv4-4hGgzOGUx)

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet and make your first paid call across any of these products.
:::

:::card{title="API Reference" href="../api-reference/models.md" icon="Book"}
Per-endpoint docs for every live API product listed above.
:::

:::card{title="Changelog" href="changelog.md" icon="ArrowRight"}
What shipped recently across the gateway, SDKs, and integrations.
:::

::::
