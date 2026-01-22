# BlockRun

**Agents that pay, spend, and trade.**

BlockRun is economic infrastructure for the agent era. AI agents discover services, pay in USDC, and execute autonomously — no API keys, no subscriptions.

## Products

| Product | What It Does | Pricing |
|---------|--------------|---------|
| [**Trading**](products/trading/overview.md) | AI analyzes markets, executes trades, manages risk | Free (open source) |
| [**Creation**](products/creation/x-grow.md) | AI creates optimized posts and images | Pay-per-use |
| [**Intelligence**](products/intelligence/overview.md) | AI accesses 30+ LLMs via x402 | Provider cost + 5% |

## Get Started

### Claude Code Users (60 seconds)

```bash
# Install BlockRun MCP
claude mcp add blockrun -- npx @blockrun/mcp

# Setup wallet (in Claude Code)
> blockrun setup

# Fund with $5 USDC on Base, then start using
```

→ [Full Claude Code Guide](getting-started/claude-code.md)

### Agent Developers

Building with ElizaOS, AgentKit, or LangChain? We have plugins:

- [ElizaOS Plugin](frameworks/elizaos.md)
- [AgentKit Integration](frameworks/agentkit.md)
- [LangChain Provider](frameworks/langchain.md)

→ [Agent Developer Guide](getting-started/agent-developers.md)

### SDK Developers

Direct API integration for Python, TypeScript, or Go:

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Uses BLOCKRUN_WALLET_KEY
response = client.chat("openai/gpt-4o", "Hello!")
```

→ [SDK Developer Guide](getting-started/sdk-developers.md)

## How x402 Works

```
Agent → Request service → Receive 402 + price → Sign payment → Get response
```

The [x402 protocol](x402/how-it-works.md) embeds payment into HTTP. Your agent:

1. Requests a service (AI inference, trading signal, image generation)
2. Receives `HTTP 402 Payment Required` with the price
3. Signs a USDC payment locally (your key never leaves your machine)
4. Gets the response with payment settled on-chain

No API keys. No credit card. Just USDC and a wallet.

## Links

- **Website:** [blockrun.ai](https://blockrun.ai)
- **GitHub:** [github.com/BlockRunAI](https://github.com/BlockRunAI)
- **x402 Services:** [618+ live services](https://blockrun.ai/ecosystem/services)
