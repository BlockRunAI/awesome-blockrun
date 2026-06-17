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
npm install elizaos-plugin-blockrun
```
:::

:::step{title="Set your wallet key"}
```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```
:::

:::step{title="Register the provider"}
```typescript
import { BlockRunProvider } from 'elizaos-plugin-blockrun';

const agent = new ElizaAgent({
  // ... other config
  providers: [
    new BlockRunProvider({
      defaultModel: 'openai/gpt-5.4',
      sessionBudget: 10.00  // Optional: max spend per session
    })
  ]
});
```
:::

::::

## Usage

### Basic Chat

```typescript
const response = await agent.chat({
  model: 'openai/gpt-5.4',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});
```

### Model Selection

::::tabs

:::tab{label="Premium model"}
```typescript
const response = await agent.chat({
  model: 'anthropic/claude-sonnet-4.6',
  messages: [...]
});
```
:::

:::tab{label="Cheap model (bulk)"}
```typescript
const response = await agent.chat({
  model: 'deepseek/deepseek-chat',
  messages: [...]
});
```
:::

::::

### Image Generation

```typescript
const image = await agent.generateImage({
  prompt: 'A futuristic AI agent',
  model: 'google/nano-banana',
  size: '1024x1024'
});
```

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

## Wallet Setup

### Create New Wallet

```typescript
import { createWallet } from 'elizaos-plugin-blockrun';

const wallet = await createWallet();
console.log('Address:', wallet.address);
// Fund this address with USDC on Base
```

### Use Existing Wallet

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

### Check Balance

```typescript
import { getBalance } from 'elizaos-plugin-blockrun';

const balance = await getBalance();
console.log(`Balance: $${balance} USDC`);
```

## Example Agent

```typescript
import { ElizaAgent } from 'elizaos';
import { BlockRunProvider } from 'elizaos-plugin-blockrun';

const agent = new ElizaAgent({
  name: 'TradingBot',
  description: 'An AI trading assistant',
  providers: [
    new BlockRunProvider({
      defaultModel: 'openai/gpt-5.4'
    })
  ],
  actions: [
    // Your agent actions
  ]
});

// Agent now has access to 50+ models via BlockRun
await agent.start();
```

## Error Handling

```typescript
try {
  const response = await agent.chat({
    model: 'openai/gpt-5.4',
    messages: [...]
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.log('Need to fund wallet');
  } else if (error.code === 'MODEL_NOT_FOUND') {
    console.log('Invalid model specified');
  } else {
    throw error;
  }
}
```

## Best Practices

### Cost Optimization

```typescript
// Use cheap models for routine tasks
const cheapProvider = new BlockRunProvider({
  defaultModel: 'deepseek/deepseek-chat'  // much cheaper than GPT-5.4
});

// Use premium models for important decisions
const premiumProvider = new BlockRunProvider({
  defaultModel: 'openai/gpt-5.4'
});
```

### Session Budgets

```typescript
new BlockRunProvider({
  sessionBudget: 5.00  // Max $5 per session
});
```

### Fallback Models

```typescript
new BlockRunProvider({
  defaultModel: 'openai/gpt-5.4',
  fallbackModel: 'deepseek/deepseek-chat'  // Use if primary fails
});
```

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
