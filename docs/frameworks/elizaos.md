---
title: ElizaOS Integration
description: Add the BlockRun plugin to ElizaOS so your agents reach 50+ AI models via x402 micropayments — no per-provider API keys.
---

# ElizaOS Integration

Use BlockRun as an LLM provider in ElizaOS agents — one plugin unlocks 50+ models paid per request over x402.

[ElizaOS](https://github.com/elizaOS/eliza) is an open-source agent framework. The BlockRun plugin gives your ElizaOS agents access to 50+ AI models via x402 micropayments.

## Setup

::::steps

:::step{title="Install the plugin"}
```bash
npm install @blockrun/elizaos-plugin
```
:::

:::step{title="Set your wallet key"}
```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```
:::

:::step{title="Register the plugin"}
The package exports a single `blockrunPlugin` — add it to your ElizaOS character's `plugins` array (the standard ElizaOS plugin pattern).

```typescript
import { blockrunPlugin } from '@blockrun/elizaos-plugin';

export const character = {
  name: 'MyAgent',
  // ...other character config
  plugins: [blockrunPlugin],
};
```
:::

::::

Once registered, the agent uses BlockRun models through ElizaOS's normal model calls — no per-provider API keys, paid per request from the wallet key you set. The plugin's actions and providers are the source of truth; see the [repo](https://github.com/BlockRunAI/elizaos-plugin-blockrun) for the current action/provider list.

## Usage

With `blockrunPlugin` registered, your agent reaches BlockRun models through ElizaOS's normal model interface — chat, plus image/video/music when you call those actions. Model selection follows your ElizaOS character/runtime settings; BlockRun model ids look like `openai/gpt-5.5`, `anthropic/claude-opus-4.8`, `deepseek/deepseek-chat`. The plugin's exact actions and providers live in the [plugin repo](https://github.com/BlockRunAI/elizaos-plugin-blockrun) — treat it as the source of truth for action names and options.

For full media/data control (image, video, search, RPC, etc.) outside the ElizaOS model flow, call the [TypeScript SDK](../sdks/typescript.md) clients directly from your actions — same wallet, same x402 settlement.

## Available Models

All BlockRun models are available:

| Provider | Models |
|----------|--------|
| OpenAI | gpt-5.4, gpt-5.2, o1, o1-mini |
| Anthropic | claude-opus-4.6, claude-opus-4.5, claude-sonnet-4.6, claude-haiku-4.5 |
| Google | gemini-3.1-pro-preview, gemini-3-flash-preview, gemini-2.5-flash-lite |
| DeepSeek | deepseek-chat, deepseek-reasoner |
| xAI | grok-4-fast |
| Meta | llama-3.3-70b, llama-3.1-405b |

See [Models Reference](../api-reference/models.md) for full list.

## Pricing

Same as BlockRun: provider cost + 5%.

Your agent pays per request via x402. No API keys needed for individual providers.

See [Intelligence Pricing](../products/intelligence/pricing.md).

## Wallet & budgets

The plugin pays from one wallet — set `BLOCKRUN_WALLET_KEY`, or let BlockRun create and use a local key at `~/.blockrun/.session`. Fund it with USDC on Base (or Solana) and manage spend caps the same way as any BlockRun client.

```bash
export BLOCKRUN_WALLET_KEY=0x...   # the wallet your agent spends from
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
