---
title: 5-Minute Quickstart
description: Install BlockRun, fund a wallet with USDC, and make your first paid call in under five minutes — via Claude Code MCP or the Python/TypeScript SDKs.
---

# 5-Minute Quickstart

Make your first paid AI call in under five minutes. No API keys, no subscription — just a wallet with a few dollars of USDC.

:::note{title="What you need"}
A terminal, and ~$5 of USDC on **Base** (or Solana). Don't have USDC yet? Any Coinbase account can withdraw it directly to Base — Step 2 shows the address.
:::

## Pick your surface

::::tabs

:::tab{label="Claude Code (MCP)"}
Best for Claude Code, Cursor, and other MCP clients — natural-language access to all 18 tools.

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```
:::

:::tab{label="Python SDK"}
Best for backends and autonomous agents.

```bash
pip install blockrun-llm
```
:::

:::tab{label="TypeScript SDK"}
Best for Node apps and agent frameworks.

```bash
npm install @blockrun/llm
```
:::

::::

## Set up and make your first call

::::steps

:::step{title="Create a wallet"}
A non-custodial wallet is created automatically on first run. In Claude Code, just ask for your wallet, or run the SDK once.

```
blockrun_wallet action:"setup"
```

This prints your address and opens a funding QR code. The private key is stored locally at `~/.blockrun/.session` and never leaves your machine.
:::

:::step{title="Fund it with USDC"}
Send **$5 USDC on Base** to the address from Step 1 — withdraw from Coinbase (pick the **Base** network) or bridge via [bridge.base.org](https://bridge.base.org).

Prefer Solana? Run `blockrun_wallet action:"chain" chain:"solana"` then `action:"setup"` for a Solana funding address — see [Wallet Setup](wallet-setup.md).
:::

:::step{title="Make a paid call"}
Ask your assistant — or call the SDK — and the payment settles automatically.

```
Use blockrun_chat to ask gpt-5.5: write a haiku about micropayments
```

```python
from blockrun_llm import LLMClient
client = LLMClient()
print(client.chat("openai/gpt-5.5", "Write a haiku about micropayments."))
```
:::

:::step{title="Check your balance"}
Confirm the charge — each call costs a fraction of a cent.

```
blockrun_wallet action:"status"
```
:::

::::

:::warning
If a call returns `402 Payment Required` after retrying, your wallet is empty or on the wrong chain. Run `blockrun_wallet action:"setup"` and confirm you funded the **active** chain.
:::

## What's next?

::::cards

:::card{title="Browse all tools" href="../mcp/blockrun-mcp.md" icon="Boxes"}
The full list of 18 `blockrun_*` tools — chat, image, video, search, markets, RPC, and more.
:::

:::card{title="Explore the models" href="../products/intelligence/overview.md" icon="Brain"}
50+ LLMs with live pricing, plus smart routing to cut costs automatically.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
