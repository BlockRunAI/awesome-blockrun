# BlockRun Ecosystem

## API Products

BlockRun is a unified API gateway — pay per request with USDC, no API keys needed.

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.02–0.15/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Search** | `/v1/search` | $0.025/source | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.001–0.005 | ✅ Live |
| **X/Twitter Data** | `/v1/x/*` | TBD | 🔜 Coming Soon |
| **Models** | `/v1/models` | Free | ✅ Live |
| **Pricing** | `/v1/pricing` | Free | ✅ Live |
| **Balance** | `/v1/balance` | Free | ✅ Live |

## Networks

| Network | Gateway | Asset | Status |
|---------|---------|-------|--------|
| **Base** | `blockrun.ai` | USDC | ✅ Live |
| **Solana** | `sol.blockrun.ai` | USDC | ✅ Live |
| **Base Sepolia** | `testnet.blockrun.ai` | USDC (testnet) | ✅ Testnet |
| **Solana Devnet** | `devnet-sol.blockrun.ai` | USDC (devnet) | ✅ Testnet |

## x402 Facilitators

BlockRun works with the x402 facilitator network:

| Facilitator | Network | Discovery Endpoint |
|-------------|---------|-------------------|
| [Coinbase CDP](https://coinbase.com/cloud) | Base, Ethereum | `api.cdp.coinbase.com/platform/v2/x402/discovery/resources` |
| [PayAI](https://payai.network) | Base, Solana | `facilitator.payai.network/discovery/resources` |
| [QuestFlow](https://questflow.ai) | Base | `facilitator.questflow.ai/discovery/resources` |
| [AnySpend](https://anyspend.com) | Base | `mainnet.anyspend.com/x402/discovery/resources` |
| [AurraCloud](https://aurracloud.com) | Base | `x402-facilitator.aurracloud.com/discovery/resources` |
| [thirdweb](https://thirdweb.com) | Base, Ethereum | `api.thirdweb.com/v1/payments/x402/discovery/resources` |

## Partners

| Partner | Relationship |
|---------|--------------|
| [Circle](https://partners.circle.com/partner/blockrunai) | Alliance Partner — USDC payments on Base |
| [Coinbase CDP](https://coinbase.com/cloud) | x402 facilitator infrastructure |
| [x402 Foundation](https://x402.org) | Protocol development |
| [thirdweb](https://thirdweb.com) | Wallet & payment infrastructure |
| [Predexon](https://predexon.com) | Prediction market data (Polymarket, Kalshi, dFlow, Binance) |
| [Modal](https://modal.com) | Sandbox compute (managed Python sandboxes for isolated code execution) |

## Community Integrations

| Project | Category | Description |
|---------|----------|-------------|
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading bot with Visual Cortex for chart analysis |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track AI brand mentions across multiple models |

### Claude Code Tools

| Tool | Description | Install |
|------|-------------|---------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP Server (v0.4.2) — Chat (33+ models), Images, Smart routing, Context window & category info | `claude mcp add blockrun npx @blockrun/mcp` |
| [nano-banana-blockrun](https://github.com/BlockRunAI/nano-banana-blockrun) | Image generation skill via x402 micropayments | Claude Code skill |

### Framework Integrations

| Project | Category | Stars | Status | Help Wanted |
|---------|----------|-------|--------|-------------|
| [Continue](https://github.com/continuedev/continue) | IDE Extension | 32K+ | ✅ Released | [Native provider](https://github.com/continuedev/continue/pull/11751) |
| [GOAT SDK](https://github.com/crossmint/goat) | Agent Framework | 150K+ downloads | In Review | - |
| [ElizaOS](https://github.com/elizaOS/eliza) | Agent Framework | 60K+ | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [AgentKit](https://github.com/coinbase/agentkit) | Agent Framework | Official | Planned | Example code |
| [LangChain](https://github.com/langchain-ai/langchain) | LLM Framework | 100K+ | Planned | Custom LLM provider |
| [OctoBot](https://github.com/Drakkar-Software/OctoBot) | Trading Bot | 5K+ | Planned | Integration |

Want to add an integration? [Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or submit a PR!

## SDKs

| Language | Repository | Features | Status |
|----------|------------|----------|--------|
| Python | [blockrun-llm](https://github.com/blockrunai/blockrun-llm) | Chat, Images, Search, Prediction Markets, Smart Routing, Solana | Released |
| TypeScript | [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts) | Chat, Images, Search, OpenAI drop-in, Smart Routing, Solana | Released |
| Go | [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go) | Chat | Released |

## Smart Routing

[ClawRouter](https://github.com/BlockRunAI/ClawRouter) — routes to cheapest capable model in <1ms, 100% local.

| Profile | Strategy | Example Models |
|---------|----------|----------------|
| `free` | Free models only | NVIDIA GPT-OSS 120B/20B |
| `eco` | Cheapest capable | DeepSeek, Gemini Flash Lite |
| `auto` | Balanced cost/quality | GPT-5 Mini, Gemini Flash |
| `premium` | Best quality | Claude Opus 4.6, GPT-5.4 |

## AI Providers

BlockRun routes to these AI providers via x402:

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| OpenAI | GPT-5.4, GPT-5.4 Pro, GPT-5.3, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-5.4 Mini, GPT-5 Mini, GPT-5.4 Nano, o1, o1-mini, o3, o3-mini | $0.05–$30.00 / $0.40–$180.00 |
| Anthropic | Claude Opus 4.6, Claude Opus 4.5, Claude Sonnet 4.6, Claude Haiku 4.5 | $1.00–$5.00 / $5.00–$25.00 |
| Google | Gemini 3.1 Pro, Gemini 3 Pro Preview, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3.1 Flash Lite, Gemini 2.5 Flash Lite | $0.10–$2.00 / $0.40–$12.00 |
| DeepSeek | DeepSeek Chat (V3.2), DeepSeek Reasoner | $0.28 / $0.42 |
| Z.AI | GLM-5, GLM-5 Turbo | $1.00–$1.20 / $3.20–$5.00 |
| Moonshot | Kimi K2.5 (262K context, MoE) | $0.60 / $3.00 |
| MiniMax | MiniMax M2.7 (204K context, reasoning) | $0.30 / $1.20 |
| NVIDIA | GPT-OSS 120B, GPT-OSS 20B, Kimi K2.5 | **Free** |

### Image Models

| Model | Price per image |
|-------|----------------|
| OpenAI GPT Image 1 | $0.02–0.04 |
| OpenAI DALL-E 3 | $0.04–0.08 |
| Nano Banana | $0.05 |
| Nano Banana Pro | $0.10–0.15 |

---

## Become a Partner

Interested in partnering with BlockRun?

- **Facilitators** - Integrate your x402 facilitator
- **Agent Frameworks** - Add BlockRun as an LLM provider
- **AI Providers** - Get listed on our gateway
- **Data Providers** - Monetize your API via x402

[Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or reach out on [Telegram](https://t.me/+mroQv4-4hGgzOGUx).
