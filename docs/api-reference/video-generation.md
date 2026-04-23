# Video Generation API

Generate short AI videos with xAI's Grok Imagine or ByteDance's Seedance. Text or image prompt in, MP4 URL out.

## Endpoint

```
POST https://blockrun.ai/api/v1/videos/generations
```

## Request

```json
{
  "model": "xai/grok-imagine-video",
  "prompt": "a red apple slowly spinning on a wooden table, daylight",
  "image_url": "https://example.com/seed.jpg"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Video model ID (see below) |
| `prompt` | string | Yes | Text description of the video to generate |
| `image_url` | string | No | Optional seed image URL for image-to-video |
| `duration_seconds` | integer | No | Duration billed for (defaults to model's default) |

### Available Models

| Model ID | Provider | Default / Max | Billing |
|----------|----------|---------------|---------|
| `xai/grok-imagine-video` | xAI | 8s / 8s MP4 | $0.050/second (default 8s = $0.42 with margin) |
| `bytedance/seedance-1.5-pro` | ByteDance | 5s / 10s MP4 | $0.030/second (default 5s = $0.158 with margin) |
| `bytedance/seedance-2.0-fast` | ByteDance | 5s / 10s MP4 | $0.150/second (default 5s = $0.788 with margin) |
| `bytedance/seedance-2.0` | ByteDance | 5s / 10s MP4 | $0.300/second (default 5s = $1.575 with margin) |

All models accept text prompts and an optional `image_url` for image-to-video. Output is 720p MP4. `seedance-2.0-fast` generates in ~60–80 s; `seedance-2.0` (Pro) may take longer and can occasionally hit the 85 s timeout — in that case the request returns 504 and **no payment is taken**.

## Response

```json
{
  "created": 1776443975,
  "model": "xai/grok-imagine-video",
  "data": [
    {
      "url": "https://blockrun.ai/api/media/media/videos/2026/04/17/<id>.mp4",
      "source_url": "https://vidgen.x.ai/xai-vidgen-bucket/xai-video-<id>.mp4",
      "duration_seconds": 8,
      "request_id": "<xai-request-id>",
      "backed_up": true
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `data[].url` | string | Permanent URL. When GCS backup succeeds, this is a blockrun-hosted proxy URL; otherwise the upstream URL |
| `data[].source_url` | string | Original upstream URL from xAI (temporary — may expire) |
| `data[].duration_seconds` | integer | Duration of the generated video |
| `data[].request_id` | string | xAI request ID for debugging / deduplication |
| `data[].backed_up` | boolean | `true` when the video was mirrored to BlockRun's GCS bucket |

> **Why both `url` and `source_url`?** xAI's `vidgen.x.ai` URLs are temporary. BlockRun mirrors each generated video to Google Cloud Storage and returns the permanent proxy URL as `url`. `source_url` is kept for debugging. If the backup step fails, `url` falls back to the upstream URL and `backed_up` is `false`.

## Timing

Video generation is **asynchronous upstream**. This endpoint handles the full polling loop so you only need to make a single request.

| Phase | Typical latency |
|-------|-----------------|
| Request → xAI job submitted | ~1s |
| Polling until video ready | 15–60s (typically under 30s) |
| GCS backup + settle payment | 1–3s |
| **Total** | ~20–60s |

The connection stays open until the video is ready. Make sure your HTTP client allows at least 180s.

## Examples

### Via ClawRouter (recommended for local use)

ClawRouter handles x402 payments automatically.

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "xai/grok-imagine-video",
    "prompt": "a neon-lit cyberpunk street at night, camera slowly dollying forward"
  }'
```

### Direct API (cURL)

```bash
curl -X POST https://blockrun.ai/api/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{
    "model": "xai/grok-imagine-video",
    "prompt": "a hummingbird hovering in front of a red flower, ultra slow motion"
  }'
```

### Image-to-video

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "xai/grok-imagine-video",
    "prompt": "the subject turns its head and smiles",
    "image_url": "https://example.com/portrait.jpg"
  }'
```

## Pricing

| Model | Unit | Price | Margin | Default billed |
|-------|------|-------|--------|----------------|
| `xai/grok-imagine-video` | per second | $0.050 | 5% | 8s = $0.420 |
| `bytedance/seedance-1.5-pro` | per second | $0.030 | 5% | 5s = $0.158 |
| `bytedance/seedance-2.0-fast` | per second | $0.150 | 5% | 5s = $0.788 |
| `bytedance/seedance-2.0` | per second | $0.300 | 5% | 5s = $1.575 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad prompt, parameters, or `duration_seconds` above model max) |
| 402 | Payment required or payment verification/settlement failed |
| 403 | Content policy violation |
| 429 | Rate limit exceeded (xAI caps at 60 RPM) |
| 500 | Server error |
| 504 | Video generation timed out (upstream job did not finish within the 85s cap). No payment is taken. |

## Links

- [Image Generation](image-generation.md) — for still images via Grok Imagine and other providers
- [Music Generation](music-generation.md) — for audio
- [Error Handling](errors.md)
