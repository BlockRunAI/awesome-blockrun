---
title: ElizaOS Integration
description: Add the BlockRun plugin to ElizaOS so your agents reach 94 AI models via x402 micropayments — no per-provider API keys.
---

# ElizaOS Integration

Use BlockRun as an LLM provider in ElizaOS agents — one plugin unlocks 70 models paid per request over x402.

:::note{title="Community integration"}
BlockRun's primary paths are [Franklin](../products/franklin.md), the [BlockRun MCP](../mcp/blockrun-mcp.md), and the [SDKs](../sdks/python.md). Framework integrations like this one are community-maintained.
:::

[ElizaOS](https://github.com/elizaOS/eliza) is an open-source agent framework. The BlockRun plugin gives your ElizaOS agents access to 94 AI models via x402 micropayments.

## Setup

::::steps

:::step{title="Install the plugin"}
```bash
npm install @blockrun/elizaos-plugin
```

`@blockrun/elizaos-plugin` 1.0.0 has a peer dependency on `@elizaos/core >= 1.0.0`.
:::

:::step{title="Set your wallet key"}
```bash
export BASE_CHAIN_WALLET_KEY=0x...your_private_key...
```

The plugin reads `BASE_CHAIN_WALLET_KEY` (from agent settings first, then the environment) — not `BLOCKRUN_WALLET_KEY`.
:::

:::step{title="Register the plugin"}
The package exports a single `blockrunPlugin` — add it to your ElizaOS character's `plugins` array (the standard ElizaOS plugin pattern).

```typescript
import { blockrunPlugin } from '@blockrun/elizaos-plugin';

export const character = {
  name: 'MyAgent',
  // ...other character config
  plugins: [blockrunPlugin],
  settings: {
    BASE_CHAIN_WALLET_KEY: process.env.BASE_CHAIN_WALLET_KEY,
    BLOCKRUN_DEFAULT_MODEL: 'openai/gpt-5.4',   // optional; default openai/gpt-4o-mini
  },
};
```
:::

::::

Once registered, the agent pays per request from the wallet key you set — no per-provider API keys. The plugin registers one action and one provider (the [repo](https://github.com/BlockRunAI/elizaos-plugin-blockrun) is the source of truth):

| Component | Name | What it does |
|-----------|------|--------------|
| Action | `BLOCKRUN_CHAT` | Makes a pay-per-request chat call through the BlockRun gateway; the model comes from the action's `options.model`, then `BLOCKRUN_DEFAULT_MODEL`, then `openai/gpt-4o-mini` |
| Provider | `BLOCKRUN_WALLET` | Injects the wallet address and USDC balance on Base into agent context, so the agent knows its payment capacity |

### Configuration

| Setting / env var | Required | Description |
|-------------------|----------|-------------|
| `BASE_CHAIN_WALLET_KEY` | Yes | Base wallet private key that signs x402 payments |
| `BLOCKRUN_API_URL` | No | Gateway URL (default `https://blockrun.ai/api`) |
| `BLOCKRUN_DEFAULT_MODEL` | No | Model for `BLOCKRUN_CHAT` when none is passed (default `openai/gpt-4o-mini`) |

## Usage

With `blockrunPlugin` registered, `BLOCKRUN_CHAT` triggers when the agent needs to query a model; payments are signed locally (EIP-712) and the request is retried with the payment proof automatically. BlockRun model ids look like `openai/gpt-5.5`, `anthropic/claude-opus-5`, `deepseek/deepseek-chat`.

The plugin is chat-only and Base-only. For image, video, music, search, RPC and Solana payments, call the [TypeScript SDK](../sdks/typescript.md) clients directly from your own actions — same wallet, same x402 settlement.

## Available Models

All BlockRun chat models are available. A sample of what the live catalog lists today:

| Provider | Models |
|----------|--------|
| OpenAI | gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5.2, o3, o1 |
| Anthropic | claude-fable-5, claude-opus-5, claude-opus-4.8, claude-sonnet-5, claude-sonnet-4.6, claude-haiku-4.5 |
| Google | gemini-3.1-pro, gemini-3.5-flash, gemini-3-flash-preview, gemini-2.5-flash-lite |
| DeepSeek | deepseek-v4-pro, deepseek-chat, deepseek-reasoner |
| xAI | grok-4.3, grok-4.5, grok-build-0.1 |
| NVIDIA (free) | nemotron-3.5-lightning, nemotron-3-nano-30b, llama-3.2-11b-vision |

See [Models Reference](../api-reference/models.md) for the full list, or `curl https://blockrun.ai/api/v1/models`.

## Pricing

Same as the BlockRun API — the plugin adds no markup. Your agent pays per request via x402; no API keys needed for individual providers.

See [Intelligence Pricing](../products/intelligence/pricing.md).

## Wallet & budgets

The plugin pays from one Base wallet — set `BASE_CHAIN_WALLET_KEY` in agent settings or the environment. Fund it with USDC on Base and manage spend caps the same way as any BlockRun client; the `BLOCKRUN_WALLET` provider surfaces the live balance to the agent.

```bash
export BASE_CHAIN_WALLET_KEY=0x...   # the wallet your agent spends from
```

See [Wallet Setup](../getting-started/wallet-setup.md) for funding, chain switching, and per-agent budget delegation.

## Links

- [GitHub: elizaos-plugin-blockrun](https://github.com/BlockRunAI/elizaos-plugin-blockrun)
- [ElizaOS Documentation](https://github.com/elizaOS/eliza)
- [BlockRun Models](../api-reference/models.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)

## What's next?

::::cards

:::card{title="Models Reference" href="../api-reference/models.md" icon="Brain"}
Every model available through BlockRun, with live pricing.
:::

:::card{title="Wallet Setup" href="../getting-started/wallet-setup.md" icon="Wallet"}
Fund your agent's wallet on Base or Solana and manage budgets.
:::

:::card{title="Agent Developer Guide" href="../getting-started/agent-developers.md" icon="Boxes"}
Build autonomous agents that pay as they work.
:::

::::
