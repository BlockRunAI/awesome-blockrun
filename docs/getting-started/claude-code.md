# Claude Code Users

Get started with BlockRun in 60 seconds. Give your Claude agent superpowers.

## Quick Install

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

That's it. The MCP server is now available to Claude Code.

## Setup Your Wallet

In Claude Code, say:

```
blockrun setup
```

Claude will:
1. Generate a new wallet (or use an existing one)
2. Show you your wallet address
3. Explain how to fund it

## Fund Your Wallet

Send USDC to your wallet address on **Base network**:

- **Recommended:** $5-20 for regular usage
- **Minimum:** $1 to get started

Get USDC on Base:
- [Coinbase](https://coinbase.com) - withdraw directly to Base
- [Base Bridge](https://bridge.base.org) - bridge from Ethereum
- [Uniswap](https://app.uniswap.org) - swap on Base

### Prefer Solana?

The MCP holds a Solana wallet too. Switch with two tool calls — no env vars, no file editing, no restart:

```
blockrun_wallet action:"chain" chain:"solana"
blockrun_wallet action:"setup"
```

Then send USDC (SPL) on the **Solana** network (Coinbase → pick "Solana", or Phantom/Solflare/Backpack). Switch back with `blockrun_wallet action:"chain" chain:"base"`. Note: image, music, speech, video, paid stock prices, smart routing, and native Anthropic (`claude-*`) settle on Base only.

## What You Can Do Now

### Image Generation

```
Generate a logo for a crypto trading bot
```

Claude uses nano-banana to generate images via Google's Nano Banana, OpenAI GPT Image, CogView-4, or xAI Grok Imagine. ~$0.015-0.12 per image.

### Access Other AI Models

```
Use GPT-5 to get a second opinion on this code
```

```
Ask Grok what's trending on X right now
```

Claude automatically routes to 50+ AI models and pays via x402.

### Trading (alpha-mcp)

For trading, install the trading-specific MCP:

```bash
claude mcp add @blockrun/alpha
```

Then:

```
Analyze BTC/USDC for trading signals
```

See [Trading Overview](../products/trading/overview.md) for full details.

## Check Your Balance

```
blockrun balance
```

or

```
What's my BlockRun wallet balance?
```

## Available Skills

BlockRun provides Claude Code skills that extend what Claude can do:

| Skill | What It Does |
|-------|-------------|
| [nano-banana](../products/creation/nano-banana.md) | Generate images via micropayments |
| [alpha-mcp](../products/trading/overview.md) | AI crypto trading with risk management |

## Pricing

- **Intelligence:** Provider cost + 5% (no subscriptions)
- **Images:** $0.05-0.12 per image
- **Trading tools:** Free (open source)

$1 gets you approximately:
- ~500 GPT-5.4 calls
- ~10,000 DeepSeek calls
- ~20–65 image generations

## Security

- Your private key stays on your machine (`~/.blockrun/`)
- Only cryptographic signatures are sent to servers
- All payments are verifiable on [Basescan](https://basescan.org)
- You control your wallet — withdraw anytime

## Troubleshooting

### MCP not loading?

Restart Claude Code after installation:

```bash
# Check if MCP is registered
claude mcp list
```

### Wallet not found?

```bash
# Check wallet location
ls ~/.blockrun/
```

### Transaction failed?

Check your USDC balance on Base:
```
blockrun balance
```

For more help, see [MCP Troubleshooting](../mcp/troubleshooting.md).

## Next Steps

- [Install Trading Agent](../products/trading/installation.md)
- [Generate images with nano-banana](../products/creation/nano-banana.md)
- [Explore all models](../products/intelligence/overview.md)
