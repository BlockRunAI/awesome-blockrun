# AgentKit Integration

Use BlockRun with Coinbase AgentKit for wallet-enabled AI agents.

[AgentKit](https://github.com/coinbase/agentkit) is Coinbase's framework for building AI agents with wallet capabilities. Combined with BlockRun, your agents can both hold assets AND pay for AI intelligence.

## Overview

AgentKit provides:
- Wallet management (via Coinbase CDP)
- Transaction execution
- Asset management

BlockRun adds:
- 30+ AI model access
- Pay-per-request intelligence
- No API key management

## Installation

```bash
pip install coinbase-agentkit blockrun-llm
```

## Configuration

```python
from coinbase_agentkit import AgentKit
from blockrun_llm import LLMClient

# Initialize AgentKit with CDP
agent_kit = AgentKit.from_cdp()

# Initialize BlockRun for AI
blockrun = LLMClient(private_key=agent_kit.wallet.private_key)
```

## Usage

### AI-Powered Trading Agent

```python
from coinbase_agentkit import AgentKit
from blockrun_llm import LLMClient

# Setup
agent_kit = AgentKit.from_cdp()
blockrun = LLMClient()

# Get AI analysis
analysis = blockrun.chat(
    "openai/gpt-4o",
    f"Analyze this portfolio: {agent_kit.get_balances()}"
)

# Execute based on analysis
if "buy" in analysis.lower():
    agent_kit.swap("USDC", "ETH", amount=100)
```

### Multi-Model Decision Making

```python
# Get opinions from multiple models
gpt_opinion = blockrun.chat("openai/gpt-4o", market_question)
claude_opinion = blockrun.chat("anthropic/claude-sonnet-4", market_question)
deepseek_opinion = blockrun.chat("deepseek/deepseek-v3", market_question)

# Aggregate and decide
final_decision = blockrun.chat(
    "openai/gpt-4o",
    f"Synthesize these opinions: {gpt_opinion}, {claude_opinion}, {deepseek_opinion}"
)
```

## Wallet Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Agent                       │
├─────────────────────┬───────────────────────────┤
│    AgentKit Wallet  │     BlockRun Wallet       │
│    (Trading/Assets) │   (AI Payments)           │
│                     │                           │
│  • Hold ETH, USDC   │  • Pay for GPT-4o         │
│  • Execute swaps    │  • Pay for Claude         │
│  • Transfer assets  │  • Pay for images         │
└─────────────────────┴───────────────────────────┘
```

You can use the same wallet for both, or separate wallets for accounting.

## Example: Autonomous Trading Bot

```python
import asyncio
from coinbase_agentkit import AgentKit
from blockrun_llm import LLMClient

class TradingBot:
    def __init__(self):
        self.agent_kit = AgentKit.from_cdp()
        self.blockrun = LLMClient()

    async def analyze_market(self, asset: str) -> dict:
        """Get AI analysis of an asset."""
        prompt = f"""
        Analyze {asset} for trading:
        1. Technical indicators
        2. Sentiment
        3. Risk assessment
        4. Recommendation (buy/hold/sell)
        """

        response = self.blockrun.chat("openai/gpt-4o", prompt)
        return {"analysis": response, "asset": asset}

    async def execute_trade(self, decision: dict):
        """Execute trade based on AI decision."""
        if decision.get("action") == "buy":
            self.agent_kit.swap("USDC", decision["asset"], decision["amount"])
        elif decision.get("action") == "sell":
            self.agent_kit.swap(decision["asset"], "USDC", decision["amount"])

    async def run(self):
        """Main trading loop."""
        while True:
            analysis = await self.analyze_market("ETH")
            # Parse analysis and execute
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
    "deepseek/deepseek-v3",  # ~$0.14/M tokens
    "Quick market check..."
)

# Use premium models for important decisions
important_decision = blockrun.chat(
    "openai/gpt-4o",  # ~$2.50/M tokens
    "Should I execute this $10k trade?"
)
```

## Security

| Aspect | AgentKit | BlockRun |
|--------|----------|----------|
| Key storage | CDP MPC or local | Local (~/.blockrun/) |
| Transactions | On-chain signed | EIP-712 signatures |
| Verification | Etherscan | Basescan |

## Links

- [AgentKit Documentation](https://github.com/coinbase/agentkit)
- [Coinbase CDP](https://coinbase.com/cloud)
- [BlockRun Python SDK](../sdks/python.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)
