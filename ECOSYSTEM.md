# BlockRun Ecosystem

## API Products

BlockRun is a unified API gateway — pay per request with USDC, no API keys needed.

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token — provider cost, no platform margin, + $0.001/request | ✅ Live |
| **Anthropic-Compat** | `/v1/messages` | Per token + $0.001/request | ✅ Live |
| **Responses API** | `/v1/responses` | Per token + $0.001/request | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.015–0.15/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Video Generation** | `/v1/videos/generations` | Per second / per M tokens | ✅ Live |
| **Music / Speech / SFX** | `/v1/audio/*` | $0.151/track · $0.05–0.10/1k chars · $0.0535/SFX | ✅ Live |
| **Voice Calls & Phone Numbers** | `/v1/voice/call`, `/v1/phone/*` | $0.541/call · $5.001/30 days | ✅ Live |
| **Search** | `/v1/search` | $0.025/source | ✅ Live |
| **Exa Web Search** | `/v1/exa/*` | $0.003–0.011 | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.0085 | ✅ Live |
| **Surf Crypto Data** | `/v1/surf/*` (83 endpoints) | $0.0085 | ✅ Live |
| **DefiLlama** | `/v1/defillama/*` | $0.002–0.006 | ✅ Live |
| **0x Swap (DEX)** | `/v1/zerox/*` | Free | ✅ Live |
| **Multi-chain RPC** | `/v1/rpc/{network}` (<!-- br:chains.rpc -->40<!-- /br:chains.rpc --> chains) | $0.003/call | ✅ Live |
| **Market Data (Pyth)** | `/v1/{crypto,fx,commodity}/*` · `/v1/{usstock,stocks}/*` | Free · $0.002 | ✅ Live |
| **Modal Sandbox** | `/v1/modal/*` | $0.002–0.011 | ✅ Live |
| **RealFace / Virtual Portrait** | `/v1/realface/enroll`, `/v1/portrait/enroll` | $0.011 | ✅ Live |
| **Polymarket Funding** | `/v1/polymarket/fund` | $0.011 fee | ✅ Live |
| **Models** | `/v1/models` | Free | ✅ Live |
| **Pricing** | `/v1/pricing` | Free | ✅ Live |
| **Balance** | `/v1/balance` | Free | ✅ Live |

Full catalog with per-path prices: [x402 Endpoints](./docs/x402/endpoints.md).

## Networks

| Network | Gateway | Asset | Status |
|---------|---------|-------|--------|
| **Base** | `blockrun.ai` | USDC | ✅ Live |
| **Solana** | `sol.blockrun.ai` | USDC | ✅ Live |
| **Polygon / Arbitrum / Optimism / Unichain** | `nano.blockrun.ai` | USDC via Circle Gateway (gas-free, batched) | ✅ Live |
| **Base Sepolia** | `testnet.blockrun.ai` | USDC (testnet) | ✅ Testnet |
| **XRP Ledger** | `xrpl.blockrun.ai` | RLUSD | ⛔ Sunset (offline) |

**Enterprise (coming soon):** `user.blockrun.ai` — API keys (`brk_live_…`) + wire billing, billed post-hoc at exact usage with no per-call minimum. Sign-in is not yet open.

## x402 Facilitators

BlockRun works with the x402 facilitator network:

| Facilitator | Network | Discovery Endpoint |
|-------------|---------|-------------------|
| [Coinbase CDP](https://coinbase.com/cloud) | Base, Ethereum | `api.cdp.coinbase.com/platform/v2/x402/discovery/resources` |
| [Circle Gateway](https://developers.circle.com/gateway/nanopayments) | Polygon, Arbitrum, Optimism, Unichain (batched nanopayments, `nano.blockrun.ai`) | — |
| [PayAI](https://payai.network) | Base, Solana | `facilitator.payai.network/discovery/resources` |
| [QuestFlow](https://questflow.ai) | Base | `facilitator.questflow.ai/discovery/resources` |
| [AnySpend](https://anyspend.com) | Base | `mainnet.anyspend.com/x402/discovery/resources` |
| [AurraCloud](https://aurracloud.com) | Base | `x402-facilitator.aurracloud.com/discovery/resources` |
| [thirdweb](https://thirdweb.com) | Base, Ethereum | `api.thirdweb.com/v1/payments/x402/discovery/resources` |

## Partners

| Partner | Relationship |
|---------|--------------|
| [Circle](https://partners.circle.com/partner/blockrunai) | Alliance Partner — USDC payments on Base; Circle Gateway nanopayments on `nano.blockrun.ai` |
| [OKX OnchainOS](https://web3.okx.com) | Agentic wallet behind XClawRouter |
| [Amazon Web Services](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-payments-is-now-generally-available-enabling-agents-to-transact-safely-and-autonomously-at-scale/) | Launch partner — Amazon Bedrock AgentCore Payments (GA Aug 2026) pays for BlockRun endpoints via x402 |
| [Coinbase CDP](https://coinbase.com/cloud) | x402 facilitator infrastructure |
| [x402 Foundation](https://x402.org) | Protocol development |
| [thirdweb](https://thirdweb.com) | Wallet & payment infrastructure |
| [Predexon](https://predexon.com) | Prediction market data (Polymarket, Kalshi, Limitless, Opinion, Predict.Fun, Binance) |
| [Modal](https://modal.com) | Sandbox compute (managed Python sandboxes for isolated code execution) |
| [Surf (asksurf.ai)](https://asksurf.ai) | Crypto data — 83 endpoints |
| [Exa](https://exa.ai) | Neural web search |
| [0x](https://0x.org) | DEX aggregation (Swap V2 + Gasless V2) |
| [Tatum](https://tatum.io) | Multi-chain JSON-RPC |
| [Pyth](https://pyth.network) | Crypto, FX, commodity and equity prices |
| [Bland.ai](https://bland.ai) / [Twilio](https://twilio.com) | Voice calls / phone-number provisioning |

## Community Integrations

| Project | Category | Description |
|---------|----------|-------------|
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading bot with Visual Cortex for chart analysis |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track AI brand mentions across multiple models |

### Claude Code Tools

| Tool | Description | Install |
|------|-------------|---------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP Server — <!-- br:mcp.tools -->20<!-- /br:mcp.tools --> tools across <!-- br:models.chatVisible -->71<!-- /br:models.chatVisible --> AI models, image/video/music/speech gen, voice calls, crypto data (Surf), prediction markets, DEX prices, raw JSON-RPC (<!-- br:chains.rpc -->40<!-- /br:chains.rpc --> chains), DeFi TVL/yields, sandboxed code exec, search | `claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest` |
| [blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin) | Media plugin — spend confirmation before each paid image/video/audio call, running cost meter, balance status line | `claude --plugin-dir /path/to/blockrun-plugin` |
| [Claude-Code-GPT-IMAGE2-SeeDance-BlockRun](https://github.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun) | `/headshot`, `/dance`, `/poster`, `/launch-film` — 848 prompt cases as one-line commands, pay per image | `curl -fsSL https://raw.githubusercontent.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun/main/install.sh \| bash` |
| [alpha-mcp](https://github.com/BlockRunAI/alpha-mcp) | AI crypto-trading MCP — technical analysis, sentiment, DEX swaps on Base, risk limits | `claude mcp add alpha npx @blockrun/alpha` |

### Official Repos

Every public, non-archived repo in the [BlockRunAI org](https://github.com/BlockRunAI):

| Repo | What it is | Install |
|------|------------|---------|
| [blockrun-cli](https://github.com/BlockRunAI/blockrun-cli) | `blockrun` umbrella CLI + `@blockrun/core` shared kernel — one wallet, one x402 payment path, one output contract; generic `api`/`pay` for any x402 endpoint | `npm install -g @blockrun/cli` |
| [ClawRouter](https://github.com/BlockRunAI/ClawRouter) | The agent-native LLM router — <1ms local routing, USDC on Base & Solana via x402, OpenClaw plugin | `npm install -g @blockrun/clawrouter` |
| [router-core](https://github.com/BlockRunAI/router-core) | The routing engine behind ClawRouter, Franklin, Hermes and dsh-clawrouter — deterministic, constraint-first, no inference call | library |
| [XClawRouter](https://github.com/BlockRunAI/XClawRouter) | ClawRouter powered by the OKX OnchainOS wallet — wallet-based auth, USDC on Base & Solana | `curl -fsSL https://blockrun.ai/XClawRouter-update \| bash` |
| [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) | ClawRouter for NousResearch Hermes — Python plugin wrapping the proxy | `pip install hermes-plugin-clawrouter` |
| [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) | DeepSeek Harness safety gate — a stronger model reviews dangerous tool calls before they run; vision + full catalog | `dsh plugin --profile web add dsh-clawrouter` |
| [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) | OpenAI Codex ↔ BlockRun bridge via the Responses API, wallet-signed x402, zero API keys | `npx @blockrun/clawrouter-codex up` |
| [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) | Media tools for Codex — spend gate + real-ledger cost meter | `codex plugin marketplace add BlockRunAI/blockrun-codex-plugin` |
| [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) | OpenCode plugin — chat, images, auto-generated wallet (npm only) | `"plugin": ["@blockrun/opencode"]` |
| [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) | LiteLLM adapter — custom provider or local OpenAI-compatible proxy, Base + Solana | `pip install blockrun-litellm` |
| [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) | BlockRun skill for the lobster.cash OpenClaw plugin — Solana USDC | `install.sh` in repo |
| [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) | ElizaOS plugin for x402 pay-per-request AI on Base | `npm install @blockrun/elizaos-plugin` |
| [blockrun-llm-vip](https://github.com/BlockRunAI/blockrun-llm-vip) | Native Anthropic + OpenAI passthrough (Python) — official SDK subclasses, responses verbatim, zero model substitution | `pip install blockrun-llm-vip` |
| [blockrun-llm-go-vip](https://github.com/BlockRunAI/blockrun-llm-go-vip) | Native Anthropic + OpenAI passthrough (Go) — official client types, zero reshaping | `go get github.com/BlockRunAI/blockrun-llm-go-vip` |
| [blockrun-nano-client](https://github.com/BlockRunAI/blockrun-nano-client) | TypeScript SDK for `nano.blockrun.ai` — gas-free batched USDC via Circle Gateway on Polygon, Arbitrum, Optimism, Unichain | `npm install @blockrun/nano-client` |
| [circle-nanopayment-sample](https://github.com/BlockRunAI/circle-nanopayment-sample) | Circle Gateway nanopayment sample — an agent pays for API access with gas-free USDC | `npm run setup` |
| [Franklin](https://github.com/BlockRunAI/Franklin) | The AI agent with a wallet — spends USDC autonomously to get real work done | `npm install -g @blockrun/franklin` |
| [Franklin-Trading](https://github.com/BlockRunAI/Franklin-Trading) | Wallet-native trading agent — persona debate, Backtest → Paper → Live, x402 receipt per fill | `npm install -g @blockrun/franklin-trading` |
| [franklin-canvas](https://github.com/BlockRunAI/franklin-canvas) | Node-based AI media studio — image, video, music on an infinite canvas | `git clone` + `npm start` |
| [franklin-bet](https://github.com/BlockRunAI/franklin-bet) | Frontier-model council researches, reads odds, and bets on every 2026 World Cup match | `npm run generate -- --agent` |
| [franklin-run](https://github.com/BlockRunAI/franklin-run) | Source of franklin.run — landing site, blog, docs | — |
| [polymarket-agent](https://github.com/BlockRunAI/polymarket-agent) | Autonomous prediction-market trading agent using x402 micropayments | `pip install -r requirements.txt` |
| [awesome-OpenClaw-Money-Maker](https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker) | Curated ways to make money with OpenClaw | — |
| [awesome-finance-mcp](https://github.com/BlockRunAI/awesome-finance-mcp) · [awesome-healthcare-mcp](https://github.com/BlockRunAI/awesome-healthcare-mcp) · [awesome-mcp-servers](https://github.com/BlockRunAI/awesome-mcp-servers) | Curated MCP server lists | — |
| [branding](https://github.com/BlockRunAI/branding) · [renovate-config](https://github.com/BlockRunAI/renovate-config) | Brand kit · shared Renovate preset | — |

### Framework Integrations

| Project | Category | Stars | Status | Help Wanted |
|---------|----------|-------|--------|-------------|
| [Continue](https://github.com/continuedev/continue) | IDE Extension | 32K+ | ✅ Released | [Native provider](https://github.com/continuedev/continue/pull/11751) |
| [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) | Agent Platform | Official | ✅ Released | [AgentCore Payments](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-payments-is-now-generally-available-enabling-agents-to-transact-safely-and-autonomously-at-scale/) — launch partner |
| [GOAT SDK](https://github.com/crossmint/goat) | Agent Framework | 150K+ downloads | In Review | - |
| [ElizaOS](https://github.com/elizaOS/eliza) | Agent Framework | 60K+ | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [OpenAI Codex](https://github.com/openai/codex) | Coding Agent | — | ✅ Released | [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) · [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) |
| [Hermes](https://github.com/NousResearch/hermes-agent) | Agent Framework | — | ✅ Released | [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) |
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | Coding Agent | — | ✅ Released | [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) |
| [OpenCode](https://opencode.ai) | Coding Agent | — | ✅ Released | [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) |
| [LiteLLM](https://github.com/BerriAI/litellm) | LLM Gateway | — | ✅ Released | [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) |
| [OKX OnchainOS](https://web3.okx.com) | Agent Wallet | — | ✅ Released | [XClawRouter](https://github.com/BlockRunAI/XClawRouter) |
| [lobster.cash](https://lobster.cash) | OpenClaw Plugin | — | ✅ Released | [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) |
| [AgentKit](https://github.com/coinbase/agentkit) | Agent Framework | Official | Planned | Example code |
| [LangChain](https://github.com/langchain-ai/langchain) | LLM Framework | 100K+ | Planned | Custom LLM provider |
| [OctoBot](https://github.com/Drakkar-Software/OctoBot) | Trading Bot | 5K+ | Planned | Integration |

Want to add an integration? [Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or submit a PR!

## SDKs

| Language | Repository | Features | Status |
|----------|------------|----------|--------|
| Python | [blockrun-llm](https://github.com/blockrunai/blockrun-llm) | Chat, Images, Search, Prediction Markets, Smart Routing, Solana | Released |
| TypeScript | [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts) | Chat, Images, Search, OpenAI drop-in, Smart Routing, Solana | Released |
| Go | [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go) | Chat, Images, Video, Music, Speech, Voice, Search, Market Data, Prediction Markets, DeFi/DEX, Multi-chain RPC, Solana | Released |
| Python (native) | [blockrun-llm-vip](https://github.com/BlockRunAI/blockrun-llm-vip) | Official Anthropic/OpenAI SDK subclasses — verbatim responses, Base + Solana | Released |
| Go (native) | [blockrun-llm-go-vip](https://github.com/BlockRunAI/blockrun-llm-go-vip) | Official `anthropic-sdk-go` / `openai-go` client types with x402 transport | Released |
| TypeScript (nano) | [blockrun-nano-client](https://github.com/BlockRunAI/blockrun-nano-client) | Circle Gateway batched USDC — Polygon, Arbitrum, Optimism, Unichain | Released |
| Python (LiteLLM) | [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) | LiteLLM custom provider + local proxy | Released |
| CLI | [blockrun-cli](https://github.com/BlockRunAI/blockrun-cli) | `blockrun` umbrella CLI + `@blockrun/core` kernel | Released |
| Python (XRPL) | [blockrun-llm-xrpl](https://github.com/BlockRunAI/blockrun-llm-xrpl) | RLUSD on XRP Ledger | Deprecated (gateway sunset) |

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

## Events

| Event | Where | About |
|-------|-------|-------|
| [Building the Agentic Economy with Fireblocks, Circle & BlockRun](https://luma.com/lon7mu2d) | New York (5 Penn Plaza) | Co-hosted with Circle, Fireblocks and Dynamic — panel + live demos on how agents access services and transact via Circle's Agent Stack and x402 |

## Become a Partner

Interested in partnering with BlockRun?

- **Facilitators** - Integrate your x402 facilitator
- **Agent Frameworks** - Add BlockRun as an LLM provider
- **AI Providers** - Get listed on our gateway
- **Data Providers** - Monetize your API via x402

[Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or reach out on [Telegram](https://t.me/+mroQv4-4hGgzOGUx).
