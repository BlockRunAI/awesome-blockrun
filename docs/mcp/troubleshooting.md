# MCP Troubleshooting

Common issues and solutions for BlockRun MCP.

## Installation Issues

### "MCP not found" after installation

**Cause:** Claude Code needs to restart to load new MCPs.

**Solution:**
```bash
# Kill all Claude processes
pkill -f "claude"

# Start fresh
claude

# Verify MCP is loaded
claude mcp list
```

### "Permission denied" during install

**Cause:** npm doesn't have write permission.

**Solution:**
```bash
# Set npm to use local directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Retry installation
claude mcp add blockrun -- npx @blockrun/mcp
```

### "Node not found"

**Cause:** Node.js is not installed or not in PATH.

**Solution:**
```bash
# Install Node.js (macOS)
brew install node

# Or download from https://nodejs.org

# Verify
node --version  # Should be 18+
```

## Wallet Issues

### "Wallet not found"

**Cause:** No wallet has been created yet.

**Solution:**
```
# In Claude Code
blockrun setup
```

This creates a wallet at `~/.blockrun/wallet.json`.

### "Insufficient balance"

**Cause:** Not enough USDC in your wallet.

**Solution:**
1. Check balance: `blockrun balance`
2. Fund wallet with USDC on Base network
3. Verify balance updated

### "Transaction failed"

**Causes:**
- Network congestion
- Insufficient balance
- RPC endpoint issues

**Solutions:**
```bash
# Check balance
blockrun balance

# Check Base network status
curl https://mainnet.base.org -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Retry after a few seconds
```

### "Invalid private key"

**Cause:** Corrupted wallet file or incorrect format.

**Solution:**
```bash
# Backup existing wallet
mv ~/.blockrun/wallet.json ~/.blockrun/wallet.json.backup

# Create new wallet
# In Claude Code:
blockrun setup
```

## Connection Issues

### "Network timeout"

**Cause:** Can't reach BlockRun API or Base RPC.

**Solutions:**
1. Check internet connection
2. Verify BlockRun API is up: `curl https://blockrun.ai/api/health`
3. Try again in a few seconds

### "Rate limited"

**Cause:** Too many requests in a short period.

**Solution:** Wait 60 seconds and retry. Consider using session budgets to pace requests.

### "API error: 500"

**Cause:** Server-side issue.

**Solution:**
1. Wait a few minutes
2. Check [BlockRun status](https://blockrun.ai)
3. Report if persists: [GitHub Issues](https://github.com/BlockRunAI/blockrun-mcp/issues)

## Tool Issues

### "Tool not available"

**Cause:** MCP not properly initialized.

**Solution:**
```bash
# Verify MCP is running
claude mcp list

# Should show "blockrun" in the list
# If not, reinstall:
claude mcp remove blockrun
claude mcp add blockrun -- npx @blockrun/mcp
```

### "Invalid model"

**Cause:** Requested model doesn't exist or isn't supported.

**Solution:** Check available models at [Models Reference](../api-reference/models.md).

### "Image generation failed"

**Causes:**
- Insufficient balance
- Content policy violation
- Timeout

**Solutions:**
1. Check balance
2. Simplify prompt (remove potentially flagged content)
3. Try again with shorter prompt

## Environment Issues

### Wrong wallet being used

**Cause:** Environment variable overriding default location.

**Solution:**
```bash
# Check environment
echo $BLOCKRUN_WALLET_KEY
echo $BLOCKRUN_WALLET_PATH

# Unset if needed
unset BLOCKRUN_WALLET_KEY
unset BLOCKRUN_WALLET_PATH
```

### Using wrong network

**Cause:** Custom RPC configured for wrong network.

**Solution:**
```bash
# Verify using Base mainnet
echo $BASE_RPC_URL

# Should be empty (uses default) or:
# https://mainnet.base.org
```

## Getting Help

### Check Logs

```bash
# Claude Code logs
cat ~/.claude/logs/latest.log

# Look for MCP-related errors
grep -i "blockrun\|mcp" ~/.claude/logs/latest.log
```

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* claude
```

### Report Issues

If you can't resolve an issue:

1. Gather info:
   - Error message
   - Steps to reproduce
   - Claude Code version: `claude --version`
   - Node version: `node --version`
   - OS: `uname -a`

2. Report at [GitHub Issues](https://github.com/BlockRunAI/blockrun-mcp/issues)

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| MCP not loading | Restart Claude Code |
| No wallet | `blockrun setup` |
| No balance | Fund wallet on Base |
| Network error | Check internet, retry |
| Tool error | `claude mcp list` to verify |
