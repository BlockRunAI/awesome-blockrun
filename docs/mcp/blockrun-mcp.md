---
title: BlockRun MCP
description: A Model Context Protocol server that gives Claude Code 75 models, crypto data, voice calls, media generation, and prediction markets with zero API keys.
---

# BlockRun MCP

Give Claude Code access to 99 AI models, 83 crypto data endpoints, voice calls, image/video/music generation, prediction markets (read *and* trade), multi-chain RPC, and a sandbox runtime — all with zero API keys.

BlockRun MCP is a Model Context Protocol server that connects Claude Code to BlockRun's intelligence, trading, and creation capabilities.

Always installs the latest version — see [npm](https://www.npmjs.com/package/@blockrun/mcp) for the current release.

## Installation

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

That's it. Restart Claude Code and the MCP is available. A wallet is auto-created on first run — no signup.

`-s user` installs globally (available in every project). The `--` separator ensures `-y` is passed to `npx`, not parsed by `claude mcp add`. Requires Node.js ≥ 20.19.

:::tip{title="Homebrew / nvm users"}
If the server doesn't connect, Claude Code likely can't find `node`/`npx` on its launcher PATH. Pass your shell PATH through — works on CLI and desktop:

```bash
claude mcp add blockrun -s user -e PATH="$PATH" -- npx -y @blockrun/mcp@latest
```
:::

:::tip
Failed calls aren't charged. You only pay when a request succeeds and settles on-chain.
:::

### Other clients

The same server runs in any MCP-compatible client.

::::tabs

:::tab{label="Claude Desktop"}
Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blockrun": { "command": "npx", "args": ["-y", "@blockrun/mcp@latest"] }
  }
}
```
:::

:::tab{label="Cursor"}
Add to `~/.cursor/mcp.json` (macOS/Linux) or `%APPDATA%\Cursor\mcp.json` (Windows):

```json
{
  "mcpServers": {
    "blockrun": { "command": "npx", "args": ["-y", "@blockrun/mcp@latest"] }
  }
}
```
:::

:::tab{label="Windsurf"}
Same JSON, in:
- macOS: `~/.codeium/windsurf/mcp_config.json`
- Linux: `~/.config/.codeium/windsurf/mcp_config.json`
- Windows: `%APPDATA%\Codeium\windsurf\mcp_config.json`
:::

:::tab{label="Codex CLI"}
```bash
codex mcp add blockrun -- npx -y @blockrun/mcp@latest
```

Or add to `~/.codex/config.toml`:

```toml
[mcp_servers.blockrun]
command = "npx"
args = ["-y", "@blockrun/mcp@latest"]
```
:::

::::

### Tool profiles (optional)

Expose a trimmed tool set so the client loads fewer schemas into context. Pass `--profile <name>` (or set `BLOCKRUN_MCP_PROFILE`); omit for the full set.

| Profile | Tools |
|---------|-------|
| `full` *(default)* | everything |
| `media` | `wallet` `models` `image` `video` `realface` `music` `speech` |
| `trading` | `wallet` `price` `dex` `markets` `surf` `defi` `rpc` `polymarket_read` `polymarket` |
| `research` | `wallet` `models` `chat` `search` `exa` `surf` |
| `chat` | `wallet` `models` `chat` |

```bash
claude mcp add blockrun-trading -s user -- npx -y @blockrun/mcp@latest --profile trading
```

An unknown profile name falls back to `full`. `modal` and `phone` are `full`-profile only.

### Plugins (spend controls)

The bare MCP works everywhere. For Claude Code specifically, the **blockrun-media** plugin wraps the `media` profile with a spend-confirmation prompt before every paid call, a running cost meter, a status-line balance, and `/blockrun-media:balance` · `/blockrun-media:report` · `/blockrun-media:insights` commands:

```
/plugin marketplace add BlockRunAI/blockrun-claude-plugin
/plugin install blockrun-media@blockrun
```

The Codex port is [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin) (`codex plugin marketplace add BlockRunAI/blockrun-codex-plugin`, then `codex plugin install blockrun-media`). Both read real settled spend from `~/.blockrun/cost_log.jsonl`. Knobs: `BLOCKRUN_ASK_THRESHOLD` (auto-run paid calls at or under this USD amount), `BLOCKRUN_SESSION_CAP` (soft per-session budget).

Prompt-based skills for every tool family install from a separate marketplace — see [Skills](skills.md).

## What It Enables

| Capability | Example |
|------------|---------|
| **Multi-model access** | "Use GPT-5.5 to review this code" |
| **Image, video, music, speech** | "Generate a logo for my app" · "A 5-second clip of a sunset over Tokyo" |
| **Real-time data** | "What's trending on X?" · "Polymarket odds on the next Fed decision?" |
| **Trading** | "If 'hold' is above 70%, put $2 on it" (confirm-gated) |
| **On-chain & crypto** | "What's this wallet labeled, and what does it hold?" |
| **Cost optimization** | "Use DeepSeek for bulk processing" · `mode:"free"` for drafts |

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

:::step{title="See your wallet"}
The wallet is created automatically the first time the server starts. In Claude Code:
```
blockrun_wallet action:"setup"
```

Or just ask: "Set up my BlockRun wallet." This prints the address and a funding QR code.
:::

:::step{title="Fund the wallet"}
Send USDC to your wallet on Base network:
- [Coinbase](https://coinbase.com) — Send → USDC → Base network → paste address
- [Base Bridge](https://bridge.base.org) — bridge from Ethereum
- Card: `blockrun_wallet action:"deposit"` mints a one-time Coinbase Onramp link and opens it (Base only; funds land in your own wallet)

Recommended: $5-20 to start.
:::

:::step{title="Verify"}
```
blockrun_wallet
```

Or ask: "What's my BlockRun wallet balance?" The default `status` action shows both wallet addresses, USDC balances, the active chain, and session spend.
:::

::::

### Pay on Solana (optional)

The MCP pays on **Base** by default but holds a Solana wallet too. To pay in USDC on Solana, no env vars, file editing, or restart needed — two tool calls:

```
blockrun_wallet action:"chain" chain:"solana"   # provisions + activates the Solana wallet
blockrun_wallet action:"setup"                  # shows the Solana address + funding QR
```

Then send USDC (SPL) on the **Solana** network — from Coinbase (pick "Solana"), Phantom, Solflare, or Backpack. Switch back anytime with `blockrun_wallet action:"chain" chain:"base"`. The server keeps both wallets; switching just changes which one pays.

:::info
**Base-only** (these fall back to Base regardless of active chain): `blockrun_music`, `blockrun_speech`, `blockrun_modal`, `blockrun_defi`, paid `blockrun_realface`, paid stock `blockrun_price`, and native Anthropic (`claude-*`) passthrough. In Solana mode they return a "switch to Base" message instead of charging. `blockrun_image` and `blockrun_video` pay on either chain.
:::

## Available Tools

The MCP exposes 20 tools to Claude, grouped below by what they do. Every tool description carries its current price — prices are generated from the live catalog, not typed, so read the tool description (or the `402` response) rather than a remembered figure.

### Intelligence

#### `blockrun_chat`

Get a second opinion from another model, or use a specialised model for a task. Pick by `model` id or by `mode`.

```
Use GPT-5.5 to explain this error
blockrun_chat mode:"reasoning" message:"Prove there are infinitely many primes"
blockrun_chat mode:"free" message:"Draft a commit message for this diff"
```

**Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `message` | string | The prompt (appended as the final user turn when `messages` is also given). |
| `model` | string | Explicit model id, e.g. `openai/gpt-5.5`, `moonshot/kimi-k3`, `zai/glm-5`. Overrides `mode`. |
| `mode` | enum | Pick a model by intent: `fast`, `balanced` (default), `powerful`, `cheap`, `reasoning`, `free`, `coding`, `glm`. Ignored when `model` is set. |
| `system` | string | System prompt. |
| `max_tokens` | number | Default `1024`. |
| `temperature` | number | 0–2, default `1`. |
| `response_format` | enum | `text` or `json_object` (forces valid JSON, no fences). |
| `stop` | string[] | Up to 4 stop sequences. |
| `thinking` | object | `{type:"enabled", budget_tokens}` — extended thinking, honoured for `anthropic/claude-*` only. |
| `messages` | array | `[{role:"user"\|"assistant"\|"system", content}]` for multi-turn; `content` may be text or `text`/`image_url` parts. |
| `agent_id` | string | Attribute the spend to a sub-agent budget (see `blockrun_wallet`). |

#### `blockrun_models`

List every available LLM, image, video, music and speech model with live pricing, context windows, and categories. Free.

### Search & research

#### `blockrun_search`

Live web + X/Twitter + news search with AI-summarised results and citations. Body: `{ query, sources: ["web","x","news"], max_results, from_date, to_date }`. `sources` accepts any subset (default all three; `["x"]` for tweets only). `max_results` is 1–50 and drives the price — pass a small value to cap spend.

```
blockrun_search body:{query:"what are people saying about @sama", sources:["x"], max_results:5}
```

#### `blockrun_exa`

Neural semantic web search — `search`, `answer` (cited), `contents` (read URLs), `find-similar`. Best for research, papers, competitors.

### Markets & trading

#### `blockrun_markets`

Prediction-market and derivatives data via the Predexon aggregator — Polymarket (markets, candles, trades, orderbooks, leaderboards, smart-wallet PnL), Kalshi, Limitless, Opinion, Predict.Fun, dFlow, Binance Futures, sports, and cross-venue search. See [Prediction Markets reference](../api-reference/prediction-markets.md).

#### `blockrun_polymarket_read`

Read or preview Polymarket state without signing anything — `positions`, open `orders`, and a live order `preview` from the CLOB book. Free; never accepts `confirm`.

#### `blockrun_polymarket`

**Trade on Polymarket** (CLOB V2, Polygon) — `setup`, `fund`, `buy`, `sell`, `cancel`, `redeem`, `withdraw`. Orders are signed locally by your BlockRun key and settle in pUSD from a gasless deposit wallet. Real money: every order needs `confirm:true`, capped per order by `POLYMARKET_MAX_BET_USD` (default $25). Without `confirm` you get a dry-run. Discover markets and token ids with `blockrun_markets` first. See [Polymarket funding](../api-reference/polymarket-funding.md).

```
blockrun_polymarket action:"setup"
blockrun_polymarket action:"fund" amount_usd:5 confirm:true
blockrun_polymarket_read action:"preview" side:"buy" token_id:"<id>" amount_usd:5 order_type:"FOK"
blockrun_polymarket action:"buy" token_id:"<id>" amount_usd:5 order_type:"FOK" confirm:true
```

### Crypto & on-chain data

#### `blockrun_surf`

Unified crypto data — CEX data, on-chain SQL, labeled wallets, social mindshare, news, prediction markets, and unified search. See [Surf API reference](../api-reference/surf.md).

```
What's the BTC funding rate on Binance perps right now, and how does it compare to the 7-day average?
```

#### `blockrun_price`

Pyth-backed realtime quotes and OHLC history — crypto, FX, commodities (free) and 12 global stock markets (paid). Actions: `price`, `history`, `list`.

#### `blockrun_dex`

Real-time DEX pair data — token prices, liquidity, volume, pair and contract lookup across chains. Free.

#### `blockrun_defi`

DeFi fundamentals — protocol TVL, chain TVL, yield pools (APY), token prices. See [DefiLlama reference](../api-reference/defillama.md).

#### `blockrun_rpc`

Raw JSON-RPC against 40 blockchains through one endpoint — contract reads, balances, blocks, transactions, logs, gas estimates. No node, no API key. See [Multi-chain RPC](../api-reference/multi-chain-rpc.md).

### Media

#### `blockrun_image`

Generate or edit images (img2img, inpaint, fusion). Models include `openai/gpt-image-2`, `openai/gpt-image-1`, `google/nano-banana`, `google/nano-banana-2`, `google/nano-banana-pro`, `xai/grok-imagine-image`, `xai/grok-imagine-image-pro`, `zai/cogview-4`, `bytedance/seedream-5-pro`. Pays on either chain. Pair with the `image-prompting` skill for text-accurate prompts.

```
Generate a poster announcing our launch, retro-futuristic, headline "NOW LIVE"
```

#### `blockrun_video`

Short AI video from a text prompt and optional seed image — `azure/sora-2`, `xai/grok-imagine-video`, `xai/grok-imagine-video-1.5`, and `bytedance/seedance-1.5-pro` / `2.0-mini` / `2.0-fast` / `2.0` / `2.5`. Async and client-polled (typically 60–180s, 9-minute hard cap); you are charged only when a finished video comes back.

#### `blockrun_realface`

Enroll a real person (phone liveness check) or an AI character as a `ta_xxxx` asset, then drive Seedance 2.0 / 2.0-fast / 2.0-mini video of that specific person via `blockrun_video real_face_asset_id`. Not supported on Seedance 2.5 or 1.5-pro. See [RealFace reference](../api-reference/realface.md).

#### `blockrun_music`

Generate a full-length (~3 minute) MP3 track. Async; payment settles only when a finished track is returned.

#### `blockrun_speech`

Text-to-speech (`speak`, default), cinematic `sound_effect` clips up to 22s, and a free `voices` list. Price is quoted before payment. See [Text-to-Speech reference](../api-reference/text-to-speech.md).

### Actions & compute

#### `blockrun_phone`

Phone-number intelligence (carrier, line type, SIM-swap and call-forwarding fraud signals), wallet-owned US/CA number leases, and outbound AI voice calls. See [Phone & Voice reference](../api-reference/voice-phone.md).

```
Call +14155551234 and ask if Tuesday at 7pm is available for a reservation for two.
```

#### `blockrun_modal`

Run isolated code in a BlockRun-hosted sandbox — a disposable remote container with optional GPU (T4 / L4 / A10G / A100 / H100). The `timeout` you ask for is the billed lifetime, charged up front and never refunded, so request what you need. See [Modal sandbox reference](../api-reference/modal-sandbox.md).

### Wallet

#### `blockrun_wallet`

USDC balance, wallet setup, card on-ramp, chain switching, and per-agent budget delegation.

**`action`** (default `status`):

| action | What it does | Extra params |
|--------|--------------|--------------|
| `status` | Both addresses + USDC balances, active chain, session spend | — |
| `setup` | Print address + funding QR (creates the wallet if missing) | — |
| `deposit` | Buy USDC with a card via a one-time Coinbase Onramp link (Base only) | — |
| `qr` | Open the funding QR in a viewer | — |
| `chain` | Switch active chain (omit `chain` to view current) | `chain:"base"` \| `"solana"` |
| `budget` | Set / check / clear a global session spend cap | `budget_action:"set"\|"check"\|"clear"`, `budget_amount` |
| `delegate` | Allocate a spend limit to a sub-agent | `agent_id`, `agent_limit` |
| `revoke` | Remove a sub-agent's budget | `agent_id` |
| `report` | Per-agent spending breakdown | — |

```
blockrun_wallet action:"status"
blockrun_wallet action:"budget" budget_action:"set" budget_amount:5.00
blockrun_wallet action:"delegate" agent_id:"researcher" agent_limit:2.00
```

Call this tool **first** whenever another `blockrun_*` tool returns a payment or balance error. Paid tools auto-open the card on-ramp when a call fails for lack of funds.

### Mode Routing

`mode` picks a model by intent in one hop. Each mode is an ordered list; the first entry is tried first and the rest are fallbacks.

| Mode | Tries first | Best For |
|------|-------------|----------|
| `fast` | `google/gemini-3.5-flash`, `google/gemini-2.5-flash`, `openai/gpt-5.6-luna` | Quick responses |
| `balanced` *(default)* | `openai/gpt-5.6-terra`, `anthropic/claude-sonnet-5`, `moonshot/kimi-k3` | General use |
| `powerful` | `anthropic/claude-opus-5`, `anthropic/claude-opus-4.8`, `openai/gpt-5.6-sol` | Complex tasks, 1M context |
| `cheap` | `deepseek/deepseek-v4-pro`, `qwen/qwen3.7-flash`, `minimax/minimax-m3` | Cost savings |
| `reasoning` | `anthropic/claude-opus-5`, `anthropic/claude-opus-4.8`, `openai/gpt-5.6-sol` | Logic and math |
| `free` | NVIDIA-hosted open models only | Development, zero-cost |
| `coding` | Coding-tuned models (`openai/gpt-5.3-codex`, `xai/grok-build-0.1`, `zai/glm-5.2`, …) | Code generation/review |
| `glm` | `zai/glm-5` / `5.2` / `5.1` / `5-turbo` | Strong general + coding at low token cost |

An explicit `model` always wins over `mode`. There is no prompt-aware "smart" router inside the MCP any more — that lived in the standalone [ClawRouter](../products/routing/clawrouter.md) proxy and was dropped from `blockrun_chat` because every caller here is already a frontier model reaching for something specific.

## Configuration

### Environment Variables

All optional. The wallet file is created for you; nothing here is required for a first call.

| Variable / File | Default | Effect |
|---|---|---|
| `~/.blockrun/.session` | auto-created on first run | EVM private key (`0600`). Also the Polymarket signer. |
| `~/.blockrun/.solana-session` | created by `action:"chain"` | Solana private key. |
| `~/.blockrun/.chain` | unset | Explicit chain preference, written only by `blockrun_wallet action:"chain"`. |
| `BLOCKRUN_WALLET_KEY` | unset | Env override of the EVM key — outranks the session file. |
| `SOLANA_WALLET_KEY` | unset | Env override of the Solana key. Set → pay on Solana (unless a stored `.chain` preference says `base`). |
| `BLOCKRUN_KEYCHAIN` | `auto` | `auto` mirrors the key into the OS keychain (macOS Keychain / Linux `secret-tool`) and keeps the file; `off` is file only; `strict` also deletes `~/.blockrun/.session` once the keychain read-back matches — this breaks other tools that read that file. |
| `BLOCKRUN_BUDGET_LIMIT` | unset | Default global session spend cap in USD (same as `action:"budget"`). |
| `BLOCKRUN_MCP_PROFILE` | `full` | Tool profile (`media` / `trading` / `research` / `chat`). |
| `BLOCKRUN_CONFIRM_SPEND` | off | `on` asks for confirmation before paid calls on clients that support MCP elicitation. `BLOCKRUN_CONFIRM_THRESHOLD` (USD) only confirms calls above that estimate. |
| `BLOCKRUN_INLINE_IMAGES` | off | `1` returns a small inline preview alongside the image URL (rich clients render it). |
| `POLYMARKET_MAX_BET_USD` | `25` | Hard per-order cap for `blockrun_polymarket`. `POLYMARKET_MAX_SESSION_USD` adds an optional session cap. |

Chain selection priority: `.chain` preference → `SOLANA_WALLET_KEY` → first-run auto-pin → `.solana-session` exists → otherwise Base. The full Polymarket variable list is in the [repo README](https://github.com/BlockRunAI/blockrun-mcp#configuration).

The server checks npm at startup and prints an `Update available` notice to stderr when a newer `@blockrun/mcp` exists — re-run the install command to upgrade.

### Claude Code Settings

View MCP configuration:

```bash
claude mcp list
```

Remove if needed:

```bash
claude mcp remove blockrun -s user
```

## Pricing

- **Intelligence:** Provider cost, no platform margin on chat tokens, plus $0.001 per request
- **Images:** $0.015-0.15 per image
- **Free tier:** `blockrun_chat mode:"free"`, `blockrun_dex`, crypto/FX/commodity `blockrun_price`, `blockrun_models`, `blockrun_polymarket_read`, and `blockrun_speech action:"voices"` cost $0
- **No subscriptions, no minimums**

See [Intelligence Pricing](../products/intelligence/pricing.md) for details.

## Security

| Aspect | How It's Protected |
|--------|-------------------|
| Private key | Stored locally at `~/.blockrun/.session` (`0600`), or in the OS keychain with `BLOCKRUN_KEYCHAIN=strict` |
| Payments | Only signatures sent, key never transmitted |
| Trading | Polymarket orders are EIP-712-signed locally, `confirm:true` required, per-order cap |
| Verification | All transactions viewable on Basescan / Solscan |
| Control | You control your wallet, withdraw anytime |

:::warning
Back up `~/.blockrun/.session`. It is the only key to both the payment wallet and the Polymarket deposit wallet.
:::

## Common Commands

```
# Check balance
blockrun_wallet

# Setup/view wallet + funding QR
blockrun_wallet action:"setup"

# Use a specific model
Use GPT-5.5 to analyze this

# Generate image
Create an image of [description]

# Get second opinion
Ask Claude Opus what it thinks about this approach

# Draft for free
blockrun_chat mode:"free" message:"..."
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

**`spawn npx ENOENT` / server won't connect:** reinstall with your shell PATH passed through (`-e PATH="$PATH"`, see [Installation](#installation)).

**Wallet not found:**
```
blockrun_wallet action:"setup"
```

**Insufficient balance / 402:**
```
blockrun_wallet
```

Fund your wallet on the active chain if needed.

## Links

- [GitHub: blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)
- [npm: @blockrun/mcp](https://www.npmjs.com/package/@blockrun/mcp)
- [Claude Code plugin: blockrun-claude-plugin](https://github.com/BlockRunAI/blockrun-claude-plugin)
- [Codex plugin: blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin)
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
