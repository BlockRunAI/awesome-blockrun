---
title: Installing alpha-mcp
description: Install the alpha-mcp trading server in Claude Code, fund a wallet on Base, and confirm Claude can pull live technical signals.
---

# Installing alpha-mcp

Add the alpha-mcp trading tools to Claude Code, fund a wallet, and verify it works — a few minutes start to finish.

:::note{title="Requirements"}
Claude Code CLI, Node.js 18+, and a funded wallet on Base (for paid features).
:::

## Install

Pick one of the three install methods.

::::tabs

:::tab{label="Direct install"}
```bash
claude mcp add @blockrun/alpha
```
:::

:::tab{label="Via npx"}
```bash
npx @anthropic-ai/claude-code install @blockrun/alpha
```
:::

:::tab{label="Manual config"}
Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "alpha": {
      "command": "npx",
      "args": ["@blockrun/alpha"]
    }
  }
}
```
:::

::::

## Set up and verify

::::steps

:::step{title="Verify installation"}
Restart Claude Code, then:

```bash
claude mcp list
```

You should see `alpha` or `@blockrun/alpha` in the list.
:::

:::step{title="Set up a wallet"}
alpha-mcp needs a funded wallet for sentiment analysis queries (paid via x402) and trade execution (USDC for swaps).

```
# In Claude Code
blockrun setup
```

Then fund with USDC on Base. See [Wallet Setup](../../getting-started/wallet-setup.md).
:::

:::step{title="Configure (optional)"}
alpha-mcp uses environment variables for configuration:

```bash
# Optional: Custom RPC endpoint
export BASE_RPC_URL=https://mainnet.base.org

# Optional: Custom wallet location
export BLOCKRUN_WALLET_PATH=~/.blockrun/trading-wallet.json
```
:::

:::step{title="Test it works"}
In Claude Code:

```
What's the current RSI for ETH?
```

Claude should call `alpha_signal` and return technical indicators.
:::

::::

## Troubleshooting

### "MCP not found"

Restart Claude Code after installation:

```bash
# Kill any running instances
pkill -f "claude"

# Start fresh
claude
```

### "Wallet not configured"

Run wallet setup:

```
blockrun setup
```

### "Permission denied"

Check npm permissions:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### "Network error"

Verify Base RPC is accessible:

```bash
curl https://mainnet.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## What's next?

::::cards

:::card{title="Tools reference" href="tools.md" icon="Boxes"}
Learn what each of the 7 alpha-mcp tools does.
:::

:::card{title="Risk management" href="risk-management.md" icon="TrendingUp"}
Understand the hardcoded safety limits before you trade.
:::

:::card{title="Wallet setup" href="../../getting-started/wallet-setup.md" icon="Wallet"}
Fund your agent with USDC on Base.
:::

::::
