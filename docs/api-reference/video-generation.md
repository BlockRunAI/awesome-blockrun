---
title: Video Generation API
description: Generate short AI videos with Sora 2, Grok Imagine, or Seedance — async submit-poll-settle, paid per call in USDC, no charge on timeout or failure.
---

# Video Generation API

Generate short AI videos with **OpenAI Sora 2**, **xAI Grok Imagine**, or **ByteDance Seedance**. Text (or image) prompt in, MP4 URL out — paid per call with USDC on Base via x402.

- **Endpoint:** `POST https://blockrun.ai/api/v1/videos/generations`
- **Poll:** `GET https://blockrun.ai/api/v1/videos/generations/{id}?model=…&duration=…&i2v=…&sig=…` — always use the `poll_url` the POST returns, verbatim
- **Payment:** x402, **USDC on Base** mainnet (`paymentInfo.network: "base"`, `x402Version: 2`; the signed requirement names the chain as `eip155:8453`). Every paid call carries a flat **$0.001 transaction fee** on top of the media price; the `price.amount` in the 402 body already includes it. The signed authorization window is 600s (`maxTimeoutSeconds`).

:::note
The gateway serves its API under `/api/v1/...`. The bare `/v1/...` form in some examples is the **ClawRouter** local-proxy surface (`http://localhost:8402/v1/...`) — `https://blockrun.ai/v1/...` returns `404`. Examples below use `/api/v1` for direct calls.
:::

---

## Sample output

A real `azure/sora-2` clip generated through this exact API — 4s, 720p, synced audio (text-to-video):

<video src="https://blockrun.ai/api/media/media/videos/2026/05/27/video_6a1670cac7a081909309f1b6b85fbb40-6af6c7a4.mp4" controls muted width="480"></video>

> ▶️ [Open the sample clip directly](https://blockrun.ai/api/media/media/videos/2026/05/27/video_6a1670cac7a081909309f1b6b85fbb40-6af6c7a4.mp4) if the inline player doesn't load.

---

## How it works — async submit → poll → settle

Video generation is **asynchronous and two-step**. A clip takes ~60–180s upstream, far longer than a single HTTP request should stay open, so the flow is:

::::steps

:::step{title="Submit the job"}
**`POST /api/v1/videos/generations`** — validates the body (all per-model gates run **before** the 402, so a bad resolution or duration costs nothing), verifies your x402 payment (verify only, **no charge yet**), claims the authorization's nonce so it cannot be reused for a second job, and submits the upstream job. Returns `202` in ~3–20s with an opaque job `id` and a `poll_url`.
:::

:::step{title="Poll until completed"}
**`GET {poll_url}`** — poll every 5–10s with an `x-payment` header signed by the **same wallet**. While the job runs you get `202`. When it finishes you get `200` with the video URL, and **that is the moment you are charged** (settlement happens on the first `completed` poll).
:::

::::

:::tip{title="No charge on timeout or failure"}
Settlement only fires on a `completed` poll. If the upstream job fails, times out, or you never poll, **no USDC moves**. Re-polling an already-settled job returns the same video URL (`payment.status: "already_settled"`) — you are never double-charged.
:::

Key guarantees:

| Guarantee | Detail |
|---|---|
| **No charge on failure** | If the upstream job fails or you never poll, no USDC moves. Settlement only fires on a `completed` poll. |
| **Wallet binding, not signature equality** | The poll must be signed by the wallet that submitted the POST. A *fresh* signature from that same wallet is fine — the poll endpoint returns its own 402 challenge if no header is sent, so standard x402 clients re-sign automatically. |
| **Idempotent re-polls** | The gateway claims a per-job settlement lock before charging, so concurrent or repeated polls of a finished job return the same video URL with `payment.status: "already_settled"` — you are never double-charged. |
| **Replay-protected** | Each signed authorization can submit exactly one job (nonce claim on POST). Re-sending a used authorization returns `402` with `code: "PAYMENT_REPLAY"`. |
| **Tamper-evident poll** | `poll_url` carries the billed `duration`, image-to-video flag, resolution and reference counts, HMAC-signed into `sig`. A hand-built poll query returns `400` — use `poll_url` verbatim. |
| **Durable output** | The clip is mirrored to BlockRun's storage before settlement; `data[].url` is the permanent BlockRun-hosted URL, `data[].source_url` is the (often temporary) upstream URL. |
| **Claimable for ~48h** | If your client times out mid-poll, re-GET the same `poll_url` later with a fresh signature from the same wallet — no resubmission needed. |

:::note{title="SDKs and ClawRouter hide all of this"}
The TypeScript `VideoClient`, the Python `VideoClient`, and the local ClawRouter proxy run the submit+poll loop for you, so you make a single call and get the finished video back. The two-step contract below is only relevant if you call the raw HTTP API yourself.
:::

---

## Available models

| Model ID | Name | Durations (sec) | Resolution | Image-to-video | Synced audio | Character / RealFace asset |
|---|---|---|---|---|---|---|
| `azure/sora-2` | Sora 2 | **4 / 8 / 12** (default 4 — only these three) | 720p, portrait or landscape | ✅ (non-human only) | ✅ | ❌ |
| `xai/grok-imagine-video` | Grok Imagine Video | 1–15 (default 8) | 480p (default), 720p | ✅ | — | ❌ |
| `xai/grok-imagine-video-1.5` | Grok Imagine Video 1.5 | 1–15 (default 8) | 480p (default), 720p, **1080p** | ✅ | ✅ | ❌ |
| `bytedance/seedance-1.5-pro` | Seedance 1.5 Pro | 4–12 (default 5) | 480p, 720p (default), 1080p | ✅ | ✅ (t2v) | ❌ |
| `bytedance/seedance-2.0-mini` | Seedance 2.0 Mini | 4–15 (default 5) | 480p, 720p (default) | ✅ | ✅ (t2v) | ✅ |
| `bytedance/seedance-2.0-fast` | Seedance 2.0 Fast | 4–15 (default 5) | 480p, 720p (default) | ✅ | ✅ (t2v) | ✅ |
| `bytedance/seedance-2.0` (Pro) | Seedance 2.0 Pro | 4–15 (default 5) | 480p, 720p (default), 1080p, **4K** | ✅ | ✅ (t2v) | ✅ |
| `bytedance/seedance-2.5` | Seedance 2.5 | 4–**30** (default 5) | 480p, 720p (default) | ✅ | ✅ (t2v) | ❌ |

The live list, with per-second rates and duration caps, is at `GET https://blockrun.ai/api/v1/video/models` (free, rate-limited). An unpaid `GET /api/v1/videos/generations` returns the same catalog inside a 402 discovery body, including each Grok SKU's `pricePerSecondByResolution`, `defaultResolution` and `perGenerationFee`.

Notes:

- **Sora 2** accepts only `duration_seconds` of **4, 8, or 12** — any other value returns `400` listing the allowed set. Text-to-video and image-to-video (`image_url`, non-human subjects only — see below). Output is 720p with synchronized audio, portrait or landscape; `resolution` and the Seedance-only params are ignored.
- **Grok Imagine** accepts `duration_seconds` from **1 to 15** (default 8) and an optional `image_url` (first frame). `resolution` **is honored and is a billing tier** — `xai/grok-imagine-video` renders `480p`/`720p`, and `xai/grok-imagine-video-1.5` adds `1080p`; omitting it bills and renders `480p`, and anything off-tier returns a `400` before payment that lists the supported tiers and their rates. `aspect_ratio` is also honored: both SKUs accept `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `3:2`, `2:3` (the Seedance-only `adaptive` and `21:9` return a `400`). Grok Imagine Video **1.5** is xAI's flagship generation — better physics and prompt adherence, with native synced audio in the same pass. The remaining Seedance-only params (`generate_audio`, `seed`, RealFace, reference media) are not sent upstream for either Grok SKU.
- **Seedance** supports a default of 5s, a floor of **4s** (a `duration_seconds` below 4 returns `400` before payment) and a per-tier maximum — **`seedance-2.5` allows up to 30s, `seedance-2.0` / `seedance-2.0-fast` / `seedance-2.0-mini` up to 15s, `seedance-1.5-pro` up to 12s** (above the max also returns `400`). The gateway bumps the default to **720p** and sets `generate_audio` per the t2v/i2v split below. `seedance-2.0`, `seedance-2.0-fast` and `seedance-2.0-mini` accept a `real_face_asset_id` (`ta_xxxx`) for character/identity consistency and multiple reference images (omni). `seedance-2.5` is text-to-video and image-to-video only: no RealFace, no first/last-frame, no reference media. `seedance-2.0-fast` finishes in ~60–80s; `seedance-2.0` (Pro) is higher quality and slower; `seedance-2.0-mini` is the budget tier at roughly half the Fast rate.

---

## Image-to-video options

Whether you can seed generation from an image — and how — depends on the subject:

- **Non-human subject** (product, scene, animal, object): pass `image_url` (a public `https` URL to the first frame, or an inline `data:image/...;base64,` URI) on **`azure/sora-2`**, **Grok**, or any **Seedance** model. For `azure/sora-2` the gateway resizes the seed image server-side to Sora's exact required dimensions (1280×720 / 720×1280). Seedance image-to-video is billed at the same per-token rate as text-to-video.
- **A specific real person**: you cannot upload a face to Sora (see the note below), and Seedance rejects a seed image that contains a real face (`400`, `code: "INPUT_IMAGE_REAL_PERSON"`). Use **Seedance 2.0 / 2.0-fast / 2.0-mini + a RealFace `ta_xxxx` asset** — enroll the person once *with their consent* ([RealFace](realface.md), ~1-min on-phone liveness, $0.011), then pass `real_face_asset_id`. Details in [Character consistency](#character-consistency-seedance-20-mini--fast--pro) below.
- **An AI character / mascot**: same flow with a [Virtual Portrait](virtual-portrait.md) asset (no KYC, $0.011).

:::warning{title="Sora reference images cannot contain human faces"}
`azure/sora-2` **rejects reference images that contain human faces** — a moderation pipeline blocks any recognizable person to prevent deepfakes, and there is no general human-likeness image-upload path. So on BlockRun: **`azure/sora-2` does image-to-video for non-human subjects** (`image_url`, resized server-side to Sora's exact dimensions); and **real-person video goes through Seedance 2.0 + RealFace** (the consent-based route above).
:::

:::note{title="Inline data URIs are sniffed before the 402"}
An inline `data:` image is decoded and checked for real image bytes (PNG, JPEG, GIF, BMP, WEBP, HEIC/HEIF/AVIF) **before** any payment challenge, so a malformed data URI is a free `400` rather than a paid submit that dies upstream. Remote `https` URLs pass through unchecked.
:::

---

## Request parameters (POST body, JSON)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model` | string | No | Video model ID (default `xai/grok-imagine-video`). See table above. Unknown ids return `400` listing the available models. |
| `prompt` | string | **Yes** | Text description of the video to generate. |
| `image_url` | string (URL or data URI) | No | Seed image for image-to-video (all video models support it). For `azure/sora-2` the image is resized server-side to Sora's exact dimensions and must not contain a human face. Mutually exclusive with `real_face_asset_id`. |
| `real_face_asset_id` | string | No | Character/face reference asset (`ta_xxxxxx`) from a [Virtual Portrait](virtual-portrait.md) (AI character) or [RealFace](realface.md) (real person). **Seedance 2.0 / 2.0-fast / 2.0-mini only.** Mutually exclusive with `image_url`. |
| `last_frame_url` | string (URL or data URI) | No | Final-frame target for first-and-last-frame interpolation. Send with `image_url` (first frame) — alone it returns `400`. **Seedance only** (1.5-pro, 2.0-mini, 2.0-fast, 2.0). Cannot be combined with `real_face_asset_id`. |
| `reference_image_urls` | string[] (1–9) | No | Multiple reference images for character/style consistency (cite them as "image 1", "image 2" in the prompt). **`seedance-2.0` / `seedance-2.0-fast` / `seedance-2.0-mini` only.** Its own mode — cannot be combined with `image_url`, `last_frame_url` or `real_face_asset_id`. No surcharge. |
| `reference_videos` | array of `{url}` (1–3) | No | Reference videos for reference-to-video (r2v). **Currently gated off** — the gateway returns `503` (`reference-to-video is temporarily unavailable`) before any payment. Flat `video_url` is rejected with a `400` pointing at this field. |
| `reference_audios` | array of `{url}` (1–3, each ≤15.2s) | No | Reference audios for r2v. **Currently gated off** (`503`, see above). Flat `audio_url` is rejected with a `400` pointing at this field. |
| `input_type` | string | No | Optional validated enum: `text` / `image` / `first_last_frame` / `reference`. When supplied it must match the seed fields you actually sent or the request returns a `400` carrying `inferred_input_type`. |
| `duration_seconds` | integer | No | Duration to bill for. Defaults to the model default. Must respect the model's range (Seedance: 4s floor; 2.5 = 30s, 2.0 / 2.0-fast / 2.0-mini = 15s, 1.5-pro = 12s max; Grok: 1–15; Sora 2: the discrete `{4,8,12}` set) or you get a `400` before payment. |
| `resolution` | string | No | `480p` / `720p` / `1080p` / `4K`, gated **per model** from the upstream parameter schema: `bytedance/seedance-2.0` accepts all four (`4K` is real 3840×2160); `seedance-1.5-pro` accepts `480p` / `720p` / `1080p`; `seedance-2.0-fast` and `seedance-2.5` accept `480p` / `720p` only. **Defaults to `720p`** on Seedance; higher resolutions cost more tokens upstream. Anything off-list returns a `400` before payment (`360p` / `540p` / `1K` / `2K` are not offered by any model). `seedance-2.0-mini` renders `480p` / `720p` — keep to those; a higher value is not rejected up front for this SKU. On Grok it selects the billing tier (see above); Sora ignores it. |
| `aspect_ratio` | string | No | Seedance: `adaptive` / `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `21:9` (`9:21` is not offered by any Seedance model). Grok: `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `3:2` / `2:3`. Off-list values return `400` before payment. Sora ignores it. |
| `generate_audio` | boolean | No | Synced audio track. **Seedance default: `true` for text-to-video, `false` for image/face/reference-conditioned.** Pass explicitly to override. Ignored by Grok and Sora. |
| `seed` | integer | No | Reproducibility seed (Seedance). Same seed + prompt + params ≈ same clip. |
| `watermark` | boolean | No | Embed the upstream Seedance watermark. Off by default at the gateway. |
| `return_last_frame` | boolean | No | Also return the last frame as a still — useful for chaining clips. Seedance only. |

### Standard multimodal body — `POST /api/v1/videos`

Callers migrating from a Seedance-style multimodal API can post the `content[]` shape to `POST https://blockrun.ai/api/v1/videos` instead. The gateway translates it to the flat fields above and runs the **same** validation, 402 and billing pipeline; the returned `poll_url` points at `/api/v1/videos/{id}`, which polls the same job.

```json
{
  "model": "seedance-2.0",
  "content": [
    { "type": "text", "text": "a hummingbird hovering at a red flower, ultra slow motion" },
    { "type": "image_url", "image_url": { "url": "https://example.com/flower.jpg" } }
  ],
  "ratio": "16:9",
  "duration": 5
}
```

Mapping: `ratio` → `aspect_ratio`, `duration` → `duration_seconds`, a bare `seedance-*` id → `bytedance/seedance-*`, text parts → `prompt`, the single `image_url` part → `image_url`. More than one image part, `video_url` / `audio_url` parts, or `first_frame` / `last_frame` roles return `400` before payment — use the flat fields for those.

---

## Pricing

All prices below are the amounts quoted in the `402` challenge and actually billed in USDC. Sora and Seedance include the gateway's standard **5% margin**; Grok Imagine is billed at xAI's **official per-second rates exactly**, tiered by resolution, plus a flat **$0.001 per generation** — that flat fee, not a percentage on the rate, is the entire markup on those SKUs. Every model then adds the gateway-wide **$0.001 transaction fee** per paid call. There is no other minimum.

| Model | Billing basis | Effective price (720p unless noted) |
|---|---|---|
| `azure/sora-2` | $0.10 / second (flat) × 1.05 + $0.001 fee | **4s = $0.421** · **8s = $0.841** · **12s = $1.261** |
| `xai/grok-imagine-video` | $0.05 / sec @ 480p (default) · $0.07 / sec @ 720p (official rates) + $0.001 / generation + $0.001 fee | **8s = $0.562** · **15s = $1.052** (480p: **8s = $0.402**) |
| `xai/grok-imagine-video-1.5` | $0.08 / sec @ 480p (default) · $0.14 / sec @ 720p · $0.25 / sec @ 1080p (official rates) + $0.001 / generation + $0.001 fee | **8s = $1.122** · **15s = $2.102** (480p: **8s = $0.642**; 1080p: **8s = $2.002**) |
| `bytedance/seedance-1.5-pro` | Token-metered ($3.108 / M tokens) ≈ $0.070 / sec | **5s ≈ $0.355** · **12s ≈ $0.850** |
| `bytedance/seedance-2.0-mini` | Token-metered ($3.5 / M tokens) ≈ $0.0797 / sec | **5s ≈ $0.400** · **15s ≈ $1.197** |
| `bytedance/seedance-2.0-fast` | Token-metered ($7.252 / M tokens) ≈ $0.165 / sec | **5s ≈ $0.827** · **15s ≈ $2.478** |
| `bytedance/seedance-2.0` (Pro) | Token-metered ($9.9715 / M tokens) ≈ $0.227 / sec | **5s ≈ $1.136** · **15s ≈ $3.407** |
| `bytedance/seedance-2.5` | Token-metered ($13.8565 / M tokens) ≈ $0.315 / sec | **5s ≈ $1.579** · **30s ≈ $9.468** |

**Seedance token math:** at the 720p default a clip uses **~21,690 tokens/second** (a 5s clip ≈ 108,450 tokens). Price = `duration × 21,690 × resolution-factor × rate-per-M ÷ 1,000,000 × 1.05 + $0.001`. Image-to-video is billed at the **same per-token rate** as text-to-video (no i2v discount). The resolution token factor relative to 720p (=1) is: `480p ×0.5`, `1080p ×2.25`, and `4K ×9` (area-proportional) — so dropping to `480p` halves the per-clip cost and `1080p`/`4K` cost proportionally more (a 5s `seedance-2.0` clip is ≈ $2.556 at 1080p and ≈ $10.220 at 4K). `4K` (real 3840×2160) is available **only on `bytedance/seedance-2.0`**; the ceiling is `1080p` on `seedance-1.5-pro` and `720p` on `seedance-2.0-fast`/`seedance-2.0-mini`/`seedance-2.5`; anything above a model's ceiling returns a `400` before payment. On a completed poll the response carries `usage.total_tokens` with `token_source: "upstream"` when the upstream reported the metered count, or `"estimated"` when the gateway fell back to this formula. Sora ignores resolution. Grok Imagine bills per second **by resolution tier**, at xAI's official rates with no margin: on `xai/grok-imagine-video` `480p` is $0.05/sec (the default when `resolution` is omitted) and `720p` $0.07/sec, with `1080p`/`4K` rejected before payment; on `xai/grok-imagine-video-1.5` `480p` is $0.08/sec (default), `720p` $0.14/sec and `1080p` $0.25/sec, with `4K` rejected before payment. Both SKUs add a flat **$0.001 per generation** on top of rate × duration — it does not scale with length, so a 1s clip and a 15s clip carry the same one.

**One-time enrollment fees (separate from per-call billing):**

| Action | Endpoint | Price |
|---|---|---|
| Virtual Portrait enrollment | [`POST /v1/portrait/enroll`](virtual-portrait.md) | $0.011 USDC per asset (no KYC) |
| RealFace enrollment | [`POST /v1/realface/enroll`](realface.md) | $0.011 USDC per asset (no KYC, requires ~1-min on-phone liveness) |

---

## The 402 challenge

An unpaid POST returns `402` with the x402 requirement in three equivalent headers — `X-Payment-Required`, `PAYMENT-REQUIRED` (base64 JSON) and `WWW-Authenticate: X402 requirements="…"` — mirrored at the top of the body as `x402Version`/`accepts`; the rest of the JSON body is informational:

```json
{
  "x402Version": 2,
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "amount": "1122000", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300 }],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {
    "amount": "1.122000",
    "currency": "USD",
    "pricePerSecond": 0.14,
    "resolution": "720p",
    "perGenerationFee": "0.001000",
    "durationSeconds": 8
  },
  "generation_info": {
    "output_duration": "8s video (max 15s)",
    "generation_time": "~60-180s upstream",
    "flow": "async",
    "note": "POST verifies payment + submits the job in ~3-20s and returns { id, poll_url } …"
  },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

`price.amount` is the full amount you will be charged (media price + $0.001 fee). On the Grok SKUs `pricePerSecond` states the rate of the **tier actually billed** and `resolution` / `perGenerationFee` are present so the arithmetic reconciles; on Sora and Seedance `pricePerSecond` is the model's flat display rate. The decoded requirement's `accepts[0].amount` is the same figure in USDC base units (6 decimals) — and now identical to the body's own `accepts[0].amount`.

Sign that requirement and re-send the POST with the signature in `X-Payment` (also accepted: `Payment-Signature`). A verification failure returns `402` with a machine-readable `code`:

| `code` | Meaning |
|---|---|
| `PAYMENT_INVALID` | Signature / payload did not verify (default when no more specific cause is known). |
| `PAYMENT_UNFUNDED` | The authorization could not be executed on-chain — usually insufficient USDC on Base, or an expired `validAfter`/`validBefore` window. |
| `PAYMENT_REPLAY` | This authorization was already claimed by an earlier POST. Sign a fresh one. |
| `PAYMENT_BLOCKHASH_STALE` | Solana gateway only — re-sign against a fresh blockhash. |

---

## Responses

### 1. POST → `202 Accepted` (job submitted)

```json
{
  "id": "<opaque job id>",
  "object": "video.generation.job",
  "status": "queued",
  "model": "azure/sora-2",
  "duration_seconds": 8,
  "price": { "amount": "0.841000", "currency": "USD" },
  "payment_status": "verified",
  "created": 1776443975,
  "poll_url": "/api/v1/videos/generations/<opaque job id>?model=azure%2Fsora-2&duration=8&i2v=0&sig=…",
  "poll_instructions": "Send GET to poll_url with an x-payment header signed by the SAME wallet …"
}
```

The `id` is opaque — treat it as a token, not a string to parse. The `poll_url` already encodes the required `model`, `duration`, `i2v`, optional `resolution` and the HMAC `sig` that binds billing to this job — preserve it verbatim when polling (relative to `https://blockrun.ai`).

### 2. GET poll → `202` (still generating)

```json
{
  "id": "<job reference>",
  "object": "video.generation.job",
  "status": "in_progress",
  "model": "azure/sora-2",
  "payment_status": "verified",
  "progress": 42,
  "elapsed_seconds": 75,
  "note": "Upstream is still generating. Poll again in 5-10s. No charge until status=completed. The job stays claimable for ~48h …"
}
```

`status` is `queued` or `in_progress`; `progress` (percent) and `elapsed_seconds` appear when the upstream reports them. Keep polling every 5–10s.

### 3. GET poll → `200` (completed — charged here)

```json
{
  "id": "<job reference>",
  "object": "video.generation.job",
  "status": "completed",
  "model": "bytedance/seedance-2.0-fast",
  "created": 1776444180,
  "data": [
    {
      "url": "https://blockrun.ai/api/media/media/videos/2026/05/27/<id>.mp4",
      "source_url": "https://<upstream-host>/<id>.mp4",
      "duration_seconds": 5,
      "request_id": "<upstream request id>",
      "backed_up": true
    }
  ],
  "usage": { "total_tokens": 108450, "token_source": "upstream" },
  "price": { "amount": "0.826810", "currency": "USD" },
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

On settlement the response also carries `PAYMENT-RESPONSE` (base64 JSON `{success, transaction, network, payer}`) and `X-Payment-Receipt` (the on-chain tx hash) headers. A re-poll of an already-settled job returns the same body with `payment.status: "already_settled"` and no new charge.

### GET poll → `200` (failed — not charged)

```json
{
  "id": "<job reference>",
  "object": "video.generation.job",
  "status": "failed",
  "model": "bytedance/seedance-2.0",
  "error": "<upstream reason>",
  "payment_status": "not_charged",
  "note": "Upstream generation failed. No payment was taken."
}
```

One failure class is recoverable client-side: when only the **generated soundtrack** trips upstream audio-copyright moderation on a Seedance clip, the body adds `error_code: "output_audio_moderation"` and `retry_with: { "generate_audio": false }` — resubmit with `generate_audio: false` (or add "no background music, silent" to the prompt).

### Response fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Job id. Opaque on the POST; the poll echoes an internal job reference — always navigate via `poll_url`. |
| `status` | string | `queued` → `in_progress` → `completed` \| `failed` |
| `data[].url` | string | Permanent BlockRun-hosted URL. Falls back to the upstream URL if the mirror fails (`backed_up: false`). |
| `data[].source_url` | string | Original upstream URL (may expire) |
| `data[].duration_seconds` | integer | Duration of the generated clip (falls back to the billed duration when the upstream does not echo one) |
| `data[].request_id` | string | Upstream request id for debugging |
| `data[].backed_up` | boolean | `true` when mirrored to BlockRun's storage |
| `usage.total_tokens` | integer | Seedance only: the metered token count; `usage.token_source` is `upstream` or `estimated` |
| `price.amount` | string | Amount charged in USD, fee included |
| `payment.status` | string | `settled` \| `already_settled` |
| `payment.tx_hash` | string | On-chain USDC settlement tx (also in `X-Payment-Receipt` header) |

---

## Examples

::::tabs

:::tab{label="TypeScript SDK"}
The `@blockrun/llm` `VideoClient` handles submit + poll for you.

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

`VideoClient` polls every 5s within an overall `budgetMs` (default 900000ms / 15 min); `timeout` (default 120000ms) is the per-HTTP-call limit. Options mirror the request params: `model`, `imageUrl`, `lastFrameUrl`, `referenceImageUrls`, `realFaceAssetId`, `durationSeconds`, `aspectRatio`, `resolution`, `generateAudio`, `seed`, `watermark`, `returnLastFrame`.
:::

:::tab{label="Python SDK"}
`blockrun_llm.VideoClient` runs the same submit + poll loop, re-signing automatically if the 600s authorization window lapses mid-poll.

```python
from blockrun_llm import VideoClient

client = VideoClient()  # wallet from BLOCKRUN_WALLET_KEY / ~/.blockrun

result = client.generate(
    "a corgi surfing at sunset, cinematic",
    model="azure/sora-2",
    duration_seconds=8,
)
print(result.data[0].url)
```

`generate()` accepts a `budget_seconds` (default 900) for the whole poll loop; if the budget runs out the job stays claimable for ~48h via the `poll_url` in the error details.
:::

:::tab{label="ClawRouter"}
ClawRouter (local proxy) signs payments and runs the poll loop, so you just POST and wait for the finished clip.

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{ "model": "azure/sora-2", "prompt": "a neon-lit cyberpunk street, slow dolly forward", "duration_seconds": 8 }'
```
:::

:::tab{label="Raw HTTP"}
Two steps — submit, then poll until completed.

**Step 1 — submit:**

```bash
curl -X POST https://blockrun.ai/api/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{ "model": "azure/sora-2", "prompt": "a hummingbird hovering at a red flower, ultra slow motion", "duration_seconds": 8 }'
# → 202 { "id": "...", "poll_url": "/api/v1/videos/generations/...?model=...&duration=8&i2v=0&sig=...", ... }
```

**Step 2 — poll until completed (re-sign with the SAME wallet, use `poll_url` verbatim):**

```bash
curl "https://blockrun.ai$POLL_URL" \
  -H "X-Payment: $FRESH_PAYMENT_HEADER_SAME_WALLET"
# → 202 in_progress … repeat every 5–10s … → 200 completed { data:[{url}], payment:{status:"settled"} }
```
:::

::::

### Image-to-video (Grok / Seedance)

```bash
curl -X POST https://blockrun.ai/api/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{ "model": "bytedance/seedance-2.0", "prompt": "the subject turns and smiles", "image_url": "https://example.com/portrait.jpg" }'
```

### Character consistency (Seedance 2.0 mini / fast / pro)

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
| [**Virtual Portrait**](virtual-portrait.md) | AI character, mascot, avatar | No | No | $0.011 USDC | [`POST /v1/portrait/enroll`](virtual-portrait.md) · [studio/portrait](https://blockrun.ai/studio/portrait) |
| [**RealFace**](realface.md) | Real person you have rights to | No | Yes (~1 min on phone) | $0.011 USDC (promo) | [`POST /v1/realface/init`](realface.md) + `/enroll` · [studio/realface](https://blockrun.ai/studio/realface) |

---

## Timing

| Phase | Typical latency |
|---|---|
| POST → upstream job submitted (`202`) | ~3–20s |
| Polling until clip ready | 60–180s (poll every 5–10s) |
| Mirror + settle on the completed poll | ~1–30s |

Set your HTTP client timeout to at least 60s per request (the poll that completes has to mirror the clip and settle on-chain before it answers). The POST handler caps the upstream submit at ~20s (returns `504`, no charge, if upstream doesn't acknowledge). A job that is still `in_progress` after 5 minutes is unusual but not lost — keep polling, or come back later; the job stays claimable for ~48h.

---

## Error codes

| Code | Where | Description |
|---|---|---|
| 400 | POST | Invalid JSON; unknown / unavailable model; bad or missing prompt; `duration_seconds` outside the model's range or not in its allowed set; off-list `resolution` / `aspect_ratio` for the model; `image_url` / `real_face_asset_id` / `last_frame_url` / `reference_image_urls` on a model that lacks the capability, or in a disallowed combination; `input_type` mismatch (`inferred_input_type` tells you what you sent); malformed inline image data. All of these fire **before** the 402. |
| 400 | POST | After payment, on submit: `code: "INPUT_IMAGE_REAL_PERSON"` (Seedance rejected a seed image containing a real face — use RealFace), `Content policy violation`, or `code: "INVALID_VIDEO_REQUEST"` (upstream rejected a parameter). **No charge** — settlement only happens on a completed poll. |
| 400 | GET | Invalid job id, missing `?model` / `?duration`, model/provider mismatch, or invalid `?sig` — poll the `poll_url` verbatim. |
| 402 | POST / GET | Payment required (no header → x402 challenge), or verification failed (`code`: `PAYMENT_INVALID` / `PAYMENT_UNFUNDED` / `PAYMENT_REPLAY`). On a completed-but-unsettleable poll (`Payment settlement failed`), the clip was generated but the signed authorization could not be settled (often expired) — retry the poll with a fresh signature. |
| 429 | POST / GET | Upstream rate limit (`code: "RATE_LIMITED"`). Response includes `Retry-After` and `retry_after_seconds`. |
| 500 | POST / GET | Server / provider configuration error. |
| 503 | POST | `reference_videos` / `reference_audios` sent — reference-to-video is gated off. No charge. |
| 504 | POST | Upstream submit timed out (>~20s). **No payment taken** — retry. |
| 504 | GET | Upstream poll timed out — retry the poll in a few seconds. |

---

## What's next?

::::cards

:::card{title="Virtual Portrait" href="virtual-portrait.md" icon="Boxes"}
Zero-KYC `ta_xxx` enrollment for AI-character consistency across clips.
:::

:::card{title="RealFace Enrollment" href="realface.md" icon="Image"}
Real-person likeness with on-phone liveness — still no KYC.
:::

:::card{title="Image Generation" href="image-generation.md" icon="Image"}
Generate stills you can then seed into image-to-video.
:::

::::

Also useful: [Music Generation](music-generation.md) · [Error Handling](errors.md) · [Real-person video walkthrough](https://blockrun.ai/docs/video/real-person-ip).
