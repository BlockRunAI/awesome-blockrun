# Image Editing API (img2img)

Edit existing images using AI inpainting — pass a source image and describe what to change.

## Endpoint

| Network | URL |
|---------|-----|
| Base | `https://blockrun.ai/api/v1/images/image2image` |
| Solana | `https://sol.blockrun.ai/api/v1/images/image2image` |

```
POST https://blockrun.ai/api/v1/images/image2image       # Base
POST https://sol.blockrun.ai/api/v1/images/image2image    # Solana
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
| `model` | string | No | Model to use (default: `openai/gpt-image-2`). Supported: `openai/gpt-image-1`, `openai/gpt-image-2`, `google/nano-banana`, `google/nano-banana-pro` |
| `prompt` | string | Yes | Description of edits to make |
| `image` | string \| string[] | Yes | Source image as a base64 data URI, **or an array of data URIs** to fuse multiple sources into one variant (e.g. a reference image + a brand logo). OpenAI-compatible `image[]`. Max 4 images for OpenAI, 3 for Google. |
| `mask` | string | No | Mask image as base64 data URI (white = area to edit). Single-image only — cannot be combined with a multi-image `image[]` array. |
| `size` | string | No | Output size (default: `1024x1024`) |
| `n` | integer | No | Number of images to generate (default: 1) |

### Supported Models

| Model ID | Provider | Mask | Sizes | Pricing |
|----------|----------|------|-------|---------|
| `openai/gpt-image-1` | OpenAI | ✅ | 1024x1024, 1536x1024, 1024x1536 | $0.02-0.04 |
| `openai/gpt-image-2` | OpenAI | ✅ | 1024x1024, 1536x1024, 1024x1536 | $0.06-0.12 |
| `google/nano-banana` | Google (Gemini 2.5 Flash Image) | ❌ prompt-only | 1024x1024 | $0.05 |
| `google/nano-banana-pro` | Google (Gemini 3 Pro Image) | ❌ prompt-only | 1024x1024, 2048x2048, 4096x4096 | $0.10-0.15 |

## Response

```json
{
  "created": 1706000000,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "A photo with the background changed to..."
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `data` | array | Array of edited images |
| `data[].url` | string | URL to edited image |
| `data[].revised_prompt` | string | Expanded prompt |

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

> **Mask is OpenAI-only.** Masks apply to `openai/gpt-image-1` and `openai/gpt-image-2`. Google `nano-banana` / `nano-banana-pro` are prompt-only — passing a `mask` to a Google model returns `400`.

The mask defines which parts of the image to edit:

- **White pixels** = areas to edit (AI generates new content here)
- **Black pixels** = areas to keep unchanged

If no mask is provided, the AI will edit the entire image based on the prompt.

## Multi-image input (image fusion)

Pass an **array** of source images in `image` to fuse several inputs into one
result — e.g. a reference image + a brand logo, composed by a single prompt.
This is OpenAI-compatible `image[]`.

- **OpenAI** `gpt-image-1` / `gpt-image-2`: up to **4** source images.
- **Google** `nano-banana` / `nano-banana-pro`: up to **3** source images (earlier images act as primary composition anchors).
- `mask` **cannot** be combined with a multi-image array (mask is single-region only) → `400`.
- Exceeding a provider's image cap → `400`.

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

Single-image requests are unchanged — `image` as a plain string still works.

## Pricing

Prices include 5% BlockRun margin:

| Model | Size | Price |
|-------|------|-------|
| GPT Image 1 | 1024x1024 | $0.021 |
| GPT Image 1 | 1536x1024 | $0.042 |
| GPT Image 1 | 1024x1536 | $0.042 |
| ChatGPT Images 2.0 | 1024x1024 | $0.063 |
| ChatGPT Images 2.0 | 1536x1024 | $0.126 |
| ChatGPT Images 2.0 | 1024x1536 | $0.126 |
| Nano Banana | 1024x1024 | $0.0525 |
| Nano Banana Pro | 1024x1024 | $0.105 |
| Nano Banana Pro | 2048x2048 | $0.105 |
| Nano Banana Pro | 4096x4096 | $0.1575 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad image format, unsupported model, invalid size) |
| 402 | Payment required |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 504 | Image editing timed out |

## Links

- [Image Generation API](image-generation.md)
- [ClawRouter README](https://github.com/blockrunai/ClawRouter)
