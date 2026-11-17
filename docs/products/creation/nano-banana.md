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

| Model | Price per image | Best For |
|-------|-------|----------|
| Google Nano Banana | $0.0535 | Fast, affordable generation |
| Google Nano Banana 2 Lite | $0.0535 | Lowest-cost Nano Banana |
| Google Nano Banana 2.1 | $0.0745 | Newer Flash-tier model with thinking |
| Google Nano Banana 2 | $0.0955 | Pro-level quality at Flash speed |
| Google Nano Banana Pro | $0.106-0.316 | Highest quality, up to 4K |
| ByteDance Seedream 5.0 Pro | $0.04825-0.0955 | Up to 4K-class resolution |
| OpenAI GPT Image 1 | $0.022-0.043 | Native OpenAI image generation |
| OpenAI ChatGPT Images 2.0 | $0.064-0.127 | Premium quality, text rendering, edits |
| OpenAI GPT Image 2.5 Flare / Sunburst | $0.295-0.589 | OpenAI's newest; Sunburst for precision edits |
| Zhipu CogView-4 | $0.01675-0.022 | Cheapest, Chinese prompts |
| xAI Grok Imagine (base / 2.0 / Pro) | $0.022-0.064 | Stylized generation |

Prices are what one image costs at the cheapest–largest size, including the 5% media margin and the $0.001 per-call transaction fee — the same figures as the [Image Generation API](../../api-reference/image-generation.md#pricing), which lists every size.

## Installation

Image generation ships as the `blockrun_image` tool in [BlockRun MCP](../../mcp/blockrun-mcp.md) — there is no separate skill to install:

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
3. The MCP signs a USDC authorization locally (EIP-712)
4. BlockRun verifies the signature and generates the image
5. The payment settles once the image is ready, and the image is returned to Claude — a failed generation is never charged

**Your private key stays on your machine** — only the signature is sent.

## Pricing Details

Billed per image, 5% margin and $0.001 transaction fee included:

| Model | Resolution | Price |
|-------|------------|-------|
| Nano Banana / Nano Banana 2 Lite | 1024x1024 | $0.0535 |
| Nano Banana 2.1 | 1024x1024 | $0.0745 |
| Nano Banana 2 | 1024x1024 | $0.0955 |
| Nano Banana Pro | up to 2048x2048 | $0.106 |
| Nano Banana Pro | 4096x4096 (4K) | $0.316 |
| Seedream 5.0 Pro | up to 2048x1024 | $0.04825 |
| Seedream 5.0 Pro | 2048x2048 and above | $0.0955 |
| GPT Image 1 | 1024x1024 | $0.022 |
| GPT Image 1 | wide/tall | $0.043 |
| ChatGPT Images 2.0 | 1024x1024 | $0.064 |
| ChatGPT Images 2.0 | wide/tall | $0.127 |
| GPT Image 2.5 Flare / Sunburst | 1024x1024 | $0.295 |
| GPT Image 2.5 Flare / Sunburst | wide/tall | $0.589 |
| CogView-4 | up to 1344px | $0.01675 |
| CogView-4 | 1440x1440 | $0.022 |
| Grok Imagine | 1024x1024 | $0.022 |
| Grok Imagine 2.0 | 1024x1024 | $0.043 |
| Grok Imagine Pro | 1024x1024 | $0.064 |

## Example Session

```
User: Generate a minimalist logo for "BlockRun" - black and white,
      geometric, representing AI and crypto

Claude: I'll generate this using Nano Banana.

[Calls nano-banana with prompt]

Here's your logo:
[Image displayed]

Cost: $0.0535 USDC
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

Check your USDC balance — run the `blockrun_wallet` tool, or ask Claude:
```
What's my BlockRun wallet balance?
```

### "Generation failed"

- Try a simpler prompt
- Check for content policy violations
- Retry after a few seconds

### "Timeout"

Most models finish within 30 seconds. Seedream 5.0 Pro (~2 minutes) and slower GPT Image renders switch to a job that is polled until it completes — you are charged only when the image is ready.

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

:::card{title="GitHub: nano-banana-blockrun (archived)" href="https://github.com/BlockRunAI/nano-banana-blockrun" icon="Code"}
The original Claude Code skill repo, now archived — use `blockrun_image` in BlockRun MCP instead.
:::

::::
