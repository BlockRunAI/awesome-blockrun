---
title: BlockRun MCP
description: A Model Context Protocol server that gives Claude Code 50+ models, crypto data, voice calls, media generation, and prediction markets with zero API keys.
---

# BlockRun MCP

Give Claude Code access to 50+ AI models, 80+ crypto data endpoints, voice calls, image/video/music generation, prediction markets, and a sandbox runtime — all with zero API keys.

BlockRun MCP is a Model Context Protocol server that connects Claude Code to BlockRun's intelligence, trading, and creation capabilities.

**Latest version: v0.4.2**

## Installation

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

That's it. Restart Claude Code and the MCP is available.

:::tip
Failed calls aren't charged. You only pay when a request succeeds and settles on-chain.
:::

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

::::steps

:::step{title="Install the MCP"}
```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```
:::

:::step{title="Set up the wallet"}
In Claude Code:
```
blockrun setup
```

This creates or displays your wallet address.
:::

:::step{title="Fund the wallet"}
Send USDC to your wallet on Base network:
- [Coinbase](https://coinbase.com) — withdraw directly to Base
- [Base Bridge](https://bridge.base.org) — bridge from Ethereum

Recommended: $5-20 to start.
:::

:::step{title="Verify"}
```
blockrun balance
```

Or ask: "What's my BlockRun wallet balance?"
:::

::::

### Pay on Solana (optional)

The MCP pays on **Base** by default but holds a Solana wallet too. To pay in USDC on Solana, no env vars, file editing, or restart needed — two tool calls:

```
blockrun_wallet action:"chain" chain:"solana"   # provisions + activates the Solana wallet
blockrun_wallet action:"setup"                  # shows the Solana address + funding QR
```

Then send USDC (SPL) on the **Solana** network — from Coinbase (pick "Solana"), Phantom, Solflare, or Backpack. Switch back anytime with `blockrun_wallet action:"chain" chain:"base"`.

:::info
**Base-only** (these need Base regardless of active chain): `blockrun_image`, `blockrun_music`, `blockrun_speech`, `blockrun_video`, paid stock `blockrun_price`, `blockrun_chat routing:"smart"`, and native Anthropic (`claude-*`) models. On Solana, pass `model:` or `mode:` to `blockrun_chat` explicitly.
:::

## Available Tools

The MCP exposes 18 tools to Claude:

### `blockrun_chat`

Call any supported LLM model — plus image, video, and music generation when smart-routed.

```
Use GPT-5.4 to explain this error
Generate an image of a futuristic city
Generate a 5-second video of a sunset over Tokyo
Compose a 60-second lo-fi hip-hop loop
```

**Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `message` | string | The prompt (or use `messages` for multi-turn). |
| `model` | string | Explicit model id, e.g. `openai/gpt-5.5`. Overrides `mode`. |
| `mode` | enum | Pick a model by intent instead of by name: `fast`, `balanced`, `powerful`, `cheap`, `reasoning`, `free`, `coding`, `glm`. |
| `routing` | `"smart"` | Run ClawRouter's local scorer to choose the cheapest capable model. Pair with `routing_profile`. |
| `routing_profile` | enum | `free` · `eco` · `auto` (default) · `premium`. Only used when `routing:"smart"`. |
| `system` | string | System prompt. |
| `max_tokens` | number | Default `1024`. |
| `temperature` | number | Default `1`. |
| `messages` | array | `[{role:"user"\|"assistant"\|"system", content}]` for multi-turn. |
| `agent_id` | string | Attribute the spend to a sub-agent budget (see `blockrun_wallet`). |

```
blockrun_chat mode:"reasoning" message:"Prove there are infinitely many primes"
blockrun_chat routing:"smart" routing_profile:"eco" message:"Summarize this thread"
```

### `blockrun_search`

Live web and news search (Grok-grounded). Params: `query` (required), `sources` (`web` · `x` · `news`), `max_results` (1–50, default 10), `from_date` / `to_date` (`YYYY-MM-DD`).

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

USDC balance, wallet setup, chain switching, and per-agent budget delegation.

**`action`** (default `status`):

| action | What it does | Extra params |
|--------|--------------|--------------|
| `status` | Address, USDC balance, session spend | — |
| `setup` | Print address + funding QR (creates wallet on first run) | — |
| `chain` | Switch active chain | `chain:"base"` \| `"solana"` |
| `budget` | Set/clear a global session spend cap | `budget_action:"set"\|"clear"`, `budget_amount` |
| `delegate` | Allocate a spend limit to a sub-agent | `agent_id`, `agent_limit` |
| `revoke` | Remove a sub-agent's budget | `agent_id` |
| `report` | Per-agent spending breakdown | — |

```
blockrun_wallet action:"status"
blockrun_wallet action:"budget" budget_action:"set" budget_amount:5.00
blockrun_wallet action:"delegate" agent_id:"researcher" agent_limit:2.00
```

### Smart Routing

The MCP includes built-in smart routing that selects the best model based on your intent:

| Mode | Models | Best For |
|------|--------|----------|
| `fast` | Gemini Flash, GPT-5 Mini | Quick responses |
| `balanced` | GPT-5.4, Claude Sonnet 4.6 | General use |
| `powerful` | GPT-5.4, Claude Opus 4.8 | Complex tasks |
| `cheap` | NVIDIA free models, DeepSeek, Gemini Flash | Cost savings |
| `reasoning` | o3, DeepSeek Reasoner | Logic and math |
| `free` | NVIDIA-hosted open models only | Development, zero-cost |
| `coding` | Coding-tuned models | Code generation/review |
| `glm` | Zhipu GLM-5 / GLM-5-Turbo | Flat-rate ($0.001/call) bulk |

`mode` picks a model by intent in one hop. For prompt-aware selection (the scorer reads the prompt and picks the cheapest capable model), use `routing:"smart"` with a `routing_profile` instead — see [ClawRouter / Smart Routing](../products/routing/clawrouter.md).

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

## What's next?

::::cards

:::card{title="Claude Code guide" href="../getting-started/claude-code.md" icon="Terminal"}
The 60-second walkthrough for installing and using the MCP.
:::

:::card{title="Skills" href="skills.md" icon="Zap"}
Add prompt-based skills that teach Claude how to use the tools.
:::

:::card{title="Troubleshooting" href="troubleshooting.md" icon="Search"}
Fix install, wallet, network, and tool issues fast.
:::

::::
