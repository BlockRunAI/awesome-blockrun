---
title: Franklin Agent
description: Franklin is the AI agent with a wallet — it writes code and spends USDC autonomously across 55+ models and paid APIs, settling per outcome over x402. No subscriptions, no API keys.
---

# Franklin Agent

**The AI agent with a wallet.** Other coding agents write code; Franklin writes code *and spends money to get the job done* — picking the best model per task, buying data, generating media, paying for search, all autonomously from one USDC wallet.

**Source:** [github.com/BlockRunAI/Franklin](https://github.com/BlockRunAI/Franklin) · [npm: @blockrun/franklin](https://www.npmjs.com/package/@blockrun/franklin) · Apache-2.0

:::tip{title="YOPO — You Only Pay Outcome"}
Not a subscription (pay for access), not generic pay-per-call (pay for trying). You set an outcome and a budget; Franklin decides what to call, what to pay for, and when to stop. Provider cost + 5%, settled per action in USDC — no monthly fees, no rate limits.
:::

## Quick start

::::steps

:::step{title="Install"}
Requires Node.js 20.19+ (Node 22 LTS recommended).

```bash
npm install -g @blockrun/franklin
```
:::

:::step{title="Run — free out of the box"}
Franklin starts on free NVIDIA models (Nemotron, Qwen3 Coder), no wallet needed.

```bash
franklin
```
:::

:::step{title="Fund a wallet to unlock everything"}
Add USDC to unlock Claude, GPT, Gemini, Grok, and every paid API (trading data, image/video, web search).

```bash
franklin setup base      # or: franklin setup solana
franklin balance         # show address + USDC balance
```
:::

::::

No install? Run it directly with `npx @blockrun/franklin`.

## How Franklin fits

Franklin is the autonomous agent on top of the BlockRun stack — it uses the same pieces you can use directly:

- **Models & routing** — picks the best model per task via [ClawRouter](routing/clawrouter.md)'s scoring, across 55+ providers.
- **Paid APIs** — search, market data, media, RPC, and more, paid per call over [x402](../x402/how-it-works.md).
- **One wallet** — the wallet is the identity; fund it on Base or Solana ([Wallet Setup](../getting-started/wallet-setup.md)).

## What's next?

::::cards

:::card{title="ClawRouter" href="routing/clawrouter.md" icon="Route"}
The router Franklin uses — 14-dimension scoring picks the cheapest capable model.
:::

:::card{title="BlockRun MCP" href="../mcp/blockrun-mcp.md" icon="Terminal"}
Prefer Claude Code / Cursor? Get the same tools as MCP commands.
:::

:::card{title="Wallet Setup" href="../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana and set budgets for autonomous spend.
:::

::::
