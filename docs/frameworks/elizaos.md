# ElizaOS Integration

Use BlockRun as an LLM provider in ElizaOS agents.

[ElizaOS](https://github.com/elizaOS/eliza) is an open-source agent framework. The BlockRun plugin gives your ElizaOS agents access to 33+ AI models via x402 micropayments.

## Installation

```bash
npm install elizaos-plugin-blockrun
```

## Configuration

### Environment Variables

```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```

### Agent Configuration

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

```typescript
// Use specific model
const response = await agent.chat({
  model: 'anthropic/claude-sonnet-4.6',
  messages: [...]
});

// Use cheap model for bulk tasks
const response = await agent.chat({
  model: 'deepseek/deepseek-chat',
  messages: [...]
});
```

### Image Generation

```typescript
const image = await agent.generateImage({
  prompt: 'A futuristic AI agent',
  model: 'dall-e-3',
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

// Agent now has access to 33+ models via BlockRun
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
