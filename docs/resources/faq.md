# FAQ

Frequently asked questions about BlockRun.

## General

### What is BlockRun?

BlockRun is an AI API gateway that accepts stablecoin payments via the x402 protocol. Access OpenAI, Anthropic, Google, and other AI models with just a wallet.

### Why use BlockRun instead of direct API access?

- **No API keys** - Your wallet is your identity
- **No credit cards** - Pay with stablecoin
- **No subscriptions** - Pay per request
- **Unified API** - One interface for all providers
- **Privacy** - No account, no tracking

### Is BlockRun decentralized?

BlockRun uses the x402 protocol for payments, which settles on-chain. The API gateway itself is centralized for performance and reliability.

## Payments

### How do I pay?

Fund your wallet with USDC on a supported network (currently Base). The SDK handles payments automatically.

### What's the minimum payment?

$0.001 (one-tenth of a cent) per request.

### Do I need to pre-fund an account?

No. Keep USDC in your wallet and pay per-request. No deposits or credits.

### What if a request fails?

You only pay for successful requests. If the AI call fails, no payment is settled.

### Can I get a refund?

Once a payment settles, it's final. This is like any blockchain transaction.

### How fast is settlement?

Payments settle in ~2 seconds on Base.

## Technical

### Which AI models are available?

See [Models](../api-reference/models.md) for the full list including:
- OpenAI (GPT-4o, o1, etc.)
- Anthropic (Claude Opus, Sonnet, Haiku)
- Google (Gemini)
- And more

### Is the API OpenAI-compatible?

Yes! Use the same message format as OpenAI's Chat Completions API.

### Can I use BlockRun in production?

Yes. BlockRun is designed for production use with reliable uptime and fast response times.

### Is there rate limiting?

Rate limits are generous for normal usage. Contact us for high-volume needs.

### Do you support streaming?

Streaming support is coming soon.

## Security

### Is my private key safe?

Your private key never leaves your device. The SDK only sends signatures, not keys.

### Can BlockRun access my wallet?

No. BlockRun can only claim the specific amount you authorize for each request.

### What happens if BlockRun is hacked?

Attackers could only process requests and claim authorized payments. They cannot access your wallet or steal funds beyond what you actively authorize.

See [Security](../x402/security.md) for more details.

## Wallet Setup

### Which wallets work?

Any EVM wallet works. You need the private key for signing. Popular options:
- Create a new wallet with `viem` or `ethers.js`
- Export key from MetaMask (not recommended for main wallet)
- Use a dedicated hot wallet

### How do I get a private key?

```typescript
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);
console.log('Address:', account.address);
console.log('Private Key:', privateKey);
```

### How much USDC do I need?

Start with $1-5 for testing. A typical request costs $0.001-0.01.

### How do I get USDC on Base?

1. Buy USDC on any exchange
2. Withdraw to Base network, or
3. Bridge using the official Base Bridge

## Troubleshooting

### "Insufficient balance" error

Your wallet doesn't have enough USDC. Check your balance on Base.

### "Unknown model" error

Check the model ID is correct (e.g., `openai/gpt-4o`, not `gpt-4o`).

### "Timeout" error

Increase timeout in client options. Some models (like o1) take longer.

### Request is slow

AI model execution varies. GPT-4o Mini is fastest. o1 and Claude Opus are slower.

## Support

### How do I get help?

- Check this FAQ
- Read the [documentation](../README.md)
- Open an issue on GitHub

### How do I report bugs?

Open an issue on the relevant GitHub repository:
- API issues: BlockRun main repo
- Python SDK: blockrun-llm
- TypeScript SDK: blockrun-llm-ts

### Can I request features?

Yes! Open a feature request on GitHub.
