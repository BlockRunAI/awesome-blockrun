---
title: Changelog
description: All notable changes to BlockRun — gateway endpoints, model lineup, pricing, and SDK releases, newest first.
---

# Changelog

All notable changes to BlockRun, newest first — gateway endpoints, model lineup, pricing, and SDK releases.

## [2026-05-24 — late]

### Changed — Virtual Portrait enrollment dropped to $0.01 (parity with RealFace)
- **`POST /api/v1/portrait/enroll`**: $0.50 → **$0.01 USDC**. Token360 charges nothing for asset storage, so per-enrollment margin was always trivial; the old $0.50 was friction without offsetting cost. Now matches RealFace pricing — both are 1¢ to encourage adoption, and we make our money on the downstream Seedance per-clip revenue.
- All UI, docs, video-playground tooltips, and asset-storage comments updated to reflect the new price.

## [2026-05-24]

### Added — RealFace enrollment (real-person likeness, no KYC)
- **`POST /api/v1/realface/init`** + **`POST /api/v1/realface/enroll`** — full RealFace flow now live. The rights-holder scans a QR on their phone and completes a brief liveness check (nod + blink, ~1 minute), BlockRun's backend uploads the face photo and waits for an upstream biometric match, returns a `ta_xxxxxx` id usable as `real_face_asset_id` on Seedance 2.0 / 2.0-fast. **$0.01 USDC per enrollment** (promotional pricing), one-time. See [RealFace API reference](../api-reference/realface.md).
- **No KYC required.** No government ID, no account login, no name verification. Only a face-match between the live H5 capture and the photo you supply. Biometric data flows phone → upstream identity service directly, never touches BlockRun servers.
- **`GET /api/v1/realface/status?groupId=…`** — free polling endpoint, used by the studio UI to detect H5 completion.
- **`GET /api/v1/wallet/<address>/realfaces`** — symmetric to `/portraits`, lists a wallet's enrolled RealFaces.
- **[blockrun.ai/studio/realface](https://blockrun.ai/studio/realface)** — web UI: connect wallet → upload image URL → click Start → QR + countdown → poll for H5 completion → sign payment → copy `ta_xxx`.
- **Video playground dropdown** now combines Virtual Portrait + RealFace assets into a single `real_face_asset_id` selector, grouped by type.
- Header **Models** dropdown adds "RealFace Studio".

### Reversed — earlier 2026-05-22 "RealFace removed" entry
- The 2026-05-22 changelog entry "Removed — RealFace" was based on an integration that was blocked by an upstream webhook bug at our inference partner. The partner shipped a fix on 2026-05-24; we verified the end-to-end flow (group active after H5 → photo upload → `ta_xxx` active in 6s → Seedance video generated in 86s using the enrolled face). The original conclusion that RealFace requires KYC was wrong — actual flow is liveness-only (nod + blink), no ID or account binding.

---

## [2026-05-22]

### Added — Virtual Portrait enrollment (no KYC)
- **`POST /api/v1/portrait/enroll`** — $0.50 USDC per enrollment, x402-gated. Registers an AI-generated character image as a Virtual Portrait and returns a `ta_xxxxxx` id usable as `real_face_asset_id` on Seedance 2.0 / 2.0-fast. Settlement happens only after enrollment succeeds — no charge on upload failure. See [Virtual Portrait API reference](../api-reference/virtual-portrait.md).
- **`GET /api/v1/wallet/<address>/portraits`** — lists the portraits a wallet has enrolled. Free, rate-limited (20 req/hr/IP, shared with the wallet-reconciliation bucket).
- **[blockrun.ai/studio/portrait](https://blockrun.ai/studio/portrait)** — web UI: connect wallet → name + image URL → sign → copy `ta_xxx`. Existing portraits listed below the form.
- **Video playground** at `/models/bytedance-seedance-2.0-fast` (and 2.0 Pro) now shows a dropdown of the connected wallet's enrolled portraits instead of asking users to paste a `ta_xxx` manually.
- Header **Models** dropdown now exposes "Portrait Studio".

### ~~Removed — RealFace (real-person likeness) is no longer offered~~ *(reversed on 2026-05-24, see latest entry)*
- ~~BlockRun does not offer real-person likeness in video generation.~~ This conclusion was wrong — upstream had a webhook bug that made the group never transition to active; once fixed, the flow works without KYC. RealFace was reinstated on 2026-05-24.

### Changed — Seedance defaults bumped to 720p + synced audio
- `/api/v1/videos/generations` now defaults `resolution: "720p"` for all Seedance models (was 480p). Override by passing an explicit `resolution` (`360p` / `480p` / `720p` / `1080p` / `4K`).
- `/api/v1/videos/generations` now defaults `generate_audio: true` for text-to-video Seedance calls (`false` for image-conditioned or `real_face_asset_id` calls, where audio defaults are off per upstream guidance). Pass an explicit boolean to override.
- Output now matches JiMeng / BytePlus directly — same resolution, same multimodal audio path. Per-clip cost ≈ 2× the old 480p baseline because Seedance meters by tokens and 720p doubles the per-second count.
- Updated pricing table: **$0.46 / $1.19 / $1.49** per 5s 720p clip for 1.5-pro / 2.0-fast / 2.0 (was $0.22 / $0.57 / $0.71 at 480p, text-to-video).
- `tokensPerSecondAtDefault` updated to **20,256** in the model catalog (was 10,128).

### Fixed — Seedance copyright-filter UX
- The video playground now distinguishes Seedance's content-policy rejections from generic errors. On rejection, users see a clear "You were not charged" message + suggestions (rephrase with generic descriptors, switch to Grok Imagine Video, or enroll a Virtual Portrait for consistent characters).

---

## [2026-05-18]

### Added — Surf crypto data partnership
- **`/api/v1/surf/*`** — 83 crypto data endpoints in three flat price tiers ($0.001 / $0.005 / $0.02), covering CEX prices, on-chain SQL (sub-second ClickHouse, 80+ tables), Polymarket/Kalshi/dFlow prediction markets, wallet labels (smart-money, KOL, exchange), social mindshare, AI-curated news, and project/fund/token/wallet search. Payment settles 1:1 directly to Surf's treasury — BlockRun takes no margin in exchange for being the discovery + x402 layer. See [Surf API reference](../api-reference/surf.md).
- **`blockrun_surf` MCP tool** added to the BlockRun MCP server.
- Surf added as a partner in [Ecosystem](ecosystem.md).

### Added — Phone & Voice partnership (Bland.ai + Twilio)
- **`/api/v1/voice/call`** — outbound AI conversation calls. **$0.54 flat per call** (up to 30 min, default 5 min). Bland.ai upstream.
- **`/api/v1/phone/numbers/buy`** — provision a wallet-owned US/CA phone number for $5 (30-day lease). Twilio upstream. Ownership recorded in Firestore against the calling wallet — only that wallet can use the number as caller ID or renew it.
- **`/api/v1/phone/numbers/renew`** — extend lease by 30 days for $5.
- **`/api/v1/phone/numbers/list`** — list a wallet's active numbers.
- **`GET /api/v1/voice/call/{id}`** — free polling endpoint for call status / transcript / recording.
- See [Phone & Voice API reference](../api-reference/voice-phone.md).

### Added — BytePlus RealFace for Seedance video *(deprecated 2026-05-22 — see [Removed](#removed--realface-real-person-likeness-is-no-longer-offered))*
- `bytedance/seedance-2.0-fast` and `bytedance/seedance-2.0` now accept a `real_face_asset_id` parameter (`ta_xxxxxx` format) for face-reference image-to-video. Asset IDs are managed in BytePlus's RealFace catalog.
- **Superseded by [Virtual Portrait enrollment](../api-reference/virtual-portrait.md) (2026-05-22)** — the API field name is preserved, but the only supported asset type is now a BlockRun-issued Virtual Portrait (`POST /v1/portrait/enroll`). Real-person likeness is not offered.

### Added — Brand: Franklin → Franklin Agent
- Renamed the autonomous-agent product across the entire site, docs, and SDKs. Repo (`BlockRunAI/Franklin`) and CSS unchanged; surface copy now consistently says "Franklin Agent" to disambiguate from the personal name.

### Changed — Seedance pricing migrated to per-M-token
- Old per-second pricing ($0.03–$0.30 / sec) is deprecated. New per-M-token pricing aligned with token360 upstream:
  - `seedance-1.5-pro`: $4.32/M tokens (flat, 480p default)
  - `seedance-2.0-fast`: $11.20/M (text-only) or $6.60/M (with image input)
  - `seedance-2.0`: $14/M (text-only) or $8.60/M (with image input)
- Default resolution is 480p (token360 default). Effective rate at 10,128 tok/sec.

### Added — Rate-limit transparency
- 429 responses now carry `Retry-After` (RFC-7231 standard) + `X-RateLimit-Source: <provider>` headers, plus body fields `code: "RATE_LIMITED"`, `source`, `retry_after_seconds`. Clients can fail over to a same-tier model on a different provider, or honor the retry interval. See [Rate Limits](../api-reference/rate-limits.md) — there is no platform-side QPS/RPM/TPM quota on paid inference; upstream provider limits apply.

---

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
