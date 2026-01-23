# Wallet Setup

BlockRun uses USDC on Base network for payments. Your agent needs a funded wallet to pay for services.

## Networks

| Network | Chain ID | Usage | USDC |
|---------|----------|-------|------|
| **Base Mainnet** | 8453 | Production | Real USDC |
| **Base Sepolia** | 84532 | Development/Testing | Testnet USDC (free) |

## How It Works

1. Your agent has a wallet with a private key stored locally
2. When using paid services, the SDK signs a USDC payment authorization
3. The signature (not your key) is sent to the server
4. Payment settles on-chain, you receive the service

**Your private key never leaves your machine.**

## Setup Options

### Option 1: Auto-generated Wallet (Recommended)

BlockRun SDKs can generate a wallet automatically:

**Claude Code:**
```
blockrun setup
```

**Python SDK:**
```python
from blockrun_llm import LLMClient

client = LLMClient()  # Creates wallet at ~/.blockrun/wallet.json if none exists
print(client.get_address())
```

**TypeScript SDK:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();  // Creates wallet if none exists
console.log(await client.getAddress());
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

### Option 3: Agent Wallet CLI

For more control, use the [agent-wallet CLI](https://github.com/BlockRunAI/blockrun-agent-wallet):

```bash
npx @blockrun/agent-wallet create
npx @blockrun/agent-wallet address
npx @blockrun/agent-wallet balance
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

**Claude Code:**
```
blockrun balance
```

**Python:**
```python
balance = client.get_balance()
print(f"Balance: ${balance} USDC")
```

**CLI:**
```bash
npx @blockrun/agent-wallet balance
```

**On-chain:**

View your wallet on [Basescan](https://basescan.org) by searching your address.

## Wallet Location

| Platform | Location |
|----------|----------|
| Claude Code / MCP | `~/.blockrun/wallet.json` |
| Python SDK | `~/.blockrun/wallet.json` or env var |
| TypeScript SDK | `~/.blockrun/wallet.json` or env var |

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

## Withdraw Funds

Your wallet is a standard Ethereum-compatible wallet. You can withdraw anytime using:

- Any Web3 wallet (MetaMask, Rainbow, etc.)
- Import your private key and send to your desired address

## Testnet Setup (Development)

For development and testing, use Base Sepolia testnet with free testnet USDC:

### 1. Get Testnet ETH

Get free testnet ETH for gas from [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia).

### 2. Get Testnet USDC

Get free testnet USDC from [Circle USDC Faucet](https://faucet.circle.com/).

### 3. Configure SDK for Testnet

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

### Testnet API Endpoint

```
https://testnet.blockrun.ai/api
```

### Available Testnet Models

- `openai/gpt-oss-20b` - $0.001/request
- `openai/gpt-oss-120b` - $0.002/request

## Troubleshooting

### "Insufficient balance"

Check your USDC balance on Base network. ETH for gas is handled by the x402 facilitator — you only need USDC.

### "Transaction failed"

1. Verify you have enough USDC for the request
2. Check if the network is congested on [Basescan](https://basescan.org)
3. Try again in a few seconds

### "Wallet not found"

```bash
# Check if wallet file exists
ls ~/.blockrun/

# Create new wallet
blockrun setup
```

## Next Steps

- [Claude Code Guide](claude-code.md)
- [SDK Developer Guide](sdk-developers.md)
- [Agent Developer Guide](agent-developers.md)
