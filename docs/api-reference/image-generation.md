# Image Generation API

Generate images using GPT Image (including ChatGPT Images 2.0), Google Nano Banana, CogView-4, or xAI Grok Imagine.

## Endpoint

```
POST https://blockrun.ai/api/v1/images/generations
```

## Request

```json
{
  "model": "google/nano-banana",
  "prompt": "A futuristic city at sunset",
  "size": "1024x1024",
  "n": 1
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model to use (see below) |
| `prompt` | string | Yes | Image description |
| `size` | string | No | Image dimensions (default: "1024x1024") |
| `quality` | string | No | "standard" or "hd" (model-dependent) |
| `n` | integer | No | Number of images (default: 1) |

### Available Models

| Model ID | Provider | Sizes | Price |
|----------|----------|-------|-------|
| `openai/gpt-image-1` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.021 |
| `openai/gpt-image-2` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.063 |
| `google/nano-banana` | Google | 1024x1024 | $0.053 |
| `google/nano-banana-pro` | Google | 1024x1024, 2048x2048, 4096x4096 | $0.105 |
| `zai/cogview-4` | Zhipu AI | 512x512 – 1440x1440 | $0.015 |
| `xai/grok-imagine-image` | xAI | 1024x1024 | $0.021 |
| `xai/grok-imagine-image-pro` | xAI | 1024x1024 | $0.074 |

#### CogView-4 Sizes

`zai/cogview-4` supports flexible sizes (multiples of 16, max 1440×1440):

| Size | Use Case |
|------|----------|
| `512x512` | Thumbnails, icons |
| `768x768` | Social media |
| `1024x1024` | Standard (default) |
| `768x1344` | Portrait / mobile |
| `1344x768` | Landscape / banner |
| `1440x1440` | High resolution |

## How it works — hybrid sync/async flow & settlement

This endpoint is **hybrid**: fast generations complete synchronously, slow ones
switch to an async job you poll. The split is purely by elapsed time:

1. **`POST /v1/images/generations`** with an `x-payment` (or
   `PAYMENT-SIGNATURE`) header. The gateway **verifies** the payment
   authorization (no USDC moves yet) and starts generation.
2. **Fast path (≤30s inline window — most models):** generation finishes
   inline. The gateway settles the payment and returns **`200`** with the
   standard `{ created, data: [...] }` body below. This is the only moment a
   fast-path call is charged.
3. **Slow path (>30s — e.g. `openai/gpt-image-2` under load):** the gateway
   returns **`202`** with an async job envelope `{ id, status: "queued",
   poll_url, price, payment_status: "verified" }`. **No USDC has moved.**
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
| Idempotent re-polls | Polling an already-settled job returns the same URLs again (`payment.status: "already_settled"`) — never double-charged. |
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
  "price": { "amount": "0.063000", "currency": "USD" },
  "payment_status": "verified",
  "created": 1706000000,
  "poll_url": "/api/v1/images/generations/img_8f3a…",
  "poll_instructions": "…"
}
```

`status` enum: `queued` → `in_progress` → `completed` | `failed`.

### Poll responses

- **`202` running:** `{ id, object, status: "queued" | "in_progress", model, payment_status: "verified" }`
- **`200` completed (charged here):** the standard body below plus
  `price: { amount, currency }` and `payment: { status: "settled", tx_hash, network }`,
  with `PAYMENT-RESPONSE` and `X-Payment-Receipt` (on-chain tx hash) headers.
- **`200` failed (not charged):** `{ id, object, status: "failed", model, error, payment_status: "not_charged" }`

> **OpenAI-compatible clients:** plain OpenAI SDKs don't understand the `202`
> envelope. Use a model that completes inline, or the official BlockRun SDKs —
> Go `blockrun-llm-go ≥ v0.17.0` handles the hybrid flow transparently and
> always returns the synchronous `{data:[...]}` shape.

## Response

```json
{
  "created": 1706000000,
  "data": [
    {
      "url": "https://blockrun.ai/api/media/media/images/2026/04/17/<id>.jpg",
      "source_url": "https://imgen.x.ai/xai-imgen/...",
      "backed_up": true,
      "revised_prompt": "..."
    }
  ],
  "price": { "amount": "0.015000", "currency": "USD" },
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `data` | array | Array of generated images |
| `data[].url` | string | Permanent URL. When GCS backup succeeds, this is a blockrun-hosted proxy URL; otherwise the upstream URL. For `openai/gpt-image-1` and `openai/gpt-image-2` this is a base64 data URI |
| `data[].source_url` | string | Original upstream URL (omitted for data URIs) |
| `data[].backed_up` | boolean | `true` when the image was mirrored to BlockRun's GCS bucket (omitted for data URIs) |
| `data[].revised_prompt` | string | Expanded prompt (when the model rewrites it) |

> **Why both `url` and `source_url`?** Most providers return temporary URLs (OpenAI image URLs expire in 60 min, xAI Grok Imagine URLs are flagged `xai-tmp-*`). BlockRun mirrors each generated image to Google Cloud Storage and returns the permanent proxy URL as `url`.

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

### Direct API (cURL)

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

### Python

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

### TypeScript

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

## Pricing

| Model | Size | Price |
|-------|------|-------|
| CogView-4 | up to 1440x1440 | **$0.015** |
| CogView-4 | 1440x1440 | $0.02 |
| GPT Image 1 | 1024x1024 | $0.021 |
| ChatGPT Images 2.0 | 1024x1024 | $0.063 |
| ChatGPT Images 2.0 | 1536x1024 / 1024x1536 | $0.126 |
| Grok Imagine | 1024x1024 | $0.021 |
| Grok Imagine Pro | 1024x1024 | $0.074 |
| Nano Banana | 1024x1024 | $0.053 |
| Nano Banana Pro | 1024x1024 | $0.105 |
| Nano Banana Pro 4K | 4096x4096 | $0.158 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad prompt or parameters) |
| 402 | Payment required (insufficient balance) |
| 403 | Content policy violation |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Model Selection Guide

| Use Case | Recommended |
|----------|-------------|
| Cheapest | `zai/cogview-4` |
| Chinese prompts | `zai/cogview-4` |
| Highest quality | `google/nano-banana-pro` |
| Fast & reliable | `google/nano-banana` |
| Best prompt following | `openai/gpt-image-2` |
| Image editing (img2img) | `openai/gpt-image-1`, `openai/gpt-image-2`, `google/nano-banana`, or `google/nano-banana-pro` |
| Multi-image fusion (ref + logo → 1 image) | `google/nano-banana(-pro)` (≤3) or `openai/gpt-image-1/2` (≤4) — see [Image Editing](image-editing.md) |
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

## Links

- [Video Generation](video-generation.md)
- [Image Editing (img2img)](image-editing.md)
- [Music Generation](music-generation.md)
- [nano-banana Skill](../products/creation/nano-banana.md)
- [Intelligence Pricing](../products/intelligence/pricing.md)
- [Error Handling](errors.md)
