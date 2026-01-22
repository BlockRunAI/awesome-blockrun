# Claude Code Users

Get started with BlockRun in 60 seconds. Give your Claude agent superpowers.

## Quick Install

```bash
claude mcp add blockrun -- npx @blockrun/mcp
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

## What You Can Do Now

### Image Generation

```
Generate a logo for a crypto trading bot
```

Claude uses nano-banana to generate images via DALL-E, Flux, or Google's Nano Banana model. ~$0.05-0.12 per image.

### Access Other AI Models

```
Use GPT-5 to get a second opinion on this code
```

```
Ask Grok what's trending on X right now
```

Claude automatically routes to 30+ AI models and pays via x402.

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
| [x-grow](../products/creation/x-grow.md) | Write algorithm-optimized X posts |
| [nano-banana](../products/creation/nano-banana.md) | Generate images via micropayments |
| [alpha-mcp](../products/trading/overview.md) | AI crypto trading with risk management |

## Pricing

- **Intelligence:** Provider cost + 5% (no subscriptions)
- **Images:** $0.05-0.12 per image
- **Trading tools:** Free (open source)

$1 gets you approximately:
- ~1,000 GPT-4o calls
- ~10,000 DeepSeek calls
- ~20 DALL-E images

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
- [Try x-grow for X posts](../products/creation/x-grow.md)
- [Explore all models](../products/intelligence/overview.md)
