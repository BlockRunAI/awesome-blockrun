---
title: GOAT SDK Integration
description: Combine GOAT SDK's cross-chain execution with BlockRun's 98 AI models, paid per request over x402 — until the official plugin ships.
---

# GOAT SDK Integration

Use BlockRun with [GOAT SDK](https://github.com/crossmint/goat) (Great Onchain Agent Toolkit) for cross-chain AI agents. GOAT handles blockchain interactions, BlockRun provides AI intelligence via 74 models with x402 micropayments.

:::note{title="Community integration — pre-release"}
No official `@goat-sdk/plugin-blockrun` yet; use BlockRun alongside GOAT via the [TypeScript SDK](../sdks/typescript.md) as shown below. BlockRun's primary paths are [Franklin](../products/franklin.md), the [MCP](../mcp/blockrun-mcp.md), and the SDKs.
:::

## Quick Start

::::steps

:::step{title="Install both packages"}
```bash
npm install @goat-sdk/core @blockrun/llm
```
:::

:::step{title="Set your wallet key"}
```bash
export BASE_CHAIN_WALLET_KEY=0x...  # Your Base wallet private key
```
:::

:::step{title="Use BlockRun for AI + GOAT for on-chain execution"}
```typescript
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';
import { LLMClient } from '@blockrun/llm';

const blockrun = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`,
});

const response = await blockrun.chatCompletion(
  'anthropic/claude-sonnet-4.6',
  [{ role: 'user', content: 'Analyze ETH/USDC liquidity on Uniswap V3 on Base' }],
  { maxTokens: 1024 },
);

console.log(response.choices[0].message.content);
```

`chatCompletion(model, messages, options?)` takes camelCase options (`maxTokens`, `temperature`, `tools`, `toolChoice`, …) and returns an OpenAI-shaped response. Prefer the exact OpenAI shape? `import { OpenAI } from '@blockrun/llm'` gives you `chat.completions.create({ model, messages, max_tokens })`.
:::

::::

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  GOAT Agent                      │
├─────────────────────────────────────────────────┤
│                   Plugins                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Uniswap  │ │  Aave    │ │    BlockRun      │ │
│  │  Plugin  │ │  Plugin  │ │     Plugin       │ │
│  │ (DeFi)   │ │ (Lending)│ │ (AI Intelligence)│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│              Supported Chains                    │
│   Base • Ethereum • Polygon • Arbitrum • etc    │
└─────────────────────────────────────────────────┘
```

## Use Cases

### DeFi Strategy Agent

```typescript
// Analyze yield opportunities across chains
const yieldAnalysis = await agent.blockrun.chat(
  'openai/gpt-5.4',
  `
    Compare yield opportunities:
    - Aave on Ethereum: ${await agent.aave.getAPY('USDC')}
    - Uniswap LP on Base: ${await agent.uniswap.getLPYield('USDC/ETH')}
    Which offers better risk-adjusted returns?
  `,
);
```

### Cross-Chain Arbitrage

```typescript
// Spot and execute arbitrage with AI verification
const arbitrageOpp = await agent.findArbitrage('ETH');

// AI validates the opportunity — chat() returns the reply text directly
const validation = await agent.blockrun.chat(
  'anthropic/claude-sonnet-4.6',
  `Validate this arbitrage: ${JSON.stringify(arbitrageOpp)}`,
);

if (validation.includes('valid')) {
  await agent.executeArbitrage(arbitrageOpp);
}
```

### Let the model drive GOAT's tools

GOAT's Vercel AI adapter returns AI SDK tools; BlockRun's gateway is OpenAI-compatible, so any AI SDK provider can call it once payments are signed. The [BlockRun LiteLLM sidecar](https://github.com/BlockRunAI/blockrun-litellm) does that signing on `http://127.0.0.1:4001/v1` and forwards `tools` / `tool_choice` verbatim, which closes the loop:

```typescript
import { generateText, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';
import { viem } from '@goat-sdk/wallet-viem';

const blockrun = createOpenAI({ baseURL: 'http://127.0.0.1:4001/v1', apiKey: 'dummy' });

const tools = await getOnChainTools({ wallet: viem(walletClient) });

const { text } = await generateText({
  model: blockrun('openai/gpt-5.4'),
  tools,
  stopWhen: stepCountIs(5),   // AI SDK v5+; `maxSteps: 5` on v4
  prompt: 'Check my USDC balance on Base and tell me if I can afford a $50 swap.',
});
```

## Why BlockRun + GOAT?

| GOAT Provides | BlockRun Adds |
|---------------|---------------|
| Cross-chain execution | AI decision making |
| Protocol integrations | 74 chat models (95 total) |
| Wallet management | Pay-per-request AI |
| Transaction building | No API key hassle |

## Getting Started

Use BlockRun's TypeScript SDK alongside GOAT until the official plugin is released:

```typescript
import { LLMClient } from '@blockrun/llm';

const blockrun = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`,
});

async function analyzeAndAct() {
  const analysis = await blockrun.chatCompletion(
    'openai/gpt-5.4',
    [{
      role: 'user',
      content: 'Compare Aave USDC yield on Ethereum vs Base. Which is better risk-adjusted?'
    }],
    { maxTokens: 2048 },
  );

  console.log('AI Analysis:', analysis.choices[0].message.content);

  // Or let the bundled router pick the cheapest capable model
  const routed = await blockrun.smartChat('Summarize the last 24h of Base DEX volume');
  console.log(routed.model, routed.response);
}

analyzeAndAct();
```

## Links

- [GOAT SDK](https://github.com/crossmint/goat)
- [Crossmint](https://crossmint.com)
- [BlockRun TypeScript SDK](../sdks/typescript.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)

## What's next?

::::cards

:::card{title="BlockRun TypeScript SDK" href="../sdks/typescript.md" icon="Code"}
Full reference for `LLMClient` and the payment flow it wraps.
:::

:::card{title="Agent Developer Guide" href="../getting-started/agent-developers.md" icon="Brain"}
Patterns for cross-chain agents that pay per request.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
