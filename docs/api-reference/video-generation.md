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
| `real_face_asset_id` | string | No | Face-reference asset ID (`ta_xxxxxx`) — either a [Virtual Portrait](virtual-portrait.md) (AI character, $0.50, no KYC) or a [RealFace](realface.md) (real person, $1.00, no KYC, requires brief liveness check on phone). Keeps the same character / person across multiple Seedance videos. **Seedance 2.0 fast/pro only.** Mutually exclusive with `image_url`. |
| `duration_seconds` | integer | No | Duration billed for (defaults to model's default) |
| `resolution` | string | No | `360p` / `480p` / `720p` / `1080p` / `4K`. **Seedance defaults to `720p`**; Grok uses its own default. Higher resolutions cost more tokens upstream. |
| `generate_audio` | boolean | No | Synced audio in the output. **Seedance defaults: `true` for text-to-video, `false` for image/face-conditioned**. Pass an explicit value to override. Grok ignores this field. |
| `aspect_ratio` | string | No | Output aspect ratio: `adaptive` / `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `21:9` / `9:21`. Seedance only — silently ignored by xAI Grok. |
| `seed` | integer | No | Reproducibility seed (Seedance). Same seed + same prompt + same params ≈ same clip. |
| `watermark` | boolean | No | Embed the upstream Seedance watermark on the output. Defaults to off at the gateway. |
| `return_last_frame` | boolean | No | Return the last frame as a still image alongside the clip — useful for chaining one video into the next. Seedance only. |

### Available Models

| Model ID | Provider | Default / Max | Default Res | Billing | Virtual Portrait |
|----------|----------|---------------|-------------|---------|------------------|
| `xai/grok-imagine-video` | xAI | 8s / 8s MP4 | 720p | $0.050/second (8s clip ≈ $0.40) | – |
| `bytedance/seedance-1.5-pro` | ByteDance | 5s / 10s MP4 | **720p + audio (t2v)** | **$4.32 / M tokens** (flat) ≈ $0.46/5s | – |
| `bytedance/seedance-2.0-fast` | ByteDance | 5s / 10s MP4 | **720p + audio (t2v)** | **$11.20 / M (text)** or **$6.60 / M (image input)** ≈ $1.19/5s t2v | ✅ |
| `bytedance/seedance-2.0` | ByteDance | 5s / 10s MP4 | **720p + audio (t2v)** | **$14 / M (text)** or **$8.60 / M (image input)** ≈ $1.49/5s t2v | ✅ |

All models accept text prompts and an optional `image_url` for image-to-video. Seedance 2.0 fast/pro additionally accept a `real_face_asset_id` for AI-character consistency (see [Virtual Portrait](virtual-portrait.md)). Output is MP4 — 720p by default for Seedance with synced audio in the t2v path; 480p / 1080p / 4K are available via the `resolution` parameter.

`seedance-2.0-fast` generates in ~60–80 s; `seedance-2.0` (Pro) may take longer and can occasionally hit the 180 s per-model timeout — in that case the request returns 504 and **no payment is taken**.

### Seedance per-M-token billing (vs old per-second)

Seedance is billed by token360 in tokens, not seconds — at the **720p** default, a 5-second clip uses ~101,300 tokens (≈ 20,256 tok/sec). The pricing reflects token360's upstream cost exactly:

- `seedance-1.5-pro` at $4.32/M ≈ $0.46 per 5s 720p clip (text-only or image-input — flat)
- `seedance-2.0-fast` at $11.20/M ≈ $1.19 per 5s 720p clip text-only; $6.60/M ≈ $0.70 with image input
- `seedance-2.0` at $14/M ≈ $1.49 per 5s 720p clip text-only; $8.60/M ≈ $0.91 with image input

The image-input rate is cheaper because token360's underlying inference uses fewer tokens when conditioning on a frame. Drop to `resolution: "480p"` for roughly half the cost; bump to `1080p` / `4K` for higher fidelity at proportional cost.

### Character consistency (Seedance 2.0 fast / pro)

`real_face_asset_id` lets you condition generation on a pre-registered face and keep the same identity across multiple videos. Two flavours, both produce a `ta_xxxxxx` id usable identically:

| Asset type | Use when | KYC? | Liveness? | Cost | Enroll via |
|---|---|---|---|---|---|
| [**Virtual Portrait**](virtual-portrait.md) | AI-generated character, mascot, avatar | No | No | $0.50 USDC, one-time | [`POST /v1/portrait/enroll`](virtual-portrait.md) or [studio/portrait](https://blockrun.ai/studio/portrait) |
| [**RealFace**](realface.md) | Real person you have permission to use | No | Yes (~1 min on phone) | $1.00 USDC, one-time | [`POST /v1/realface/init`](realface.md) + [`/enroll`](realface.md) or [studio/realface](https://blockrun.ai/studio/realface) |

Both are passed identically on the video call:

```json
{
  "model": "bytedance/seedance-2.0",
  "prompt": "the subject smiles warmly and waves at the camera",
  "real_face_asset_id": "ta_abc123xyz"
}
```

Asset IDs must start with `ta_`. Used as the first frame's face reference. Cannot be combined with `image_url`. Browse / enroll at [blockrun.ai/studio/portrait](https://blockrun.ai/studio/portrait) or [blockrun.ai/studio/realface](https://blockrun.ai/studio/realface).

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

| Model | Unit | Price | Default 5s 720p cost (approx.) |
|-------|------|-------|---------------------------------|
| `xai/grok-imagine-video` | per second | $0.050 | 8s = $0.40 |
| `bytedance/seedance-1.5-pro` | per M tokens (flat) | $4.32 | $0.46 |
| `bytedance/seedance-2.0-fast` | per M tokens | $11.20 text / $6.60 image | $1.19 text / $0.70 image |
| `bytedance/seedance-2.0` | per M tokens | $14.00 text / $8.60 image | $1.49 text / $0.91 image |

Seedance tokens-per-second: **~20,256 at the default 720p**. Drop to `resolution: "480p"` for roughly half the per-clip cost.

**One-time enrollment fees (separate from per-call billing):**

| Action | Endpoint | Price |
|--------|----------|-------|
| Virtual Portrait enrollment | [`POST /v1/portrait/enroll`](virtual-portrait.md) | $0.50 USDC per asset (no KYC) |

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

- [Virtual Portrait Enrollment](virtual-portrait.md) — zero-KYC `ta_xxx` for character consistency
- [RealFace Enrollment](realface.md) — real-person likeness with liveness check (no KYC)
- [Real-person video walkthrough](https://blockrun.ai/docs/video/real-person-ip) — visual walkthrough of the RealFace flow
- [Image Generation](image-generation.md) — for still images via Grok Imagine and other providers
- [Music Generation](music-generation.md) — for audio
- [Error Handling](errors.md)
