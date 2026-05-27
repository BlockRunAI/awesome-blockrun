# Video Generation API

Generate short AI videos with **OpenAI Sora 2**, **xAI Grok Imagine**, or **ByteDance Seedance**. Text (or image) prompt in, MP4 URL out — paid per call with USDC on Base via x402.

- **Endpoint:** `POST https://blockrun.ai/v1/videos/generations`
- **Poll:** `GET https://blockrun.ai/v1/videos/generations/{id}?model=…&duration=…`
- **Payment:** x402, **USDC on Base** mainnet (`network: "base"`, `x402Version: 2`). Minimum charge $0.001.

> The `/v1/...` and `/api/v1/...` paths are equivalent (the gateway rewrites `/v1` → `/api/v1`). Examples below use `/v1`.

---

## Sample output

A real `azure/sora-2` clip generated through this exact API — 4s, 720p, synced audio (text-to-video):

<video src="https://blockrun.ai/api/media/media/videos/2026/05/27/video_6a1670cac7a081909309f1b6b85fbb40-6af6c7a4.mp4" controls muted width="480"></video>

> ▶️ [Open the sample clip directly](https://blockrun.ai/api/media/media/videos/2026/05/27/video_6a1670cac7a081909309f1b6b85fbb40-6af6c7a4.mp4) if the inline player doesn't load.

---

## How it works — async submit → poll → settle

Video generation is **asynchronous and two-step**. A clip takes ~60–180s upstream, far longer than a single HTTP request should stay open, so the flow is:

1. **`POST /v1/videos/generations`** — verifies your x402 payment (verify only, **no charge yet**) and submits the upstream job. Returns `202` in ~3–20s with a job `id` and a `poll_url`.
2. **`GET {poll_url}`** — poll every 5–10s with an `x-payment` header signed by the **same wallet**. While the job runs you get `202`. When it finishes you get `200` with the video URL, and **that is the moment you are charged** (settlement happens on the first `completed` poll).

Key guarantees:

| Guarantee | Detail |
|---|---|
| **No charge on failure** | If the upstream job fails or you never poll, no USDC moves. Settlement only fires on a `completed` poll. |
| **Wallet binding, not signature equality** | The poll must be signed by the wallet that submitted the POST. A *fresh* signature from that same wallet is fine — the poll endpoint returns its own 402 challenge if no header is sent, so standard x402 clients re-sign automatically. |
| **Idempotent re-polls** | Polling an already-settled job returns the same video URL again (`payment.status: "already_settled"`) — you are never double-charged. |
| **Replay-protected** | Each signed authorization can submit exactly one job (nonce claim on POST). |
| **Durable output** | The clip is mirrored to BlockRun's GCS bucket before settlement; `data[].url` is the permanent BlockRun-hosted URL, `data[].source_url` is the (often temporary) upstream URL. |

> **SDKs and ClawRouter hide all of this.** The TypeScript `VideoClient` and the local ClawRouter proxy run the submit+poll loop for you, so you make a single call and get the finished video back. The two-step contract below is only relevant if you call the raw HTTP API yourself.

---

## Available models

| Model ID | Provider | Durations (sec) | Resolution | Image-to-video | Synced audio | Character / RealFace asset |
|---|---|---|---|---|---|---|
| `azure/sora-2` | OpenAI (via Azure) | **4 / 8 / 12** (default 4 — only these three) | 720p, portrait or landscape | ❌ | ✅ | ❌ |
| `xai/grok-imagine-video` | xAI | 8 (fixed) | upstream default | ✅ | — | ❌ |
| `bytedance/seedance-1.5-pro` | ByteDance (Token360) | default 5, max 10 | 720p (default) | ✅ | ✅ (t2v) | ❌ |
| `bytedance/seedance-2.0-fast` | ByteDance (Token360) | default 5, max 10 | 720p (default) | ✅ | ✅ (t2v) | ✅ |
| `bytedance/seedance-2.0` (Pro) | ByteDance (Token360) | default 5, max 10 | 720p (default) | ✅ | ✅ (t2v) | ✅ |

Notes:

- **Sora 2** accepts only `duration_seconds` of **4, 8, or 12** — any other value returns `400` listing the allowed set. Text-to-video only (no `image_url`). Output is 720p with synchronized audio, portrait or landscape.
- **Grok Imagine** is fixed at 8s; it accepts an optional `image_url` and ignores the Seedance-only tuning params (`resolution`, `aspect_ratio`, `generate_audio`, etc.).
- **Seedance** is Token360-backed. The gateway bumps the default to **720p** and sets `generate_audio` per the t2v/i2v split below. Only Seedance **2.0** / **2.0-fast** accept a `real_face_asset_id` (`ta_xxxx`) for character/identity consistency. `seedance-2.0-fast` finishes in ~60–80s; `seedance-2.0` (Pro) is higher quality and slower.

---

## Request parameters (POST body, JSON)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model` | string | No | Video model ID (default `xai/grok-imagine-video`). See table above. |
| `prompt` | string | **Yes** | Text description of the video to generate. |
| `image_url` | string (URL) | No | Seed image for image-to-video. Only models with image-to-video support (everything except `azure/sora-2`). Mutually exclusive with `real_face_asset_id`. |
| `real_face_asset_id` | string | No | Character/face reference asset (`ta_xxxxxx`) from a [Virtual Portrait](virtual-portrait.md) (AI character) or [RealFace](realface.md) (real person). **Seedance 2.0 / 2.0-fast only.** Mutually exclusive with `image_url`. |
| `duration_seconds` | integer | No | Duration to bill for. Defaults to the model default. Must respect the model's max (and, for Sora 2, the discrete `{4,8,12}` set) or you get a `400`. |
| `resolution` | string | No | `360p` / `480p` / `540p` / `720p` / `1080p` / `1K` / `2K` / `4K`. **Seedance defaults to `720p`**; higher resolutions cost more tokens upstream. Seedance only. |
| `aspect_ratio` | string | No | `adaptive` / `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `21:9` / `9:21`. Seedance only — ignored by Grok. |
| `generate_audio` | boolean | No | Synced audio track. **Seedance default: `true` for text-to-video, `false` for image/face-conditioned.** Pass explicitly to override. Ignored by Grok. |
| `seed` | integer | No | Reproducibility seed (Seedance). Same seed + prompt + params ≈ same clip. |
| `watermark` | boolean | No | Embed the upstream Seedance watermark. Off by default at the gateway. |
| `return_last_frame` | boolean | No | Also return the last frame as a still — useful for chaining clips. Seedance only. |

---

## Pricing

All prices include the gateway's standard **5% margin** — i.e. these are the amounts quoted in the `402` challenge and actually billed in USDC.

| Model | Billing basis | Effective price |
|---|---|---|
| `azure/sora-2` | $0.10 / second (flat) | **4s = $0.42** · **8s = $0.84** · **12s = $1.26** |
| `xai/grok-imagine-video` | $0.05 / second (flat) | **8s = $0.42** |
| `bytedance/seedance-1.5-pro` | Token-metered ($4.32 / M tokens) | **5s ≈ $0.46** · **10s ≈ $0.92** (text = image, flat) |
| `bytedance/seedance-2.0-fast` | Token-metered ($11.20/M text · $6.60/M image) | **t2v 5s ≈ $1.19 / 10s ≈ $2.38** · **i2v 5s ≈ $0.70 / 10s ≈ $1.40** |
| `bytedance/seedance-2.0` (Pro) | Token-metered ($14/M text · $8.60/M image) | **t2v 5s ≈ $1.49 / 10s ≈ $2.98** · **i2v 5s ≈ $0.91 / 10s ≈ $1.83** |

**Seedance token math:** at the 720p default a clip uses **~20,256 tokens/second** (a 5s clip ≈ 101,300 tokens). Price = `duration × 20,256 × rate-per-M ÷ 1,000,000 × 1.05`. The image-input rate is cheaper (Token360 uses fewer tokens when conditioning on a frame). Drop to `resolution: "480p"` for roughly half the per-clip cost; `1080p` / `4K` cost proportionally more.

**One-time enrollment fees (separate from per-call billing):**

| Action | Endpoint | Price |
|---|---|---|
| Virtual Portrait enrollment | [`POST /v1/portrait/enroll`](virtual-portrait.md) | $0.01 USDC per asset (no KYC) |
| RealFace enrollment | [`POST /v1/realface/enroll`](realface.md) | $0.01 USDC per asset (no KYC, requires ~1-min on-phone liveness) |

---

## Responses

### 1. POST → `202 Accepted` (job submitted)

```json
{
  "id": "azure:vidjob_abc123",
  "object": "video.generation.job",
  "status": "queued",
  "model": "azure/sora-2",
  "duration_seconds": 8,
  "price": { "amount": "0.840000", "currency": "USD" },
  "payment_status": "verified",
  "created": 1776443975,
  "poll_url": "/api/v1/videos/generations/azure%3Avidjob_abc123?model=azure%2Fsora-2&duration=8"
}
```

The `id` is a composite `"{provider}:{upstreamId}"`. The `poll_url` already encodes the required `?model` and `?duration` query params — preserve them when polling.

### 2. GET poll → `202` (still generating)

```json
{
  "id": "azure:vidjob_abc123",
  "object": "video.generation.job",
  "status": "in_progress",
  "model": "azure/sora-2",
  "payment_status": "verified",
  "note": "Upstream is still generating. Poll again in 5-10s. No charge until status=completed."
}
```

`status` is `queued` or `in_progress`. Keep polling every 5–10s.

### 3. GET poll → `200` (completed — charged here)

```json
{
  "id": "azure:vidjob_abc123",
  "object": "video.generation.job",
  "status": "completed",
  "model": "azure/sora-2",
  "created": 1776444180,
  "data": [
    {
      "url": "https://blockrun.ai/api/media/media/videos/2026/05/27/<id>.mp4",
      "source_url": "https://<upstream-host>/<id>.mp4",
      "duration_seconds": 8,
      "request_id": "vidjob_abc123",
      "backed_up": true
    }
  ],
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

On settlement the response also carries `PAYMENT-RESPONSE` and `X-Payment-Receipt` (the on-chain tx hash) headers. A re-poll of an already-settled job returns the same body with `payment.status: "already_settled"` and no new charge.

### GET poll → `200` (failed — not charged)

```json
{
  "id": "azure:vidjob_abc123",
  "object": "video.generation.job",
  "status": "failed",
  "model": "azure/sora-2",
  "error": "<upstream reason>",
  "payment_status": "not_charged",
  "note": "Upstream generation failed. No payment was taken."
}
```

### Response fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Composite job id `"{provider}:{upstreamId}"` |
| `status` | string | `queued` → `in_progress` → `completed` \| `failed` |
| `data[].url` | string | Permanent BlockRun-hosted URL (GCS-backed). Falls back to upstream URL if backup fails. |
| `data[].source_url` | string | Original upstream URL (may expire) |
| `data[].duration_seconds` | integer | Duration of the generated clip |
| `data[].request_id` | string | Upstream request id for debugging |
| `data[].backed_up` | boolean | `true` when mirrored to BlockRun's GCS bucket |
| `payment.status` | string | `settled` \| `already_settled` |
| `payment.tx_hash` | string | On-chain USDC settlement tx (also in `X-Payment-Receipt` header) |

---

## Examples

### TypeScript SDK (`@blockrun/llm`) — handles submit + poll for you

```ts
import { VideoClient } from "@blockrun/llm";

const client = new VideoClient({ privateKey: "0x..." }); // EOA with USDC on Base

const result = await client.generate("a corgi surfing at sunset, cinematic", {
  model: "azure/sora-2",
  durationSeconds: 8,
});

console.log(result.data[0].url);  // permanent MP4 URL
console.log(result.txHash);       // settlement tx
```

`VideoClient` polls internally up to its `timeout` (default 300000ms / 5 min). Options mirror the request params: `model`, `imageUrl`, `realFaceAssetId`, `durationSeconds`, `aspectRatio`, `resolution`, `generateAudio`, `seed`, `watermark`, `returnLastFrame`.

> The Python SDK does not yet ship a video helper — use the raw two-step HTTP flow below (sign the POST and the poll with the same wallet), or ClawRouter.

### ClawRouter (local proxy — auto x402, single call)

ClawRouter signs payments and runs the poll loop, so you just POST and wait for the finished clip.

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{ "model": "azure/sora-2", "prompt": "a neon-lit cyberpunk street, slow dolly forward", "duration_seconds": 8 }'
```

### Raw HTTP — two steps

**Step 1 — submit:**

```bash
curl -X POST https://blockrun.ai/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{ "model": "azure/sora-2", "prompt": "a hummingbird hovering at a red flower, ultra slow motion", "duration_seconds": 8 }'
# → 202 { "id": "...", "poll_url": "/api/v1/videos/generations/...?model=...&duration=8", ... }
```

**Step 2 — poll until completed (re-sign with the SAME wallet):**

```bash
curl "https://blockrun.ai/v1/videos/generations/azure%3Avidjob_abc123?model=azure%2Fsora-2&duration=8" \
  -H "X-Payment: $FRESH_PAYMENT_HEADER_SAME_WALLET"
# → 202 in_progress … repeat every 5–10s … → 200 completed { data:[{url}], payment:{status:"settled"} }
```

### Image-to-video (Grok / Seedance)

```bash
curl -X POST https://blockrun.ai/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{ "model": "bytedance/seedance-2.0", "prompt": "the subject turns and smiles", "image_url": "https://example.com/portrait.jpg" }'
```

### Character consistency (Seedance 2.0 fast / pro)

Pass a `ta_xxxx` asset from a Virtual Portrait or RealFace enrollment to keep the same identity across clips. Mutually exclusive with `image_url`.

```json
{
  "model": "bytedance/seedance-2.0",
  "prompt": "the subject smiles warmly and waves at the camera",
  "real_face_asset_id": "ta_abc123xyz"
}
```

| Asset type | Use when | KYC? | Liveness? | Cost | Enroll via |
|---|---|---|---|---|---|
| [**Virtual Portrait**](virtual-portrait.md) | AI character, mascot, avatar | No | No | $0.01 USDC | [`POST /v1/portrait/enroll`](virtual-portrait.md) · [studio/portrait](https://blockrun.ai/studio/portrait) |
| [**RealFace**](realface.md) | Real person you have rights to | No | Yes (~1 min on phone) | $0.01 USDC (promo) | [`POST /v1/realface/init`](realface.md) + `/enroll` · [studio/realface](https://blockrun.ai/studio/realface) |

---

## Timing

| Phase | Typical latency |
|---|---|
| POST → upstream job submitted (`202`) | ~3–20s |
| Polling until clip ready | 60–180s (poll every 5–10s) |
| GCS backup + settle on the completed poll | ~1–30s |

Set your HTTP client timeout to at least 180s per poll. The POST handler itself caps the upstream submit at ~20s (returns `504`, no charge, if upstream doesn't acknowledge).

---

## Error codes

| Code | Where | Description |
|---|---|---|
| 400 | POST / GET | Invalid request — bad/missing prompt, unsupported `image_url`/`real_face_asset_id` for the model, `duration_seconds` above max or not in the model's allowed set, model/provider mismatch on the poll. |
| 402 | POST / GET | Payment required (no header → x402 challenge), or payment verify/settle failed. On a completed-but-unsettleable poll, the clip was generated but the signed authorization could not be settled (often expired) — retry the poll. |
| 400 | POST | Content policy violation (`Content policy violation`). |
| 429 | POST / GET | Upstream rate limit. Response includes `Retry-After` (and `X-RateLimit-Source` for Token360). |
| 500 | POST / GET | Server / provider configuration error. |
| 504 | POST | Upstream submit timed out (>~20s). **No payment taken** — retry. |
| 504 | GET | Upstream poll timed out — retry the poll in a few seconds. |

---

## Links

- [Virtual Portrait Enrollment](virtual-portrait.md) — zero-KYC `ta_xxx` for AI-character consistency
- [RealFace Enrollment](realface.md) — real-person likeness with on-phone liveness (no KYC)
- [Real-person video walkthrough](https://blockrun.ai/docs/video/real-person-ip)
- [Image Generation](image-generation.md) · [Music Generation](music-generation.md) · [Error Handling](errors.md)
