---
title: Skills
description: BlockRun skills extend Claude Code with prompt-based workflows — install, invoke, and author skills that teach Claude how to use BlockRun tools.
---

# Skills

Skills extend what Claude Code can do. They're like plugins that add specific capabilities.

:::note
A **skill** teaches Claude *how* to do a task; an **MCP server** gives Claude the *tools* to call. They work together — the `image-prompting` skill turns "make me a cool poster" into a text-accurate prompt, then hands it to the BlockRun MCP's `blockrun_image` tool.
:::

## Available Skills

Every skill ships inside the [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp) repo and is published through its Claude Code plugin marketplace. Add the marketplace once, then install whichever you need:

```
/plugin marketplace add BlockRunAI/blockrun-mcp
/plugin install blockrun@blockrun-mcp
```

| Skill | Use when | Tools it drives |
|-------|----------|-----------------|
| `blockrun` | **Start here.** Which tool answers a question, how the wallet works, how to make a first call for free. | all |
| `search` | Real-time web or news results with citations — "what just happened" questions. | `blockrun_search` |
| `exa-research` | Researching products, papers, competitors, reading pages, cited answers. | `blockrun_exa` |
| `crypto-data` | Any crypto data question — prices, FX, OHLC, DEX pairs, TVL, on-chain SQL, wallet labels. Says which of the five overlapping tools to use and which are free. | `blockrun_price` `blockrun_dex` `blockrun_defi` `blockrun_surf` `blockrun_rpc` |
| `surf` | Deep crypto data — on-chain SQL, CEX order books, wallet net worth, social mindshare, news. | `blockrun_surf` |
| `rpc` | Raw blockchain JSON-RPC — contract reads, balances, blocks, logs, gas — across 40 chains. | `blockrun_rpc` |
| `prediction-markets` | Event probabilities, Polymarket / Kalshi odds, finding markets on a topic. | `blockrun_markets` |
| `polymarket-trading` | Actually placing, managing, or redeeming real bets — setup, funding, confirm-gated orders. | `blockrun_polymarket` `blockrun_polymarket_read` |
| `signal-to-trade-demo` | A presentation-ready live signal (price, probability history, smart money, liquidity) ending in a safe order preview. | `blockrun_markets` `blockrun_polymarket_read` |
| `image-prompting` | Generating or editing images — structured, text-accurate prompts. | `blockrun_image` |
| `phone` | Number intelligence (carrier, SIM-swap, call-forwarding), US/CA number leases, outbound AI calls. | `blockrun_phone` |
| `modal` | Running code in a disposable remote container, optional GPU. | `blockrun_modal` |
| `gentech-blockrun` | GenTech Labs' daily-usage and multi-tool pipeline patterns from Hermes Agent. | all |

Install any of them the same way: `/plugin install <skill>@blockrun-mcp`, e.g. `/plugin install polymarket-trading@blockrun-mcp`. The same commands work from the shell as `claude plugin marketplace add BlockRunAI/blockrun-mcp` and `claude plugin install <skill>@blockrun-mcp`.

:::info{title="Trading"}
[Trading](../products/trading/overview.md) — signals, paper trading, Polymarket bets, and a trade-plan gate for real money — is built into the Franklin agent rather than shipped as a skill or a separate MCP server. See [Trading installation](../products/trading/installation.md).
:::

## What Are Skills?

Skills are prompt-based extensions that teach Claude new workflows. Unlike MCP servers (which provide tools), skills provide instructions and best practices.

**MCP Server:** Gives Claude new tools to call
**Skill:** Teaches Claude how to use tools effectively

## Installing Skills

### From the BlockRun marketplace

```
# Once per machine
/plugin marketplace add BlockRunAI/blockrun-mcp

# Then per skill
/plugin install blockrun@blockrun-mcp
/plugin install image-prompting@blockrun-mcp
```

The skills only describe workflows — the tools they call come from the MCP server, so install [BlockRun MCP](blockrun-mcp.md) first.

### Manual Installation

A skill is a directory containing a `SKILL.md`. Copy one into your Claude Code skills directory:

```bash
# Find skills directory
ls ~/.claude/skills/

# Add a skill manually (directory, not a single file)
git clone https://github.com/BlockRunAI/blockrun-mcp
cp -r blockrun-mcp/skills/search ~/.claude/skills/search
```

## Using Skills

Skills are invoked with slash commands:

```
/image-prompting "a minimalist logo for a crypto trading bot"
```

Or by natural language when Claude recognizes the task:

```
Generate an image of a futuristic AI agent
```

Claude will pick up the `image-prompting` skill automatically, because its description lists the phrases that should trigger it.

## Creating Custom Skills

A skill is a `SKILL.md` with YAML frontmatter followed by instructions:

```markdown
---
name: my-skill
description: |
  What this skill does, and when Claude should reach for it.
  TOOLS: blockrun_search, blockrun_chat.
  TRIGGERS: create a post, write a tweet
---

# My Skill

Instructions for Claude on how to perform this task...

## Steps

1. First, do this...
2. Then, do that...
3. Finally, check this...

## Best Practices

- Always do X
- Never do Y
```

### Skill Metadata

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (matches the directory name) |
| `description` | Yes | What it does and when to use it. Put trigger phrases here — Claude matches on the description, and this is the only field it reads before deciding to load the skill. |

### Skill Content

The body of the skill file is instructions for Claude. Write it like you're teaching someone the task. Two rules the BlockRun skills follow that are worth copying:

- **Never put a price in a skill.** Read it from `blockrun_models` or the `402` response — every typed price in the repo drifted the last time the transaction fee changed.
- **Say which tools don't exist on the other chain.** `blockrun_defi` and `blockrun_modal` are Base-only; a skill that sends a Solana user there without saying so produces a confusing error.

## Skills vs MCP Servers

| Feature | Skills | MCP Servers |
|---------|--------|-------------|
| What they provide | Instructions | Tools |
| Written in | Markdown | Code (JS/Python) |
| Installation | `/plugin install` | `claude mcp add` |
| Example | image-prompting | blockrun-mcp |

**Use skills when:** You want to teach Claude a workflow
**Use MCP when:** You need Claude to call external services

## Skill + MCP Combinations

Skills often work alongside MCP servers:

| Skill | Uses MCP |
|-------|----------|
| image-prompting | blockrun-mcp (`blockrun_image`) |
| polymarket-trading | blockrun-mcp (`blockrun_markets` → `blockrun_polymarket`) |
| crypto-data | blockrun-mcp (five data tools) |

## Managing Skills

Open the plugin manager in Claude Code to see what's installed, update, or remove:

```
/plugin
```

Skills installed by hand live under `~/.claude/skills/<name>/SKILL.md`; delete the directory to remove one.

## Troubleshooting

### Skill Not Triggering

Check that the marketplace and skill are installed (`/plugin`), then try explicit invocation:
```
/skill-name command
```

If the skill loads but the tool call fails, the problem is the MCP, not the skill — run `claude mcp list` and see [Troubleshooting](troubleshooting.md).

### Skill Conflicts

If multiple skills handle similar tasks, use explicit invocation to specify which one. `crypto-data` exists for exactly this: it routes across the five overlapping crypto tools.

### Skill Not Found

```
/plugin marketplace add BlockRunAI/blockrun-mcp
/plugin install skill-name@blockrun-mcp
```

## What's next?

::::cards

:::card{title="Image generation" href="../products/creation/nano-banana.md" icon="Image"}
Generate images via micropayments with `blockrun_image` and the image-prompting skill.
:::

:::card{title="BlockRun MCP" href="blockrun-mcp.md" icon="Boxes"}
The MCP server and the 20 tools skills build on.
:::

:::card{title="Troubleshooting" href="troubleshooting.md" icon="Search"}
Resolve skill and MCP issues.
:::

::::
