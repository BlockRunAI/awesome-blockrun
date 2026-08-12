# BlockRun Ecosystem

## API Products

BlockRun is a unified API gateway — pay per request with USDC, no API keys needed.

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.015–0.15/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Search** | `/v1/search` | $0.025/source | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.0085 | ✅ Live |
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
| [Predexon](https://predexon.com) | Prediction market data (Polymarket, Kalshi, Limitless, Opinion, Predict.Fun, Binance) |
| [Modal](https://modal.com) | Sandbox compute (managed Python sandboxes for isolated code execution) |

## Community Integrations

| Project | Category | Description |
|---------|----------|-------------|
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading bot with Visual Cortex for chart analysis |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track AI brand mentions across multiple models |
| [PulseNetwork](https://pulsenetwork.theaslangroupllc.com) | API Catalog | 76-origin x402 API catalog (950+ pay-per-call intelligence endpoints: token safety, macro, geopolitical, sports, clinical trials) — purchasable by BlockRun-powered agents via CDP/PayAI facilitator discovery |

### Claude Code Tools

| Tool | Description | Install |
|------|-------------|---------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP Server — <!-- br:mcp.tools -->20<!-- /br:mcp.tools --> tools across <!-- br:models.chatVisible -->70<!-- /br:models.chatVisible --> AI models, image/video/music/speech gen, voice calls, crypto data (Surf), prediction markets, DEX prices, raw JSON-RPC (<!-- br:chains.rpc -->40<!-- /br:chains.rpc --> chains), DeFi TVL/yields, sandboxed code exec, search | `claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest` |
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
| `premium` | Best quality | Claude Opus 5, GPT-5.6 Sol |

## AI Providers

BlockRun routes to these AI providers via x402:

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| OpenAI | GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, GPT-5.5 Pro, GPT-5.4, GPT-5.4 Pro, GPT-5.3, GPT-5.3 Codex, GPT-5.2, GPT-5.2 Pro, GPT-5.4 Mini, GPT-5 Mini, GPT-5.4 Nano, o1, o3, o3-mini, o4-mini | $0.10–$30.00 / $0.40–$180.00 |
| Anthropic | Claude Fable 5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.6, Claude Opus 4.5, Claude Sonnet 5, Claude Sonnet 4.6, Claude Haiku 4.5 | $1.00–$10.00 / $5.00–$50.00 |
| Google | Gemini 3.1 Pro, Gemini 3 Pro Preview, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3.1 Flash Lite, Gemini 2.5 Flash Lite | $0.10–$2.00 / $0.40–$12.00 |
| DeepSeek | DeepSeek V4 Flash Chat, DeepSeek V4 Flash Reasoner, DeepSeek V4 Pro | $0.14–$0.435 / $0.28–$0.87 |
| Z.AI | GLM-5.2, GLM-5.1, GLM-5, GLM-5 Turbo | $1.00–$1.40 / $3.20–$4.40 |
| Moonshot | Kimi K3 (1M context, 2.8T open MoE, flagship), Kimi K2.7, Kimi K2.5 | $0.60–$3.00 / $3.00–$15.00 |
| MiniMax | MiniMax M2.7 (204K context, reasoning) | $0.30 / $1.20 |
| Qwen | Qwen3.7 Max (1M context, Alibaba flagship) | $1.48 / $4.43 |
| NVIDIA | GPT-OSS 120B, GPT-OSS 20B, DeepSeek V4 Flash, Nemotron Nano | **Free** |

### Image Models

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

---

## Become a Partner

Interested in partnering with BlockRun?

- **Facilitators** - Integrate your x402 facilitator
- **Agent Frameworks** - Add BlockRun as an LLM provider
- **AI Providers** - Get listed on our gateway
- **Data Providers** - Monetize your API via x402

[Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or reach out on [Telegram](https://t.me/+mroQv4-4hGgzOGUx).
