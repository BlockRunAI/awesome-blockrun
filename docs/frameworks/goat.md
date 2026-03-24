# GOAT SDK Integration

Use BlockRun with [GOAT SDK](https://github.com/crossmint/goat) (Great Onchain Agent Toolkit) for cross-chain AI agents. GOAT handles blockchain interactions, BlockRun provides AI intelligence via 33+ models with x402 micropayments.

## Status

**Pre-Integration** — Official `@goat-sdk/plugin-blockrun` is not yet published. Use BlockRun alongside GOAT via the TypeScript SDK as shown below.

## Quick Start

Install both packages:

```bash
npm install @goat-sdk/core @blockrun/llm
```

Set your wallet key:

```bash
export BLOCKRUN_WALLET_KEY=0x...  # Your Base wallet private key
```

Use BlockRun for AI + GOAT for on-chain execution:

```typescript
import { getOnChainTools } from '@goat-sdk/adapter-vercel-ai';
import { BlockRunLLM } from '@blockrun/llm';

const blockrun = new BlockRunLLM({
  privateKey: process.env.BLOCKRUN_WALLET_KEY,
});

const response = await blockrun.chat({
  model: 'anthropic/claude-sonnet-4.6',
  messages: [
    { role: 'user', content: 'Analyze ETH/USDC liquidity on Uniswap V3 on Base' }
  ],
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
```

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
const yieldAnalysis = await agent.blockrun.chat({
  model: 'openai/gpt-5.4',
  messages: [{
    role: 'user',
    content: `
      Compare yield opportunities:
      - Aave on Ethereum: ${await agent.aave.getAPY('USDC')}
      - Uniswap LP on Base: ${await agent.uniswap.getLPYield('USDC/ETH')}
      Which offers better risk-adjusted returns?
    `
  }]
});
```

### Cross-Chain Arbitrage

```typescript
// Spot and execute arbitrage with AI verification
const arbitrageOpp = await agent.findArbitrage('ETH');

// AI validates the opportunity
const validation = await agent.blockrun.chat({
  model: 'anthropic/claude-sonnet-4.6',
  messages: [{
    role: 'user',
    content: `Validate this arbitrage: ${JSON.stringify(arbitrageOpp)}`
  }]
});

if (validation.includes('valid')) {
  await agent.executeArbitrage(arbitrageOpp);
}
```

## Why BlockRun + GOAT?

| GOAT Provides | BlockRun Adds |
|---------------|---------------|
| Cross-chain execution | AI decision making |
| Protocol integrations | 33+ model access |
| Wallet management | Pay-per-request AI |
| Transaction building | No API key hassle |

## Getting Started

Use BlockRun's TypeScript SDK alongside GOAT until the official plugin is released:

```typescript
import { BlockRunLLM } from '@blockrun/llm';

const blockrun = new BlockRunLLM({
  privateKey: process.env.BLOCKRUN_WALLET_KEY,
});

async function analyzeAndAct() {
  const analysis = await blockrun.chat({
    model: 'openai/gpt-5.4',
    messages: [{
      role: 'user',
      content: 'Compare Aave USDC yield on Ethereum vs Base. Which is better risk-adjusted?'
    }],
    max_tokens: 2048,
  });

  console.log('AI Analysis:', analysis.choices[0].message.content);
}

analyzeAndAct();
```

## Links

- [GOAT SDK](https://github.com/crossmint/goat)
- [Crossmint](https://crossmint.com)
- [BlockRun TypeScript SDK](../sdks/typescript.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)
