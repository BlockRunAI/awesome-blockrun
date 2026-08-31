---
title: TypeScript SDK
description: The official BlockRun TypeScript/JavaScript SDK — call 73 LLMs, smart routing, and prediction markets over x402 micropayments with no API keys.
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

Requires Node ≥ 20. The smart router is bundled — nothing else to install for Base payments.

**Paying on Solana?** The two Solana packages are optional *peer* dependencies (they are not pulled in automatically, to keep `bigint-buffer` out of Base-only projects). Install them explicitly:

```bash
npm install @blockrun/llm @solana/web3.js @solana/spl-token
```

Calling a Solana path without them throws an error naming the exact install command.

## Quick Start

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`
});

// Recommended: let the bundled router pick the cheapest capable model
const routed = await client.smartChat('Hello!');
console.log(routed.response, routed.model);

// Or pin a model yourself
const response = await client.chat('openai/gpt-5.5', 'Hello!');
console.log(response);
```

**Latest version: v3.13.2 on npm** (v3.13.3 is tagged in the repo as of 2026-08-26 and ships on the next GitHub release — check `npm view @blockrun/llm version`).

## Configuration

### Options

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: '0x...',               // Optional if BASE_CHAIN_WALLET_KEY is set
  apiUrl: 'https://blockrun.ai/api', // Optional: API endpoint
  timeout: 600000                    // Optional: timeout in ms (default 600s)
});
```

`LLMClient` reads `BASE_CHAIN_WALLET_KEY` when `privateKey` is omitted and throws if neither is present. It does not create a wallet for you — use `setupAgentWallet()` for that:

```typescript
import { setupAgentWallet } from '@blockrun/llm';

// Resolves BLOCKRUN_WALLET_KEY / BASE_CHAIN_WALLET_KEY → ~/.blockrun/.session,
// creates and saves a new key if none exists, and returns a ready LLMClient.
const client = setupAgentWallet();
console.log(client.getWalletAddress());   // fund this address with USDC on Base
```

### Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `BASE_CHAIN_WALLET_KEY` | `LLMClient`, `OpenAI`, `AnthropicClient` | Base wallet private key (`0x…`) |
| `BLOCKRUN_WALLET_KEY` | `BlockrunClient`, the specialized clients, `setupAgentWallet()` | Same key; these clients accept either variable (`BLOCKRUN_WALLET_KEY` first) |
| `SOLANA_WALLET_KEY` | `SolanaLLMClient` | Solana secret key — bs58, CLI JSON array, or hex |
| `BLOCKRUN_CHAT_TIMEOUT` | all chat clients | Default chat timeout in **seconds** (default 600) |
| `BLOCKRUN_HOME` | wallet storage | Overrides `~/.blockrun` for the Base wallet file. Security-sensitive: it redirects where the signing key is read and written |
| `BASE_RPC_URL` | `getBalance()` | Custom Base RPC for balance checks |
| `SOLANA_RPC_URL` / `SOLANA_RPC_API_KEY` / `SOLANA_RPC_HEADERS` | `SolanaLLMClient` | Custom Solana RPC (default: BlockRun's own proxy) |

## Methods

### `chat(model, prompt, options?)`

Simple one-line chat interface.

```typescript
const response = await client.chat('openai/gpt-5.5', 'Explain quantum computing', {
  system: 'You are a physics teacher.',  // Optional
  maxTokens: 500,                         // Optional (default 1024)
  temperature: 0.7,                       // Optional
  topP: 0.9,                              // Optional
  responseFormat: { type: 'json_object' }, // Optional: JSON mode
  stop: ['\n\n'],                         // Optional: up to 4 stop sequences
  fallbackModels: ['openai/gpt-5.4'],     // Optional: tried on timeout / 429 / 5xx
  search: true,                           // Optional: Live Search (search-enabled models)
});
```

**Returns:** `Promise<string>` - The assistant's response text

### `chatCompletion(model, messages, options?)`

Full OpenAI-compatible chat completion, including tool calling.

```typescript
import { LLMClient, type ChatMessage } from '@blockrun/llm';

const messages: ChatMessage[] = [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'What is 2+2?' }
];

const result = await client.chatCompletion('openai/gpt-5.5', messages, {
  maxTokens: 100,
  temperature: 0.7,
  topP: 0.9,
  // tools, toolChoice, responseFormat, stop, search, fallbackModels also accepted
});

console.log(result.choices[0].message.content);
console.log(`Tokens used: ${result.usage?.total_tokens}`);
```

**Returns:** `Promise<ChatResponse>`

### `chatCompletionStream(model, messages, options?)`

Same parameters as `chatCompletion`, streamed. Returns a standard `fetch` `Response` whose body is an SSE stream (the SDK pre-signs the payment from a 1-hour cache on repeat calls to the same model, skipping the 402 round-trip). See [Streaming](#streaming) below for a full example, or use the [OpenAI-compatible client](#drop-in-openai--anthropic-clients), which yields parsed chunks.

**Returns:** `Promise<Response>`

### `listModels()` / `listImageModels()` / `listAllModels()`

Get available models with pricing. `listModels()` returns chat models; `listImageModels()` returns per-image models; `listAllModels()` returns both.

```typescript
const models = await client.listModels();
for (const model of models) {
  console.log(`${model.id}: $${model.inputPrice}/M`);
}
```

### `getWalletAddress()` / `getBalance()` / `getSpending()`

```typescript
const address = client.getWalletAddress();
console.log(`Paying from: ${address}`);

const balance = await client.getBalance();          // USDC on Base
const spent = client.getSpending();                 // this session: { totalUsd, calls, ... }
```

### `onramp(address)`

Mints a one-time Coinbase Onramp link (free call, Base only) so you can buy USDC by card straight into your signing wallet. The URL is single-use and expires in ~5 minutes — mint it at click time.

```typescript
const { url } = await client.onramp(client.getWalletAddress());
```

## Smart Routing (Router Core V3)

**Save 88% on LLM costs automatically.**

`smartChat()` routes each request on [Router Core V3](https://github.com/BlockRunAI/router-core) — the same deterministic portfolio router that drives [ClawRouter](../products/routing/clawrouter.md), **bundled into the SDK** since v3.12.0. 15 weighted dimensions classify the request, capability constraints (tools, vision, structured output, context) are applied as hard filters, and the surviving candidates are ranked on task affinity, cost, speed and reliability. Decisions run locally in <1ms — your prompts never leave your machine for routing, and no extra model call is made to decide.

### Basic Usage

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`
});

// Let the router pick the best model automatically
const result = await client.smartChat('What is 2+2?');

console.log(result.response);           // "4"
console.log(result.model);              // "google/gemini-2.5-flash"
console.log(result.routing.tier);       // "SIMPLE"
console.log(result.routing.savings);    // 0.88 (88% savings vs the premium baseline)
```

### Three ways to route

```typescript
// 1. smartChat() — one-line routed chat
const result = await client.smartChat('What is 2+2?');

// 2. smartChatCompletion() — full agent/tool conversations, routed;
//    the decision is attached as response.routing
const agent = await client.smartChatCompletion(messages, { tools, toolChoice: 'auto' });

// 3. blockrun/auto | blockrun/eco | blockrun/premium — model aliases accepted by
//    chat(), chatCompletion() and chatCompletionStream() on Base and Solana
const reply = await client.chatCompletion('blockrun/auto', messages);

// Inspect a decision without making (or paying for) a model call
const decision = await client.route('Prove the Riemann hypothesis');
```

The aliases are resolved locally by `LLMClient`, `SolanaLLMClient` and the OpenAI-compatible layer. `AnthropicClient` proxies straight to `/v1/messages` and does **not** resolve them — pass a concrete model id there.

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"eco"` | Cheapest capable model — ranks the free NVIDIA tier first, so simple requests cost $0 | Bulk processing, zero-cost testing |
| `"auto"` | Balances quality and cost (default) | Production workloads |
| `"premium"` | Always uses top-tier models | Critical tasks |

There is no `"free"` profile — `routingProfile` accepts `'eco' | 'auto' | 'premium'` (ClawRouter's `/model free` belongs to its own proxy). For guaranteed $0, pin a `nvidia/*` model with `chat()`.

```typescript
// Guaranteed $0: call a free model directly
const free = await client.chat('nvidia/nemotron-3.5-lightning', 'Explain recursion');

// Smart-routed $0-first
const result = await client.smartChat('What is 2+2?', {
  routingProfile: 'eco'
});
console.log(result.model);  // "nvidia/nemotron-3.5-lightning" (a live $0 model; the free lineup rotates as NVIDIA retires SKUs)
console.log(result.routing.savings);  // 1 (100%)

// Premium mode for critical tasks
const result3 = await client.smartChat('Review this contract for legal issues...', {
  routingProfile: 'premium'
});
console.log(result3.model);  // "anthropic/claude-opus-4.7"
```

### 4-Tier Model Selection

The router classifies prompts into four tiers (`routing.tier`); each tier × profile anchors a candidate pool that the portfolio ranking draws from:

| Tier | Example Tasks | Typical Models |
|------|---------------|----------------|
| **SIMPLE** | Greetings, math, lookups | Gemini Flash, GPT-4o-mini, free NVIDIA tier (eco) |
| **MEDIUM** | Explanations, summaries, code snippets | GPT-4o, Claude Sonnet, Kimi |
| **COMPLEX** | Analysis, architecture, long documents | Gemini 3.1 Pro, Claude Fable 5 (premium) |
| **REASONING** | Multi-step logic, proofs | Grok reasoning, o3, DeepSeek Reasoner |

The [ClawRouter README](https://github.com/BlockRunAI/ClawRouter#how-it-works) is the live source of truth for the tier configs as models and prices move.

### Automatic fallback on transient errors

`smartChat()` builds `routing.fallbacks` from the portfolio ranking, and `chat()` / `chatCompletion()` walk it automatically on timeouts, network failures, 429s and 5xx (502/503/504/522/524). Other 4xx errors and `PaymentError` propagate immediately. Each hop is logged to stderr as `[@blockrun/llm] <from> -> <to> (...)`. Pass `fallbackModels` yourself to get the same behaviour on a pinned model.

### Routing Decision Details

```typescript
const result = await client.smartChat('Prove that √2 is irrational');

// Access full routing decision
const { routing } = result;
console.log(`Model: ${routing.model}`);             // the selected model id
console.log(`Tier: ${routing.tier}`);               // "REASONING"
console.log(`Method: ${routing.method}`);           // "portfolio"
console.log(`Task: ${routing.taskType}`);           // "reasoning_math"
console.log(`Candidates: ${routing.candidates}`);   // ranked, capability-eligible models
console.log(`Fallbacks: ${routing.fallbacks}`);     // the chain walked on transient errors
console.log(`Confidence: ${routing.confidence}`);   // 0–1
console.log(`Reasoning: ${routing.reasoning}`);     // "Detected: math proof..."
console.log(`Cost: $${routing.costEstimate.toFixed(4)}`);
console.log(`Baseline: $${routing.baselineCost.toFixed(4)}`);
console.log(`Savings: ${(routing.savings * 100).toFixed(0)}%`);
console.log(`Router: ${routing.routerVersion}`);    // "v3-portfolio"
```

### Smart Routing Types

```typescript
import type {
  RoutingProfile,              // "eco" | "auto" | "premium"
  RoutingTier,                 // "SIMPLE" | "MEDIUM" | "COMPLEX" | "REASONING"
  RoutingTaskType,             // "chat" | "code_edit" | "tool_agent" | "reasoning" | ...
  RoutingTierConfig,           // primary + fallbacks for one tier
  RoutingDecision,             // Full routing details
  SmartChatOptions,            // ChatOptions + routingProfile + maxOutputTokens
  SmartChatResponse,           // Response + model + routing
  SmartChatCompletionOptions,  // ChatCompletionOptions + routingProfile + maxOutputTokens
  SmartChatCompletionResponse, // Full ChatResponse + routing
} from '@blockrun/llm';
```

These are derived from `@blockrun/router-core` and shipped inlined in the SDK's declaration files — nothing extra to install to typecheck.

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

// Options: { walletKey | privateKey, baseURL?, timeout? } — falls back to BASE_CHAIN_WALLET_KEY
const client = new OpenAI({ walletKey: process.env.BASE_CHAIN_WALLET_KEY });

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
import { AnthropicClient } from '@blockrun/llm';

// Wraps the official @anthropic-ai/sdk (an optional dependency — install it if it is
// not already in your tree) with a custom fetch that signs x402 payments.
const client = new AnthropicClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });
const msg = await client.messages.create({
  model: 'anthropic/claude-opus-5',
  max_tokens: 512,
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(msg.content[0].text);
```
:::

::::

`create()` mirrors the upstream params (`model`, `messages`, `max_tokens`, `temperature`, `top_p`, `tools`, `tool_choice`, `response_format`, `stop`, `n`, penalties). The OpenAI-compatible client also accepts the `blockrun/auto` / `eco` / `premium` aliases; `AnthropicClient` needs a concrete model id.

## Solana

Pay with Solana USDC through `sol.blockrun.ai` — same API as `LLMClient`, plus the two optional peer packages from [Installation](#installation).

```typescript
import { SolanaLLMClient, solanaClient } from '@blockrun/llm';

// SOLANA_WALLET_KEY env var — bs58, CLI JSON array, or hex
const client = new SolanaLLMClient();

// Or pass the key and RPC explicitly
const client2 = new SolanaLLMClient({
  privateKey: 'your-bs58-solana-key',
  apiUrl: 'https://sol.blockrun.ai/api',        // default
  rpcUrl: 'https://your-helius-or-tatum-rpc',   // default: BlockRun's own free proxy
  rpcHeaders: { 'x-api-key': '...' },           // optional header-auth
});

const response = await client.chat('openai/gpt-4o', 'gm Solana');
const routed = await client.smartChat('What is 2+2?');   // routing parity with Base
const address = await client.getWalletAddress();          // async on Solana
```

`SolanaLLMClient` has `chat`, `chatCompletion`, `smartChat`, `smartChatCompletion`, `route`, `listModels`, `getBalance`, `imageEdit`, `search`, `pm`/`pmQuery`, the `exa*`, `defi*`, `dex*` and `modal*` helpers, `getSpending()` and `isSolana()`.

A Solana payment is pinned to a blockhash valid for roughly 60 seconds. If it expires between signing and verification, the client re-signs against a fresh blockhash and retries — at most twice, with a short backoff (v3.13.3). The retry fires only on the gateway's explicit verification-phase stale signal, before any transaction is broadcast, so you cannot be double-charged; settlement failures, insufficient funds and ambiguous rejections still fail immediately as `PaymentError`.

## Streaming

Stream tokens with automatic x402 payment. The OpenAI-compatible client is the easiest path; the native client returns a raw SSE `Response`.

```typescript
import { LLMClient, type ChatMessage } from '@blockrun/llm';

const client = new LLMClient();
const messages: ChatMessage[] = [{ role: 'user', content: 'Explain quantum computing simply' }];

const response = await client.chatCompletionStream('google/gemini-2.5-flash', messages);

const reader = response.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value, { stream: true }).split('\n')) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
    const data = JSON.parse(line.slice(6));
    process.stdout.write(data.choices?.[0]?.delta?.content ?? '');
  }
}
```

First call: request → 402 with price → sign locally → retry with `PAYMENT-SIGNATURE` and `stream: true`. The payment requirements are cached per model for 1 hour, so subsequent calls pre-sign and stream immediately (~200ms faster).

## Specialized clients

Like the Python SDK, every non-chat capability has its own client class, exported from `@blockrun/llm`. Each takes the same options (`{ privateKey?, apiUrl?, timeout? }`) and returns Promises.

:::note{title="Shared instantiation"}
Construct any client with `new XClient({ privateKey })`, or rely on `BLOCKRUN_WALLET_KEY` / `BASE_CHAIN_WALLET_KEY` in the environment. All expose `getWalletAddress()`; most expose `getSpending()`.
:::

```typescript
import {
  ImageClient, VideoClient, MusicClient, SpeechClient, VoiceClient,
  PhoneClient, PortraitClient, SearchClient, PriceClient, SurfClient, RpcClient,
} from '@blockrun/llm';

// Image — generate + edit/fuse
const img = new ImageClient();
const out = await img.generate('A sunset over mountains', { model: 'google/nano-banana', size: '1024x1024' });
const fused = await img.edit('Place the logo on the shirt', [subjectDataUri, logoDataUri]);  // default model openai/gpt-image-2

// Video — async submit→poll handled internally
const vid = new VideoClient();
const clip = await vid.generate('a red apple spinning', { model: 'bytedance/seedance-2.0', durationSeconds: 5, resolution: '720p' });

// Speech + sound effects
const tts = new SpeechClient();
const audio = await tts.generate('Hello!', { voice: 'sarah', responseFormat: 'mp3' });
const sfx = await tts.soundEffect('rain on a tin roof', { durationSeconds: 5 });

// Search, prices, crypto data, RPC
const search = new SearchClient();
const news   = await search.search('agent payments', { sources: ['web', 'news'], maxResults: 10 });
const px     = new PriceClient();
const btc    = await px.price('crypto', 'BTC-USD');
const rpc    = new RpcClient();
const block  = await rpc.call('ethereum', 'eth_blockNumber');   // $0.003/call
```

The full method surface mirrors the Python SDK (see the [Python](python.md) page for per-method params, pricing tiers, and `ta_…` identity assets); the only differences are camelCase options and `Promise` returns.

### `BlockrunClient` — the universal primitive

Since v2.5.0 the SDK also ships a single `BlockrunClient` that speaks to **every** BlockRun endpoint over x402, so a new endpoint never waits on an SDK release. Four call shapes cover every endpoint type:

```typescript
import { BlockrunClient } from '@blockrun/llm';

const br = new BlockrunClient();   // BLOCKRUN_WALLET_KEY or BASE_CHAIN_WALLET_KEY

// get<T>(path, params?) — synchronous GET (price, ranking, list, news)
const btc = await br.get('/v1/surf/market/price', { symbol: 'BTC' });

// post<T>(path, body?) — synchronous POST (on-chain SQL, search)
const rows = await br.post('/v1/surf/onchain/sql', { query: 'SELECT 1' });

// poll<T>(path, body?, { budgetMs, intervalMs }) — submit + poll (image, video, music, voice)
const video = await br.poll('/v1/videos/generations', { model: 'xai/grok-imagine-video', prompt: 'a red apple spinning' });

// stream<T>(path, body?) — async iterator over SSE chunks (chat)
for await (const chunk of br.stream('/v1/chat/completions', {
  model: 'anthropic/claude-sonnet-4.6',
  messages: [{ role: 'user', content: 'Hi' }],
  stream: true,
})) {
  process.stdout.write(chunk?.choices?.[0]?.delta?.content ?? '');
}
```

The per-API client classes above all remain and are the documented surface; `BlockrunClient` is the escape hatch for endpoints they do not wrap yet.

## Prediction Markets (Powered by Predexon)

Access real-time prediction market data from Polymarket, Kalshi, Limitless, Opinion, Predict.Fun and Binance via [Predexon](https://predexon.com). No API keys needed — pay-per-request via x402.

> **Retired upstream.** `pmMarkets` / `pmListings` / `pmOutcome` (and
> `matching-markets`) hit endpoints Predexon sunset on 2026-07-20 — they now
> throw `RetiredEndpointError` before any network I/O. The dFlow endpoints
> return `404`; that category is gone. Use `markets/search` for cross-venue
> lookups. `sports/*` is returning an upstream `500` as of 2026-08-04 and is
> withheld from discovery until it recovers.


### `pm(path, params?)`

Query prediction market GET endpoints. $0.0085 per request.

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

// Cross-venue search (matching-markets was sunset by Predexon 2026-07-20)
const results = await client.pm("markets/search", { q: "Fed rate" });
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
// Bulk wallet identity lookup ($0.0085)
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

Thin wrappers over `pm()` / `pmQuery()` for the most common v2 endpoints that are still live.

```typescript
// Polymarket keyset pagination (Tier 1)
const page      = await client.pmPolymarketMarketsKeyset({ limit: "100" });
const nextPage  = await client.pmPolymarketEventsKeyset({
  pagination_key: (page.pagination as Record<string, string>).next_key,
});

// Wallet identity & on-chain clustering (Tier 2)
const ident   = await client.pmWalletIdentity("0xabc...");
const batch   = await client.pmWalletIdentities(["0xabc...", "0xdef..."]);  // up to 200
const cluster = await client.pmWalletCluster("0xabc...");

// Sports (currently upstream 500 — see note above)
const cats    = await client.pmSportsCategories();
const games   = await client.pmSportsMarkets({ category: "nba" });

// Retired: pmMarkets(), pmListings(), pmOutcome() throw RetiredEndpointError.
// Use pm("markets/search", { q }) instead.
```

### Available Platforms

| Platform | Available Data |
|----------|---------------|
| Polymarket | Markets, Events, Trades, Candlesticks (market + token), Orderbooks, Prices, Volume, Open Interest, Activity, Positions, Leaderboards, Cohort Stats, Top Holders, Wallet Analytics, Smart Money, Wallet Identity & Clustering |
| UMA Oracle | Resolution questions, status, event timeline (Polymarket markets) |
| Kalshi | Markets, Trades, Orderbooks |
| Binance Futures | Candles, Ticks |
| Limitless | Markets, Orderbooks |
| Opinion | Markets, Orderbooks |
| Predict.Fun | Markets, Orderbooks |
| Search | Unified cross-venue `markets/search` (the canonical-market and exact-match-pair endpoints were sunset 2026-07-20) |

### Solana Usage

```typescript
import { SolanaLLMClient } from '@blockrun/llm';

const client = new SolanaLLMClient();
const markets = await client.pm("polymarket/markets");
```

Works on both `LLMClient` (Base) and `SolanaLLMClient`.

## Testnet Usage

For development and testing without real USDC, point the client at the Base Sepolia gateway. (The TypeScript SDK has no `testnetClient()` helper — that is a Python SDK convenience; here you set `apiUrl`.)

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`,
  apiUrl: 'https://testnet.blockrun.ai/api'
});

// Chat with a testnet model
const response = await client.chat('openai/gpt-oss-20b', 'Hello!');
console.log(response);
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

The testnet gateway also lists the image, music and video models — `curl https://testnet.blockrun.ai/api/v1/models` for the current set.

## Error Handling

All SDK errors extend `BlockrunError`.

```typescript
import { LLMClient, APIError, PaymentError, RetiredEndpointError, BlockrunError } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

try {
  const response = await client.chat('openai/gpt-5.5', 'Hello!');
} catch (error) {
  if (error instanceof PaymentError) {
    console.error('Payment failed:', error.message);
    // Check your USDC balance (Base for LLMClient, Solana for SolanaLLMClient)
  } else if (error instanceof RetiredEndpointError) {
    console.error('Endpoint retired upstream:', error.message);
  } else if (error instanceof APIError) {
    console.error(`API error (${error.statusCode}):`, error.message);
    // error.response holds the parsed body when there is one
  } else if (error instanceof BlockrunError) {
    console.error('SDK error:', error.message);
  } else {
    throw error;
  }
}
```

Transient failures (timeouts, network errors, 429, 502/503/504/522/524) are retried down `fallbackModels` — or the router's chain after `smartChat()` — before an `APIError` surfaces. Other 4xx and `PaymentError` propagate immediately.

## Types

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  name?: string;              // tool messages
  tool_call_id?: string;      // tool result messages
  tool_calls?: ToolCall[];    // assistant messages that call tools
  reasoning_content?: string; // returned by reasoning-capable models
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
  inputPrice: number;       // per 1M tokens; 0 when billingMode !== "paid"
  outputPrice: number;
  contextWindow: number;    // mapped from API's context_window
  maxOutput: number;        // mapped from API's max_output
  categories: string[];     // e.g., ["chat", "reasoning", "coding", "vision"]
  available: boolean;
  billingMode?: string;     // "paid" | "free" | "flat"
  flatPrice?: number;       // per-request price for flat-billed models
  hidden?: boolean;
}
```

Tool-calling types (`Tool`, `FunctionDefinition`, `ToolCall`, `ToolChoice`), `ResponseFormat`, and the option bags for every specialized client are exported too.

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

### Express.js Integration

```typescript
import express from 'express';
import { LLMClient } from '@blockrun/llm';

const app = express();
const client = new LLMClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });

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
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`
});

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const response = await client.chat('openai/gpt-5.5', message);
  return NextResponse.json({ response });
}
```

### Cost logging across sessions

```typescript
import { getCostSummary } from '@blockrun/llm';

// Every paid call is appended to ~/.blockrun/cost_log.jsonl
const summary = getCostSummary();
console.log(`Lifetime: $${summary.totalUsd.toFixed(2)} over ${summary.calls} calls`);
console.log(summary.byModel);
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
- `BASE_CHAIN_WALLET_KEY` environment variable set
- Estimated cost: ~$0.05 per test run

```bash
# Set your funded wallet key
export BASE_CHAIN_WALLET_KEY=0x...

# Run only integration tests
npm test -- test/integration

# Run all tests including integration
npm test run
```

Integration tests are automatically skipped if `BASE_CHAIN_WALLET_KEY` is not set.

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
- Point `BLOCKRUN_HOME` at a directory you do not control — it redirects where the signing key is read and written

### Example Secure Setup

```bash
# .env (add to .gitignore!)
BASE_CHAIN_WALLET_KEY=0x...your_private_key_here
```

```typescript
// app.ts
import { LLMClient } from '@blockrun/llm';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BASE_CHAIN_WALLET_KEY) {
  throw new Error('BASE_CHAIN_WALLET_KEY not set');
}

const client = new LLMClient({
  privateKey: process.env.BASE_CHAIN_WALLET_KEY as `0x${string}`
});
```

### Input Validation

The SDK validates all inputs before making API requests:

- Private keys (format, length, valid hex)
- API URLs (HTTPS required for production)
- Model names (non-empty strings)
- Parameters (`temperature`, `top_p` ranges; `max_tokens` must be a positive integer — the SDK no longer caps it below what a model actually serves)

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
Browse all 73 models with live pricing to pick the right one for each call.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
