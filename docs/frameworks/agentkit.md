---
title: AgentKit Integration
description: Pair Coinbase AgentKit with BlockRun so your agents both hold on-chain assets and pay per request for 100 AI models.
---

# AgentKit Integration

Use BlockRun with Coinbase AgentKit for wallet-enabled AI agents — AgentKit holds assets and executes on-chain actions, BlockRun pays for the intelligence.

:::note{title="Community integration"}
BlockRun's primary paths are [Franklin](../products/franklin.md), the [BlockRun MCP](../mcp/blockrun-mcp.md), and the [SDKs](../sdks/python.md). Framework integrations like this one are community-maintained.
:::

[AgentKit](https://github.com/coinbase/agentkit) is Coinbase's framework for building AI agents with wallet capabilities. Combined with BlockRun, your agents can both hold assets AND pay for AI intelligence.

## Overview

AgentKit provides:
- Wallet management (CDP server wallets, or a local key via `EthAccountWalletProvider`)
- Action providers (wallet, ERC-20, swaps, DeFi protocols, …) exposed as agent tools
- Framework extensions (`coinbase-agentkit-langchain`, …)

BlockRun adds:
- 76 chat models (95 in the full catalog)
- Pay-per-request intelligence
- No API key management

## Setup

::::steps

:::step{title="Install both packages"}
```bash
pip install coinbase-agentkit blockrun-llm eth-account
```

`coinbase-agentkit` 0.7.x requires Python 3.10+.
:::

:::step{title="Initialize AgentKit and BlockRun on one key"}
The simplest setup shares a single Base private key: AgentKit signs transactions with it, BlockRun signs x402 payments with it. (Use a separate `BLOCKRUN_WALLET_KEY` if you want AI spend accounted apart from trading capital.)

```python
import os
from eth_account import Account
from coinbase_agentkit import (
    AgentKit,
    AgentKitConfig,
    EthAccountWalletProvider,
    EthAccountWalletProviderConfig,
)
from blockrun_llm import LLMClient

private_key = os.environ["BLOCKRUN_WALLET_KEY"]   # 0x-prefixed

# AgentKit — local key on Base mainnet (chain 8453)
wallet_provider = EthAccountWalletProvider(
    config=EthAccountWalletProviderConfig(
        account=Account.from_key(private_key),
        chain_id="8453",
    )
)
agent_kit = AgentKit(AgentKitConfig(wallet_provider=wallet_provider))

# BlockRun — same key pays for AI
blockrun = LLMClient(private_key=private_key)
```

Prefer CDP-managed keys? Construct `CdpEvmWalletProvider` with your CDP API credentials instead and keep BlockRun on its own local key — CDP server wallets do not expose a private key for the SDK to sign with.
:::

::::

## Usage

### AI-Powered Trading Agent

```python
# Get AI analysis of what the wallet holds
address = wallet_provider.get_address()
balance = wallet_provider.get_balance()   # native balance, in wei

analysis = blockrun.chat(
    "openai/gpt-5.4",
    f"Wallet {address} holds {balance} wei of ETH on Base. "
    "Should it rotate into USDC? Answer BUY, SELL or HOLD with one reason."
)

# Execute through AgentKit's action providers
actions = {a.name: a for a in agent_kit.get_actions()}
print(sorted(actions))          # e.g. WalletActionProvider_native_transfer, ERC20ActionProvider_transfer, ...

if "SELL" in analysis.upper():
    # pick the swap/transfer action you have enabled and invoke it with its schema
    ...
```

### Multi-Model Decision Making

```python
# Get opinions from multiple models
gpt_opinion = blockrun.chat("openai/gpt-5.4", market_question)
claude_opinion = blockrun.chat("anthropic/claude-sonnet-4.6", market_question)
deepseek_opinion = blockrun.chat("deepseek/deepseek-chat", market_question)

# Aggregate and decide
final_decision = blockrun.chat(
    "openai/gpt-5.4",
    f"Synthesize these opinions: {gpt_opinion}, {claude_opinion}, {deepseek_opinion}"
)
```

### AgentKit tools + BlockRun as the model (LangChain)

AgentKit's LangChain extension turns every action provider into a tool. Run the [BlockRun LiteLLM sidecar](langchain.md) (Path 1 on the LangChain page) and point `ChatOpenAI` at it, and the whole ReAct loop — reasoning and on-chain execution — pays per request with no OpenAI key:

```bash
pip install coinbase-agentkit-langchain langchain-openai langgraph 'blockrun-litellm[proxy]'
export BLOCKRUN_WALLET_KEY=0x...
blockrun-litellm-proxy --port 4001 &
```

```python
from coinbase_agentkit_langchain import get_langchain_tools
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

tools = get_langchain_tools(agent_kit)
llm = ChatOpenAI(model="openai/gpt-5.4", base_url="http://127.0.0.1:4001/v1", api_key="dummy")

agent = create_react_agent(llm, tools)
result = agent.invoke({"messages": [("human", "What is my wallet balance?")]})
print(result["messages"][-1].content)
```

## Wallet Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Agent                       │
├─────────────────────┬───────────────────────────┤
│    AgentKit Wallet  │     BlockRun Wallet       │
│    (Trading/Assets) │   (AI Payments)           │
│                     │                           │
│  • Hold ETH, USDC   │  • Pay for GPT-5.4        │
│  • Execute swaps    │  • Pay for Claude         │
│  • Transfer assets  │  • Pay for images         │
└─────────────────────┴───────────────────────────┘
```

You can use the same wallet for both, or separate wallets for accounting.

## Example: Autonomous Trading Bot

```python
import asyncio
import os
from eth_account import Account
from coinbase_agentkit import (
    AgentKit, AgentKitConfig, EthAccountWalletProvider, EthAccountWalletProviderConfig,
)
from blockrun_llm import LLMClient

class TradingBot:
    def __init__(self):
        key = os.environ["BLOCKRUN_WALLET_KEY"]
        self.wallet = EthAccountWalletProvider(
            config=EthAccountWalletProviderConfig(account=Account.from_key(key), chain_id="8453")
        )
        self.agent_kit = AgentKit(AgentKitConfig(wallet_provider=self.wallet))
        self.actions = {a.name: a for a in self.agent_kit.get_actions()}
        self.blockrun = LLMClient(private_key=key)

    async def analyze_market(self, asset: str) -> dict:
        """Get AI analysis of an asset."""
        prompt = f"""
        Analyze {asset} for trading:
        1. Technical indicators
        2. Sentiment
        3. Risk assessment
        4. Recommendation (buy/hold/sell)
        """

        response = self.blockrun.chat("openai/gpt-5.4", prompt)
        return {"analysis": response, "asset": asset}

    async def execute_trade(self, decision: dict):
        """Execute trade based on AI decision via an AgentKit action."""
        action = self.actions.get(decision["action_name"])
        if action:
            action.invoke(decision["args"])

    async def run(self):
        """Main trading loop."""
        while True:
            analysis = await self.analyze_market("ETH")
            # Parse analysis into {"action_name": ..., "args": {...}} and execute
            await asyncio.sleep(3600)  # Check hourly

# Run the bot
bot = TradingBot()
asyncio.run(bot.run())
```

## Cost Optimization

AgentKit handles gas fees for transactions. BlockRun handles AI costs.

```python
# Use cheap models for routine analysis
routine_analysis = blockrun.chat(
    "deepseek/deepseek-chat",  # $0.14/M input tokens
    "Quick market check..."
)

# Use premium models for important decisions
important_decision = blockrun.chat(
    "openai/gpt-5.4",  # $2.50/M input tokens
    "Should I execute this $10k trade?"
)

# Or let the bundled router decide per request
routed = blockrun.smart_chat("Quick market check...")
```

## Security

| Aspect | AgentKit | BlockRun |
|--------|----------|----------|
| Key storage | CDP server wallet or local `eth_account` key | Local (`BLOCKRUN_WALLET_KEY` or `~/.blockrun/.session`) |
| Transactions | On-chain signed | EIP-712 x402 signatures |
| Verification | Basescan | Basescan |

## Links

- [AgentKit Documentation](https://github.com/coinbase/agentkit)
- [Coinbase CDP](https://coinbase.com/cloud)
- [BlockRun Python SDK](../sdks/python.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)

## What's next?

::::cards

:::card{title="BlockRun Python SDK" href="../sdks/python.md" icon="Code"}
Full reference for the `LLMClient` that powers AI payments in your agent.
:::

:::card{title="Agent Developer Guide" href="../getting-started/agent-developers.md" icon="Brain"}
Patterns for building autonomous agents that pay as they work.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
