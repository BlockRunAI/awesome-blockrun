# Prompt Quickstart

Get started with BlockRun in Claude Code using a single prompt.

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- USDC on Base (or funds ready to transfer)

## The Prompt

Copy and paste this into Claude Code:

```
Set up BlockRun for x402 payments in Claude Code:
1. Install blockrun-mcp: `npx @anthropic-ai/claude-code mcp add blockrun-mcp`
2. Configure BLOCKRUN_WALLET_KEY (ask if I have a private key or want to generate one)
3. Show my wallet address and help me fund it with USDC on Base
4. Prove it works: check balance → make an LLM call → confirm balance decreased
```

Claude will walk you through each step interactively.
