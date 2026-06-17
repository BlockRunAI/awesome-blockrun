---
title: nano-banana
description: nano-banana is a Claude Code skill for generating images via Nano Banana, GPT Image, CogView-4, or Grok Imagine — paid per image with USDC, no API keys.
---

# nano-banana

Image generation via micropayments. No API keys needed.

nano-banana is a Claude Code skill that lets you generate images using Google's Nano Banana, OpenAI GPT Image, CogView-4, or xAI Grok Imagine models. Your private key never leaves your machine.

:::note{title="What you need"}
A funded wallet on Base — $5–10 covers roughly 50–100 images. Your private key stays local; only EIP-712 signatures are sent.
:::

## Available Models

| Model | Price | Best For |
|-------|-------|----------|
| Google Nano Banana | $0.05 | Fast, affordable generation |
| Google Nano Banana Pro | $0.10 | Higher quality outputs |
| OpenAI GPT Image 1 | $0.02-0.04 | Native GPT-4o image generation |
| OpenAI ChatGPT Images 2.0 | $0.06-0.12 | Premium quality, text rendering, edits |
| Zhipu CogView-4 | $0.015 | Cheapest, Chinese prompts |
| xAI Grok Imagine | $0.02-0.07 | Stylized generation |

## Installation

```bash
# Install the nano-banana skill
claude skill add nano-banana
```

Or via the BlockRun MCP which includes image generation:

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

## Usage

### Basic Generation

```
Generate a logo for a crypto trading bot
```

```
Create an image of a futuristic AI agent
```

### With Model Selection

```
Use GPT Image to generate a professional headshot
```

```
Use Nano Banana Pro for a high-quality landscape
```

### With Specific Parameters

```
Generate a 16:9 banner image of blockchain nodes
```

## How It Works

1. Claude sends your prompt to BlockRun API
2. API responds with HTTP 402 (Payment Required) + price
3. SDK signs USDC transaction locally (EIP-712)
4. BlockRun verifies on-chain, generates image
5. Image returned to Claude

**Your private key stays on your machine** — only the signature is sent.

## Pricing Details

| Model | Resolution | Price |
|-------|------------|-------|
| Nano Banana | 1024x1024 | $0.05 |
| Nano Banana Pro | 1024x1024 | $0.10 |
| GPT Image 1 | 1024x1024 | $0.02 |
| ChatGPT Images 2.0 | 1024x1024 | $0.06 |
| CogView-4 | up to 1440x1440 | $0.015 |

## Example Session

```
User: Generate a minimalist logo for "BlockRun" - black and white,
      geometric, representing AI and crypto

Claude: I'll generate this using Nano Banana.

[Calls nano-banana with prompt]

Here's your logo:
[Image displayed]

Cost: $0.05 USDC
Transaction: 0x...

Want me to try variations or a different style?
```

## Output Formats

- **PNG** — Default, best for web
- **JPEG** — Smaller file size
- **WebP** — Modern, efficient format

Images are saved to your current directory or a specified path.

## Tips for Better Results

### Be Specific
```
❌ "A dog"
✅ "A golden retriever puppy sitting in a sunlit meadow,
    soft focus background, warm afternoon lighting"
```

### Specify Style
```
✅ "Digital art style"
✅ "Photorealistic"
✅ "Minimalist vector illustration"
✅ "Watercolor painting"
```

### Include Composition
```
✅ "Centered composition"
✅ "Rule of thirds"
✅ "Close-up shot"
✅ "Wide angle view"
```

## Wallet Requirements

You need a funded wallet on Base network. See [Wallet Setup](../../getting-started/wallet-setup.md).

Recommended balance: $5-10 for ~50-100 images

## Troubleshooting

### "Insufficient balance"

Check your USDC balance:
```
blockrun balance
```

### "Generation failed"

- Try a simpler prompt
- Check for content policy violations
- Retry after a few seconds

### "Timeout"

Complex prompts may take longer. Wait up to 30 seconds.

## Security

- Private key stored locally (`~/.blockrun/`)
- Only EIP-712 signatures sent to server
- All payments verifiable on [Basescan](https://basescan.org)
- No account needed — just a wallet

## What's next?

::::cards

:::card{title="Music generation" href="music-generation.md" icon="Zap"}
Generate full-length tracks with lyrics or instrumental, paid per track.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund a Base wallet to start generating.
:::

:::card{title="GitHub: nano-banana-blockrun" href="https://github.com/BlockRunAI/nano-banana-blockrun" icon="Code"}
Source for the nano-banana Claude Code skill.
:::

::::
