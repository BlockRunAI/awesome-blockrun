---
title: Text-to-Speech & Sound Effects API
description: ElevenLabs voice synthesis, ByteDance Seed Audio prompt-directed audio creation, and cinematic sound effects behind x402 — no subscription, failed generations never charged.
---

# Text-to-Speech & Sound Effects API

Ultra-realistic voice synthesis (ElevenLabs models), prompt-directed audio creation (ByteDance Seed Audio), and cinematic sound effects, behind x402. Pay per call in USDC — no subscriptions, no API keys.

ElevenLabs models are billed **per input character**; ByteDance Seed Audio is billed **per second of output audio** (quoted from an estimate of your input). Either way the price is quoted up front in the 402 challenge and settlement only happens after the audio is generated **and stored**. A failed generation is never charged. All three endpoints are **synchronous** — one paid POST returns the finished audio URL.

## Endpoints

```
POST https://blockrun.ai/api/v1/audio/speech          # text-to-speech
POST https://blockrun.ai/api/v1/audio/sound-effects   # sound effect generation
GET  https://blockrun.ai/api/v1/audio/voices           # list voices (free)
```

## Text-to-Speech

### Request

```json
{
  "model": "elevenlabs/flash-v2.5",
  "input": "Hello from BlockRun. Pay per call, no subscription.",
  "voice": "sarah",
  "response_format": "mp3"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Model ID (default: `elevenlabs/flash-v2.5`). Unknown ids return `400` listing the available models. |
| `input` | string | Yes | Text to synthesize (1 char minimum; per-model maximum below — over it returns `400` before payment) |
| `voice` | string | No | Voice alias (e.g. `sarah`, `george`, case-insensitive) or a raw `voice_id` from `/v1/audio/voices` (default: `sarah`). Ignored by `bytedance/seed-audio-1.0`. |
| `response_format` | string | No | `mp3` (default), `opus`, `pcm`, `wav` |
| `speed` | number | No | Playback speed 0.7–1.2 |

### Models

| Model ID | Price | Max input | Best for |
|----------|-------|-----------|----------|
| `elevenlabs/flash-v2.5` | $0.05 / 1k chars | 40,000 | Real-time voice agents (~75ms) |
| `elevenlabs/turbo-v2.5` | $0.05 / 1k chars | 40,000 | Balanced quality/latency |
| `elevenlabs/multilingual-v2` | $0.10 / 1k chars | 10,000 | Studio-grade narration |
| `elevenlabs/v3` | $0.10 / 1k chars | 5,000 | Maximum expressiveness |
| `bytedance/seed-audio-1.0` | $0.003 / second of audio | 3,000 | Prompt-directed audio creation (voice, emotion, staging) |

:::info
ElevenLabs models: price = `(characters / 1000) × model rate × 1.05` (the 5% BlockRun media margin), floored at $0.001, **plus the flat $0.001 transaction fee** charged on every paid call — so the minimum quote is **$0.002** per request and 1,000 characters on `flash-v2.5` is **$0.0535**. The price is quoted up front in the 402 challenge and settlement only fires after the audio is generated and stored — a failed generation is never charged.
:::

#### Seed Audio 1.0 (ByteDance)

`bytedance/seed-audio-1.0` is not plain TTS — it is **prompt-directed audio
creation**: describe the voice, emotion, and sound staging in natural language
inside `input`, and the model performs it. Example:

```json
{
  "model": "bytedance/seed-audio-1.0",
  "input": "A middle-aged sports commentator, hoarse with excitement, shouts over a roaring stadium crowd: GOAL! Absolutely unbelievable!",
  "response_format": "mp3"
}
```

Differences from the ElevenLabs models:

- **Billing is per second of output audio** ($0.003/second, a final rate — the
  5% margin is *not* added on top; only the $0.001 transaction fee is). Since
  the exact duration isn't known before synthesis, the 402 quote prices an
  **estimated duration** derived from your input length (CJK text estimates
  slower speech than Latin text). The 402 body reports the estimate in
  `generation_info.estimated_seconds`, and the response reports the actual
  `duration_seconds`.
- Output is capped at **120 seconds** (so the maximum possible quote is $0.361).
- The `voice` parameter is **ignored** — direct the voice in the prompt itself.
- Supports up to 3,000 input characters.

### The 402 challenge

An unpaid POST returns `402` with the x402 requirement in the `X-Payment-Required` / `PAYMENT-REQUIRED` / `WWW-Authenticate` headers and an informational body:

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": { "amount": "0.053500", "currency": "USD" },
  "generation_info": {
    "characters": 1000,
    "model": "elevenlabs/flash-v2.5",
    "note": "Price scales with input character count. Synthesis is synchronous (typically <1s for Flash)."
  },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

For `bytedance/seed-audio-1.0` the `generation_info` block instead carries `estimated_seconds` and a note that billing is by output duration. `price.amount` already includes the $0.001 fee. Sign the requirement and re-send with the signature in `X-Payment` (also accepted: `Payment-Signature`).

### Response

```json
{
  "created": 1733443200,
  "model": "elevenlabs/flash-v2.5",
  "data": [
    {
      "url": "https://blockrun.ai/api/media/audios/2026/06/05/....mp3",
      "format": "mp3",
      "characters": 51,
      "credits": 51
    }
  ]
}
```

`credits` (ElevenLabs models) is the upstream-reported character cost when available; `bytedance/seed-audio-1.0` returns `duration_seconds` (the actual billed length) instead. The response carries `PAYMENT-RESPONSE` (base64 JSON `{success, transaction, network, payer}`) and `X-Payment-Receipt` (the settlement tx hash) headers.

## Sound Effects

```json
POST /api/v1/audio/sound-effects
{
  "text": "thunderclap with heavy rain",
  "duration_seconds": 5
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | `elevenlabs/sound-effects` (the only model; default) |
| `text` | string | Yes | Description of the sound effect (1–1,000 chars) |
| `duration_seconds` | number | No | 0.5–22s (auto if omitted) |
| `prompt_influence` | number | No | 0–1, how strictly to follow the prompt |
| `response_format` | string | No | `mp3` (default), `opus`, `pcm`, `wav` |

Flat price: **$0.0535 / generation** ($0.05 base + 5% margin + the $0.001 transaction fee), regardless of duration. The 402 body is `{ error, message, price: { amount, currency }, paymentInfo }`.

Response:

```json
{
  "created": 1733443200,
  "model": "elevenlabs/sound-effects",
  "data": [{ "url": "https://blockrun.ai/api/media/audios/2026/06/05/....mp3", "format": "mp3" }]
}
```

## Voices (free)

```
GET /api/v1/audio/voices
```

Returns the available voices with their `voice_id`, `name`, `category`, `labels` (accent, gender, age, use case, language), `preview_url`, and `alias` (if mapped). Pass the `alias` or `voice_id` as the `voice` field to `/v1/audio/speech`. No payment; rate-limited to 60 requests/minute per IP (`429` with `Retry-After`) and cached for 5 minutes.

```json
{
  "object": "list",
  "endpoint": "/v1/audio/speech",
  "note": "Pass a voice's `alias` (if present) or `voice_id` as the `voice` field to /v1/audio/speech.",
  "data": [
    { "voice_id": "EXAVITQu4vr4xnSDxMaL", "name": "Sarah - Mature, Reassuring, Confident", "category": "premade", "labels": { "accent": "american", "gender": "female", "age": "young", "language": "en" }, "preview_url": "…", "alias": "sarah" }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid JSON or parameters (`details` carries the schema issues), unknown / unavailable model, or `input` over the model's character cap (`Input too long: N characters (max M for <model>)`). All before payment. |
| 402 | Payment required (challenge), or verification failed with a machine-readable `code`: `PAYMENT_INVALID` (default), `PAYMENT_UNFUNDED` (authorization not executable on-chain — usually insufficient USDC on Base, or an expired window), `PAYMENT_REPLAY` (authorization already used — sign a fresh one). Also `Payment settlement failed` when the audio was produced but the authorization could not be settled (retry with a fresh signature). |
| 429 | Upstream rate limit — `Retry-After: 30`. Not charged. |
| 502 | Upstream provider error (`Upstream provider error`). Not charged. |
| 504 | Synthesis timed out. Not charged; retry. |
| 500 | Server / storage error (including a failed upload of the finished audio — no URL, so no charge). |

Every failure after a verified payment carries a `PAYMENT-RESPONSE` header with `success: false` so you can confirm nothing was settled.

## Notes

- Audio is stored by BlockRun and returned as a permanent hosted URL. If storage fails there is nothing to return, so the request fails **without** settling — retry for free.
- The price is recomputed from the request body on the paid call, so a payment signed for short text cannot be reused to synthesize longer text.
- Each signed authorization is single-use (nonce claim before synthesis); reusing one returns `402` with `code: "PAYMENT_REPLAY"`.
- Settlement happens only after successful synthesis and storage; upstream failures are not charged.

## What's next?

::::cards

:::card{title="Voice & Phone" href="voice-phone.md" icon="Zap"}
Place outbound AI voice calls from a wallet-owned number — synthesis plus telephony.
:::

:::card{title="Music Generation" href="music-generation.md" icon="Image"}
Generate full tracks from a prompt, billed per track in USDC.
:::

:::card{title="Error Handling" href="errors.md" icon="Code"}
The gateway-wide error envelope and 402 handling.
:::

::::
