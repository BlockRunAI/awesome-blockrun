---
title: Introduction
description: BlockRun is economic infrastructure for the agent era — AI agents discover services, pay in USDC over x402, and execute autonomously with no API keys and no subscriptions.
---

# What is BlockRun?

**Agents that pay, spend, and trade.**

BlockRun is economic infrastructure for the agent era. AI agents discover services, pay in USDC over the [x402 protocol](x402/how-it-works.md), and execute autonomously — **no API keys, no subscriptions, no credit card.** One funded wallet unlocks 50+ LLMs, media generation, real-time data, and on-chain execution.

:::tip{title="In a hurry?"}
Jump to the [5-Minute Quickstart](getting-started/quickstart.md) and make your first paid call.
:::

## How it works

::::steps

:::step{title="Fund a wallet"}
BlockRun creates a non-custodial wallet on first run. Send a few dollars of USDC on **Base** (or **Solana**). Your private key never leaves your machine.
:::

:::step{title="Call any service"}
Ask for an LLM completion, an image, a market quote, a swap. Your client signs an x402 payment locally and the request settles in the same round-trip.
:::

:::step{title="Pay only for what you use"}
Each call costs a fraction of a cent — provider cost plus a small margin, with a $0.001 floor. No monthly bill, no seats, no minimums.
:::

::::

## Start building

Pick the path that matches how you work.

::::cards

:::card{title="I want an autonomous agent" href="products/franklin.md" icon="Rocket"}
Franklin — the AI agent with a wallet. Writes code and spends USDC across 55+ models and paid APIs. Free to start.
:::

:::card{title="I use Claude Code / Cursor" href="getting-started/quickstart.md" icon="Terminal"}
One MCP install adds 18 `blockrun_*` tools to your assistant. Best for Claude Code, Cursor, and other MCP clients.
:::

:::card{title="I'm building an agent / backend" href="getting-started/sdk-developers.md" icon="Code"}
Drop-in SDKs for Python, TypeScript, and Go — pay-per-call, OpenAI-compatible.
:::

:::card{title="Set up my wallet" href="getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana, switch chains, manage budgets, and understand how settlement works.
:::

::::

## Explore by capability

Four product families, one payment layer.

::::cards

:::card{title="Intelligence" href="products/intelligence/overview.md" icon="Brain"}
50+ LLMs (GPT, Claude, Gemini, DeepSeek, Grok, Kimi, Llama) through one OpenAI-compatible API. Pay per request.
:::

:::card{title="Routing" href="products/routing/clawrouter.md" icon="Route"}
ClawRouter scores each prompt and picks the cheapest model that can handle it — up to **78% lower** LLM cost.
:::

:::card{title="Creation" href="products/creation/nano-banana.md" icon="Image"}
Image, video (Sora 2, Seedance), music, and voice generation via micropayments. No API keys.
:::

:::card{title="Trading" href="products/trading/overview.md" icon="TrendingUp"}
Technical analysis, DEX data, sentiment, and 0x swaps with hardcoded risk guardrails. Your AI becomes a trader.
:::

::::

## Why x402?

The [x402 protocol](x402/how-it-works.md) puts payment directly into HTTP. Your agent requests a service, receives `HTTP 402 Payment Required` with a price, signs a USDC authorization locally, and gets the response with payment settled on-chain — all in one round-trip.

:::note
No API keys to rotate, no subscriptions to cancel, no per-provider signups. Just USDC and a wallet you control.
:::

## Links

- **Website:** [blockrun.ai](https://blockrun.ai)
- **GitHub:** [github.com/BlockRunAI](https://github.com/BlockRunAI)
- **x402 Services:** [live service directory](https://blockrun.ai/ecosystem/services)
