# Changelog

All notable changes to BlockRun.

## [2026-03-24]

### API Changes
- `/api/v1/models` now returns extended metadata for each model: `name`, `description`, `context_window`, `max_output`, and `categories`
- Model categories indicate capabilities: `chat`, `reasoning`, `coding`, `vision`

### Models
- 33 visible models across 9 providers (Base), 31 on Solana
- Added GPT-5.4 Mini ($0.75/$4.50, 400K context)
- Added GPT-5.4 Nano, GPT-5.3, GPT-5.3 Codex
- Added Claude Opus 4.6 (1M context), Claude Sonnet 4.6
- Added Gemini 3.1 Pro, Gemini 3 Pro Preview, Gemini 3.1 Flash Lite
- Added NVIDIA Kimi K2.5 (free tier)
- Removed xAI/Grok, Qwen, and legacy GPT-4 family from visible lineup (hidden, still routable via API)

### SDK Updates
- TypeScript SDK (`@blockrun/llm`) v1.4.3: Model type now includes `categories`, `contextWindow`, `maxOutput`, properly mapped from API
- MCP Server (`@blockrun/mcp`) v0.4.2: `blockrun_models` shows context window and categories, smart routing updated to current models

### MCP Smart Routing
- `fast`: Gemini Flash, GPT-5 Mini
- `balanced`: GPT-5.4, Claude Sonnet 4.6
- `powerful`: GPT-5.4, Claude Opus 4.6
- `cheap`: NVIDIA free models, DeepSeek, Gemini Flash
- `reasoning`: o3, o1, DeepSeek Reasoner

---

## [Unreleased]

### Coming Soon
- Streaming support
- Additional AI providers

---

## [1.0.0] - 2025-12

### Added
- Initial public release
- x402 v2 protocol support
- OpenAI models (GPT-4o, GPT-4o Mini, o1, o1-mini)
- Anthropic models (Claude Opus 4, Sonnet 4, Haiku 4.5)
- Google models (Gemini 2.5 Pro, Gemini 2.5 Flash)
- xAI models (Grok 4)
- DeepSeek models (V3, R1)
- Meta models via Together.ai (Llama 3.3 70B)
- Qwen models via Together.ai (Qwen 2.5 72B)
- Mistral models (Mistral Large)
- Python SDK (`blockrun-llm`)
- TypeScript SDK (`@blockrun/llm`)
- Base network support (USDC)
- CDP Facilitator integration

### Technical
- EIP-3009 TransferWithAuthorization for gasless payments
- EIP-712 typed data signing
- Automatic retry with payment on 402 response
- OpenAI-compatible Chat Completions API

---

## SDK Versions

### Python SDK (blockrun-llm)

#### [0.1.0] - 2025-12
- Initial release
- `LLMClient` with `chat()` and `chat_completion()` methods
- `AsyncLLMClient` for async usage
- x402 v2 protocol support
- Error handling with `APIError` and `PaymentError`

### TypeScript SDK (@blockrun/llm)

#### [0.1.0] - 2025-12
- Initial release
- `LLMClient` class with full TypeScript types
- `chat()` and `chatCompletion()` methods
- `listModels()` for available models
- x402 v2 protocol support
- Error handling with `APIError` and `PaymentError`

---

## Version Policy

BlockRun follows [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking API changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

## Release Notes

For detailed release notes, see the GitHub releases page for each repository.
