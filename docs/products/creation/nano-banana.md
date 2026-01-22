# nano-banana

Image generation via micropayments. No API keys needed.

nano-banana is a Claude Code skill that lets you generate images using DALL-E, Flux, or Google's Nano Banana model. Your private key never leaves your machine.

## Available Models

| Model | Price | Best For |
|-------|-------|----------|
| Google Nano Banana | $0.05 | Fast, affordable generation |
| Google Nano Banana Pro | $0.10 | Higher quality outputs |
| OpenAI DALL-E 3 | $0.04-0.12 | Premium image generation |

## Installation

```bash
# Install the nano-banana skill
claude skill add nano-banana
```

Or via the BlockRun MCP which includes image generation:

```bash
claude mcp add blockrun -- npx @blockrun/mcp
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
Use DALL-E to generate a professional headshot
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
| DALL-E 3 Standard | 1024x1024 | $0.04 |
| DALL-E 3 HD | 1024x1792 | $0.08 |
| DALL-E 3 HD Wide | 1792x1024 | $0.12 |

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

## Integration with x-grow

nano-banana powers the image mode in [x-grow](x-grow.md):

```
/x-grow image "AI agent trading dashboard"
```

Images are automatically optimized for X (Twitter) engagement:
- 16:9 aspect ratio
- High contrast
- Mobile-friendly

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

## Links

- [GitHub: nano-banana-blockrun](https://github.com/BlockRunAI/nano-banana-blockrun)
- [x-grow (X post optimization)](x-grow.md)
- [Wallet Setup](../../getting-started/wallet-setup.md)
