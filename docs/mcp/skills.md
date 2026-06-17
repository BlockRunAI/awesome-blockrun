---
title: Skills
description: BlockRun skills extend Claude Code with prompt-based workflows — install, invoke, and author skills that teach Claude how to use BlockRun tools.
---

# Skills

Skills extend what Claude Code can do. They're like plugins that add specific capabilities.

:::note
A **skill** teaches Claude *how* to do a task; an **MCP server** gives Claude the *tools* to call. They often work together — the nano-banana skill uses the BlockRun MCP to generate images.
:::

## Available Skills

| Skill | Description | Install |
|-------|-------------|---------|
| [nano-banana](../products/creation/nano-banana.md) | Image generation | `claude skill add nano-banana` |
| [alpha-mcp](../products/trading/overview.md) | Crypto trading | `claude mcp add @blockrun/alpha` |

## What Are Skills?

Skills are prompt-based extensions that teach Claude new workflows. Unlike MCP servers (which provide tools), skills provide instructions and best practices.

**MCP Server:** Gives Claude new tools to call
**Skill:** Teaches Claude how to use tools effectively

## Installing Skills

### From BlockRun

```bash
# Add nano-banana skill
claude skill add nano-banana
```

### Manual Installation

Skills are markdown files in your Claude Code skills directory:

```bash
# Find skills directory
ls ~/.claude/skills/

# Add a skill manually
cp my-skill.md ~/.claude/skills/
```

## Using Skills

Skills are invoked with slash commands:

```
/nano-banana "a minimalist logo for a crypto trading bot"
```

Or by natural language when Claude recognizes the task:

```
Generate an image of a futuristic AI agent
```

Claude will use the nano-banana skill automatically.

## Creating Custom Skills

Skills are markdown files with a specific format:

```markdown
---
name: my-skill
description: What this skill does
triggers:
  - "create a post"
  - "write a tweet"
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
| `name` | Yes | Skill identifier |
| `description` | Yes | Brief description |
| `triggers` | No | Phrases that activate the skill |

### Skill Content

The body of the skill file is instructions for Claude. Write it like you're teaching someone the task.

## Skills vs MCP Servers

| Feature | Skills | MCP Servers |
|---------|--------|-------------|
| What they provide | Instructions | Tools |
| Written in | Markdown | Code (JS/Python) |
| Installation | `skill add` | `mcp add` |
| Example | nano-banana | blockrun-mcp |

**Use skills when:** You want to teach Claude a workflow
**Use MCP when:** You need Claude to call external services

## Skill + MCP Combinations

Skills often work alongside MCP servers:

| Skill | Uses MCP |
|-------|----------|
| nano-banana | blockrun-mcp (for generation) |
| alpha-mcp | alpha-mcp (for trading tools) |

## Managing Skills

### List Installed Skills

```bash
claude skill list
```

### Remove a Skill

```bash
claude skill remove nano-banana
```

### Update a Skill

```bash
claude skill update nano-banana
```

## Troubleshooting

### Skill Not Triggering

Check if the skill is installed:
```bash
claude skill list
```

Try explicit invocation:
```
/skill-name command
```

### Skill Conflicts

If multiple skills handle similar tasks, use explicit invocation to specify which one.

### Skill Not Found

```bash
# Reinstall
claude skill remove skill-name
claude skill add skill-name
```

## What's next?

::::cards

:::card{title="nano-banana skill" href="../products/creation/nano-banana.md" icon="Image"}
Generate images via micropayments with the bundled skill.
:::

:::card{title="BlockRun MCP" href="blockrun-mcp.md" icon="Boxes"}
The MCP server and the 18 tools skills build on.
:::

:::card{title="Troubleshooting" href="troubleshooting.md" icon="Search"}
Resolve skill and MCP issues.
:::

::::
