---
title: Image Generation API
description: Generate images with GPT Image, Nano Banana, Seedream, CogView-4, or Grok Imagine through one OpenAI-compatible endpoint, paid per call in USDC over x402.
---

# Image Generation API

Generate images using GPT Image (including ChatGPT Images 2.0), Google Nano Banana (including Nano Banana 2 and Pro), ByteDance Seedream 5.0 Pro, CogView-4, or xAI Grok Imagine.

## Endpoint

```
POST https://blockrun.ai/api/v1/images/generations
GET  https://blockrun.ai/api/v1/images/generations/{id}   # poll (async slow path only)
GET  https://blockrun.ai/api/v1/images/models              # catalog + per-size prices, free
```

:::note
The live gateway path is `/api/v1/...`. Bare `/v1/...` on `blockrun.ai` returns `404`; the `/v1` form is the local ClawRouter surface.
:::

## Request

```json
{
  "model": "google/nano-banana",
  "prompt": "A futuristic city at sunset",
  "size": "1024x1024",
  "n": 1
}
```

The body must be `application/json`. A body that is not valid JSON returns `400 { "error": "Invalid JSON", ... }`; a body that fails validation returns `400 { "error": "Invalid request body", "details": [...] }` with the per-field issues.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model to use (see below). An unknown ID returns `400` whose `error` lists every available model ID. |
| `prompt` | string | Yes | Image description |
| `size` | string | No | Image dimensions (default: `"1024x1024"`). Must be one of the model's listed sizes — anything else returns `400` naming the valid sizes for that model. |
| `n` | integer | No | Number of images (default: 1, min 1, max 10). Validated before the 402 so an out-of-range value never costs a signed round-trip. |

Unknown fields (for example OpenAI's `quality`, `style`, `response_format`) are ignored, not rejected.

### Available Models

Prices are what the `402` challenge quotes and what is billed for **one** image at that size: the catalog rate + 5% + the flat $0.001 transaction fee. See [Pricing](#pricing) for the formula and every size.

| Model ID | Provider | Sizes | Price (1 image) |
|----------|----------|-------|-------|
| `openai/gpt-image-1` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.022 / $0.043 |
| `openai/gpt-image-2` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.064 / $0.127 |
| `google/nano-banana` | Google | 1024x1024 | $0.0535 |
| `google/nano-banana-2` | Google | 1024x1024 | $0.0955 |
| `google/nano-banana-pro` | Google | 1024x1024, 2048x2048, 4096x4096 | $0.106 / $0.106 / $0.1585 |
| `zai/cogview-4` | Zhipu AI | 512x512 – 1440x1440 | $0.01675 / $0.022 |
| `xai/grok-imagine-image` | xAI | 1024x1024 | $0.022 |
| `xai/grok-imagine-image-pro` | xAI | 1024x1024 | $0.0745 |
| `bytedance/seedream-5-pro` | ByteDance | 1024x1024 – 2848x1600 (8 sizes) | $0.04825 / $0.0955 |

`GET /api/v1/images/models` returns the same catalog with `pricing.sizes[]` per model (catalog rates, before margin and fee). `openai/dall-e-3` was removed from the catalog and now returns the unknown-model `400`.

#### Seedream 5.0 Pro Sizes

`bytedance/seedream-5-pro` is ByteDance's flagship image model (up to 4K-class
resolution). Pricing is by output pixel count — sizes at or below ~2.36M pixels
bill $0.04825, larger sizes bill $0.0955 (catalog $0.045 / $0.09 + 5% + $0.001):

| Size | Price | Use Case |
|------|-------|----------|
| `1024x1024` | $0.04825 | Standard (default) |
| `1280x720` | $0.04825 | HD landscape |
| `2048x1024` | $0.04825 | Wide banner |
| `2048x2048` | $0.0955 | High-resolution square |
| `2304x1728` / `1728x2304` | $0.0955 | 4:3 / 3:4 print-quality |
| `2848x1600` / `1600x2848` | $0.0955 | 16:9 / 9:16 4K-class |

Seedream 5.0 Pro generations take **~2 minutes** — calls always resolve through
the async `202` + poll flow described below, and you are only charged when the
image completes.

#### CogView-4 Sizes

`zai/cogview-4` accepts exactly these sizes (any other value returns `400`):

| Size | Price | Use Case |
|------|-------|----------|
| `512x512` | $0.01675 | Thumbnails, icons |
| `768x768` | $0.01675 | Social media |
| `1024x1024` | $0.01675 | Standard (default) |
| `768x1344` | $0.01675 | Portrait / mobile |
| `1344x768` | $0.01675 | Landscape / banner |
| `1440x1440` | $0.022 | High resolution |

## How it works — hybrid sync/async flow & settlement

This endpoint is **hybrid**: fast generations complete synchronously, slow ones
switch to an async job you poll. The split is purely by elapsed time:

1. **`POST /v1/images/generations`** with an `x-payment` (or
   `PAYMENT-SIGNATURE`) header. The gateway **verifies** the payment
   authorization (no USDC moves yet), claims the authorization's nonce so it
   cannot be reused, creates a job, and starts generation.
2. **Fast path (≤30s inline window — most models):** generation finishes
   inline. The gateway mirrors the image to durable storage, settles the
   payment and returns **`200`** with the standard `{ id, created, data: [...] }`
   body below. This is the only moment a fast-path call is charged.
3. **Slow path (>30s — `bytedance/seedream-5-pro` always, `openai/gpt-image-2`
   under load):** the gateway returns **`202`** with an async job envelope
   `{ id, status: "queued", poll_url, price, payment_status: "verified" }`.
   **No USDC has moved.** Generation keeps running in the background — the
   upstream call for `openai/gpt-image-2` is allowed up to 600s.
4. **`GET {poll_url}`** — poll every 2–5s with an `x-payment` header signed by
   the **same wallet** (a fresh signature works; the gateway enforces wallet
   binding, not signature byte-equality; with no header it returns a normal
   x402 `402` challenge so clients can re-sign automatically). While the job
   runs you get `202` (`status: queued | in_progress`). When it finishes you
   get `200` with the image URLs, and **that is the moment you are charged** —
   settlement happens exactly once, on the first poll that observes
   `status: "completed"`.

| Guarantee | Meaning |
|-----------|---------|
| `payment_status: "verified"` | Signature/authorization checked only — **not** a charge. |
| Upstream fails (`status: "failed"`) | `payment_status: "not_charged"` — no USDC is ever transferred. |
| You never poll | Nothing settles; the signed authorization simply expires. You are not charged. |
| Idempotent re-polls | Polling an already-settled job returns the same URLs again (`payment.status: "already_settled"`) — never double-charged. A settle-once claim per job also covers the race between an inline settle and a concurrent poll. |
| Lost response is recoverable, not re-billable | Re-sending the **same** signed authorization returns `402 { code: "PAYMENT_REPLAY", job_id, poll_url, recoverable: true }` pointing at the job that authorization already paid for — `GET poll_url` to collect it instead of signing again. |
| Authorization lifetime | The `402` challenge sets `maxTimeoutSeconds: 600`; the same authorization must still be valid when the settling poll lands, so finish polling within 10 minutes of signing. |
| Stalled jobs | A job still `in_progress` after 1 hour is marked `failed` ("Job stalled …") and is never charged. |
| Settlement timing | Fast path: inside the `200` POST. Slow path: on the first `completed` poll. Identical to `/v1/videos/generations` and `/v1/images/image2image`. |

### Async job envelope (`202`)

```json
{
  "id": "img_8f3a…",
  "object": "image.generation.job",
  "status": "queued",
  "model": "openai/gpt-image-2",
  "size": "1024x1024",
  "n": 1,
  "price": { "amount": "0.064000", "currency": "USD" },
  "payment_status": "verified",
  "created": 1706000000,
  "poll_url": "/api/v1/images/generations/img_8f3a…",
  "poll_instructions": "…"
}
```

`status` enum: `queued` → `in_progress` → `completed` | `failed`. `poll_url` is a path — prefix it with the origin you posted to.

### Poll responses

- **`202` running:** `{ id, object, status: "queued" | "in_progress", model, payment_status: "verified", note }`
- **`200` completed (charged here):** the standard body below plus
  `price: { amount, currency }` and `payment: { status: "settled", tx_hash, network }`,
  with `PAYMENT-RESPONSE` and `X-Payment-Receipt` (on-chain tx hash) headers.
- **`200` completed, already settled (not charged again):** same body with `payment.status: "already_settled"`.
- **`200` failed (not charged):** `{ id, object, status: "failed", model, error, payment_status: "not_charged", note }`
- **`402` no header:** a fresh x402 challenge for this job (`job_id`, `model`, `price` in the body; requirements in the headers) — sign with the original wallet and retry.
- **`402` settlement failed:** `{ error: "Payment settlement failed", details, note }` — the image is ready but the authorization could not be settled; retry the poll, and re-sign if the authorization has expired.
- **`403` payer mismatch:** `{ error: "Payment payer mismatch" }` — the presenting wallet is not the one that submitted the job.
- **`404` job not found:** `{ error: "Job not found" }` — expired or never created.

:::warning{title="OpenAI-compatible clients and the async envelope"}
Plain OpenAI SDKs don't understand the `202` envelope. Use a model that completes inline, or the official BlockRun SDKs — Go `blockrun-llm-go ≥ v0.17.0` handles the hybrid flow transparently and always returns the synchronous `{data:[...]}` shape.
:::

## Response

```json
{
  "id": "img_8f3a…",
  "created": 1706000000,
  "data": [
    {
      "url": "https://blockrun.ai/api/media/media/images/2026/04/17/<id>.jpg",
      "source_url": "https://<upstream-host>/...",
      "backed_up": true,
      "revised_prompt": "..."
    }
  ],
  "price": { "amount": "0.016750", "currency": "USD" },
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

Headers: `PAYMENT-RESPONSE` (x402 settlement receipt) and `X-Payment-Receipt` (the on-chain tx hash).

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Per-call job id — the same value used as `job_id` in the async envelope, poll responses and replay `402`s, so you can reconcile 1:1 |
| `created` | integer | Unix timestamp |
| `data` | array | Array of generated images |
| `data[].url` | string | Permanent BlockRun-hosted proxy URL when the mirror to durable storage succeeds — this applies to every model, including the ones whose raw output is base64 (`openai/gpt-image-*`, `google/nano-banana*`, `xai/grok-imagine-image*`). If the mirror fails, `url` is the raw upstream value instead: a temporary upstream URL or a `data:image/...;base64,` URI |
| `data[].source_url` | string | Original upstream URL; for base64 outputs only the MIME type is kept (e.g. `"data:image/png"`), never the payload |
| `data[].backed_up` | boolean | `true` when the image was mirrored to BlockRun's durable storage |
| `data[].revised_prompt` | string | Expanded prompt (when the model rewrites it) |
| `price.amount` | string | USD billed for this call (includes the 5% margin and the $0.001 transaction fee) |
| `payment.status` | string | `settled` \| `already_settled` |
| `payment.tx_hash` | string | On-chain USDC settlement tx (also in `X-Payment-Receipt`) |

:::info{title="Why both url and source_url?"}
Upstream image URLs are usually temporary (they can expire within an hour). BlockRun mirrors each generated image to durable cloud storage and returns the permanent proxy URL as `url`; `source_url` is the original (possibly short-lived) upstream URL.
:::

## Examples

### Via ClawRouter (recommended for local use)

ClawRouter handles x402 payments automatically. Start it with `openclaw gateway start`, then call `localhost:8402` directly.

```bash
curl -X POST http://localhost:8402/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"model":"zai/cogview-4","prompt":"a futuristic city at night","size":"1024x1024"}'
```

Open the returned URL directly:
```bash
URL=$(curl -s -X POST http://localhost:8402/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"model":"google/nano-banana","prompt":"your prompt here","size":"1024x1024"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['url'])")

open "$URL"   # macOS
xdg-open "$URL"   # Linux
```

### Direct API

::::tabs

:::tab{label="cURL"}
```bash
curl -X POST https://blockrun.ai/api/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{
    "model": "zai/cogview-4",
    "prompt": "a minimalist logo for an AI company",
    "size": "1024x1024"
  }'
```
:::

:::tab{label="Python"}
```python
from blockrun_llm import ImageClient

client = ImageClient()

# CogView-4 (cheapest, supports Chinese prompts)
result = client.generate(
    "一个未来城市的夜景",
    model="zai/cogview-4",
    size="1344x768"
)
print(result.data[0].url)

# Nano Banana (Gemini 2.5 Flash Image)
result = client.generate(
    "A futuristic AI robot",
    model="google/nano-banana",
    size="1024x1024"
)
print(result.data[0].url)
```
:::

:::tab{label="TypeScript"}
```typescript
import { ImageClient } from '@blockrun/llm';

const client = new ImageClient();

// CogView-4
const result = await client.generate('a futuristic city at night', {
  model: 'zai/cogview-4',
  size: '1344x768',
});
console.log(result.data[0].url);

// Nano Banana (Gemini 2.5 Flash Image)
const result2 = await client.generate('A futuristic AI robot', {
  model: 'google/nano-banana',
  size: '1024x1024',
});
console.log(result2.data[0].url);
```
:::

::::

## Pricing

Every price below is the amount quoted in the `402` challenge (`price.amount`) and billed in USDC:

```
billed = catalog rate for the size × n × 1.05   (5% platform margin on media)
       + $0.001                                 (flat transaction fee, once per call)
```

`n` multiplies the margined rate; the transaction fee is charged once per call, not per image. The catalog rates themselves are published by `GET /api/v1/images/models`.

| Model | Size | Catalog rate | Billed (n=1) |
|-------|------|-------|-------|
| CogView-4 | 512x512 – 1344x768 | $0.015 | **$0.01675** |
| CogView-4 | 1440x1440 | $0.02 | $0.022 |
| GPT Image 1 | 1024x1024 | $0.02 | $0.022 |
| GPT Image 1 | 1536x1024 / 1024x1536 | $0.04 | $0.043 |
| ChatGPT Images 2.0 | 1024x1024 | $0.06 | $0.064 |
| ChatGPT Images 2.0 | 1536x1024 / 1024x1536 | $0.12 | $0.127 |
| Grok Imagine | 1024x1024 | $0.02 | $0.022 |
| Grok Imagine Pro | 1024x1024 | $0.07 | $0.0745 |
| Nano Banana | 1024x1024 | $0.05 | $0.0535 |
| Nano Banana 2 | 1024x1024 | $0.09 | $0.0955 |
| Nano Banana Pro | 1024x1024 / 2048x2048 | $0.10 | $0.106 |
| Nano Banana Pro 4K | 4096x4096 | $0.15 | $0.1585 |
| Seedream 5.0 Pro | ≤ ~2.36M pixels (1024x1024, 1280x720, 2048x1024) | $0.045 | $0.04825 |
| Seedream 5.0 Pro | > 2.36M pixels (2048x2048 and larger) | $0.09 | $0.0955 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request: malformed JSON, failed validation (`details[]`), unknown model (the message lists the available IDs), invalid size for the model, `n` outside 1–10, or a **content-policy rejection** (`{ "error": "Content policy violation", "details" }`) — content-policy rejections are `400`, not `403` |
| 402 | Payment required, rejected, or replayed — see below. A `402` never means the image was generated and billed. |
| 403 | Poll only — `Payment payer mismatch`: the polling wallet is not the one that submitted the job |
| 404 | Poll only — `Job not found` (expired or never created) |
| 429 | Upstream rate limit: `{ "error": "Rate limit exceeded", "code": "RATE_LIMITED", "source": "<model maker>", "retry_after_seconds", "details" }` with `Retry-After` and `X-RateLimit-Source` headers. BlockRun applies no per-IP limit of its own to this endpoint (only `GET /api/v1/images/models` is limited, 100 req/hour per IP) |
| 500 | Server error (`Image generation failed` / `Internal server error`, with `details` and, on the inline path, the `job_id`). Settlement never ran, so nothing was billed |

### 402 responses

The unpaid `402` is a normal x402 challenge: the signable requirements live in the `X-Payment-Required` / `PAYMENT-REQUIRED` / `WWW-Authenticate` headers (base64 JSON, `x402Version: 2`, `maxTimeoutSeconds: 600`); the body is informational.

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": { "amount": "0.053500", "currency": "USD", "pricePerImage": 0.05, "totalImages": 1 },
  "generation_info": { "generation_time": "~10s-10min upstream depending on model and prompt complexity", "flow": "hybrid", "note": "..." },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

`price.amount` is the billed total; `pricePerImage` is the catalog rate before margin and fee.

When a payment header is present but rejected, the body is `{ "error": "Payment verification failed", "code", "message"?, "details" }` and `code` is machine-readable:

| `code` | Meaning | What to do |
|--------|---------|------------|
| `PAYMENT_INVALID` | Default — the signature or authorization did not verify | Check the header; `details` carries the raw reason |
| `PAYMENT_UNFUNDED` | The authorization could not execute on-chain — usually an insufficient USDC balance on Base for the quoted amount; can also be an expired `validAfter`/`validBefore` window | Fund the wallet, or sign a fresh authorization |
| `PAYMENT_BLOCKHASH_STALE` | Solana-signed payments — the transaction was pinned to a blockhash that has expired. Nothing was charged | Re-sign against a current blockhash and resend |
| `PAYMENT_REPLAY` | The authorization was already used. If that earlier request completed, the body carries `job_id`, `poll_url` and `recoverable: true` | `GET poll_url` with the same wallet to collect the result you already paid for; do not sign again |

A `402 { "error": "Payment settlement failed" }` (with a `PAYMENT-RESPONSE` header) means verification passed but settlement did not; on the fast path nothing was billed, on the poll path retry the poll.

## Model Selection Guide

| Use Case | Recommended |
|----------|-------------|
| Cheapest | `zai/cogview-4` |
| Chinese prompts | `zai/cogview-4` |
| Highest quality | `google/nano-banana-pro` |
| Pro-level quality at Flash speed | `google/nano-banana-2` |
| Fast & reliable | `google/nano-banana` |
| Best prompt following | `openai/gpt-image-2` |
| Largest output (up to 2848x1600 / 4K-class) | `bytedance/seedream-5-pro` (async, ~2 min) |
| Image editing (img2img) | `openai/gpt-image-1`, `openai/gpt-image-2`, `google/nano-banana`, `google/nano-banana-2`, or `google/nano-banana-pro` |
| Multi-image fusion (ref + logo → 1 image) | `google/nano-banana(-2/-pro)` (≤3) or `openai/gpt-image-1/2` (≤4) — see [Image Editing](image-editing.md) |
| Multilingual text in images / character consistency | `openai/gpt-image-2` |
| xAI-style stylization | `xai/grok-imagine-image-pro` |

## OpenAI Compatibility

This endpoint is compatible with OpenAI's Images API:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://blockrun.ai/api/v1",
    api_key="unused"  # x402 payment handled via header
)

response = client.images.generate(
    model="zai/cogview-4",
    prompt="A futuristic city",
    size="1024x1024"
)
print(response.data[0].url)
```

The extra `id`, `price` and `payment` fields are additive — OpenAI clients ignore them. The OpenAI SDK's bearer key does **not** pay: you still need an x402 header, so pair it with a client that signs one (BlockRun SDKs, ClawRouter).

## What's next?

::::cards

:::card{title="Image Editing (img2img)" href="image-editing.md" icon="Image"}
Edit or fuse existing images with the same model lineup and settlement flow.
:::

:::card{title="Video Generation" href="video-generation.md" icon="Image"}
Generate video clips with Grok Imagine and Seedance over the same async flow.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes, content-policy rejections, and how the SDKs surface failures.
:::

::::
