# Pricing

BlockRun uses pay-per-request pricing with no subscriptions or prepaid credits.

## How Pricing Works

1. **Per-token billing** - Pay based on actual usage
2. **Input + Output** - Separate rates for prompts and responses
3. **No minimums** - Start with any amount of USDC
4. **No markup** - We pass through provider rates

## Current Rates

Prices are per 1 million tokens.

### OpenAI Models

| Model | Input | Output |
|-------|-------|--------|
| GPT-5.2 | $1.75 | $14.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.15 | $0.60 |
| o1 | $15.00 | $60.00 |
| o1-mini | $3.00 | $12.00 |

### Anthropic Models

| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4 | $15.00 | $75.00 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 |

### Google Models

| Model | Input | Output |
|-------|-------|--------|
| Gemini 3 Pro | $2.00 | $12.00 |
| Gemini 2.5 Pro | $1.25 | $10.00 |
| Gemini 2.5 Flash | $0.15 | $0.60 |

### Other Models

| Model | Input | Output |
|-------|-------|--------|
| Grok 4 Fast | $0.20 | $0.50 |
| DeepSeek V3 | $0.20 | $0.88 |
| DeepSeek R1 | $0.55 | $2.19 |
| Llama 3.3 70B | $0.12 | $0.30 |
| Qwen 2.5 72B | $0.07 | $0.26 |
| Mistral Large | $2.00 | $6.00 |

## Example Costs

### Simple Chat

```
Model: GPT-4o Mini
Input: 100 tokens (~75 words)
Output: 200 tokens (~150 words)

Cost: (100 × $0.00000015) + (200 × $0.0000006)
    = $0.000015 + $0.00012
    = $0.000135 (~$0.0001)
```

### Complex Analysis

```
Model: Claude Opus 4
Input: 10,000 tokens (long document)
Output: 2,000 tokens (detailed analysis)

Cost: (10000 × $0.000015) + (2000 × $0.000075)
    = $0.15 + $0.15
    = $0.30
```

### Code Generation

```
Model: GPT-4o
Input: 500 tokens (problem description)
Output: 1,000 tokens (code solution)

Cost: (500 × $0.0000025) + (1000 × $0.00001)
    = $0.00125 + $0.01
    = $0.01125 (~$0.01)
```

## Minimum Payment

The minimum payment per request is **$0.001** (one-tenth of a cent).

For very short requests, you'll pay the minimum regardless of actual token usage.

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

## No Hidden Fees

- No subscription fees
- No platform fees
- No withdrawal fees
- No minimum balance

You only pay for what you use.

## Getting USDC

1. **Centralized Exchange** - Buy on Coinbase, Binance, etc.
2. **DEX** - Swap on Uniswap, Aerodrome
3. **Bridge** - Bridge from other chains

Ensure your USDC is on a supported network (Base).

## Cost Optimization

### Choose the Right Model

| Task | Recommended Model | Why |
|------|-------------------|-----|
| Simple Q&A | GPT-4o Mini | Fast, cheap |
| Complex reasoning | o1, Claude Opus | Higher quality |
| Code generation | GPT-4o, Claude Sonnet | Good balance |
| Bulk processing | Gemini Flash, DeepSeek | Cost effective |

### Optimize Prompts

- Be concise in system prompts
- Avoid unnecessary context
- Use `max_tokens` to limit output

### Monitor Usage

Track your spending by monitoring your wallet's USDC transfers.
