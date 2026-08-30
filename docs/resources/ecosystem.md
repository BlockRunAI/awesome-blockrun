---
title: Ecosystem
description: Every public BlockRun repo — gateway entry points, routers and agent-runtime plugins, SDKs, payment rails, Franklin apps, skills, curated lists — plus API products, networks, x402 facilitators, partners, and community projects.
---

# Ecosystem

Projects, integrations, and partners building with BlockRun and x402. Every row under **Official projects** is a public, actively maintained repository in the [BlockRunAI GitHub org](https://github.com/BlockRunAI); archived repos are not listed.

## Official projects

### Entry points

| Project | What it is | Install |
|---------|------------|---------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP server for Claude Code and any MCP client — 20 tools: chat across the full model catalog, image / video / music / speech, web + neural search, prediction markets (read **and** trade Polymarket), crypto data, Pyth prices, multi-chain RPC, DeFi data, sandboxed code exec, phone calls, wallet | `claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest` |
| [blockrun-cli](https://github.com/BlockRunAI/blockrun-cli) | Umbrella CLI (`blockrun`) + `@blockrun/core` shared kernel — one wallet, one x402 payment path, one `{ok,data\|error}` output contract. ~40 commands: wallet, inference, multimodal, data, generic `api` / `pay` for any x402 endpoint, spending guardrails, agent skills; prefix discovery routes to ClawRouter, Franklin, MCP and the Codex bridge | `npm install -g @blockrun/cli` |
| [ClawRouter](https://github.com/BlockRunAI/ClawRouter) | The agent-native LLM router — every frontier model behind one wallet, <1ms local routing, USDC on Base & Solana via x402. OpenClaw plugin; free models need no wallet | `npm install -g @blockrun/clawrouter` |
| [router-core](https://github.com/BlockRunAI/router-core) | The routing engine underneath ClawRouter, Franklin, ClawRouter-Hermes and dsh-clawrouter. Deterministic, constraint-first model routing — classify, hard-filter, rank — locally in <1ms, with no inference call. Product-neutral: no wallet, gateway, or telemetry | Library (`@blockrun/router-core`, consumed from GitHub) |
| [Franklin](https://github.com/BlockRunAI/Franklin) | The AI agent with a wallet — spends USDC autonomously to get real work done. Apache-2.0, TypeScript | `npm install -g @blockrun/franklin` |

### Routers and agent-runtime plugins

| Project | What it is | Install |
|---------|------------|---------|
| [XClawRouter](https://github.com/BlockRunAI/XClawRouter) | ClawRouter powered by the OKX OnchainOS wallet — full model catalog, wallet-based auth, USDC micropayments via x402 on Base & Solana. OpenClaw plugin | `curl -fsSL https://blockrun.ai/XClawRouter-update \| bash` then `npx @blockrun/xclawrouter setup` |
| [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) | ClawRouter for [NousResearch Hermes](https://github.com/NousResearch/hermes-agent) — Python plugin wrapping the ClawRouter proxy; one Hermes provider for the whole catalog, paid per request in USDC on Base & Solana | `pip install hermes-plugin-clawrouter` then `hermes plugins enable clawrouter` |
| [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) | Safety gate for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a stronger model reviews dangerous tool calls before they run. Adds vision and the full model catalog from one wallet, paid per request over x402 | `dsh plugin --profile web add dsh-clawrouter` |
| [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) | OpenAI Codex (CLI, IDE, Desktop) ↔ BlockRun bridge — translates the Responses API to Chat Completions, pays per request from a local wallet, `blockrun/auto` smart routing, zero API keys | `npx @blockrun/clawrouter-codex up` then `codex --profile clawrouter` |
| [blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin) | Claude Code media plugin (prototype) — wraps the MCP media profile with spend confirmation before each paid call, a running cost meter, a status-line balance, and `/blockrun-media:*` slash commands | `claude --plugin-dir /path/to/blockrun-plugin` |
| [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) | Codex port of the media plugin — image / video / audio with spend gate and real-ledger cost meter | `codex plugin marketplace add BlockRunAI/blockrun-codex-plugin` then `codex plugin install blockrun-media` |
| [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) | OpenCode plugin — chat, multi-turn messages, image generation and an auto-generated wallet for OpenCode agents (npm only, no public repo) | add `"@blockrun/opencode"` to the `plugin` list in `opencode.json` |
| [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) | LiteLLM adapter — call x402-paid models through LiteLLM as an in-process custom provider (`blockrun/<model>`) or a local OpenAI-compatible proxy. Base and Solana | `pip install blockrun-litellm` (`[proxy]`, `[solana]` extras) |
| [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) | BlockRun skill for the [lobster.cash](https://lobster.cash) OpenClaw plugin — chat, image generation and model browsing, paid with Solana USDC from the lobster.cash smart wallet | `curl -sSL https://raw.githubusercontent.com/BlockRunAI/lobstercash-blockrun-skill/main/install.sh \| bash` |
| [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) | ElizaOS plugin for x402 pay-per-request AI on Base | `npm install @blockrun/elizaos-plugin` |

### SDKs

| Project | What it is | Install |
|---------|------------|---------|
| [blockrun-llm](https://github.com/BlockRunAI/blockrun-llm) | Python SDK — every model, pay-per-call with USDC, OpenAI-compatible, zero rate limits. Chat, images, video, music, search, prediction markets, smart routing, Base + Solana | `pip install blockrun-llm` (`[solana]` extra) |
| [blockrun-llm-ts](https://github.com/BlockRunAI/blockrun-llm-ts) | TypeScript SDK — smart routing built in, OpenAI drop-in, Base + Solana | `npm install @blockrun/llm` |
| [blockrun-llm-go](https://github.com/BlockRunAI/blockrun-llm-go) | Go SDK — chat, image, video, music, speech, voice, web search, market data, prediction markets, DeFi/DEX and multi-chain RPC. Base or Solana | `go get github.com/BlockRunAI/blockrun-llm-go` |
| [blockrun-llm-vip](https://github.com/BlockRunAI/blockrun-llm-vip) | Native passthrough for the Anthropic and OpenAI APIs (Python) — subclasses the official SDKs and swaps only transport and base URL, so responses come back verbatim: real thinking-block signatures, native `content[]`, cache-token usage. Zero model substitution. Base or Solana | `pip install blockrun-llm-vip` |
| [blockrun-llm-go-vip](https://github.com/BlockRunAI/blockrun-llm-go-vip) | Go counterpart — returns the official `anthropic-sdk-go` and `openai-go` client types with x402 transport, zero response reshaping | `go get github.com/BlockRunAI/blockrun-llm-go-vip` |
| [blockrun-nano-client](https://github.com/BlockRunAI/blockrun-nano-client) | TypeScript SDK for `nano.blockrun.ai` — the full model catalog paid with gas-free, batched USDC via Circle Gateway on Polygon, Arbitrum, Optimism and Unichain mainnet (Base buyers use native x402 on `blockrun.ai`) | `npm install @blockrun/nano-client` |
| [blockrun-llm-xrpl](https://github.com/BlockRunAI/blockrun-llm-xrpl) | XRPL SDK (RLUSD) — **deprecated**, see the [XRPL notice](../sdks/xrpl.md) | `pip install blockrun-llm-xrpl` |

### Franklin apps

| Project | What it is | Install |
|---------|------------|---------|
| [Franklin-Trading](https://github.com/BlockRunAI/Franklin-Trading) | Wallet-native trading agent forked from Franklin — multi-persona debate, Backtest → Paper → Live lifecycle, multi-venue on-chain execution, x402 USDC receipt per fill | `npm install -g @blockrun/franklin-trading` |
| [franklin-canvas](https://github.com/BlockRunAI/franklin-canvas) | Open-source node-based AI media studio — image, video and music on an infinite canvas, or let an agent build a whole short film from one prompt. Pay-per-use in USDC | `git clone` + `npm start` |
| [franklin-bet](https://github.com/BlockRunAI/franklin-bet) | AI World Cup match predictions — a council of frontier models researches the form, reads live odds, and bets on every 2026 World Cup match. Static, reproducible pipeline built on Franklin × BlockRun | `npm run generate -- --agent` |
| [franklin-run](https://github.com/BlockRunAI/franklin-run) | Source of [franklin.run](https://franklin.run), Franklin's landing site, blog and docs (13 locales) | — |

### Skills, agents, and samples

| Project | What it is | Install |
|---------|------------|---------|
| [Claude-Code-GPT-IMAGE2-SeeDance-BlockRun](https://github.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun) | Run any awesome-gpt-image-2 or Seedance prompt as a one-line Claude Code command — `/headshot`, `/dance`, `/poster`, `/launch-film` + an 848-case library. Pay per image with x402 USDC on Base | `curl -fsSL https://raw.githubusercontent.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun/main/install.sh \| bash` |
| [polymarket-agent](https://github.com/BlockRunAI/polymarket-agent) | Autonomous AI-powered prediction-market trading agent using x402 micropayments — owns its wallet, pays for its own inference | `git clone` + `pip install -r requirements.txt` |
| [circle-nanopayment-sample](https://github.com/BlockRunAI/circle-nanopayment-sample) | Circle Gateway nanopayment sample — an AI agent pays for API access with gas-free, batched USDC micropayments | `npm run setup` |

### Curated lists and org infrastructure

| Project | What it is |
|---------|------------|
| [awesome-OpenClaw-Money-Maker](https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker) | Curated list of ways to make money with OpenClaw — automations, skills, services, and strategies |
| [awesome-finance-mcp](https://github.com/BlockRunAI/awesome-finance-mcp) | A curated list of MCP servers for AI finance agents |
| [awesome-healthcare-mcp](https://github.com/BlockRunAI/awesome-healthcare-mcp) | A curated list of MCP servers for healthcare and medical |
| [awesome-mcp-servers](https://github.com/BlockRunAI/awesome-mcp-servers) | A collection of MCP servers |
| [awesome-blockrun](https://github.com/BlockRunAI/awesome-blockrun) | This repo — docs, SDK index, research, and community |
| [branding](https://github.com/BlockRunAI/branding) | Official brand kit — logos, colors, and usage guidelines ([live preview](https://blockrunai.github.io/branding/)) |
| [renovate-config](https://github.com/BlockRunAI/renovate-config) | Shared Renovate preset for every BlockRun repo |

### Enterprise (coming soon)

**user.blockrun.ai** — enterprise access for teams that cannot run wallets: authenticate with an API key (`brk_live_…`), pay by wire (prepaid credit), and get billed post-hoc at exact actual usage — no per-call minimum, no per-call fee. It is a standard x402-paying client of the main gateway, so the gateway itself stays wallet-native. **Sign-in and self-serve API keys are not yet open**; contact the team via [Telegram](https://t.me/+mroQv4-4hGgzOGUx) for early access.

## API Products

| Product | Endpoint | Pricing | Status |
|---------|----------|---------|--------|
| **LLM Chat** | `/v1/chat/completions` | Per token (provider cost, no platform margin) + $0.001/request | ✅ Live |
| **Anthropic-Compat** | `/v1/messages` | Per token + $0.001/request | ✅ Live |
| **Responses API** | `/v1/responses` | Per token + $0.001/request | ✅ Live |
| **Image Generation** | `/v1/images/generations` | $0.015–0.10/image | ✅ Live |
| **Image Editing** | `/v1/images/image2image` | Per request | ✅ Live |
| **Video Generation** | `/v1/videos/generations` | Per second / per M tokens | ✅ Live |
| **Music Generation** | `/v1/audio/generations` | $0.1585/track | ✅ Live |
| **Text-to-Speech** | `/v1/audio/speech` | $0.05–0.10/1k chars | ✅ Live |
| **Sound Effects** | `/v1/audio/sound-effects` | $0.0535/generation | ✅ Live |
| **Voice Calls** | `/v1/voice/call` | $0.541 flat | ✅ Live |
| **Phone Numbers** | `/v1/phone/numbers/*` | $5.001/30 days | ✅ Live |
| **Surf Crypto Data** | `/api/v1/surf/*` (83 endpoints) | $0.0085 | ✅ Live |
| **Search** | `/v1/search` | $0.026/source | ✅ Live |
| **Exa Web Search** | `/api/v1/exa/*` | $0.003–0.011 | ✅ Live |
| **0x Swap (DEX)** | `/api/v1/zerox/*` | Free | ✅ Live |
| **Multi-chain RPC** | `/api/v1/rpc/{network}` (40 chains) | $0.003/call | ✅ Live |
| **Prediction Markets** | `/v1/pm/*` | $0.0085 | ✅ Live |
| **DefiLlama** | `/api/v1/defillama/*` | $0.002–0.006 | ✅ Live |
| **Market Data (Pyth)** | `/v1/{crypto,fx,commodity}/*` | Free | ✅ Live |
| **Equity Prices (Pyth)** | `/v1/{usstock,stocks}/*` | $0.002 | ✅ Live |
| **RealFace Enrollment** | `/v1/realface/enroll` | $0.011 | ✅ Live |
| **Virtual Portrait** | `/v1/portrait/enroll` | $0.011 | ✅ Live |
| **Polymarket Funding** | `/v1/polymarket/fund` | $0.011 fee | ✅ Live |
| **Coinbase Onramp** | `/v1/onramp/token` | Free (Base only) | ✅ Live |
| **Modal Sandbox** | `/v1/modal/*` | $0.002–0.011 | ✅ Live |
| **Models** | `/v1/models` | Free | ✅ Live |
| **Pricing** | `/api/pricing` | Free | ✅ Live |
| **Balance** | `/v1/balance` | Free | ✅ Live |

Per-token chat carries **no platform margin** — only the flat $0.001 transaction fee. Media generation and Live Search carry 5%. See [Pricing](../products/intelligence/pricing.md) and the full [x402 endpoint catalog](../x402/endpoints.md).

## Framework Integrations

| Framework / runtime | Status | Link |
|---------|--------|------|
| Claude Code, Cursor, any MCP client | Released | [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) · [blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin) |
| OpenClaw | Released | [ClawRouter](https://github.com/BlockRunAI/ClawRouter) · [XClawRouter](https://github.com/BlockRunAI/XClawRouter) (OKX OnchainOS wallet) · [lobstercash-blockrun-skill](https://github.com/BlockRunAI/lobstercash-blockrun-skill) |
| OpenAI Codex | Released | [clawrouter-codex](https://github.com/BlockRunAI/clawrouter-codex) · [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) |
| NousResearch Hermes | Released | [ClawRouter-Hermes](https://github.com/BlockRunAI/ClawRouter-Hermes) |
| DeepSeek Harness | Released | [dsh-clawrouter](https://github.com/BlockRunAI/dsh-clawrouter) |
| OpenCode | Released | [@blockrun/opencode](https://www.npmjs.com/package/@blockrun/opencode) |
| LiteLLM | Released | [blockrun-litellm](https://github.com/BlockRunAI/blockrun-litellm) |
| Continue | Released | [Native provider](https://github.com/continuedev/continue/pull/11751) — ClawRouter as a built-in LLM provider |
| ElizaOS | Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| GOAT SDK | In Review | [GitHub Issue](https://github.com/crossmint/goat) |
| AgentKit | Available | [Integration Guide](../frameworks/agentkit.md) |
| LangChain | Available | [Custom LLM Guide](../frameworks/langchain.md) |

## Community Projects

Projects built by the community using BlockRun.

| Project | Category | Description |
|---------|----------|-------------|
| [PredictOS](https://github.com/PredictionXBT/PredictOS) | Prediction Markets | Prediction market analysis with multi-AI provider support |
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading with Visual Cortex chart analysis |
| [Spraay](https://github.com/plagtech/spraay-x402-gateway) | x402 Gateway | Multi-chain x402 payment gateway with dual-provider AI inference |
| [NoFx](https://github.com/NoFxAiOS/nofx) | Crypto Trading | Personal AI trading assistant - any market, any model, pay with USDC |
| [Voyage GEO](https://github.com/onvoyage-ai/voyage-geo-agent) | AI Analytics | Generative Engine Optimization - track AI brand mentions across multiple models |

## Networks

| Network | Gateway | Asset | Settlement | Status |
|---------|---------|-------|------------|--------|
| Base | `blockrun.ai` | USDC | Per-call x402 | ✅ Live |
| Solana | `sol.blockrun.ai` | USDC (SPL) | Per-call x402 | ✅ Live |
| Polygon / Arbitrum / Optimism / Unichain | `nano.blockrun.ai` | USDC via Circle Gateway | Gas-free, batched nanopayments | ✅ Live |
| Base Sepolia | `testnet.blockrun.ai` | USDC (testnet) | Per-call x402 | ✅ Testnet |
| XRP Ledger | `xrpl.blockrun.ai` | RLUSD | — | ⛔ Sunset (gateway offline) |

## x402 Facilitators

BlockRun works with the x402 facilitator network:

| Facilitator | Network | Link |
|-------------|---------|------|
| Coinbase CDP | Base, Ethereum | [coinbase.com/cloud](https://coinbase.com/cloud) |
| Circle Gateway | Polygon, Arbitrum, Optimism, Unichain (batched nanopayments) | [developers.circle.com/gateway](https://developers.circle.com/gateway/nanopayments) |
| PayAI | Base, Solana | [payai.network](https://payai.network) |
| QuestFlow | Base | [questflow.ai](https://questflow.ai) |
| AnySpend | Base | [anyspend.com](https://anyspend.com) |
| AurraCloud | Base | [aurracloud.com](https://aurracloud.com) |
| thirdweb | Base, Ethereum | [thirdweb.com](https://thirdweb.com) |

## Partners

| Partner | Relationship |
|---------|--------------|
| [Circle](https://partners.circle.com/partner/blockrunai) | Alliance Partner — USDC payments on Base; Circle Gateway nanopayments on `nano.blockrun.ai` |
| [Coinbase CDP](https://coinbase.com/cloud) | x402 facilitator infrastructure |
| [x402 Foundation](https://x402.org) | Protocol development |
| [thirdweb](https://thirdweb.com) | Wallet & payment infrastructure |
| [OKX OnchainOS](https://web3.okx.com) | Agentic wallet behind XClawRouter |
| [Predexon](https://predexon.com) | Prediction market data |
| [Modal](https://modal.com) | Sandbox compute (isolated code execution) |
| [Surf (asksurf.ai)](https://asksurf.ai) | Crypto data — 83 endpoints (CEX, on-chain SQL, prediction markets, wallet labels, social, news) |
| [Bland.ai](https://bland.ai) | Conversational voice AI — outbound calls |
| [Twilio](https://twilio.com) | Phone-number provisioning (wallet-owned US/CA numbers) |
| [Exa](https://exa.ai) | Neural web search |
| [0x](https://0x.org) | DEX aggregation (Swap V2 + Gasless V2) |
| [Tatum](https://tatum.io) | Multi-chain JSON-RPC (40 chains) |
| [Pyth](https://pyth.network) | Crypto, FX, commodity and equity prices |

## AI Providers

BlockRun routes to these providers via x402:

| Provider | Models | Input/Output per 1M tokens |
|----------|--------|---------------------------|
| OpenAI | GPT-5.5, GPT-5.4, GPT-5.4 Pro, GPT-5.2 | $1.75–$30.00 / $14.00–$180.00 |
| Anthropic | Claude Fable 5, Claude Opus 5, Claude Opus 4.8, Claude Sonnet 5, Claude Sonnet 4.6, Claude Haiku 4.5 | $1.00–$10.00 / $5.00–$50.00 |
| Google | Gemini 3.1 Pro, Gemini 3.5 Flash | $1.50–$2.00 / $9.00–$12.00 |
| DeepSeek | DeepSeek V4 Flash Chat, DeepSeek V4 Pro, DeepSeek Reasoner | $0.14–$0.435 / $0.28–$0.87 |
| xAI | Grok 4.5, Grok 4.3, Grok Build 0.1 | $1.50–$2.50 / $3.00–$9.00 |
| Z.AI | GLM-5.2 (1M context), GLM-5.1, GLM-5, GLM-5 Turbo | $1.00–$1.40 / $3.20–$4.40 |
| Moonshot | Kimi K3 (1M context, image + text input) | $3.00 / $15.00 |
| MiniMax | MiniMax M3 (1M context) | $0.30 / $1.20 |
| Qwen | Qwen3.7 Max (1M context, flagship) | $1.48 / $4.43 |
| Free tier | 5 reasoning, coding, and vision models | **Free** |

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
