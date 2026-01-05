# Quick Start

Get started with BlockRun in under 5 minutes.

## Prerequisites

- An EVM wallet with USDC (Base network)
- Python 3.8+ or Node.js 18+

## Step 1: Install the SDK

**Python:**
```bash
pip install blockrun-llm
```

**TypeScript:**
```bash
npm install @blockrun/llm
# or
pnpm add @blockrun/llm
```

## Step 2: Set Your Wallet Key

Export your wallet's private key and set it as an environment variable:

```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key
```

> Your private key **never leaves your machine**. It's only used to sign payment authorizations locally.

## Step 3: Make Your First Request

**Python:**
```python
from blockrun_llm import LLMClient

client = LLMClient()
response = client.chat("openai/gpt-4o", "What is the capital of France?")
print(response)
# Output: The capital of France is Paris.
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});

const response = await client.chat('openai/gpt-4o', 'What is the capital of France?');
console.log(response);
// Output: The capital of France is Paris.
```

## What Just Happened?

1. Your request was sent to BlockRun's API
2. BlockRun returned the price (a few cents in USDC)
3. The SDK automatically signed a payment authorization
4. The request was retried with the payment proof
5. BlockRun called OpenAI and returned the response
6. The USDC payment was settled on-chain

All of this happened automatically - you just wrote one line of code!

## Try Different Providers

BlockRun supports models from 6 providers. Just change the model ID:

**Python:**
```python
# OpenAI
response = client.chat("openai/gpt-5.2", "Explain quantum computing")

# Anthropic
response = client.chat("anthropic/claude-sonnet-4", "Write a Python function")

# Google
response = client.chat("google/gemini-2.5-pro", "Analyze this data")

# DeepSeek (code-optimized)
response = client.chat("deepseek/deepseek-chat", "Debug this code")

# Qwen (multilingual)
response = client.chat("qwen/qwen3-max", "Translate to Chinese")

# xAI
response = client.chat("xai/grok-3", "What's happening in the world?")

# Budget option - GPT-OSS 20B ($0.03/M input!)
response = client.chat("openai/gpt-oss-20b", "Summarize this article")
```

## Next Steps

- [Installation Guide](installation.md) - Detailed setup instructions
- [Authentication](authentication.md) - Learn about wallet setup
- [API Reference](../api-reference/chat-completions.md) - Full API documentation
- [Models](../api-reference/models.md) - Full list of available models
