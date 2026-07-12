---
title: Text-to-Speech & Sound Effects API
description: ElevenLabs voice synthesis, ByteDance Seed Audio prompt-directed audio creation, and cinematic sound effects behind x402 — no subscription, failed generations never charged.
---

# Text-to-Speech & Sound Effects API

Ultra-realistic voice synthesis (ElevenLabs), prompt-directed audio creation (ByteDance Seed Audio), and cinematic sound effects, behind x402. Pay per call in USDC — no subscriptions, no API keys.

ElevenLabs models are billed **per input character**; ByteDance Seed Audio is billed **per second of output audio** (quoted from an estimate of your input). Either way the price is quoted up front in the 402 challenge and settlement only happens after the audio is generated. A failed generation is never charged.

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
| `model` | string | No | Model ID (default: `elevenlabs/flash-v2.5`) |
| `input` | string | Yes | Text to synthesize |
| `voice` | string | No | Voice alias (e.g. `sarah`, `george`) or raw ElevenLabs `voice_id` (default: `sarah`) |
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
ElevenLabs models: price = `(characters / 1000) × model rate`, plus a 5% platform fee, minimum **$0.003** per request. The price is quoted up front in the 402 challenge and settlement only fires after the audio is generated — a failed generation is never charged.
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

- **Billing is per second of output audio** ($0.003/second). Since the exact
  duration isn't known before synthesis, the 402 quote prices an **estimated
  duration** derived from your input length (CJK text estimates slower speech
  than Latin text). The 402 body reports the estimate in
  `generation_info.estimated_seconds`, and the response reports the actual
  `duration_seconds`.
- Output is capped at **120 seconds** (so the maximum possible quote is $0.36).
- The `voice` parameter is **ignored** — direct the voice in the prompt itself.
- Supports up to 3,000 input characters.

### Response

```json
{
  "created": 1733443200,
  "model": "elevenlabs/flash-v2.5",
  "data": [
    {
      "url": "https://blockrun.ai/api/media/audios/2026/06/05/....mp3",
      "format": "mp3",
      "characters": 51
    }
  ]
}
```

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
| `text` | string | Yes | Description of the sound effect |
| `duration_seconds` | number | No | 0.5–22s (auto if omitted) |
| `prompt_influence` | number | No | 0–1, how strictly to follow the prompt |
| `response_format` | string | No | `mp3` (default), `opus`, `pcm`, `wav` |

Flat price: **$0.052 / generation** (+5% fee).

## Voices (free)

```
GET /api/v1/audio/voices
```

Returns the available voices with their `voice_id`, `name`, and `alias` (if mapped). Pass the `alias` or `voice_id` as the `voice` field to `/v1/audio/speech`.

## Notes

- Audio is stored by BlockRun and returned as a permanent hosted URL.
- The price is recomputed from the request body on the paid call, so a payment signed for short text cannot be reused to synthesize longer text.
- Settlement happens only after successful synthesis; upstream failures are not charged.

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
