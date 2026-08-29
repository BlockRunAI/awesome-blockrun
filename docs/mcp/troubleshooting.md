---
title: MCP Troubleshooting
description: Fix common BlockRun MCP issues — installation, wallet, connection, tool, and environment errors — with copy-paste solutions and quick fixes.
---

# MCP Troubleshooting

Common issues and solutions for BlockRun MCP.

:::tip
Most problems are solved by restarting Claude Code and confirming the wallet is funded on the active chain — jump to the [Quick Reference](#quick-reference) for the fastest fix.
:::

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

### `blockrun` doesn't connect / "MCP server failed" / `spawn npx ENOENT`

**Cause:** Almost always a PATH issue — Claude Code can't find `node`/`npx` on its launcher PATH. Common with Homebrew and nvm installs, on the CLI *and* the desktop app.

**Solution:** Reinstall with your shell PATH passed through:
```bash
claude mcp remove blockrun -s user
claude mcp add blockrun -s user -e PATH="$PATH" -- npx -y @blockrun/mcp@latest
```
Then restart Claude Code. Or pin absolute paths (`which npx`).

### `claude mcp list` doesn't show `blockrun`

**Solution:**
```bash
# Node must be 20.19 or newer
node --version

# Clear the npx cache, then re-run the install
rm -rf ~/.npm/_npx
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

### "Permission denied" during install

**Cause:** npm doesn't have write permission.

**Solution:**
```bash
# Set npm to use local directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Retry installation
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

### "Node not found"

**Cause:** Node.js is not installed or not in PATH.

**Solution:**
```bash
# Install Node.js (macOS)
brew install node

# Or download from https://nodejs.org

# Verify
node --version  # Must be 20.19+
```

### "Update available" on startup

Not an error. The server checks npm at startup and prints this to stderr when a newer `@blockrun/mcp` exists. `npx -y @blockrun/mcp@latest` picks up the new version on the next restart; clear `~/.npm/_npx` if it keeps starting an old one.

## Wallet Issues

### "Wallet not found"

**Cause:** The wallet is created automatically the first time the server starts, so this usually means the server never started (see [Installation Issues](#installation-issues)) or the key file was moved.

**Solution:**
```
# In Claude Code
blockrun_wallet action:"setup"
```

This creates the wallet if it is missing and prints the address plus a funding QR. The key lives at `~/.blockrun/.session` (mode `0600`).

### "Insufficient balance" / HTTP 402 after retry

**Cause:** Not enough USDC on the **active** chain. The server holds a Base wallet and a Solana wallet but pays from one at a time.

**Solution:**
1. Check balance and active chain: `blockrun_wallet`
2. Fund that wallet — USDC on Base, or USDC (SPL) on Solana — or buy with a card via `blockrun_wallet action:"deposit"` (Base)
3. Verify balance updated, then retry the original call. Don't retry-loop the failing tool: the wallet is empty until funded.

### Balance funded but still shows zero

Wait for network confirmation and re-check. Base finality is seconds, not instant; a card on-ramp can take a few minutes.

### "402 Payment Required" came back twice

**Cause:** The payment signature did not verify. Usually the wallet has no key, or the active chain doesn't match the chain the request was priced on.

**Solution:** `blockrun_wallet` to confirm the active chain has a funded wallet, then retry once.

### `fetch failed` / balance-check timeout

**Cause:** A transient Base RPC outage. The tool falls through several public RPCs on its own.

**Solution:** Retry after 30 seconds. If it persists, a local proxy or firewall is blocking outbound RPC traffic.

### `~/.blockrun/.session no longer exists because BLOCKRUN_KEYCHAIN=strict retired it`

**Cause:** You opted into `BLOCKRUN_KEYCHAIN=strict`, so the key lives only in the OS keychain, and the keychain could not be read (locked, ACL denial, timeout). The server stops rather than silently minting a new empty wallet.

**Solution:** Unlock the keychain and restart, or export the key as `BLOCKRUN_WALLET_KEY`. Do not run `setup` expecting it to recover funds — the funded wallet is still in the keychain.

### `SOLANA_WALLET_KEY is set but the active chain is BASE`

**Cause:** A stored chain preference (`~/.blockrun/.chain`) outranks the env var.

**Solution:** `blockrun_wallet action:"chain" chain:"solana"` — switching explicitly also clears the stored preference.

### Want a different key

**Cause:** Replacing `~/.blockrun/.session` is how a wallet gets rotated or restored from backup; a `BLOCKRUN_WALLET_KEY` env var outranks the file.

**Solution:**
```bash
# Back up the current key first — it is the only key to the payment wallet AND the Polymarket deposit wallet
cp ~/.blockrun/.session ~/.blockrun/.session.backup

# Then either drop in the replacement key, or export it
export BLOCKRUN_WALLET_KEY=0x...
```
`blockrun_wallet action:"setup"` prints the address the server is actually signing with.

## Connection Issues

### "Network timeout"

**Cause:** Can't reach BlockRun API or Base RPC.

**Solutions:**
1. Check internet connection
2. Verify BlockRun API is up: `curl https://blockrun.ai/api/health`
3. Try again in a few seconds

### "Rate limited"

**Cause:** Too many requests in a short period. Only the free tier is rate limited; paid calls are not.

**Solution:** Wait 60 seconds and retry, or pass a paid `mode` / explicit `model`. Consider session budgets to pace unattended agents.

### "The free tier did not answer within …s"

**Cause:** Free capacity is saturated. `mode:"free"` tries each free model in turn and gives up after a deadline rather than hanging.

**Solution:** Retry shortly, or pass an explicit model (or a paid `mode`) to skip the free tier. Nothing was charged.

### "API error: 500"

**Cause:** Server-side issue.

**Solution:**
1. Wait a few minutes
2. Check [BlockRun status](https://blockrun.ai)
3. Report if persists: [GitHub Issues](https://github.com/BlockRunAI/blockrun-mcp/issues)

## Tool Issues

### "Tool not available"

**Cause:** MCP not properly initialized, or the server was installed with a trimmed `--profile` that doesn't include the tool (`modal` and `phone` are `full`-profile only).

**Solution:**
```bash
# Verify MCP is running
claude mcp list

# Should show "blockrun" in the list
# If not, reinstall:
claude mcp remove blockrun -s user
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
```

### "Invalid model" / a model id 404s

**Cause:** Requested model doesn't exist, or was delisted. Some ids redirect, some are gone.

**Solution:** Run `blockrun_models` for the live list, or check [Models Reference](../api-reference/models.md).

### "Image generation failed"

**Causes:**
- Insufficient balance
- Content policy violation
- Timeout

**Solutions:**
1. Check balance
2. Simplify prompt (remove potentially flagged content)
3. Try again with shorter prompt

### "Video generation timed out" / "Music generation timed out"

**Cause:** Upstream queue congestion. Both tools are async and payment-on-completion; a typical clip takes 60–180s and the video poll budget is 9 minutes.

**Solution:** **No charge** was made. Retry, or pick a faster model. Don't retry-loop — let one job finish.

### Modal sandbox charged more than expected

**Cause:** `timeout` is the billed lifetime, charged up front and never refunded — you pay for the time you ask for, not the time you use, and terminating early refunds nothing.

**Solution:** Request the lifetime you actually need rather than a safe-looking ceiling.

### Polymarket: buy on a "winner"-style (neg-risk) market fails, or `redeem` reverts, though `setup` shows ready

**Cause:** A deposit wallet provisioned before an upgrade may lack some on-chain approvals.

**Solution:** Re-run `blockrun_polymarket action:"setup" confirm:true` once. See the [setup guide](https://github.com/BlockRunAI/blockrun-mcp/blob/main/docs/polymarket-trading-setup.md).

### Polymarket order refused without a network call

**Cause:** Server-side safety rails — every order, approval and redeem needs `confirm:true`, and each order is capped by `POLYMARKET_MAX_BET_USD` (default $25). Without `confirm` you get a dry-run.

**Solution:** Preview with `blockrun_polymarket_read action:"preview"`, get the user's explicit approval for that exact trade, then place it with `confirm:true`.

### "Per-call cap refused to sign"

That is a client-side spending hook (a plugin `PreToolUse` gate or `BLOCKRUN_CONFIRM_SPEND`), not BlockRun rejecting the call. Raise `BLOCKRUN_ASK_THRESHOLD` / `BLOCKRUN_SESSION_CAP` (plugin) or `BLOCKRUN_CONFIRM_THRESHOLD` (MCP), or approve the prompt.

## Environment Issues

### Wrong wallet being used

**Cause:** An env var outranks the key file. Precedence: `BLOCKRUN_WALLET_KEY` → `~/.blockrun/.session` → OS keychain (only once the file is gone).

**Solution:**
```bash
# Check environment
echo $BLOCKRUN_WALLET_KEY
echo $SOLANA_WALLET_KEY
echo $BLOCKRUN_KEYCHAIN

# Unset if needed
unset BLOCKRUN_WALLET_KEY
unset SOLANA_WALLET_KEY
```
`blockrun_wallet action:"setup"` always prints the address actually in use.

### Wrong chain being used

**Cause:** Chain selection priority is `~/.blockrun/.chain` (explicit preference) → `SOLANA_WALLET_KEY` → first-run auto-pin → `~/.blockrun/.solana-session` exists → otherwise Base.

**Solution:** Set it explicitly — that clears the auto-pin:
```
blockrun_wallet action:"chain" chain:"base"     # or "solana"
```

### Want to pay on Solana instead of Base

**Cause:** The MCP pays on Base by default. You don't switch chains with env vars — use the wallet tool.

**Solution:** In Claude Code, run:
```
blockrun_wallet action:"chain" chain:"solana"   # provisions + activates the Solana wallet
blockrun_wallet action:"setup"                  # Solana address + funding QR
```
Applies instantly — no env vars, no file editing, no restart. Switch back with `chain:"base"`.

:::info
`blockrun_music`, `blockrun_speech`, `blockrun_video`, `blockrun_modal`, `blockrun_defi`, paid `blockrun_realface`, paid stock `blockrun_price`, and native Anthropic (`claude-*`) settle on Base only. In Solana mode they return a "switch to Base" message instead of charging. `blockrun_image` pays on either chain.
:::

## Getting Help

### Check Logs

The MCP server writes its own diagnostics (startup, profile, update notices, keychain fallbacks) to stderr, which Claude Code captures. Start Claude Code with debug output to see them:

```bash
claude --debug
```

`claude mcp list` shows whether the `blockrun` server connected.

### Report Issues

If you can't resolve an issue:

::::steps

:::step{title="Gather info"}
- Error message
- Steps to reproduce
- Claude Code version: `claude --version`
- Node version: `node --version`
- `@blockrun/mcp` version: `npm view @blockrun/mcp version`
- OS: `uname -a`
:::

:::step{title="Open an issue"}
Report at [GitHub Issues](https://github.com/BlockRunAI/blockrun-mcp/issues). Security issues: see the repo's [SECURITY.md](https://github.com/BlockRunAI/blockrun-mcp/blob/main/SECURITY.md) for private reporting.
:::

::::

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| MCP not loading | Restart Claude Code |
| `spawn npx ENOENT` | Reinstall with `-e PATH="$PATH"` |
| No wallet | `blockrun_wallet action:"setup"` |
| No balance / 402 | `blockrun_wallet`, fund on the active chain |
| Wrong chain | `blockrun_wallet action:"chain" chain:"base"` |
| Video / music timed out | Not charged — retry |
| Network error | Check internet, retry |
| Tool error | `claude mcp list` to verify |

## What's next?

::::cards

:::card{title="BlockRun MCP" href="blockrun-mcp.md" icon="Boxes"}
Setup, tools, and configuration for the MCP server.
:::

:::card{title="Wallet setup" href="../getting-started/wallet-setup.md" icon="Wallet"}
Fund on Base or Solana and fix balance issues at the source.
:::

:::card{title="Claude Code guide" href="../getting-started/claude-code.md" icon="Terminal"}
The 60-second install and first-call walkthrough.
:::

::::
