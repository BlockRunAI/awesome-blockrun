# BlockRun

**Discover, Route, and Pay for Any AI Service with Stablecoin**

> 618+ x402 AI services. One unified gateway. No account needed.

[![Website](https://img.shields.io/badge/Website-blockrun.ai-blue)](https://blockrun.ai)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@BlockRunAI-1DA1F2)](https://x.com/BlockRunAI)

## Contribute & Get Recognized

We welcome contributions! Here's how you can help:

| Contribution | What You Can Do |
|--------------|-----------------|
| Code | Add features, fix bugs, improve SDKs |
| Docs | Improve documentation, add examples |
| Integrations | Build plugins for agent frameworks |
| Feedback | Report bugs, request features |

All contributors will be recognized in [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md).

**Join our community:** [Telegram](https://t.me/blockrunai) | [GitHub Issues](https://github.com/blockrunai/awesome-blockrun/issues)

---

## What is BlockRun?

BlockRun is the discovery and gateway platform for x402 AI services:

- **Discover** - Browse 618+ x402 AI services directory
- **LLM Gateway** - Pay-per-request access to GPT, Claude, Gemini
- **Route** - Call any x402 service with unified payment

**Wallet = Identity. No account needed.**

## SDKs

| Language | Repository | Install |
|----------|------------|---------|
| Python | [blockrun-llm](https://github.com/blockrunai/blockrun-llm) | `pip install blockrun-llm` |
| TypeScript | [blockrun-llm-ts](https://github.com/blockrunai/blockrun-llm-ts) | `npm i blockrun-llm` |
| Go | [blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go) | `go get github.com/blockrunai/blockrun-llm-go` |

## Quick Start

```python
from blockrun_llm import LLMClient

client = LLMClient(private_key="0x...")
response = client.chat("Hello!")
# Payment handled automatically via x402
```

## Supported Models

| Category | Models |
|----------|--------|
| LLMs | GPT-4o, GPT-5, Claude, Gemini, DeepSeek, Llama, Qwen |
| Reasoning | o1, o3, Grok |
| Image | DALL-E, Stable Diffusion, Flux |
| Voice | ElevenLabs, OpenAI TTS |

## Integrations

Help us integrate with more frameworks!

| Project | Status | Help Wanted |
|---------|--------|-------------|
| [GOAT SDK](https://github.com/crossmint/goat) | In Review | - |
| [ElizaOS](https://github.com/elizaOS/eliza) | Planned | Plugin development |
| [AgentKit](https://github.com/coinbase/agentkit) | Planned | Example code |
| [LangChain](https://github.com/langchain-ai/langchain) | Planned | Custom LLM provider |

Want to add an integration? [Open an issue](https://github.com/blockrunai/awesome-blockrun/issues) or submit a PR!

## Research

We analyzed every x402 transaction in December 2025.

**63 million payments. $7.5M in USDC. 1,100+ projects.**

This is the first real-world proof that AI agents can pay for services at scale.

| Report | Description |
|--------|-------------|
| [State of x402 2025](./research/State_of_x402_2025.pdf) | Full research report |
| [Web Version](./research/WEB_STATE_OF_X402.md) | Markdown version |
| [Presentation Deck](https://blockrun.ai/state-x402-2025-deck.pdf) | Slides |

Key findings:
- Average transaction: $0.12 (true micropayments impossible on traditional rails)
- 53% of volume is organic business activity
- Base dominates with 53.3% of services, Solana at 36.6%
- 76% of services priced at $0.10 or below

See [research/](./research/) for all reports and methodology.

## Documentation

- [Full Documentation](https://blockrun.ai/docs)
- [API Reference](./docs/api-reference/)
- [Getting Started](./docs/getting-started/)
- [x402 Protocol](./docs/x402/)

## More

- [Roadmap](./ROADMAP.md) - What we're building next
- [Vision](./VISION.md) - The future of AI agent payments
- [Acknowledgments](./ACKNOWLEDGMENTS.md) - Our partners and contributors
- [Community](./COMMUNITY.md) - How to get involved
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Links

- Website: [blockrun.ai](https://blockrun.ai)
- Twitter: [@BlockRunAI](https://x.com/BlockRunAI)
- GitHub: [github.com/blockrunai](https://github.com/blockrunai)
- Telegram: [t.me/blockrunai](https://t.me/blockrunai)

---

**BlockRun: Let AI agents pay for AI.**
