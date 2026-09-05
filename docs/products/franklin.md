---
title: Franklin Agent
description: Franklin is the AI agent with a wallet — it writes code and spends USDC autonomously across 76 models and paid APIs, settling per outcome over x402. No subscriptions, no API keys.
---

# Franklin Agent

**The AI agent with a wallet.** Other coding agents write code; Franklin writes code *and spends money to get the job done* — picking the best model per task, buying data, generating media, paying for search, proposing trades you approve, all autonomously from one USDC wallet.

**Source:** [github.com/BlockRunAI/Franklin](https://github.com/BlockRunAI/Franklin) · [npm: @blockrun/franklin](https://www.npmjs.com/package/@blockrun/franklin) · Apache-2.0 · current release **3.42.2** (2026-08-29)

:::tip{title="YOPO — You Only Pay Outcome"}
Not a subscription (pay for access), not generic pay-per-call (pay for trying). You set an outcome and a budget; Franklin decides what to call, what to pay for, and when to stop. Provider rates plus a flat $0.001 per request (no margin on chat tokens; media generation and Live Search carry 5%), settled per action in USDC — no monthly fees, no rate limits, and no overdraft: when the wallet is empty, Franklin stops.
:::

## Quick start

::::steps

:::step{title="Install"}
Requires Node.js 20.19+ (Node 22 LTS recommended). Older Node crashes at startup with `ERR_REQUIRE_ESM`.

```bash
npm install -g @blockrun/franklin
franklin --version
```
:::

:::step{title="Run — free out of the box"}
Franklin starts on the free tier (5 reasoning, coding, and vision models), no wallet needed.

```bash
franklin
```
:::

:::step{title="Fund a wallet to unlock everything"}
Add USDC to unlock Claude, GPT, Gemini, Grok, and every paid API (market data, image/video/music, web search, prediction markets, RPC). Since 3.41.0 a fresh install defaults to **Solana**; pass `base` to create a Base wallet instead.

```bash
franklin setup           # Solana wallet (default)
franklin setup base      # or: a Base wallet
franklin balance         # show address + USDC balance
```

You can also buy USDC with a card from inside Franklin — the onramp link targets whichever chain your wallet is on. Switch chains any time with `franklin solana` or `franklin base`; an existing Base wallet stays on Base until you choose otherwise.
:::

::::

No install? Run it directly with `npx @blockrun/franklin`. If a global install fails with `EACCES`, don't use `sudo` — use `npx`, or install Node through `nvm`/`fnm` so global packages live in your home directory.

## What Franklin can do

Franklin is chat-first: you state an outcome, and it decides what to read, search, fetch, call, and pay for. Every tool call is itemized and priced; run `/cost` any time to see where the USDC went.

| Area | Built-in tools |
|---|---|
| Code & files | `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `Task` (sub-agents), detached background tasks (`franklin task`) |
| Research | `WebSearch`, `WebFetch`, Exa neural search / answer / read-URLs, `MemoryRecall` |
| Trading & markets | `TradingSignal`, `TradingMarket`, paper-trading portfolio (`TradingPortfolio` / `TradingOpenPosition` / `TradingClosePosition` / `TradingHistory`), `TradePlan`, DEX quotes on Solana (Jupiter) and Base (0x), `PolymarketBet`, `PredictionMarket`, DeFi protocol / chain / yield / price lookups, `MultiChainRPC` (read-only, 40 chains), `Wallet` — see [Trading](trading/overview.md) |
| Media | `ImageGen`, `VideoGen`, `MusicGen`, `RealFace` avatars, a content library (`franklin content`) |
| Social & comms | `SearchX`, `PostToX`, `BrowserX`, phone numbers + voice calls, webhooks |
| Compute | GPU sandbox (`ModalCreate` / `ModalExec` / `ModalStatus` / `ModalTerminate`) |
| Autonomy | `Monitor` (watch long-running commands), `Scheduler` (durable `/loop`), `UpdateGoal` (`/goal` mode), lifecycle hooks |
| Extensibility | MCP servers (auto-discovered, `/mcp`), Plugin SDK, skills (`franklin skills`), paid skills from the BlockRun agent marketplace |

Every paid call goes through the BlockRun gateway over x402 — Franklin never holds an API key for any provider.

## Guardrails on money

Autonomy over a wallet needs architecture, not vibes. Every spending path in Franklin has a hard bound and an off switch:

- **The wallet balance is the hard limit.** `--max-spend <usd>` adds a per-session cap on gateway spend; the session stops when it's exceeded.
- **Real-money trades need an approved plan.** Before any swap or prediction-market order, Franklin proposes a `TradePlan` (venue, asset, size, slippage, stop condition, rationale, total spend). Nothing executes until you approve; approved budgets draw down per trade and expire after 15 minutes. This holds in every permission mode, `--trust` included. Headless runs fail closed unless you pass `--approve-trades`, and even then the plan must fit inside what's left of `--max-spend`.
- **Lifecycle hooks veto before money moves.** Drop JSON hooks in `~/.blockrun/hooks/`; `PreSpend` fires for any money-moving tool with the estimated USD on stdin and can deny it. Examples ship for a daily spend cap, a token blacklist, and a spend ledger.
- **Every approval and denial is recorded** in `~/.blockrun/approvals.jsonl`.

Details in [Risk Management](trading/risk-management.md).

## CLI reference

```bash
franklin                       # interactive session (default chain)
franklin solana | franklin base  # start on a specific chain (and remember it)
franklin -p "prompt"           # one-shot, non-interactive (add --approve-trades to allow plans within --max-spend)
franklin --max-spend 5         # hard USD cap on this session's spend
franklin --trust               # skip permission prompts for tools (trade plans still require approval)
franklin --model <id>          # pin a model; or a router profile: auto | eco | premium | free
franklin -c / -r [id]          # continue the last session / resume by id
franklin --from claude|codex   # start from another agent's session context

franklin setup [base|solana]   # create a wallet
franklin balance               # address + USDC balance
franklin models                # model catalog
franklin doctor                # health check: node, wallet, chain, gateway, MCP, telemetry
franklin insights / stats / search <q>   # cost analytics, usage stats, full-text session search
franklin predict -m <model> -q "<question>"  # headless forecast with a research-only toolset
franklin proxy / init / daemon # payment proxy for Anthropic-compatible CLIs (port 8402)
franklin telegram / slack      # remote control from chat (owner-locked)
franklin serve / panel         # local agent server + browser mission control (many agents, remote approvals)
franklin skills / plugins / mcp / migrate / task / content
```

Inside a session: `/model`, `/plan` / `/execute`, `/ultrathink`, `/compact`, `/cost`, `/goal <objective>` (autonomous goal with adversarially verified completion), `/loop <interval> <prompt>`, `/remember` / `/flush` / `/dream` (memory), `/session-search`, `/mcp`, `/insights`, `/help`.

## Surfaces

- **CLI** — the reference surface, above.
- **Franklin Desktop (beta)** — native macOS and Windows workspace built on the same runtime, wallet, tools, and session history as the CLI (visual chat, history, gallery, wallet, tools, skills, and CLI panels). Local-first: it works in `Documents/Franklin` and asks before touching files outside the workspace or running shell commands. Beta builds are unsigned test installers — macOS Apple-silicon `.dmg` pre-releases on the [Franklin releases page](https://github.com/BlockRunAI/Franklin/releases), Windows x64 `.exe` from Desktop CI; signed downloads and auto-update are not live yet. Source lives in `apps/desktop` of the Franklin repo.
- **Franklin for VS Code** — [marketplace extension](https://marketplace.visualstudio.com/items?itemName=blockrun.franklin-vscode) (publisher `blockrun`): chat panel, model picker, wallet balance, image/video generation, inline diff cards. Shares `~/.blockrun/` config and sessions with the CLI.
- **Telegram / Slack** — `franklin telegram` (set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OWNER_ID`) or `franklin slack` on an always-on machine; sessions resume across restarts.
- **Mission control** — `franklin serve` + `franklin panel`: dispatch one agent per strategy or market, watch them stream, and approve their trade plans and permission requests from one browser page.

## How Franklin fits

Franklin is the autonomous agent on top of the BlockRun stack — it uses the same pieces you can use directly:

- **Models & routing** — picks the best model per task via [ClawRouter](routing/clawrouter.md)'s scoring, across 76 chat models. Four profiles: `auto`, `eco`, `premium`, `free`.
- **Paid APIs** — search, market data, media, RPC, prediction markets and more, paid per call over [x402](../x402/how-it-works.md).
- **One wallet** — the wallet is the identity; fund it on Solana or Base ([Wallet Setup](../getting-started/wallet-setup.md)).

## What's next?

::::cards

:::card{title="Trading with Franklin" href="trading/overview.md" icon="TrendingUp"}
Signals, paper trading, prediction markets, and the trade-plan gate that protects real money.
:::

:::card{title="ClawRouter" href="routing/clawrouter.md" icon="Route"}
The router Franklin uses — 15-dimension scoring plus portfolio ranking picks the cheapest capable model.
:::

:::card{title="BlockRun MCP" href="../mcp/blockrun-mcp.md" icon="Terminal"}
Prefer Claude Code / Cursor? Get the same tools as MCP commands.
:::

:::card{title="Wallet Setup" href="../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Solana or Base and set budgets for autonomous spend.
:::

::::
