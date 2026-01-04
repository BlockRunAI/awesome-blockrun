# Authentication

BlockRun uses wallet-based authentication via the x402 protocol. Instead of API keys, you sign payments with your wallet.

## How It Works

1. **No API Keys** - Your wallet IS your authentication
2. **Local Signing** - Private key never leaves your machine
3. **Pay-Per-Request** - Each request is individually authorized

## Setting Up Your Wallet

### 1. Create or Use an Existing Wallet

You can use any EVM-compatible wallet:
- MetaMask
- Coinbase Wallet
- Rainbow
- Any wallet that can export a private key

### 2. Fund Your Wallet with USDC

You need USDC on the Base network to pay for API requests.

**Getting USDC on Base:**
1. Bridge from Ethereum using the [Base Bridge](https://bridge.base.org)
2. Buy directly on [Coinbase](https://coinbase.com) and withdraw to Base
3. Swap on a DEX like [Uniswap](https://app.uniswap.org)

### 3. Export Your Private Key

> **Security Warning:** Never share your private key. Only use it in secure environments.

**MetaMask:**
1. Click the three dots menu
2. Go to Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the key

**Coinbase Wallet:**
1. Go to Settings
2. Select your wallet
3. Choose "Show Private Key"
4. Authenticate and copy

### 4. Configure the SDK

Set your private key as an environment variable:

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

Or pass it directly to the client:

**Python:**
```python
from blockrun_llm import LLMClient

# From environment (recommended)
client = LLMClient()

# Or pass directly
client = LLMClient(private_key="0x...")
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({
  privateKey: '0x...'
});
```

## Security Best Practices

1. **Use Environment Variables** - Never hardcode private keys
2. **Use a Dedicated Wallet** - Create a separate wallet for API payments
3. **Limit Funds** - Only keep enough USDC for expected usage
4. **Monitor Usage** - Check your wallet transactions regularly

## Checking Your Wallet

**Python:**
```python
from blockrun_llm import LLMClient

client = LLMClient()
print(f"Using wallet: {client.get_wallet_address()}")
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });
console.log(`Using wallet: ${client.getWalletAddress()}`);
```
