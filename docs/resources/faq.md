---
title: FAQ
description: Common questions about BlockRun — what it is, how x402 payments work, supported models and frameworks, wallet security, and troubleshooting.
---

# FAQ

Frequently asked questions about BlockRun — payments, products, models, wallets, and troubleshooting.

## General

### What is BlockRun?

BlockRun is economic infrastructure for AI agents. It provides:
- **Trading** — AI that analyzes markets and executes trades (alpha-mcp)
- **Creation** — generate images, video, music, and speech, paid per output
- **Intelligence** — Access to 72 chat/LLM models via x402 micropayments
- **Routing** — ClawRouter picks the cheapest capable model locally, in under 1ms

### What makes BlockRun different?

| Traditional | BlockRun |
|-------------|----------|
| API keys per provider | One wallet for all |
| Monthly subscriptions | Pay-per-request |
| Account management | Just fund and use |
| Complex billing | On-chain transparency |

### Is BlockRun free?

- **Trading (alpha-mcp):** Free and open source
- **Creation:** Pay-per-use — images $0.015–0.15, video from $0.05/sec, music $0.15/track, text-to-speech $0.05–0.10 per 1k chars
- **Intelligence:** Provider cost with **no platform margin** on per-token chat (since 2026-08-07) — only a flat $0.001 transaction fee per request. Media generation and Live Search carry 5%.
- **Free tier:** 10 chat/reasoning/vision models with no per-token charge

## Products

### What is alpha-mcp?

alpha-mcp is our trading product. It gives Claude the tools to:
- Analyze markets (technical indicators, sentiment)
- Execute trades (DEX swaps on Base)
- Manage risk (hardcoded safety limits)

It's free and open source. See [Trading Overview](../products/trading/overview.md).

### What is nano-banana?

nano-banana is the image-generation capability — Nano Banana, GPT Image, CogView-4, or Grok Imagine via micropayments. See [nano-banana](../products/creation/nano-banana.md). The original `nano-banana-blockrun` Claude Code skill repo is archived; use the `blockrun_image` tool in [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) or the [GPT-Image-2 / SeeDance skill](https://github.com/BlockRunAI/Claude-Code-GPT-IMAGE2-SeeDance-BlockRun) instead.

### What is ClawRouter?

ClawRouter is the open-source LLM router for autonomous agents — it classifies each request locally and routes it to the cheapest capable model in under 1ms, paying per request in USDC on Base or Solana. It ships as an OpenClaw plugin and as ports for Hermes, DeepSeek Harness, Codex and the OKX OnchainOS wallet. See [ClawRouter](../products/routing/clawrouter.md) and the [Ecosystem](ecosystem.md).

### What is Franklin?

Franklin is the AI agent with a wallet — it holds USDC and spends it autonomously across every model and paid API to get work done, with budgets and guardrails. See [Franklin](../products/franklin.md).

### Can I use an API key instead of a wallet?

Enterprise access at **user.blockrun.ai** is coming soon: API keys (`brk_live_…`), wire/prepaid billing, and post-hoc billing at exact usage with no per-call minimum. Sign-in is not yet open — reach out on [Telegram](https://t.me/+mroQv4-4hGgzOGUx) for early access. Everyone else pays per call from a wallet; no API key is ever required.

## Payments

### How do payments work?

BlockRun uses the x402 protocol:
1. Request a service
2. Receive `HTTP 402 Payment Required` with price
3. Your SDK signs a USDC authorization locally
4. Payment settles on-chain, you receive the service

### What currency is accepted?

USDC — on **Base** (`blockrun.ai`) or **Solana** (`sol.blockrun.ai`), both live. `nano.blockrun.ai` also accepts gas-free, batched USDC via Circle Gateway on Polygon, Arbitrum, Optimism and Unichain.

### What's the minimum to get started?

$1 is enough for testing. Recommended: $5-20 for regular usage.

### How do I fund my wallet?

Send USDC to your wallet address on Base (or Solana):
- [Coinbase](https://coinbase.com) — Direct withdrawal to Base or Solana
- [Base Bridge](https://bridge.base.org) — Bridge from Ethereum
- [Uniswap](https://app.uniswap.org) — Swap on Base
- `POST /v1/onramp/token` — a free Coinbase Onramp link for a Base wallet (`blockrun fund` in the CLI)

### What if a request fails?

You only pay for successful requests. Failed requests don't settle.

### Can I get a refund?

Payments are on-chain and final, like any blockchain transaction.

## Trading

### Is AI trading risky?

Yes. alpha-mcp has built-in risk limits (15% max position, 50% cash reserve, 5% daily loss limit), but all trading carries risk. Only trade what you can afford to lose.

### Can I override the risk limits?

No. Risk limits are hardcoded and cannot be overridden.

### What can alpha-mcp trade?

Tokens on Base via 0x Protocol. Common pairs: ETH/USDC, popular tokens with liquidity.

### Does BlockRun charge trading fees?

No. alpha-mcp is free. You only pay for intelligence (sentiment analysis) and network gas.

### Is there a per-request fee?

Yes — a flat $0.001 transaction fee on every paid call, which covers on-chain settlement. That is the only thing added on top of provider cost for chat; there is no percentage margin on tokens.

## Technical

### Which AI models are available?

72 models including:
- OpenAI (GPT-5.5, GPT-5.4, GPT-5.4 Pro, GPT-5.2)
- Anthropic (Claude Opus 5, Opus 4.8, Sonnet 5, Sonnet 4.6, Haiku 4.5)
- Google (Gemini 3.1 Pro, Gemini 3.5 Flash)
- DeepSeek (V4 Flash Chat, V4 Pro, Reasoner)
- Z.AI (GLM-5.2 with 1M context, GLM-5.1, GLM-5, GLM-5 Turbo)
- Moonshot (Kimi K3 — 1M context, image + text input)
- MiniMax (MiniMax M3)
- Qwen (Qwen3.7 Max — 1M context, Alibaba flagship)
- xAI (Grok 4.5, Grok 4.3, Grok Build 0.1)
- Plus a free tier of 10 reasoning, coding, and vision models

Full list: [Models](../api-reference/models.md)

### Is the API OpenAI-compatible?

Yes. Use the same format as OpenAI's Chat Completions API.

### How do I use BlockRun with Claude Code?

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

Then run `blockrun setup` in Claude Code.

### What frameworks are supported?

- Claude Code, Cursor and any MCP client (blockrun-mcp; blockrun-claude-plugin for media spend gating)
- OpenClaw (ClawRouter, XClawRouter, lobster.cash skill)
- OpenAI Codex (clawrouter-codex bridge, blockrun-codex-plugin)
- NousResearch Hermes (ClawRouter-Hermes)
- DeepSeek Harness (dsh-clawrouter)
- OpenCode (@blockrun/opencode)
- LiteLLM (blockrun-litellm)
- Continue (native provider)
- ElizaOS (plugin)
- AgentKit (SDK integration) and LangChain (custom LLM class) — planned
- GOAT SDK (in review)

Install commands for each are in the [Ecosystem](ecosystem.md).

### Can I get the provider's response verbatim?

Yes. `blockrun-llm-vip` (Python) and `blockrun-llm-go-vip` (Go) subclass the official Anthropic and OpenAI SDKs and only swap the transport, so thinking-block signatures, native `content[]`, cache-token usage and streaming events come back exactly as the provider sent them — no model substitution.

## Security

### Is my private key safe?

Your private key never leaves your machine. Only cryptographic signatures are sent.

### Where is my wallet stored?

`~/.blockrun/.session` (Base key) and `~/.blockrun/.solana-session` (Solana key) by default — shared by the MCP, the CLI, ClawRouter and the SDKs, so one wallet covers every tool.

### Can BlockRun steal my funds?

No. BlockRun can only claim the specific amount you authorize per request.

### Can I use my main wallet?

We recommend a dedicated wallet with small amounts. Don't use your main holdings wallet.

## Wallet Setup

### How do I create a wallet?

**Claude Code:**
```
blockrun setup
```

**Python:**
```python
from blockrun_llm import LLMClient
client = LLMClient()  # Creates wallet automatically
print(client.get_address())
```

### How much USDC do I need?

| Usage | Amount |
|-------|--------|
| Testing | $1-5 |
| Regular use | $5-20 |
| Heavy usage | $20-100 |

### Can I withdraw my funds?

Yes. Your wallet is a standard Ethereum (Base) or Solana wallet. Import the private key into any Web3 wallet to withdraw.

## Troubleshooting

### "MCP not found"

Restart Claude Code after installing:
```bash
pkill -f "claude"
claude
```

### "Wallet not found"

Run setup:
```
blockrun setup
```

### "Insufficient balance"

Check your balance and fund if needed:
```
blockrun balance
```

### "Network error"

Check internet connection and retry. If persistent, check [BlockRun status](https://blockrun.ai).

## Support

### How do I get help?

1. Check this FAQ
2. Read the [documentation](../README.md)
3. See [MCP Troubleshooting](../mcp/troubleshooting.md)
4. Open an issue on [GitHub](https://github.com/BlockRunAI)

### How do I report bugs?

Open an issue on the relevant GitHub repository:
- General / MCP: [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)
- Routing: [ClawRouter](https://github.com/BlockRunAI/ClawRouter)
- Franklin agent: [Franklin](https://github.com/BlockRunAI/Franklin)
- CLI: [blockrun-cli](https://github.com/BlockRunAI/blockrun-cli)
- Trading: [alpha-mcp](https://github.com/BlockRunAI/alpha-mcp)
- Python SDK: [blockrun-llm](https://github.com/blockrunai/blockrun-llm)
- TypeScript SDK: [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts)
- Go SDK: [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go)

### Where can I follow updates?

- [Twitter/X: @BlockRunAI](https://x.com/BlockRunAI)
- [GitHub: BlockRunAI](https://github.com/BlockRunAI)

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet and make your first paid call in under five minutes.
:::

:::card{title="Ecosystem" href="ecosystem.md" icon="Boxes"}
Products, SDKs, framework integrations, partners, and community projects.
:::

:::card{title="MCP Troubleshooting" href="../mcp/troubleshooting.md" icon="Terminal"}
Fixes for the most common Claude Code / MCP setup issues.
:::

::::
