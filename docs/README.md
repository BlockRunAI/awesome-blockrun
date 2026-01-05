# BlockRun

**Pay-per-request access to AI models via x402 micropayments.**

BlockRun is a unified API gateway that provides access to GPT-5.2, Claude 4, Gemini 2.5, and other frontier AI models with automatic USDC micropayments using the x402 protocol.

## Why BlockRun?

- **No API Keys to Manage** - Connect your wallet and start using AI models instantly
- **Pay Only for What You Use** - Micropayments per request, no subscriptions or prepaid credits
- **Non-Custodial** - Your private key never leaves your machine; payments are signed locally
- **OpenAI-Compatible API** - Drop-in replacement for existing integrations
- **Multiple Providers** - Access OpenAI, Anthropic, Google, DeepSeek, and more through one endpoint

## How It Works

```
1. Send API request → 2. Receive 402 + price → 3. Sign payment locally → 4. Get AI response
```

The x402 protocol enables HTTP-native micropayments. When you make an API call:

1. BlockRun returns `402 Payment Required` with the price
2. Your SDK signs a USDC payment authorization (EIP-3009)
3. The request is retried with the signed payment
4. BlockRun verifies, executes the AI call, and settles the payment on-chain

**Your private key stays on your machine** - it's only used to sign payments locally.

## Quick Example

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Uses BLOCKRUN_WALLET_KEY env var
response = client.chat("openai/gpt-4o", "Hello!")
print(response)
```

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });
const response = await client.chat('openai/gpt-4o', 'Hello!');
console.log(response);
```

## Supported Models

| Provider | Models |
|----------|--------|
| OpenAI | GPT-5.2, GPT-4o, o1, o1-mini |
| Anthropic | Claude Opus 4, Claude Sonnet 4, Claude Haiku 4.5 |
| Google | Gemini 3 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash |
| DeepSeek | DeepSeek V3, DeepSeek R1 |
| xAI | Grok 4 Fast |
| Meta | Llama 3.3 70B, Llama 3.1 405B |
| Qwen | Qwen 2.5 72B |
| Mistral | Mistral Large |

## Supported Networks

| Network | Token | Status |
|---------|-------|--------|
| Base | USDC | Live |
| Solana | USDC | Coming Soon |

- **Protocol:** x402 v2
- **Settlement:** Instant on-chain

## Links

- **Website:** [blockrun.ai](https://blockrun.ai)
- **API Endpoint:** `https://blockrun.ai/api`
- **GitHub:** [github.com/blockrun](https://github.com/blockrun)
