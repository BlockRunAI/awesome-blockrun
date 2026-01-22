# BlockRun Ecosystem

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
| [Coinbase CDP](https://coinbase.com/cloud) | x402 facilitator infrastructure |
| [x402 Foundation](https://x402.org) | Protocol development |
| [thirdweb](https://thirdweb.com) | Wallet & payment infrastructure |

## Integrations

### Community Integrations

| Project | Category | Description |
|---------|----------|-------------|
| [LLM_trader](https://github.com/qrak/LLM_trader) | Trading Bot | Autonomous crypto trading bot with Visual Cortex for chart analysis |

### Claude Code Tools

| Tool | Description | Install |
|------|-------------|---------|
| [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) | MCP Server - Access 30+ AI models with zero API keys | `npx @anthropic-ai/claude-code mcp add blockrun-mcp` |
| [nano-banana-blockrun](https://github.com/BlockRunAI/nano-banana-blockrun) | Image generation skill via x402 micropayments | Claude Code skill |

### Framework Integrations

| Project | Category | Stars | Status | Help Wanted |
|---------|----------|-------|--------|-------------|
| [GOAT SDK](https://github.com/crossmint/goat) | Agent Framework | 150K+ downloads | In Review | - |
| [ElizaOS](https://github.com/elizaOS/eliza) | Agent Framework | 60K+ | ✅ Released | [elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun) |
| [AgentKit](https://github.com/coinbase/agentkit) | Agent Framework | Official | Planned | Example code |
| [LangChain](https://github.com/langchain-ai/langchain) | LLM Framework | 100K+ | Planned | Custom LLM provider |
| [OctoBot](https://github.com/Drakkar-Software/OctoBot) | Trading Bot | 5K+ | Planned | Integration |

Want to add an integration? [Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or submit a PR!

## SDKs

| Language | Repository | Status |
|----------|------------|--------|
| Python | [blockrun-llm](https://github.com/blockrunai/blockrun-llm) | Released |
| TypeScript | [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts) | Released |
| Go | [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go) | Released |

## Supported Networks

| Network | Status | Asset |
|---------|--------|-------|
| Base | Live | USDC |
| Solana | Planned Q1 2026 | USDC |

## AI Providers

BlockRun routes to these AI providers via x402:

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-5, o1, o3, DALL-E |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus |
| Google | Gemini 2.5 Pro, Gemini Flash |
| DeepSeek | DeepSeek V3, DeepSeek Reasoner |
| xAI | Grok |
| Meta | Llama 3.3 |
| Alibaba | Qwen |

---

## Become a Partner

Interested in partnering with BlockRun?

- **Facilitators** - Integrate your x402 facilitator
- **Agent Frameworks** - Add BlockRun as an LLM provider
- **AI Providers** - Get listed on our gateway

[Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or reach out on [Telegram](https://t.me/+mroQv4-4hGgzOGUx).
