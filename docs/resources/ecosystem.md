# Ecosystem

Projects, integrations, and partners building with BlockRun and x402.

## Official Products

| Product | Description | Link |
|---------|-------------|------|
| [alpha-mcp](https://github.com/BlockRunAI/alpha-mcp) | AI crypto trading for Claude | [GitHub](https://github.com/BlockRunAI/alpha-mcp) |
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP server (v0.4.2) for 33+ AI models, images, smart routing | [GitHub](https://github.com/BlockRunAI/blockrun-mcp) |
| [x-grow](https://github.com/BlockRunAI/x-grow) | X post optimization skill | [GitHub](https://github.com/BlockRunAI/x-grow) |
| [nano-banana](https://github.com/BlockRunAI/nano-banana-blockrun) | Image generation skill | [GitHub](https://github.com/BlockRunAI/nano-banana-blockrun) |

## API Products

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.02–0.15/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Search** | `/v1/search` | $0.025/source | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.001–0.005 | ✅ Live |
| **Modal Sandbox** | `/v1/modal/*` | $0.001–0.01 | ✅ Live |
| **X/Twitter Data** | `/v1/x/*` | TBD | 🔜 Coming Soon |
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

## AI Providers

BlockRun routes to these providers via x402:

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| OpenAI | GPT-5.5, GPT-5.4, GPT-5.4 Pro, GPT-5.3, GPT-5.3 Codex, GPT-5.2, GPT-5 Mini, GPT-5 Nano, o1, o3 | $0.05–$30.00 / $0.40–$180.00 |
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 | $1.00–$5.00 / $5.00–$25.00 |
| Google | Gemini 3.1 Pro, Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite | $0.10–$2.00 / $0.40–$12.00 |
| DeepSeek | DeepSeek Chat (V3.2), DeepSeek Reasoner | $0.28 / $0.42 |
| xAI | Grok 4.1 Fast, Grok Code Fast 1, Grok 4, Grok 2 Vision | $0.20–$3.00 / $0.50–$15.00 |
| Z.AI | GLM-5, GLM-5 Turbo, GLM-5 Code | $1.00–$1.20 / $3.20–$5.00 |
| Moonshot | Kimi K2.5 (262K context, MoE) | $0.60 / $3.00 |
| MiniMax | MiniMax M2.7 (204K context, reasoning) | $0.30 / $1.20 |
| NVIDIA | GPT-OSS 120B, GPT-OSS 20B | **Free** |

### Image Models

| Model | Price per image |
|-------|----------------|
| OpenAI GPT Image 1 | $0.02–0.04 |
| OpenAI ChatGPT Images 2.0 | $0.06–0.12 |
| OpenAI DALL-E 3 | $0.04–0.08 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10–0.15 |

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
