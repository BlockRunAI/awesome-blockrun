# Skills

Skills extend what Claude Code can do. They're like plugins that add specific capabilities.

## Available Skills

| Skill | Description | Install |
|-------|-------------|---------|
| [x-grow](../products/creation/x-grow.md) | X post optimization | `claude skill add x-grow` |
| [nano-banana](../products/creation/nano-banana.md) | Image generation | `claude skill add nano-banana` |
| [alpha-mcp](../products/trading/overview.md) | Crypto trading | `claude mcp add @blockrun/alpha` |

## What Are Skills?

Skills are prompt-based extensions that teach Claude new workflows. Unlike MCP servers (which provide tools), skills provide instructions and best practices.

**MCP Server:** Gives Claude new tools to call
**Skill:** Teaches Claude how to use tools effectively

## Installing Skills

### From BlockRun

```bash
# Add x-grow skill
claude skill add x-grow

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
/x-grow draft "AI agents in crypto"
```

```
/x-grow review
```

Or by natural language when Claude recognizes the task:

```
Help me write a high-performing X post about AI trading
```

Claude will use the x-grow skill automatically.

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
| Example | x-grow | blockrun-mcp |

**Use skills when:** You want to teach Claude a workflow
**Use MCP when:** You need Claude to call external services

## Skill + MCP Combinations

Skills often work alongside MCP servers:

| Skill | Uses MCP |
|-------|----------|
| x-grow | blockrun-mcp (for images) |
| nano-banana | blockrun-mcp (for generation) |
| alpha-mcp | alpha-mcp (for trading tools) |

## Managing Skills

### List Installed Skills

```bash
claude skill list
```

### Remove a Skill

```bash
claude skill remove x-grow
```

### Update a Skill

```bash
claude skill update x-grow
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

## Links

- [x-grow Skill](../products/creation/x-grow.md)
- [nano-banana Skill](../products/creation/nano-banana.md)
- [BlockRun MCP](blockrun-mcp.md)
