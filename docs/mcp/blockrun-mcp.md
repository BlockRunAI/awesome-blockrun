# BlockRun MCP

Give Claude Code access to 50+ AI models, 80+ crypto data endpoints, voice calls, image/video/music generation, prediction markets, and a sandbox runtime — all with zero API keys.

BlockRun MCP is a Model Context Protocol server that connects Claude Code to BlockRun's intelligence, trading, and creation capabilities.

**Latest version: v0.4.2**

## Installation

```bash
claude mcp add blockrun --transport http https://mcp.blockrun.ai/mcp
```

That's it. Restart Claude Code and the MCP is available.

## What It Enables

| Capability | Example |
|------------|---------|
| **Multi-model access** | "Use GPT-5 to review this code" |
| **Image generation** | "Generate a logo for my app" |
| **Real-time data** | "What's trending on X?" |
| **Cost optimization** | "Use DeepSeek for bulk processing" |

## How It Works

1. You ask Claude to use an external capability
2. Claude calls the BlockRun MCP tool
3. MCP signs a USDC payment locally
4. Request goes to BlockRun with payment signature
5. BlockRun verifies, calls the provider, returns result

**Your private key stays on your machine.**

## Setup

### 1. Install MCP

```bash
claude mcp add blockrun --transport http https://mcp.blockrun.ai/mcp
```

### 2. Setup Wallet

In Claude Code:
```
blockrun setup
```

This creates or displays your wallet address.

### 3. Fund Wallet

Send USDC to your wallet on Base network:
- [Coinbase](https://coinbase.com) — withdraw directly to Base
- [Base Bridge](https://bridge.base.org) — bridge from Ethereum

Recommended: $5-20 to start.

### 4. Verify

```
blockrun balance
```

Or ask: "What's my BlockRun wallet balance?"

## Available Tools

The MCP exposes 10 tools to Claude:

### `blockrun_chat`

Call any supported LLM model — plus image, video, and music generation when smart-routed.

```
Use GPT-5.4 to explain this error
Generate an image of a futuristic city
Generate a 5-second video of a sunset over Tokyo
Compose a 60-second lo-fi hip-hop loop
```

### `blockrun_search`

Live web and news search (Grok-grounded).

### `blockrun_exa`

Neural semantic web search — find URLs, read pages, get cited answers, find similar.

### `blockrun_markets`

Predexon prediction markets — Polymarket, Kalshi, sports markets.

### `blockrun_surf`

Crypto data via Surf — 83 endpoints across exchanges, on-chain analytics, prediction markets, wallet labels, social mindshare, news, and search. See [Surf API reference](../api-reference/surf.md).

```
What's the BTC funding rate on Binance perps right now, and how does it compare to the 7-day average?
```

### `blockrun_price`

Pyth-grounded real-time quotes — crypto, FX, commodities, stocks.

### `blockrun_dex`

0x Swap — Permit2 + Gasless V2 aggregation across 100+ venues (free passthrough).

### `blockrun_phone`

AI voice calls + wallet-owned US/CA phone numbers. See [Phone & Voice reference](../api-reference/voice-phone.md).

```
Call +14155551234 and ask if Tuesday at 7pm is available for a reservation for two.
```

### `blockrun_models`

List all available models with live pricing, context windows, and categories.

### `blockrun_wallet`

USDC balance, agent budgets, wallet setup.

```
blockrun balance
```

### Smart Routing

The MCP includes built-in smart routing that selects the best model based on your intent:

| Mode | Models | Best For |
|------|--------|----------|
| `fast` | Gemini Flash, GPT-5 Mini | Quick responses |
| `balanced` | GPT-5.4, Claude Sonnet 4.6 | General use |
| `powerful` | GPT-5.4, Claude Opus 4.6 | Complex tasks |
| `cheap` | NVIDIA free models, DeepSeek, Gemini Flash | Cost savings |
| `reasoning` | o3, o1, DeepSeek Reasoner | Logic and math |

## Configuration

### Environment Variables

```bash
# Optional: Custom wallet location
export BLOCKRUN_WALLET_PATH=~/.blockrun/custom-wallet.json

# Optional: Session budget limit
export BLOCKRUN_SESSION_BUDGET=10.00
```

### Claude Code Settings

View MCP configuration:

```bash
claude mcp list
```

Remove if needed:

```bash
claude mcp remove blockrun
```

## Pricing

- **Intelligence:** Provider cost + 5%
- **Images:** $0.05-0.12 per image
- **No subscriptions, no minimums**

See [Intelligence Pricing](../products/intelligence/pricing.md) for details.

## Security

| Aspect | How It's Protected |
|--------|-------------------|
| Private key | Stored locally at `~/.blockrun/` |
| Payments | Only signatures sent, key never transmitted |
| Verification | All transactions viewable on Basescan |
| Control | You control your wallet, withdraw anytime |

## Common Commands

```
# Check balance
blockrun balance

# Setup/view wallet
blockrun setup

# Use a specific model
Use GPT-5 to analyze this

# Generate image
Create an image of [description]

# Get second opinion
Ask Claude Opus what it thinks about this approach
```

## Troubleshooting

See [MCP Troubleshooting](troubleshooting.md) for common issues.

### Quick Fixes

**MCP not loading:**
```bash
# Restart Claude Code
pkill -f "claude"
claude

# Verify installation
claude mcp list
```

**Wallet not found:**
```
blockrun setup
```

**Insufficient balance:**
```
blockrun balance
```

Fund your wallet if needed.

## Links

- [GitHub: blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)
- [npm: @blockrun/mcp](https://www.npmjs.com/package/@blockrun/mcp)
- [Claude Code Users Guide](../getting-started/claude-code.md)
