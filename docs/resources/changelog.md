# Changelog

All notable changes to BlockRun.

## [2026-04-25]

### Models
- **Added `openai/gpt-5.5`** — released 2026-04-23, first fully retrained base since GPT-4.5. 1M context, 128K output, native agent + computer use. Pricing: $5.00 / $30.00 per 1M tokens.
- Promoted `openai/gpt-5.5` to `FEATURED_MODEL_IDS` (replaces `openai/gpt-5.4` as the OpenAI flagship surfaced on the homepage and discover pages).

### SDK Updates
- Python SDK (`blockrun-llm`) **0.17.0**: `PREMIUM_TIERS["MEDIUM"]` primary now `openai/gpt-5.5`; `gpt-5.4` demoted to first fallback. `estimate_cost` baseline rebased from $2.50/$15 to $5.00/$30 to match the new flagship. `__version__` and `VERSION` reconciled (was 0.16.1 vs 0.15.0).
- TypeScript SDK (`@blockrun/llm`) **1.11.0**: catalog refreshed with `openai/gpt-5.5`. `VERSION` and `package.json` reconciled (was 1.9.0 vs 1.10.1).
- Go SDK (`blockrun-llm-go`) **0.4.0**: `RoutingPremium.TierMedium` primary now `openai/gpt-5.5` (was `gpt-5.4`).

---

## [2026-04-17]

### Added — xAI Grok Imagine
- **Video generation** — new endpoint `POST /api/v1/videos/generations` with `xai/grok-imagine-video` ($0.050/sec, 8-second clips, text or image-to-video). The endpoint handles xAI's async job + polling internally so callers get the MP4 URL in a single request. See [Video Generation](../api-reference/video-generation.md).
- **Grok Imagine image models** — `xai/grok-imagine-image` ($0.02/image) and `xai/grok-imagine-image-pro` ($0.07/image) added to `POST /api/v1/images/generations`.
- **Grok 4.20 chat models** (hidden, API-routable) — `xai/grok-4.20-reasoning`, `xai/grok-4.20-non-reasoning`, `xai/grok-4.20-multi-agent`. 2M context, vision-capable, $2/M in · $6/M out.

### Added — Permanent media URLs via GCS backup
- Every generated image and video is now mirrored to BlockRun's Google Cloud Storage bucket and returned through a blockrun-hosted proxy URL (`/api/media/...`). Upstream URLs from `imgen.x.ai` and `vidgen.x.ai` are temporary — the returned `url` is permanent.
- Image/video responses now include:
  - `url` — permanent proxy URL (falls back to upstream if the backup step fails)
  - `source_url` — original upstream URL (for debugging / comparison)
  - `backed_up` — boolean indicating whether GCS mirroring succeeded

### API Changes
- `GET /api/v1/models` now includes video models with `billing_mode: "per_second"` and `pricing: { per_second, default_duration_seconds, max_duration_seconds }`.

---

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

### Added
- **Continue Integration** — ClawRouter merged as a native provider in [Continue](https://github.com/continuedev/continue) (32K+ ⭐), the open-source AI code assistant. Users can now select ClawRouter directly in Continue's provider settings for cost-optimized model routing. ([PR #11751](https://github.com/continuedev/continue/pull/11751))

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
