# Changelog

All notable changes to BlockRun.

## [Unreleased]

### Coming Soon
- Streaming support
- Solana network support
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
