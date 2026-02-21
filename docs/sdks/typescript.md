# TypeScript SDK

The official TypeScript/JavaScript SDK for BlockRun.

## Installation

```bash
npm install @blockrun/llm
# or
pnpm add @blockrun/llm
# or
yarn add @blockrun/llm
```

## Quick Start

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});

const response = await client.chat('openai/gpt-4o', 'Hello!');
console.log(response);
```

## Configuration

### Options

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: '0x...',              // Required: wallet private key
  apiUrl: 'https://blockrun.ai/api', // Optional: API endpoint
  timeout: 60000                     // Optional: timeout in ms
});
```

## Methods

### `chat(model, prompt, options?)`

Simple one-line chat interface.

```typescript
const response = await client.chat('openai/gpt-4o', 'Explain quantum computing', {
  system: 'You are a physics teacher.',  // Optional
  maxTokens: 500,                         // Optional
  temperature: 0.7                        // Optional
});
```

**Returns:** `Promise<string>` - The assistant's response text

### `chatCompletion(model, messages, options?)`

Full OpenAI-compatible chat completion.

```typescript
import { LLMClient, type ChatMessage } from '@blockrun/llm';

const messages: ChatMessage[] = [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'What is 2+2?' }
];

const result = await client.chatCompletion('openai/gpt-4o', messages, {
  maxTokens: 100,
  temperature: 0.7,
  topP: 0.9
});

console.log(result.choices[0].message.content);
console.log(`Tokens used: ${result.usage?.total_tokens}`);
```

**Returns:** `Promise<ChatResponse>`

### `listModels()`

Get available models with pricing.

```typescript
const models = await client.listModels();
for (const model of models) {
  console.log(`${model.id}: $${model.inputPrice}/M`);
}
```

### `getWalletAddress()`

Get the wallet address being used.

```typescript
const address = client.getWalletAddress();
console.log(`Paying from: ${address}`);
```

## Smart Routing (ClawRouter)

**Save up to 94% on LLM costs automatically.**

The `smartChat()` method uses ClawRouter's 14-dimension scoring algorithm to route each request to the optimal model. Routing decisions run locally in <1ms — your prompts never leave your machine for routing.

### Basic Usage

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});

// Let ClawRouter pick the best model automatically
const result = await client.smartChat('What is 2+2?');

console.log(result.response);           // "4"
console.log(result.model);              // "deepseek/deepseek-chat"
console.log(result.routing.tier);       // "SIMPLE"
console.log(result.routing.savings);    // 0.94 (94% savings)
```

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"free"` | Always uses free NVIDIA models | Development, testing |
| `"eco"` | Maximizes cost savings | Bulk processing |
| `"auto"` | Balances quality and cost (default) | Production workloads |
| `"premium"` | Always uses top-tier models | Critical tasks |

```typescript
// Force free models (great for development)
const result = await client.smartChat('Explain recursion', {
  routingProfile: 'free'
});
console.log(result.model);  // "nvidia/gpt-oss-120b"

// Maximum savings mode
const result2 = await client.smartChat('Summarize this article: ...', {
  routingProfile: 'eco'
});

// Premium mode for critical tasks
const result3 = await client.smartChat('Review this contract for legal issues...', {
  routingProfile: 'premium'
});
console.log(result3.model);  // "anthropic/claude-opus-4"
```

### 4-Tier Model Selection

ClawRouter classifies prompts into four tiers:

| Tier | Models | Use Case |
|------|--------|----------|
| **SIMPLE** | DeepSeek, Gemini Flash | Q&A, summaries, simple tasks |
| **MEDIUM** | GPT-4o, Claude Sonnet | Analysis, writing, coding |
| **COMPLEX** | Claude Opus, GPT-5 | Advanced reasoning, research |
| **REASONING** | DeepSeek-R1, o1, o3 | Math, logic, proofs |

### Routing Decision Details

```typescript
const result = await client.smartChat('Prove that √2 is irrational');

// Access full routing decision
const { routing } = result;
console.log(`Model: ${routing.model}`);           // "deepseek/deepseek-reasoner"
console.log(`Tier: ${routing.tier}`);             // "REASONING"
console.log(`Confidence: ${routing.confidence}`); // 0.97
console.log(`Reasoning: ${routing.reasoning}`);   // "Detected: math proof..."
console.log(`Cost: $${routing.costEstimate.toFixed(4)}`);
console.log(`Baseline: $${routing.baselineCost.toFixed(4)}`);
console.log(`Savings: ${(routing.savings * 100).toFixed(0)}%`);  // "97%"
```

### Smart Routing Types

```typescript
import type {
  RoutingProfile,      // "free" | "eco" | "auto" | "premium"
  RoutingTier,         // "SIMPLE" | "MEDIUM" | "COMPLEX" | "REASONING"
  RoutingDecision,     // Full routing details
  SmartChatResponse,   // Response + model + routing
} from '@blockrun/llm';
```

### With System Prompt

```typescript
const result = await client.smartChat('Write a haiku about coding', {
  system: 'You are a poet.',
  routingProfile: 'auto'
});
```

## Testnet Usage

For development and testing without real USDC, use the Base Sepolia testnet:

```typescript
import { testnetClient } from '@blockrun/llm';

// Create testnet client (uses Base Sepolia)
const client = testnetClient({ privateKey: '0x...' });

// Chat with testnet model
const response = await client.chat('openai/gpt-oss-20b', 'Hello!');
console.log(response);

// Verify you're on testnet
console.log(client.isTestnet()); // true
```

### Testnet Setup

1. Get testnet ETH from [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Get testnet USDC from [Circle USDC Faucet](https://faucet.circle.com/)
3. Set your wallet key: `export BASE_CHAIN_WALLET_KEY=0x...`

### Available Testnet Models

| Model | Price |
|-------|-------|
| `openai/gpt-oss-20b` | $0.001/request (flat) |
| `openai/gpt-oss-120b` | $0.002/request (flat) |

### Manual Testnet Configuration

```typescript
import { LLMClient } from '@blockrun/llm';

// Configure manually with testnet API URL
const client = new LLMClient({
  privateKey: '0x...',
  apiUrl: 'https://testnet.blockrun.ai/api'
});
const response = await client.chat('openai/gpt-oss-20b', 'Hello!');
```

## Error Handling

```typescript
import { LLMClient, APIError, PaymentError } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

try {
  const response = await client.chat('openai/gpt-4o', 'Hello!');
} catch (error) {
  if (error instanceof PaymentError) {
    console.error('Payment failed:', error.message);
    // Check your USDC balance
  } else if (error instanceof APIError) {
    console.error(`API error (${error.statusCode}):`, error.message);
  } else {
    throw error;
  }
}
```

## Types

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage?: ChatUsage;
}

interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason?: string;
}

interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  maxOutput: number;
  available: boolean;
}
```

## Examples

### Concurrent Requests

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

const [gpt, claude, gemini] = await Promise.all([
  client.chat('openai/gpt-4o', 'What is 2+2?'),
  client.chat('anthropic/claude-sonnet-4', 'What is 3+3?'),
  client.chat('google/gemini-3-flash-preview', 'What is 4+4?')
]);

console.log('GPT:', gpt);
console.log('Claude:', claude);
console.log('Gemini:', gemini);
```

### Streaming (Coming Soon)

```typescript
// Streaming support is planned for a future release
```

### Express.js Integration

```typescript
import express from 'express';
import { LLMClient } from '@blockrun/llm';

const app = express();
const client = new LLMClient({ privateKey: process.env.BLOCKRUN_WALLET_KEY });

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await client.chat('openai/gpt-4o', message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Next.js API Route

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const response = await client.chat('openai/gpt-4o', message);
  return NextResponse.json({ response });
}
```

## Testing

The SDK includes comprehensive test coverage.

### Running Unit Tests

Unit tests do not require API access or funded wallets:

```bash
npm test                          # Run all tests in watch mode
npm test run                      # Run tests once
npm test -- --coverage            # Run with coverage report
```

### Running Integration Tests

Integration tests call the production API and require:
- A funded Base wallet with USDC ($1+ recommended)
- `BLOCKRUN_WALLET_KEY` environment variable set
- Estimated cost: ~$0.05 per test run

```bash
# Set your funded wallet key
export BLOCKRUN_WALLET_KEY=0x...

# Run only integration tests
npm test -- test/integration

# Run all tests including integration
npm test run
```

Integration tests are automatically skipped if `BLOCKRUN_WALLET_KEY` is not set.

## Security Best Practices

### Private Key Management

> **Warning:** Never commit private keys to version control!

✅ **Do:**
- Use environment variables for private keys
- Use dedicated wallets for API payments (separate from your main holdings)
- Set spending limits by only funding payment wallets with small amounts
- Rotate keys periodically
- Use `.env` files and add them to `.gitignore`

❌ **Don't:**
- Hard-code private keys in your source code
- Commit `.env` files to git
- Share private keys in logs or error messages
- Use your main wallet with large holdings

### Example Secure Setup

```bash
# .env (add to .gitignore!)
BLOCKRUN_WALLET_KEY=0x...your_private_key_here
```

```typescript
// app.ts
import { LLMClient } from '@blockrun/llm';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BLOCKRUN_WALLET_KEY) {
  throw new Error('BLOCKRUN_WALLET_KEY not set');
}

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});
```

### Input Validation

The SDK validates all inputs before making API requests:

- Private keys (format, length, valid hex)
- API URLs (HTTPS required for production)
- Model names (non-empty strings)
- Parameters (max\_tokens, temperature, top\_p ranges)

### Error Response Sanitization

API errors are automatically sanitized to prevent leaking sensitive server information:

```typescript
try {
  await client.chat('invalid-model', 'Hello');
} catch (error) {
  // Error messages only contain safe, user-facing information
  // No internal stack traces, file paths, or sensitive data
  console.error(error.message);
}
```

### Monitoring Spending

Check your transaction history on Base:

```typescript
const address = client.getWalletAddress();
console.log(`View transactions: https://basescan.org/address/${address}`);
```

### SDK Updates

Keep the SDK updated to receive security patches:

```bash
npm update @blockrun/llm
```
