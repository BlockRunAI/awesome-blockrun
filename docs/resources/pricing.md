# Pricing

BlockRun uses pay-per-request pricing with no subscriptions or prepaid credits.

## How Pricing Works

1. **Per-token billing** - Pay based on actual usage
2. **Input + Output** - Separate rates for prompts and responses
3. **No minimums** - Start with any amount of USDC
4. **5% platform fee** - Added to provider rates for infrastructure

## Current Rates

Prices are per 1 million tokens (provider rates + 5% platform fee).

### OpenAI Models

| Model | Input | Output |
|-------|-------|--------|
| GPT-5.2 | $1.84 | $14.70 |
| GPT-5 Mini | $0.26 | $2.10 |
| GPT-5 Nano | $0.05 | $0.42 |
| GPT-OSS 20B | $0.03 | $0.15 |
| GPT-4o | $2.63 | $10.50 |
| GPT-4o Mini | $0.16 | $0.63 |
| o1 | $15.75 | $63.00 |
| o3-mini | $1.16 | $4.62 |

### Anthropic Models

| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4 | $15.75 | $78.75 |
| Claude Sonnet 4 | $3.15 | $15.75 |
| Claude Haiku 4.5 | $1.05 | $5.25 |

### Google Models

| Model | Input | Output |
|-------|-------|--------|
| Gemini 3 Pro | $2.10 | $12.60 |
| Gemini 2.5 Pro | $1.31 | $10.50 |
| Gemini 2.5 Flash | $0.16 | $0.63 |

### DeepSeek Models

| Model | Input | Output |
|-------|-------|--------|
| DeepSeek V3.2 Chat | $0.29 | $0.44 |
| DeepSeek V3.2 Reasoner | $0.29 | $0.44 |

### Qwen Models

| Model | Input | Output |
|-------|-------|--------|
| Qwen3 Max | $0.48 | $1.93 |
| Qwen Plus | $0.11 | $0.32 |
| Qwen Turbo | $0.02 | $0.06 |

### xAI (Grok) Models

| Model | Input | Output |
|-------|-------|--------|
| Grok 3 | $3.15 | $15.75 |
| Grok 3 Fast | $5.25 | $26.25 |
| Grok 3 Mini | $0.32 | $0.53 |

## Example Costs

### Simple Chat (GPT-4o Mini)

```
Model: GPT-4o Mini
Input: 100 tokens (~75 words)
Output: 200 tokens (~150 words)

Cost: (100 × $0.00000016) + (200 × $0.00000063)
    = $0.000016 + $0.000126
    = $0.000142 (~$0.0001)
```

### Budget Option (GPT-OSS 20B)

```
Model: GPT-OSS 20B
Input: 1,000 tokens
Output: 500 tokens

Cost: (1000 × $0.00000003) + (500 × $0.00000015)
    = $0.00003 + $0.000075
    = $0.0001 (one-hundredth of a cent!)
```

### Complex Analysis (Claude Opus 4)

```
Model: Claude Opus 4
Input: 10,000 tokens (long document)
Output: 2,000 tokens (detailed analysis)

Cost: (10000 × $0.00001575) + (2000 × $0.00007875)
    = $0.1575 + $0.1575
    = $0.315 (~$0.32)
```

### Code Generation (Claude Sonnet 4)

```
Model: Claude Sonnet 4
Input: 500 tokens (problem description)
Output: 1,000 tokens (code solution)

Cost: (500 × $0.00000315) + (1000 × $0.00001575)
    = $0.001575 + $0.01575
    = $0.0173 (~$0.02)
```

## Payment Currency

All payments are in **USDC** (USD Coin). USDC is:

- Pegged 1:1 to USD
- Available on multiple chains
- Instant settlement

## Supported Networks

| Network | Status | USDC Contract |
|---------|--------|---------------|
| Base | Live | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Solana | Coming Soon | - |

## Transparent Pricing

- No subscription fees
- No withdrawal fees
- No minimum balance
- **5% platform fee** covers infrastructure costs

You only pay for what you use, plus the transparent 5% fee.

## Getting USDC

1. **Centralized Exchange** - Buy on Coinbase, Binance, etc.
2. **DEX** - Swap on Uniswap, Aerodrome
3. **Bridge** - Bridge from other chains

Ensure your USDC is on a supported network (Base).

## Cost Optimization

### Choose the Right Model

| Task | Recommended Model | Why |
|------|-------------------|-----|
| Simple Q&A | GPT-4o Mini, GPT-OSS 20B | Fast, cheap |
| Complex reasoning | o1, Claude Opus | Higher quality |
| Code generation | Claude Sonnet, DeepSeek | Good balance |
| Bulk processing | Gemini Flash, Qwen Turbo | Cost effective |
| Chinese/Multilingual | Qwen3 Max | Optimized |

### Optimize Prompts

- Be concise in system prompts
- Avoid unnecessary context
- Use `max_tokens` to limit output

### Monitor Usage

Track your spending by monitoring your wallet's USDC transfers.
