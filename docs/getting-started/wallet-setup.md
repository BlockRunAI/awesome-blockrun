---
title: Wallet Setup
description: Create and fund a BlockRun wallet with USDC on Base or Solana, manage keys and budgets, and run on testnet — your private key never leaves your machine.
---

# Wallet Setup

BlockRun accepts USDC on **Base** (default) or **Solana** for payments. Your agent needs a funded wallet to pay for services.

## Networks

| Network | Chain ID | Usage | USDC |
|---------|----------|-------|------|
| **Base Mainnet** | 8453 | Production (default) | Real USDC |
| **Base Sepolia** | 84532 | Development/Testing | Testnet USDC (free) |
| **Solana Mainnet** | — | Production | USDC (SPL) |

:::info{title="MCP users: pay on Solana"}
Switch to Solana with `blockrun_wallet action:"chain" chain:"solana"` then `blockrun_wallet action:"setup"` — no env vars or restart. See [Claude Code MCP](../mcp/blockrun-mcp.md#pay-on-solana-optional). Some tools (music, speech, paid stock prices, smart routing, native Anthropic) settle on Base only.
:::

## How It Works

1. Your agent has a wallet with a private key stored locally
2. When using paid services, the SDK signs a USDC payment authorization
3. The signature (not your key) is sent to the server
4. Payment settles on-chain, you receive the service

**Your private key never leaves your machine.**

## Setup Options

### Option 1: Auto-generated Wallet (Recommended)

BlockRun SDKs can generate a wallet automatically:

**Claude Code (MCP):**
```
blockrun_wallet action:"setup"
```

**Python SDK:**
```python
from blockrun_llm import setup_agent_wallet

client = setup_agent_wallet()  # Creates ~/.blockrun/.session if none exists and prints a funding QR
print(client.get_wallet_address())
```

`LLMClient()` on its own does not create a wallet — it raises `ValueError` if no key is found in the environment or at `~/.blockrun/.session`.

**TypeScript SDK:**
```typescript
import { setupAgentWallet } from '@blockrun/llm';

const client = setupAgentWallet();  // Creates ~/.blockrun/.session if none exists
console.log(client.getWalletAddress());
```

### Option 2: Use Existing Private Key

If you have an existing wallet, set the environment variable:

```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```

Or pass it directly:

```python
client = LLMClient(private_key="0x...")
```

**Solana (Python SDK):** install the extra and use the Solana client. The key can be a bs58 keypair or seed, the Solana CLI's `~/.config/solana/id.json` byte array, or 64-byte hex:

```bash
pip install "blockrun-llm[solana]"
export SOLANA_WALLET_KEY=...
```

```python
from blockrun_llm import SolanaLLMClient, setup_agent_solana_wallet

client = SolanaLLMClient()              # SOLANA_WALLET_KEY, else ~/.blockrun/.solana-session
client = setup_agent_solana_wallet()    # creates ~/.blockrun/.solana-session if none exists
```

Base and Solana keys are not interchangeable (a Base key is `0x` + 64 hex); pass each to its own client. The payer must already hold a USDC token account on Solana.

**Adopt a wallet another application created:** the SDK never switches wallets on its own. List what it found and import one deliberately — your current key is backed up to `~/.blockrun/.session.backup-<timestamp>` first:

```python
from blockrun_llm import list_discovered_wallets, import_wallet

for w in list_discovered_wallets():
    print(w["address"], "from", w["source"])
import_wallet("0x...")
```

### Option 3: BlockRun MCP session wallet

Installing [BlockRun MCP](/docs/mcp/blockrun-mcp) auto-creates a wallet at `~/.blockrun/.session` on first use — the Python and TypeScript SDKs read the same file automatically, so one funded wallet serves your MCP tools and your scripts:

```bash
claude mcp add blockrun -s user -- npx -y @blockrun/mcp@latest
# ask the agent for its wallet address, then fund it with USDC on Base
```

## Fund Your Wallet

### Get USDC on Base

| Method | Best For |
|--------|----------|
| [Coinbase](https://coinbase.com) | Direct withdrawal to Base |
| [Base Bridge](https://bridge.base.org) | Bridge from Ethereum mainnet |
| [Uniswap](https://app.uniswap.org) | Swap ETH for USDC on Base |
| [Relay](https://relay.link) | Cross-chain bridge |

### Recommended Amounts

| Usage | Amount |
|-------|--------|
| Testing | $1-5 |
| Regular usage | $5-20 |
| Heavy usage / Trading | $20-100 |

### Check Balance

**Claude Code (MCP):**
```
blockrun_wallet action:"status"
```

**Python:**
```python
balance = client.get_balance()
print(f"Balance: ${balance} USDC")

# or, one-liner that also creates the wallet if needed:
python3 -c "from blockrun_llm import status; status()"
```

**MCP:** ask your agent — the `blockrun_wallet` tool reports the address and USDC balance.

**On-chain:**

View your wallet on [Basescan](https://basescan.org) by searching your address.

## Wallet Location

| Platform | Location |
|----------|----------|
| Claude Code / MCP | `~/.blockrun/.session` |
| Python SDK | `BLOCKRUN_WALLET_KEY` env var, else `~/.blockrun/.session` (legacy `~/.blockrun/wallet.key` still read) |
| Python SDK (Solana) | `SOLANA_WALLET_KEY` env var, else `~/.blockrun/.solana-session` |
| TypeScript SDK | `BASE_CHAIN_WALLET_KEY` env var for `new LLMClient()`; `~/.blockrun/.session` is read by `setupAgentWallet()` |

Every file is written with mode `0600`. The MCP and both SDKs share the Base file, so one funded wallet serves all of them.

## Spend Limits

The Python SDK can refuse any quote above a ceiling **before** signing, so an agent can never spend more than you allowed — nothing settles on a refusal:

```python
client = LLMClient(max_cost_per_call=0.25, max_session_cost=10.00)
# or per deployment: BLOCKRUN_MAX_COST_PER_CALL / BLOCKRUN_MAX_SESSION_COST
```

A refused quote raises `SpendLimitError` (a `PaymentError` subclass). Both limits are unset by default.

## Security Best Practices

### DO:
- Keep your private key secret
- Use a dedicated wallet for BlockRun (not your main holdings)
- Start with small amounts
- Monitor transactions on Basescan

### DON'T:
- Share your private key
- Commit your key to git
- Use your main wallet with large holdings
- Ignore transaction failures

:::danger
Never commit your private key or paste it into a shared chat. Anyone with the key controls the wallet and its funds.
:::

## Withdraw Funds

Your wallet is a standard Ethereum-compatible wallet. You can withdraw anytime using:

- Any Web3 wallet (MetaMask, Rainbow, etc.)
- Import your private key and send to your desired address

## Testnet Setup (Development)

For development and testing, use Base Sepolia testnet with free testnet USDC:

::::steps

:::step{title="Get testnet ETH"}
Get free testnet ETH for gas from [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia).
:::

:::step{title="Get testnet USDC"}
Get free testnet USDC from [Circle USDC Faucet](https://faucet.circle.com/).
:::

:::step{title="Configure the SDK for testnet"}
**Python:**
```python
from blockrun_llm import testnet_client

client = testnet_client()  # Uses BLOCKRUN_WALLET_KEY
response = client.chat("openai/gpt-oss-20b", "Hello!")
```

**TypeScript:**
```typescript
import { testnetClient } from '@blockrun/llm';

const client = testnetClient({ privateKey: '0x...' });
const response = await client.chat('openai/gpt-oss-20b', 'Hello!');
```
:::

::::

### Testnet API Endpoint

```
https://testnet.blockrun.ai/api
```

### Available Testnet Models

- `openai/gpt-oss-20b` - $0.001/request
- `openai/gpt-oss-120b` - $0.002/request

Testnet also lists the image models and `minimax/music-2.5+`; see `https://testnet.blockrun.ai/api/v1/models`.

## Troubleshooting

### "Insufficient balance"

Check your USDC balance on Base network. ETH for gas is handled by the x402 facilitator — you only need USDC.

### "Transaction failed"

1. Verify you have enough USDC for the request
2. Check if the network is congested on [Basescan](https://basescan.org)
3. Try again in a few seconds

### "No wallet configured"

```bash
# Check if the wallet file exists
ls -la ~/.blockrun/.session

# Create a new wallet (Python)
python3 -c "from blockrun_llm import setup_agent_wallet; setup_agent_wallet()"
```

Or in Claude Code: `blockrun_wallet action:"setup"`. If you hold a Solana key, remember it belongs to `SolanaLLMClient`, not `LLMClient`.

## What's next?

::::cards

:::card{title="Claude Code guide" href="claude-code.md" icon="Terminal"}
Install the MCP and use your funded wallet from Claude Code.
:::

:::card{title="SDK developers" href="sdk-developers.md" icon="Code"}
Wire the wallet into Python, TypeScript, or Go integrations.
:::

:::card{title="Agent developers" href="agent-developers.md" icon="Boxes"}
Give agents a wallet that pays for their own intelligence.
:::

::::
