# Text-to-Speech & Sound Effects API

Ultra-realistic voice synthesis and cinematic sound effects powered by ElevenLabs, behind x402. Pay per call in USDC — no ElevenLabs subscription, no API keys.

Text-to-speech is billed **per input character**, so the price is quoted up front in the 402 challenge and settlement only happens after the audio is generated. A failed generation is never charged.

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

> Price = `(characters / 1000) × model rate`, plus a 5% platform fee, minimum **$0.001** per request.

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

Flat price: **$0.05 / generation** (+5% fee).

## Voices (free)

```
GET /api/v1/audio/voices
```

Returns the available voices with their `voice_id`, `name`, and `alias` (if mapped). Pass the `alias` or `voice_id` as the `voice` field to `/v1/audio/speech`.

## Notes

- Audio is stored by BlockRun and returned as a permanent hosted URL.
- The price is recomputed from the request body on the paid call, so a payment signed for short text cannot be reused to synthesize longer text.
- Settlement happens only after successful synthesis; upstream failures are not charged.
