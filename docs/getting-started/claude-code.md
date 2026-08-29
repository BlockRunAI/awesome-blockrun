---
title: Claude Code Users
description: Install BlockRun MCP in Claude Code, fund a wallet with USDC on Base or Solana, and give your agent 71 models, images, and live data.
---

# Claude Code Users

Get started with BlockRun in 60 seconds. Give your Claude agent superpowers.

:::tip{title="In a hurry?"}
The whole setup is three steps below — install, fund, go. No API keys, no subscription, no signup: the wallet is created for you on first run.
:::

## Install, fund, and go

::::steps

:::step{title="Install the MCP"}
```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

That's it. Restart Claude Code and the MCP server is available. Needs Node.js ≥ 20.19.

Homebrew or nvm user and the server won't connect? Pass your shell PATH through: `claude mcp add blockrun -s user -e PATH="$PATH" -- npx -y @blockrun/mcp@latest`.
:::

:::step{title="See your wallet"}
A wallet was created automatically at `~/.blockrun/.session` when the server first started. In Claude Code, say:

```
Set up my BlockRun wallet
```

Claude calls `blockrun_wallet action:"setup"` and will:
1. Show you your wallet address (creating one if it's somehow missing)
2. Print a funding QR code
3. Explain how to fund it
:::

:::step{title="Fund your wallet"}
Send USDC to your wallet address on **Base network**:

- **Recommended:** $5-20 for regular usage
- **Minimum:** $1 to get started

Get USDC on Base:
- [Coinbase](https://coinbase.com) - Send → USDC → Base network → paste address
- [Base Bridge](https://bridge.base.org) - bridge from Ethereum
- [Uniswap](https://app.uniswap.org) - swap on Base
- **Card:** ask Claude to run `blockrun_wallet action:"deposit"` — it opens a one-time Coinbase Onramp link that settles into your own wallet
:::

::::

### Prefer Solana?

The MCP holds a Solana wallet too. Switch with two tool calls — no env vars, no file editing, no restart:

```
blockrun_wallet action:"chain" chain:"solana"
blockrun_wallet action:"setup"
```

Then send USDC (SPL) on the **Solana** network (Coinbase → pick "Solana", or Phantom/Solflare/Backpack). Switch back with `blockrun_wallet action:"chain" chain:"base"`.

:::info
Music, speech, video, the Modal sandbox, DeFi data, paid RealFace, paid stock prices, and native Anthropic (`claude-*`) settle on Base only. Image generation pays on either chain.
:::

## What You Can Do Now

### Try it for free first

```
blockrun_chat mode:"free" message:"Draft a commit message for this diff"
```

The free tier costs $0 and needs no funded wallet — a good smoke test before you send USDC. DEX data, crypto/FX/commodity prices, and the model list are free too.

### Access Other AI Models

```
Use GPT-5.5 to get a second opinion on this code
```

```
Ask Kimi K3 to review this function
```

Claude routes to the model you name — or picks one by intent with `mode:"fast"` / `"balanced"` / `"powerful"` / `"cheap"` / `"reasoning"` / `"coding"` / `"glm"` — and pays via x402. Run `blockrun_models` for the live list with pricing.

### Image Generation

```
Generate a logo for a crypto trading bot
```

Claude calls `blockrun_image` — models include `google/nano-banana`, `google/nano-banana-pro`, `openai/gpt-image-2`, `xai/grok-imagine-image`, `zai/cogview-4`, and `bytedance/seedream-5-pro`; edits (img2img, inpaint, fusion) too. ~$0.015-0.15 per image. Install the `image-prompting` skill for text-accurate prompts (see [Skills](../mcp/skills.md)).

### Video, Music, and Speech

```
Generate a 5-second video of a sunset over Tokyo
Compose a 60-second lo-fi hip-hop loop
Speak this paragraph with the sarah voice
```

`blockrun_video` and `blockrun_music` are async and payment-on-completion — if a job fails or times out you are not charged.

### Live Web and X Search

```
What are people saying about @sama on X right now?
Find me the top 5 papers on speculative decoding from the last 90 days
```

`blockrun_search` covers live web, X/Twitter, and news with citations; `blockrun_exa` does neural research, cited answers, and page reading.

### Prediction Markets — read and trade

```
What's Polymarket saying about the next Fed decision?
If "hold" is above 70%, put $2 on it
```

`blockrun_markets` reads odds across Polymarket, Kalshi and more. `blockrun_polymarket` places real, USDC-settled orders from a gasless deposit wallet — every order requires your explicit confirmation and is capped per order (default $25). See [Polymarket funding](../api-reference/polymarket-funding.md).

### Crypto and On-chain Data

```
What's this wallet labeled, and what does it hold?
Top 10 tokens by DEX volume on Base, last 24h
Call eth_getBalance on Arbitrum for 0x...
```

`blockrun_surf` (exchange, on-chain SQL, wallet labels, social mindshare), `blockrun_price` (Pyth-backed quotes), `blockrun_dex`, `blockrun_defi` (TVL, yields), and `blockrun_rpc` (raw JSON-RPC on 40+ chains). The `crypto-data` skill says which one to use.

### Phone Calls and Sandboxed Compute

```
Call +1-415-555-0100 and confirm Friday at 3pm
Run this benchmark on an H100 in a disposable sandbox
```

`blockrun_phone` makes outbound AI voice calls and leases US/CA numbers to your wallet; `blockrun_modal` runs code in an isolated container with optional GPU.

### Trading (alpha-mcp)

For strategy-driven crypto trading, install the separate trading MCP:

```bash
claude mcp add alpha -s user -- npx -y @blockrun/alpha@latest
```

Then:

```
Analyze BTC/USDC for trading signals
```

See [Trading Overview](../products/trading/overview.md) for full details.

## Check Your Balance

```
blockrun_wallet
```

or

```
What's my BlockRun wallet balance?
```

Shows both wallet addresses, USDC balances, the active chain, and what this session has spent.

## Spend Controls

- **Session cap:** `blockrun_wallet action:"budget" budget_action:"set" budget_amount:5.00` (or `BLOCKRUN_BUDGET_LIMIT=5` in the environment)
- **Sub-agent budgets:** `blockrun_wallet action:"delegate" agent_id:"researcher" agent_limit:2.00`, then pass `agent_id:"researcher"` on every downstream call — the agent is hard-stopped at zero
- **Confirm before every paid call:** install the `blockrun-media` plugin, which adds a spend-confirmation prompt, a per-call receipt, and a status-line balance meter:

```
/plugin marketplace add BlockRunAI/blockrun-claude-plugin
/plugin install blockrun-media@blockrun
```

Codex users get the same via [blockrun-codex-plugin](https://github.com/BlockRunAI/blockrun-codex-plugin).

## Available Skills

BlockRun ships prompt-based skills that teach Claude how to use each tool family. Add the marketplace once, then install what you need:

```
/plugin marketplace add BlockRunAI/blockrun-mcp
/plugin install blockrun@blockrun-mcp
```

| Skill | What It Does |
|-------|-------------|
| `blockrun` | Start here — which tool answers what, and how to make a first call free |
| `image-prompting` | Turns a vague image request into a text-accurate prompt |
| `search`, `exa-research` | Live search and cited research workflows |
| `crypto-data`, `surf`, `rpc` | Routes crypto questions to the right (often free) tool |
| `prediction-markets`, `polymarket-trading` | Read odds, then place confirm-gated bets |
| `phone`, `modal` | Voice calls and sandboxed compute |

Full list in [Skills](../mcp/skills.md). [alpha-mcp](../products/trading/overview.md) is a separate MCP server, installed with `claude mcp add`.

## Pricing

- **Intelligence:** Provider cost, no platform margin on chat tokens, plus $0.001 per request (no subscriptions)
- **Images:** $0.015-0.15 per image
- **Free tier:** `mode:"free"` chat, DEX data, crypto/FX/commodity prices, model list, Polymarket reads — $0
- **Trading tools:** Free (open source)

$1 gets you approximately:
- ~500 GPT-5.4 calls
- ~10,000 DeepSeek calls
- ~20–65 image generations

## Security

- Your private key stays on your machine (`~/.blockrun/.session`, mode `0600`; optionally the OS keychain with `BLOCKRUN_KEYCHAIN=strict`)
- Only cryptographic signatures are sent to servers
- All payments are verifiable on [Basescan](https://basescan.org) (or Solscan on Solana)
- You control your wallet — withdraw anytime
- Back up `~/.blockrun/.session`: it is the only key to both the payment wallet and the Polymarket deposit wallet

## Troubleshooting

### MCP not loading?

Restart Claude Code after installation:

```bash
# Check if MCP is registered
claude mcp list
```

`spawn npx ENOENT`? Reinstall with `-e PATH="$PATH"` (see step 1).

### Wallet not found?

```bash
# Check wallet location
ls -la ~/.blockrun/
```

Then `blockrun_wallet action:"setup"` to (re)create and print the address.

### Transaction failed / 402?

Check your USDC balance on the active chain:
```
blockrun_wallet
```

For more help, see [MCP Troubleshooting](../mcp/troubleshooting.md).

## What's next?

::::cards

:::card{title="Browse the MCP tools" href="../mcp/blockrun-mcp.md" icon="Boxes"}
The full list of 20 `blockrun_*` tools — chat, image, video, search, markets, Polymarket trading, RPC, and more.
:::

:::card{title="Generate images" href="../products/creation/nano-banana.md" icon="Image"}
Create images via micropayments with `blockrun_image`.
:::

:::card{title="Explore all models" href="../products/intelligence/overview.md" icon="Brain"}
71 LLMs with live pricing, plus smart routing to cut costs automatically.
:::

::::
