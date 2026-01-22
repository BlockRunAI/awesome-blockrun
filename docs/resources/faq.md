# FAQ

Frequently asked questions about BlockRun.

## General

### What is BlockRun?

BlockRun is economic infrastructure for AI agents. It provides:
- **Trading** — AI that analyzes markets and executes trades (alpha-mcp)
- **Creation** — AI that creates optimized content and images
- **Intelligence** — Access to 30+ AI models via x402 micropayments

### What makes BlockRun different?

| Traditional | BlockRun |
|-------------|----------|
| API keys per provider | One wallet for all |
| Monthly subscriptions | Pay-per-request |
| Account management | Just fund and use |
| Complex billing | On-chain transparency |

### Is BlockRun free?

- **Trading (alpha-mcp):** Free and open source
- **Creation:** Pay-per-use ($0.05-0.12 per image)
- **Intelligence:** Provider cost + 5%

## Products

### What is alpha-mcp?

alpha-mcp is our trading product. It gives Claude the tools to:
- Analyze markets (technical indicators, sentiment)
- Execute trades (DEX swaps on Base)
- Manage risk (hardcoded safety limits)

It's free and open source. See [Trading Overview](../products/trading/overview.md).

### What is x-grow?

x-grow is a Claude Code skill for writing high-performing X posts. It uses real algorithm knowledge to optimize your content. See [x-grow](../products/creation/x-grow.md).

### What is nano-banana?

nano-banana is a Claude Code skill for image generation. Generate images using DALL-E, Flux, or Nano Banana via micropayments. See [nano-banana](../products/creation/nano-banana.md).

## Payments

### How do payments work?

BlockRun uses the x402 protocol:
1. Request a service
2. Receive `HTTP 402 Payment Required` with price
3. Your SDK signs a USDC authorization locally
4. Payment settles on-chain, you receive the service

### What currency is accepted?

USDC on Base network.

### What's the minimum to get started?

$1 is enough for testing. Recommended: $5-20 for regular usage.

### How do I fund my wallet?

Send USDC to your wallet address on Base:
- [Coinbase](https://coinbase.com) — Direct withdrawal to Base
- [Base Bridge](https://bridge.base.org) — Bridge from Ethereum
- [Uniswap](https://app.uniswap.org) — Swap on Base

### What if a request fails?

You only pay for successful requests. Failed requests don't settle.

### Can I get a refund?

Payments are on-chain and final, like any blockchain transaction.

## Trading

### Is AI trading risky?

Yes. alpha-mcp has built-in risk limits (15% max position, 50% cash reserve, 5% daily loss limit), but all trading carries risk. Only trade what you can afford to lose.

### Can I override the risk limits?

No. Risk limits are hardcoded and cannot be overridden.

### What can alpha-mcp trade?

Tokens on Base via 0x Protocol. Common pairs: ETH/USDC, popular tokens with liquidity.

### Does BlockRun charge trading fees?

No. alpha-mcp is free. You only pay for intelligence (sentiment analysis) and network gas.

## Technical

### Which AI models are available?

30+ models including:
- OpenAI (GPT-5.2, GPT-4o, o1)
- Anthropic (Claude Opus 4, Sonnet 4, Haiku 4.5)
- Google (Gemini 3 Pro, Gemini 2.5 Flash)
- DeepSeek (V3, R1)
- xAI (Grok)
- Meta (Llama)

Full list: [Models](../api-reference/models.md)

### Is the API OpenAI-compatible?

Yes. Use the same format as OpenAI's Chat Completions API.

### How do I use BlockRun with Claude Code?

```bash
claude mcp add blockrun -- npx @blockrun/mcp
```

Then run `blockrun setup` in Claude Code.

### What frameworks are supported?

- Claude Code (via MCP)
- ElizaOS (plugin)
- AgentKit (SDK integration)
- LangChain (custom LLM class)
- GOAT SDK (in review)

## Security

### Is my private key safe?

Your private key never leaves your machine. Only cryptographic signatures are sent.

### Where is my wallet stored?

`~/.blockrun/wallet.json` by default.

### Can BlockRun steal my funds?

No. BlockRun can only claim the specific amount you authorize per request.

### Can I use my main wallet?

We recommend a dedicated wallet with small amounts. Don't use your main holdings wallet.

## Wallet Setup

### How do I create a wallet?

**Claude Code:**
```
blockrun setup
```

**Python:**
```python
from blockrun_llm import LLMClient
client = LLMClient()  # Creates wallet automatically
print(client.get_address())
```

### How much USDC do I need?

| Usage | Amount |
|-------|--------|
| Testing | $1-5 |
| Regular use | $5-20 |
| Heavy usage | $20-100 |

### Can I withdraw my funds?

Yes. Your wallet is a standard Ethereum wallet. Import the private key into any Web3 wallet to withdraw.

## Troubleshooting

### "MCP not found"

Restart Claude Code after installing:
```bash
pkill -f "claude"
claude
```

### "Wallet not found"

Run setup:
```
blockrun setup
```

### "Insufficient balance"

Check your balance and fund if needed:
```
blockrun balance
```

### "Network error"

Check internet connection and retry. If persistent, check [BlockRun status](https://blockrun.ai).

## Support

### How do I get help?

1. Check this FAQ
2. Read the [documentation](../README.md)
3. See [MCP Troubleshooting](../mcp/troubleshooting.md)
4. Open an issue on [GitHub](https://github.com/BlockRunAI)

### How do I report bugs?

Open an issue on the relevant GitHub repository:
- General: [blockrun-mcp](https://github.com/BlockRunAI/blockrun-mcp)
- Trading: [alpha-mcp](https://github.com/BlockRunAI/alpha-mcp)
- Python SDK: [blockrun-llm](https://github.com/blockrunai/blockrun-llm)
- TypeScript SDK: [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts)

### Where can I follow updates?

- [Twitter/X: @BlockRunAI](https://x.com/BlockRunAI)
- [GitHub: BlockRunAI](https://github.com/BlockRunAI)
