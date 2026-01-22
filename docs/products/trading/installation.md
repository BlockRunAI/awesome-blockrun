# Installing alpha-mcp

## Claude Code (Recommended)

### Method 1: Direct Install

```bash
claude mcp add @blockrun/alpha
```

### Method 2: Via npx

```bash
npx @anthropic-ai/claude-code install @blockrun/alpha
```

### Method 3: Manual Configuration

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

## Verify Installation

Restart Claude Code, then:

```bash
claude mcp list
```

You should see `alpha` or `@blockrun/alpha` in the list.

## Setup Wallet

alpha-mcp needs a funded wallet for:
- Sentiment analysis queries (paid via x402)
- Trade execution (USDC for swaps)

```
# In Claude Code
blockrun setup
```

Then fund with USDC on Base. See [Wallet Setup](../../getting-started/wallet-setup.md).

## Configuration

alpha-mcp uses environment variables for configuration:

```bash
# Optional: Custom RPC endpoint
export BASE_RPC_URL=https://mainnet.base.org

# Optional: Custom wallet location
export BLOCKRUN_WALLET_PATH=~/.blockrun/trading-wallet.json
```

## Test It Works

In Claude Code:

```
What's the current RSI for ETH?
```

Claude should call `alpha_signal` and return technical indicators.

## Requirements

- Claude Code CLI
- Node.js 18+
- Funded wallet on Base (for paid features)

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

## Next Steps

- [Tools Reference](tools.md) — Learn what each tool does
- [Risk Management](risk-management.md) — Understand safety limits
- [Wallet Setup](../../getting-started/wallet-setup.md) — Fund your agent
