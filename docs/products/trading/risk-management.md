---
title: Risk Management
description: Franklin layers five money guardrails — a hard wallet/session cap, paper-trading exposure caps, a mandatory trade-plan approval for real money, per-order bet caps, and your own veto hooks.
---

# Risk Management

Franklin treats money differently from file edits. A `--trust` session can skip permission prompts for tools, but it can never skip the gate on real money. The guardrails below are layered; every one has a hard bound, and the ones you can loosen require an explicit flag or environment variable, never a prompt.

:::danger{title="Prompts cannot open the gate"}
The trade-plan gate and the exposure caps live in code, not in a system prompt. Asking Franklin to "ignore the risk limits" or "skip the plan for this one trade" does nothing — the tool refuses to execute without an approved plan, in every permission mode.
:::

## The five layers

| Layer | What it bounds | Value (Franklin 3.42.0) | Adjustable? |
|-------|----------------|-------------------------|-------------|
| **Wallet + session cap** | Total gateway spend | Wallet balance is the hard limit; `--max-spend <usd>` caps a session | Flag |
| **Paper-trading caps** | Simulated positions | $400 per position · $900 total exposure · cash sufficiency · $1,000 starting bankroll | No (code defaults) |
| **Trade-plan gate** | Every real-money trade | Approval required; plan expires after 15 minutes; budget draws down per trade | No — approval is always required |
| **Polymarket caps** | Bet sizes | $25 per order by default; optional cumulative session cap | `POLYMARKET_MAX_BET_USD`, `POLYMARKET_MAX_SESSION_USD` |
| **Lifecycle hooks** | Anything you define | Your command decides; `PreSpend` can veto with the estimated USD | Your JSON in `~/.blockrun/hooks/` |

## How Enforcement Works

### Paper trades

Every `TradingOpenPosition` goes through the risk engine before a simulated fill:

```
1. Franklin wants to buy $500 of ETH (paper)
2. RiskEngine checks:
   - Is there enough paper cash for the order?
   - Would ETH's projected position exceed the $400 per-position cap?
   - Would total exposure (other positions at cost + this one) exceed $900?
3. Any check fails → order blocked with the reason; the agent can retry smaller
4. All pass → simulated fill at the live price, 10 bps fee, portfolio saved
```

Sells of an existing position always pass — exit orders bypass the exposure caps so a cap can never trap the agent in a losing position. Selling more than you hold is rejected by the portfolio itself.

### Real money

Real-money tools — Polymarket orders and, when re-enabled, the Jupiter / 0x swaps — refuse to run without an approved `TradePlan`:

```
1. Franklin proposes a plan: venue, asset, size, slippage, stop condition,
   rationale, total spend
2. The proposal blocks until you decide — in the terminal, in Franklin Desktop,
   or from the mission-control panel
3. Approved → the plan's budget draws down as trades execute, and expires
   after 15 minutes
4. Rejected or expired → nothing executes; revise and re-propose
5. Every decision is appended to ~/.blockrun/approvals.jsonl
```

Headless runs (`franklin -p ...`) have no approval surface, so they fail closed: every plan is rejected unless you pass `--approve-trades`, and even then the plan must fit inside what is left of `--max-spend`.

Polymarket adds its own layer inside the tool: every placement is a dry-run preview unless `confirm:true`, a confirmed placement is shown to you before signing (bypass only via `auto_approve` / `FRANKLIN_POLYMARKET_AUTO_APPROVE=1`), and orders are capped per order and optionally per session.

### Your own hooks

Drop a JSON hook (and its script) in `~/.blockrun/hooks/`, or in `<repo>/.franklin/hooks/` for a trusted project. Eight lifecycle events; two are blocking:

| Event | Blocking | Fires |
|---|---|---|
| `PreToolUse` | yes | before any tool executes (`matcher` regex on the tool name) |
| `PreSpend` | yes | before a tool that moves real money, with `spend: {estimatedUsd, tool, params}` on stdin |
| `PostSpend` | no | after a successful spend |
| `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`, `SessionEnd` | no | lifecycle |

Exit `2` or print `{"decision":"deny","reason":"..."}` to block. A hook that crashes or times out (5s default) fails **open** — only an explicit deny blocks. Every deny is recorded in `~/.blockrun/approvals.jsonl`; disable all hooks with `FRANKLIN_HOOKS=0`.

Franklin ships three examples: a **daily spend cap** (`PreSpend`), a **token blacklist** (`PreToolUse` on swap tools), and a **session spend ledger** (`PostSpend`).

## Example Scenarios

### Scenario 1: Paper per-position cap

```
Paper cash: $1,000
Current ETH: $300
Requested: buy $150 more ETH

Check: projected ETH $450 > $400 per-position cap
Result: BLOCKED — "Exceeds per-position cap: projected $450.00 > cap $400.00"
```

### Scenario 2: Paper total exposure

```
Open: BTC $400, SOL $350 (at cost)
Requested: buy $200 ETH

Check: projected total $950 > $900 exposure cap
Result: BLOCKED — "Exceeds total exposure cap"
```

### Scenario 3: Exit is always allowed

```
Open: BTC $400 (down 6%)
Requested: sell all BTC

Check: existing position → exposure caps skipped
Result: FILLED
```

### Scenario 4: Real-money plan in a scripted run

```
franklin -p "buy $20 of YES on the rate-cut market" --max-spend 1

TradePlan propose → no approval surface, --approve-trades not set
Result: REJECTED — recorded in ~/.blockrun/approvals.jsonl
```

### Scenario 5: Approved plan

```
Plan: polymarket · bet · "Fed cuts in September" YES · $20 · stop: exit if price < 0.35
You: approve
PolymarketBet buy (confirm:true) → within $25 per-order cap → preview → signed
Remaining plan budget: $0 · plan expires in 15 minutes
```

## Why These Limits?

### $400 / $900 paper caps

Two-and-a-half fully loaded positions and a 10% cash buffer on a $1,000 paper bankroll. Concentration is bounded, and the agent learns to size before it ever touches real funds.

### Approval, not autonomy, for real money

A signed micropayment for a model call is cheap and reversible in effect; a swap or a bet is not. The plan makes the agent write down venue, size, slippage, stop, and rationale before it asks — so what you approve is a thesis, not a button.

### 15-minute expiry

Markets move. An approval given for one price should not be spendable an hour later.

### Fail closed headless, fail open hooks

A scripted run with nobody watching must not trade unless you explicitly said so. A guardrail script that crashes must not silently freeze the agent — so hooks fail open and log, and only an explicit deny blocks.

## What You Cannot Do

❌ "Skip the plan and just buy" → real-money tools refuse without an approved `TradePlan`

❌ "Ignore the exposure caps" → the paper risk engine is code, not a prompt

❌ "Approve it yourself" in `--trust` mode → trade plans always prompt, even with `--trust`

❌ Trade from a `-p` script without `--approve-trades` → every plan is rejected

## What You Can Do

✅ Paper-trade freely within the caps

✅ Approve, revise, or reject each real-money plan — from the terminal, Desktop, or the panel

✅ Cap a session with `--max-spend`, and cap bets with `POLYMARKET_MAX_BET_USD` / `POLYMARKET_MAX_SESSION_USD`

✅ Add your own vetoes with `PreSpend` / `PreToolUse` hooks

## Viewing Current Risk Status

```
What's my current exposure?
```

`TradingPortfolio` shows cash, each position with unrealized P&L, total exposure against the $900 cap, and the journal-discipline trend. `TradePlan status` shows the active plan and its remaining budget.

## Best Practices

1. **Start on paper** — the paper engine uses live prices, so the P&L is real even if the money isn't
2. **Set `--max-spend`** on every session that can reach real-money tools
3. **Write the hook you wish you had** — a daily cap and a token blacklist take five minutes
4. **Read the journal** — `TradingHistory` and the wallet-keyed journal tell you whether your theses hold up

## Current limitations

- Paper-trading caps ($400 / $900 / $1,000) are code defaults, not user-configurable
- Live DEX execution (`JupiterSwap`, `Base0xSwap`, `Base0xGaslessSwap`) is paused in 3.42.0 pending complete local transaction validation; quotes work, and the tools stay behind `TradePlan` when they return
- Trade plans initiated from surfaces without an approval UI are rejected by the gate

## What's next?

::::cards

:::card{title="Tools reference" href="tools.md" icon="Boxes"}
See how `TradePlan` and the risk engine gate each tool.
:::

:::card{title="Setup" href="installation.md" icon="Terminal"}
Get Franklin running with a funded wallet.
:::

:::card{title="Overview" href="overview.md" icon="Book"}
What Franklin's trading surface does and how it trades.
:::

::::
