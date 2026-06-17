---
title: TypeScript SDK
description: The official BlockRun TypeScript/JavaScript SDK — call 60+ LLMs, smart routing, and prediction markets over x402 micropayments with no API keys.
---

# TypeScript SDK

The official TypeScript/JavaScript SDK for BlockRun — pay per call in USDC, no API keys or subscriptions.

**Source:** [github.com/BlockRunAI/blockrun-llm-ts](https://github.com/BlockRunAI/blockrun-llm-ts) · [npm: @blockrun/llm](https://www.npmjs.com/package/@blockrun/llm) · MIT

:::tip{title="In a hurry?"}
New to BlockRun? Run the [5-Minute Quickstart](../getting-started/quickstart.md) first to fund a wallet, then come back for the full SDK reference.
:::

## Installation

::::tabs

:::tab{label="npm"}
```bash
npm install @blockrun/llm
```
:::

:::tab{label="pnpm"}
```bash
pnpm add @blockrun/llm
```
:::

:::tab{label="yarn"}
```bash
yarn add @blockrun/llm
```
:::

::::

## Quick Start

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BLOCKRUN_WALLET_KEY as `0x${string}`
});

const response = await client.chat('openai/gpt-5.5', 'Hello!');
console.log(response);
```

**Latest version: v1.4.3**

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
const response = await client.chat('openai/gpt-5.5', 'Explain quantum computing', {
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

const result = await client.chatCompletion('openai/gpt-5.5', messages, {
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
console.log(result.model);  // "nvidia/qwen3-next-80b-a3b-instruct" (cheapest capable for SIMPLE tier)

// Maximum savings mode
const result2 = await client.smartChat('Summarize this article: ...', {
  routingProfile: 'eco'
});

// Premium mode for critical tasks
const result3 = await client.smartChat('Review this contract for legal issues...', {
  routingProfile: 'premium'
});
console.log(result3.model);  // "anthropic/claude-opus-4.6"
```

### 4-Tier Model Selection

ClawRouter classifies prompts into four tiers:

| Tier | Models | Use Case |
|------|--------|----------|
| **SIMPLE** | DeepSeek, Gemini Flash | Q&A, summaries, simple tasks |
| **MEDIUM** | GPT-5.5, Claude Sonnet 4.6 | Analysis, writing, coding |
| **COMPLEX** | Claude Opus 4.6, GPT-5.4 Pro | Advanced reasoning, research |
| **REASONING** | DeepSeek Reasoner, o1, o3 | Math, logic, proofs |

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

## Drop-in OpenAI / Anthropic clients

Already using the `openai` or `@anthropic-ai/sdk` packages? Swap the import and point it at BlockRun — your wallet key replaces the API key, everything else is the same shape.

::::tabs

:::tab{label="OpenAI-compatible"}
```typescript
import { OpenAI } from '@blockrun/llm';

const client = new OpenAI({ walletKey: process.env.BLOCKRUN_WALLET_KEY });

const res = await client.chat.completions.create({
  model: 'openai/gpt-5.5',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(res.choices[0].message.content);

// Streaming: set stream:true → returns an AsyncIterable of chunks
const stream = await client.chat.completions.create({ model: 'openai/gpt-5.5', messages, stream: true });
for await (const chunk of stream) process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
```
:::

:::tab{label="Anthropic-compatible"}
```typescript
import { Anthropic } from '@blockrun/llm';

const client = new Anthropic({ walletKey: process.env.BLOCKRUN_WALLET_KEY });
const msg = await client.messages.create({
  model: 'anthropic/claude-opus-4.8',
  max_tokens: 512,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```
:::

::::

`create()` mirrors the upstream params (`model`, `messages`, `max_tokens`, `temperature`, `top_p`, `tools`, `tool_choice`, `response_format`, `stop`, `n`, penalties).

## Specialized clients

Like the Python SDK, every non-chat capability has its own client class, exported from `@blockrun/llm`. Each takes the same options (`{ walletKey | privateKey, apiUrl?, timeout? }`) and returns Promises.

:::note{title="Shared instantiation"}
Construct any client with `new XClient({ walletKey })` (or rely on `BLOCKRUN_WALLET_KEY` / `~/.blockrun/.session`). All expose `getWalletAddress()`.
:::

```typescript
import {
  ImageClient, VideoClient, MusicClient, SpeechClient, VoiceClient,
  PhoneClient, PortraitClient, SearchClient, PriceClient, SurfClient, RpcClient,
} from '@blockrun/llm';

// Image — generate + edit/fuse
const img = new ImageClient();
const out = await img.generate('A sunset over mountains', { model: 'google/nano-banana', size: '1024x1024' });
const fused = await img.edit('Place the logo on the shirt', [subjectDataUri, logoDataUri]);

// Video — async submit→poll handled internally
const vid = new VideoClient();
const clip = await vid.generate('a red apple spinning', { model: 'bytedance/seedance-2.0', durationSeconds: 5, resolution: '720p' });

// Speech + sound effects
const tts = new SpeechClient();
const audio = await tts.generate('Hello!', { voice: 'sarah', responseFormat: 'mp3' });

// Search, prices, crypto data, RPC
const search = new SearchClient();
const news   = await search.search('agent payments', { sources: ['web', 'news'], maxResults: 10 });
const px     = new PriceClient();
const btc    = await px.price('crypto', 'BTC-USD');
const rpc    = new RpcClient();
const block  = await rpc.call('ethereum', 'eth_blockNumber');   // $0.002/call
```

The full method surface mirrors the Python SDK (see the [Python](python.md) page for per-method params, pricing tiers, and `ta_…` identity assets); the only differences are camelCase options and `Promise` returns.

## Prediction Markets (Powered by Predexon)

Access real-time prediction market data from Polymarket, Kalshi, dFlow, Binance, and more via [Predexon](https://predexon.com). No API keys needed — pay-per-request via x402.

### `pm(path, params?)`

Query prediction market GET endpoints. $0.001 per request.

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();

// List Polymarket markets
const markets = await client.pm("polymarket/markets");

// List Polymarket events
const events = await client.pm("polymarket/events");

// Get Polymarket trades
const trades = await client.pm("polymarket/trades");

// Get candlestick data for a specific condition
const candles = await client.pm("polymarket/candlesticks/0xabc123...");

// Get wallet profile
const wallet = await client.pm("polymarket/wallet/0x1234...");

// Get wallet P&L
const pnl = await client.pm("polymarket/wallet/pnl/0x1234...");

// Get Polymarket leaderboard
const leaders = await client.pm("polymarket/leaderboard");

// List Kalshi markets
const kalshiMarkets = await client.pm("kalshi/markets");

// Get Kalshi trades
const kalshiTrades = await client.pm("kalshi/trades");

// Get Binance candles for a symbol
const btcCandles = await client.pm("binance/candles/BTCUSDT");
const ethCandles = await client.pm("binance/candles/ETHUSDT");

// Cross-platform matching
const pairs = await client.pm("matching-markets/pairs");
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Endpoint path, e.g. `"polymarket/markets"`, `"kalshi/markets"` |
| `params` | `Record<string, string>` | Optional query parameters passed to the endpoint |

**Returns:** `Promise<Record<string, unknown>>` — Raw JSON response from Predexon API

### `pmQuery(path, query)`

Structured query for prediction market POST endpoints. Used for bulk wallet identity lookup and any future POST endpoints.

```typescript
// Bulk wallet identity lookup (Tier 2, $0.005)
const batch = await client.pmQuery("polymarket/wallet/identities", {
  addresses: ["0xabc...", "0xdef...", "0x123..."],  // up to 200
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Endpoint path for a POST query, e.g. `"polymarket/wallet/identities"` |
| `query` | `Record<string, unknown>` | JSON body for the structured query |

**Returns:** `Promise<Record<string, unknown>>` — Raw JSON response from Predexon API

### Predexon v2 Convenience Helpers

Thin wrappers over `pm()` / `pmQuery()` for the most common v2 endpoints.

```typescript
// Canonical cross-venue markets (Tier 1)
const markets   = await client.pmMarkets({ venue: "polymarket", status: "active" });
const listings  = await client.pmListings({ category: "elections" });
const outcome   = await client.pmOutcome("PXM-12345");

// Polymarket keyset pagination (Tier 1)
const page      = await client.pmPolymarketMarketsKeyset({ limit: "100" });
const nextPage  = await client.pmPolymarketEventsKeyset({
  pagination_key: (page.pagination as Record<string, string>).next_key,
});

// Sports markets (Tier 1)
const categories = await client.pmSportsCategories();
const games      = await client.pmSportsMarkets({ league: "NBA", status: "open" });

// Wallet identity & on-chain clustering (Tier 2)
const ident   = await client.pmWalletIdentity("0xabc...");
const batch   = await client.pmWalletIdentities(["0xabc...", "0xdef..."]);  // up to 200
const cluster = await client.pmWalletCluster("0xabc...");
```

### Available Platforms

| Platform | Available Data |
|----------|---------------|
| Polymarket | Markets, Events, Trades, Candlesticks (market + token), Orderbooks, Prices, Volume, Open Interest, Activity, Positions, Leaderboards, Cohort Stats, Top Holders, Wallet Analytics, Smart Money, Wallet Identity & Clustering |
| UMA Oracle | Resolution questions, status, event timeline (Polymarket markets) |
| Kalshi | Markets, Trades, Orderbooks |
| dFlow | Trades, Wallet Positions, Wallet P&L |
| Binance Futures | Candles, Ticks |
| Limitless | Markets, Orderbooks |
| Opinion | Markets, Orderbooks |
| Predict.Fun | Markets, Orderbooks |
| Matching | Cross-platform market matching, exact-match pairs, unified search |

### Solana Usage

```typescript
import { SolanaLLMClient } from '@blockrun/llm';

const client = new SolanaLLMClient();
const markets = await client.pm("polymarket/markets");
```

Works on both `LLMClient` (Base) and `SolanaLLMClient`.

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
  const response = await client.chat('openai/gpt-5.5', 'Hello!');
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
  description: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;   // mapped from API's context_window
  maxOutput: number;        // mapped from API's max_output
  categories: string[];     // e.g., ["chat", "reasoning", "coding", "vision"]
  available: boolean;
}
```

## Examples

### Concurrent Requests

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

const [gpt, claude, gemini] = await Promise.all([
  client.chat('openai/gpt-5.5', 'What is 2+2?'),
  client.chat('anthropic/claude-sonnet-4.6', 'What is 3+3?'),
  client.chat('google/gemini-3-flash-preview', 'What is 4+4?')
]);

console.log('GPT:', gpt);
console.log('Claude:', claude);
console.log('Gemini:', gemini);
```

### Streaming (Coming Soon)

:::info
Streaming support is planned for a future release.
:::

### Express.js Integration

```typescript
import express from 'express';
import { LLMClient } from '@blockrun/llm';

const app = express();
const client = new LLMClient({ privateKey: process.env.BLOCKRUN_WALLET_KEY });

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await client.chat('openai/gpt-5.5', message);
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
  const response = await client.chat('openai/gpt-5.5', message);
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

:::warning{title="Never commit private keys"}
Never commit private keys to version control. A leaked key can drain your funded wallet.
:::

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

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet with USDC and make your first paid call in under five minutes.
:::

:::card{title="Models & pricing" href="../api-reference/models.md" icon="Brain"}
Browse all 60+ models with live pricing to pick the right one for each call.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
