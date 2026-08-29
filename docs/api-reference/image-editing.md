---
title: Image Editing API (img2img)
description: Edit or fuse existing images with GPT Image, Nano Banana, and more — JSON or OpenAI multipart input, paid per call in USDC over x402.
---

# Image Editing API (img2img)

Edit existing images — pass one or more source images and describe what to change.

:::info{title="Two request formats are accepted"}
- **`application/json`** — `image` as a `data:image/...;base64,…` string, or a JSON **array** of them for multi-image fusion. (BlockRun-native.)
- **`multipart/form-data`** — OpenAI's format: repeated `image[]=@file` fields (a single `image=@file` also works), plus `mask`, `model`, `prompt`, `size`, `n`. Files are converted internally to data URIs; a file without an `image/*` MIME type is treated as PNG.

**Payment is always x402** (the `X-Payment` / `PAYMENT-SIGNATURE` header), regardless of body format. So you can send an OpenAI-shaped multipart body, but you still attach an x402 payment — the OpenAI SDK's native Bearer-key auth does **not** settle payment here. Use the BlockRun SDK / ClawRouter (which handle x402), or send either body format with your own x402 header.
:::

## Endpoint

| Network | URL |
|---------|-----|
| Base | `https://blockrun.ai/api/v1/images/image2image` |
| Solana | `https://sol.blockrun.ai/api/v1/images/image2image` |

```
POST https://blockrun.ai/api/v1/images/image2image       # Base
POST https://sol.blockrun.ai/api/v1/images/image2image    # Solana
GET  https://blockrun.ai/api/v1/images/generations/{id}  # poll (async slow path only — edits share the generation job store)
```

## Request

```json
{
  "model": "openai/gpt-image-1",
  "prompt": "change the background to a starry sky",
  "image": "data:image/png;base64,<base64-data>",
  "mask": "data:image/png;base64,<base64-data>",
  "size": "1024x1024",
  "n": 1
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Model to use (default: `openai/gpt-image-2`). Supported: `openai/gpt-image-1`, `openai/gpt-image-2`, `google/nano-banana`, `google/nano-banana-2`, `google/nano-banana-pro`. Any other ID (including generation-only models such as `bytedance/seedream-5-pro`) returns `400` listing the supported set. |
| `prompt` | string | Yes | Description of edits to make |
| `image` | string \| string[] | Yes | Source image as a base64 data URI, **or an array of data URIs** to fuse multiple sources into one variant (e.g. a reference image + a brand logo). OpenAI-compatible `image[]`. Max 4 images for OpenAI, 3 for Google. See [Accepted image formats](#accepted-image-formats). |
| `mask` | string | No | Mask as a base64 data URI, validated like `image`. OpenAI models only. Single-image only — cannot be combined with a multi-image `image[]` array. |
| `size` | string | No | Output size (default: `1024x1024`). Must be one of the model's listed sizes, otherwise `400`. |
| `n` | integer | No | Number of images to generate (default: 1, min 1, max 10). Validated before the 402. |

Unknown fields are ignored. A body that is not valid JSON (or an unparsable multipart form) returns `400`; a body that fails validation returns `400 { "error": "Invalid request body", "details": [...] }`.

### Accepted image formats

Every `image` and `mask` value is decoded and sniffed **before** the `402`, so bad input is a `400` and never costs a signed round-trip. To pass the gate a data URI must:

- start with `data:image/`, and
- decode to real image bytes — PNG, JPEG, GIF, BMP, WEBP, or an ISO-BMFF container (HEIC / HEIF / AVIF). A syntactically valid URI with garbage bytes (e.g. `data:image/png;base64,AAAA`) is rejected with `image data URI does not decode to a recognizable image (expected PNG, JPEG, GIF, BMP, WEBP, or HEIC/HEIF/AVIF)`.

The gate only rejects undecodable data; the model is the final authority on formats. Google Nano Banana models accept HEIC/HEIF (the iPhone camera default), while OpenAI GPT Image models do not — sending one there returns `400 { "error": "Invalid input image", "details": "..." }` from the model's own check, still without a charge. There is no separate byte cap on the source images beyond what fits in one HTTP request.

### Supported Models

Prices are what the `402` challenge quotes and what is billed for **one** edit at that size — catalog rate + 5% + the flat $0.001 transaction fee (see [Pricing](#pricing)).

| Model ID | Provider | Mask | Max source images | Sizes | Price (n=1) |
|----------|----------|------|-------|-------|---------|
| `openai/gpt-image-1` | OpenAI | ✅ | 4 | 1024x1024, 1536x1024, 1024x1536 | $0.022 / $0.043 |
| `openai/gpt-image-2` | OpenAI | ✅ | 4 | 1024x1024, 1536x1024, 1024x1536 | $0.064 / $0.127 |
| `google/nano-banana` | Google (Gemini 2.5 Flash Image) | ❌ prompt-only | 3 | 1024x1024 | $0.0535 |
| `google/nano-banana-2` | Google (Gemini 3.1 Flash Image) | ❌ prompt-only | 3 | 1024x1024 | $0.0955 |
| `google/nano-banana-pro` | Google (Gemini 3 Pro Image) | ❌ prompt-only | 3 | 1024x1024, 2048x2048, 4096x4096 | $0.106 / $0.106 / $0.1585 |

## Hybrid sync/async flow & settlement

Like [`/v1/images/generations`](image-generation.md#how-it-works--hybrid-syncasync-flow--settlement),
this endpoint is **hybrid** — it is *not* always synchronous:

- **Fast edits (≤30s inline window):** `200` with the standard
  `{ id, created, data: [...] }` body below. Payment settles inside this response.
- **Slow edits (>30s — `openai/gpt-image-2` single-image edits routinely take
  45–90s, and multi-image fusion longer; its upstream call is allowed up to 600s):**
  `202` with an async job envelope `{ id, object: "image.edit.job", status,
  poll_url, price, payment_status: "verified" }`. **Nothing has been charged
  yet.** Poll `GET {poll_url}` (it lives under `/v1/images/generations/{id}` —
  edits share the same job store) with an `x-payment` header from the same
  wallet every 2–5s. USDC settles exactly once, on the first poll that observes
  `status: "completed"`. A job that ends `failed`, or that you never poll, is
  **never charged**.

:::note{title="No charge until the image is ready"}
On the slow async path nothing is debited at submit time (`payment_status: "verified"`). USDC settles exactly once — on the first poll that sees `status: "completed"`. Failed jobs and never-polled jobs are never charged. The signed authorization is valid for 600s (`maxTimeoutSeconds` in the challenge), so finish polling within 10 minutes of signing.
:::

The envelope fields, poll responses, status enum
(`queued → in_progress → completed | failed`), replay recovery
(`402 PAYMENT_REPLAY` with `job_id` + `poll_url`) and settlement guarantees are
identical to image generation — see the
[full spec there](image-generation.md#how-it-works--hybrid-syncasync-flow--settlement).
Go SDK `blockrun-llm-go ≥ v0.17.0` (`ImageClient.Edit`) handles the hybrid
flow transparently and always returns the synchronous shape.

## Response

```json
{
  "id": "img_8f3a…",
  "created": 1706000000,
  "data": [
    {
      "url": "data:image/png;base64,…",
      "revised_prompt": "A photo with the background changed to..."
    }
  ],
  "price": { "amount": "0.064000", "currency": "USD" },
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

Headers: `PAYMENT-RESPONSE` (x402 settlement receipt) and `X-Payment-Receipt` (the on-chain tx hash).

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Per-call job id (same value as `job_id` in the async envelope, poll responses and replay `402`s) |
| `created` | integer | Unix timestamp |
| `data` | array | Array of edited images |
| `data[].url` | string | **Fast path (`200` from the POST):** the model's raw output, which for every supported model is a `data:image/...;base64,` URI — it is *not* mirrored to durable storage, so persist it yourself. **Slow path (`200` from the poll):** a permanent BlockRun-hosted proxy URL, with `source_url` and `backed_up` alongside, exactly like [image generation](image-generation.md#response-fields). |
| `data[].revised_prompt` | string | Expanded prompt (when the model returns one) |
| `price.amount` | string | USD billed for this call (includes the 5% margin and the $0.001 transaction fee) |
| `payment.status` | string | `settled` \| `already_settled` |
| `payment.tx_hash` | string | On-chain USDC settlement tx (also in `X-Payment-Receipt` header) |

## Examples

### Via ClawRouter (recommended)

The easiest way is using ClawRouter's `/img2img` slash command, which reads local files automatically:

```
/img2img --image ~/photo.png change the background to a starry sky
/img2img --image ./cat.jpg --mask ./mask.png remove the background
/img2img --image /tmp/portrait.png --size 1536x1024 add a hat
```

### Via ClawRouter API

ClawRouter handles x402 payments automatically:

```bash
# First, convert your image to base64
IMAGE_B64=$(base64 -i ~/photo.png)

curl -X POST http://localhost:8402/v1/images/image2image \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"openai/gpt-image-1\",
    \"prompt\": \"change the background to a starry sky\",
    \"image\": \"data:image/png;base64,${IMAGE_B64}\",
    \"size\": \"1024x1024\"
  }"
```

### Direct API (cURL)

```bash
IMAGE_B64=$(base64 -i ~/photo.png)

# Base
curl -X POST https://blockrun.ai/api/v1/images/image2image \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d "{
    \"model\": \"openai/gpt-image-1\",
    \"prompt\": \"change the background to a starry sky\",
    \"image\": \"data:image/png;base64,${IMAGE_B64}\",
    \"size\": \"1024x1024\"
  }"

# Solana
curl -X POST https://sol.blockrun.ai/api/v1/images/image2image \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d "{
    \"model\": \"openai/gpt-image-1\",
    \"prompt\": \"change the background to a starry sky\",
    \"image\": \"data:image/png;base64,${IMAGE_B64}\",
    \"size\": \"1024x1024\"
  }"
```

## Mask Usage

:::warning{title="Mask is OpenAI-only"}
Masks apply to `openai/gpt-image-1` and `openai/gpt-image-2`. Google `nano-banana` / `nano-banana-2` / `nano-banana-pro` are prompt-only — passing a `mask` to a Google model returns `400` before payment.
:::

The mask is passed to the model unchanged, so it follows the OpenAI Images edit convention: a PNG with an alpha channel, the same dimensions as the source image.

- **Fully transparent pixels (alpha 0)** = areas to edit (the model generates new content here)
- **Opaque pixels** = areas to keep unchanged

If no mask is provided, the model edits the entire image based on the prompt. The mask goes through the same pre-402 byte check as `image`.

## Multi-image input (image fusion)

Pass an **array** of source images in `image` to fuse several inputs into one
result — e.g. a reference image + a brand logo, composed by a single prompt.

- **OpenAI** `gpt-image-1` / `gpt-image-2`: up to **4** source images.
- **Google** `nano-banana` / `nano-banana-2` / `nano-banana-pro`: up to **3** source images (earlier images act as primary composition anchors).
- `mask` **cannot** be combined with a multi-image array (mask is single-region only) → `400`.
- Exceeding a model's image cap → `400` (`Model … accepts at most N source images per edit`).

:::info{title="Two ways to send multiple images"}
- **JSON** (shown below): `image` as a JSON **array of base64 data URIs**.
- **Multipart** (OpenAI's format): repeated `image[]=@file` fields, e.g.
  `-F "image[]=@ref.png" -F "image[]=@logo.png"`.

Both are accepted. Payment is still x402 in either case (see the format note at the top).
:::

```bash
REF_B64=$(base64 -i ~/reference-post.png)
LOGO_B64=$(base64 -i ~/brand-logo.png)

curl -X POST https://blockrun.ai/api/v1/images/image2image \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d "{
    \"model\": \"google/nano-banana\",
    \"prompt\": \"place the brand logo in the corner, vintage warm palette, no text overlay\",
    \"image\": [
      \"data:image/png;base64,${REF_B64}\",
      \"data:image/png;base64,${LOGO_B64}\"
    ],
    \"size\": \"1024x1024\"
  }"
```

Same request in **OpenAI multipart format** (repeated `image[]`):

```bash
curl -X POST https://blockrun.ai/api/v1/images/image2image \
  -H "X-Payment: $PAYMENT_HEADER" \
  -F "model=google/nano-banana" \
  -F "prompt=place the brand logo in the corner, vintage warm palette, no text overlay" \
  -F "image[]=@reference-post.png" \
  -F "image[]=@brand-logo.png" \
  -F "size=1024x1024"
```

Single-image requests are unchanged — `image` as a plain string (JSON) or a single `image[]`/`image` file (multipart) both work.

## Pricing

Edits bill exactly like generations on the same model:

```
billed = catalog rate for the size × n × 1.05   (5% platform margin on media)
       + $0.001                                 (flat transaction fee, once per call)
```

| Model | Size | Catalog rate | Billed (n=1) |
|-------|------|-------|-------|
| GPT Image 1 | 1024x1024 | $0.02 | $0.022 |
| GPT Image 1 | 1536x1024 | $0.04 | $0.043 |
| GPT Image 1 | 1024x1536 | $0.04 | $0.043 |
| ChatGPT Images 2.0 | 1024x1024 | $0.06 | $0.064 |
| ChatGPT Images 2.0 | 1536x1024 | $0.12 | $0.127 |
| ChatGPT Images 2.0 | 1024x1536 | $0.12 | $0.127 |
| Nano Banana | 1024x1024 | $0.05 | $0.0535 |
| Nano Banana 2 | 1024x1024 | $0.09 | $0.0955 |
| Nano Banana Pro | 1024x1024 | $0.10 | $0.106 |
| Nano Banana Pro | 2048x2048 | $0.10 | $0.106 |
| Nano Banana Pro | 4096x4096 | $0.15 | $0.1585 |

The number of *source* images does not change the price — you pay per output image.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request: malformed JSON / multipart, failed validation (`details[]` — including an `image` or `mask` that does not decode to a real image), unsupported model (message lists the supported set), mask on a Google model, mask combined with multiple images, too many source images, invalid size for the model, `n` outside 1–10, `Invalid input image` (the model rejected the file, e.g. HEIC on an OpenAI model), or `Content policy violation`. None of these are billed. |
| 402 | Payment required / rejected / replayed. Same shapes and machine-readable `code`s (`PAYMENT_INVALID`, `PAYMENT_UNFUNDED`, `PAYMENT_BLOCKHASH_STALE`, `PAYMENT_REPLAY`) as [image generation](image-generation.md#402-responses); the unpaid body has no `generation_info` block. |
| 403 / 404 | Poll only — payer mismatch / job not found (see the [poll responses](image-generation.md#poll-responses)). |
| 429 | Upstream rate limit (`{ "error": "Rate limit exceeded", "details" }`). BlockRun applies no per-IP limit of its own to this endpoint. |
| 500 | Server error (`Image editing failed` / `Internal server error`, with `details` and the `job_id`). Settlement never ran, so nothing was billed. |
| 504 | `Image editing timed out` — rare: an edit that outlives the 30s inline window normally goes async (`202`) instead of timing out. |

## What's next?

::::cards

:::card{title="Image Generation" href="image-generation.md" icon="Image"}
Generate images from a text prompt with the same model lineup and hybrid settlement flow.
:::

:::card{title="ClawRouter" href="https://github.com/blockrunai/ClawRouter" icon="Terminal"}
The `/img2img` slash command reads local files and handles x402 payments for you.
:::

::::
