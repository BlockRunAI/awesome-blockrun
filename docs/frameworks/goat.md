# GOAT SDK Integration

Use BlockRun with GOAT SDK for cross-chain AI agents.

[GOAT SDK](https://github.com/crossmint/goat) (Great Onchain Agent Toolkit) is a framework for building AI agents that can interact with any blockchain. BlockRun provides the AI intelligence layer.

## Status

**In Review** — BlockRun integration is currently under review for inclusion in GOAT SDK.

Track progress: [GitHub Issue](https://github.com/crossmint/goat/issues)

## Planned Integration

### Installation

```bash
npm install @goat-sdk/core @goat-sdk/plugin-blockrun
```

### Configuration

```typescript
import { GoatAgent } from '@goat-sdk/core';
import { BlockRunPlugin } from '@goat-sdk/plugin-blockrun';

const agent = new GoatAgent({
  plugins: [
    new BlockRunPlugin({
      privateKey: process.env.BLOCKRUN_WALLET_KEY,
      defaultModel: 'openai/gpt-4o'
    })
  ]
});
```

### Usage

```typescript
// AI-powered decision making
const analysis = await agent.blockrun.chat({
  model: 'openai/gpt-4o',
  messages: [
    { role: 'user', content: 'Analyze ETH/USDC liquidity on Uniswap' }
  ]
});

// Execute cross-chain action based on analysis
await agent.executeAction({
  chain: 'base',
  action: 'swap',
  params: { from: 'USDC', to: 'ETH', amount: 100 }
});
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
  model: 'openai/gpt-4o',
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
  model: 'anthropic/claude-sonnet-4',
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
| Protocol integrations | 30+ model access |
| Wallet management | Pay-per-request AI |
| Transaction building | No API key hassle |

## Getting Started (Pre-Integration)

Until official integration is released, you can use BlockRun alongside GOAT:

```typescript
import { GoatAgent } from '@goat-sdk/core';
import { LLMClient } from '@blockrun/llm';

// Initialize separately
const goat = new GoatAgent({ /* config */ });
const blockrun = new LLMClient();

// Use together
const analysis = await blockrun.chat('openai/gpt-4o', 'Analyze opportunity...');
await goat.executeAction(/* based on analysis */);
```

## Links

- [GOAT SDK](https://github.com/crossmint/goat)
- [Crossmint](https://crossmint.com)
- [BlockRun TypeScript SDK](../sdks/typescript.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)
