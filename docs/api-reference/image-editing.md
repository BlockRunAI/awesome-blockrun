# Image Editing API (img2img)

Edit existing images using AI inpainting — pass a source image and describe what to change.

## Endpoint

```
POST https://blockrun.ai/api/v1/images/image2image
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
| `model` | string | No | Model to use (default: `openai/gpt-image-1`) |
| `prompt` | string | Yes | Description of edits to make |
| `image` | string | Yes | Source image as base64 data URI (`data:image/png;base64,...`) |
| `mask` | string | No | Mask image as base64 data URI (white = area to edit) |
| `size` | string | No | Output size (default: `1024x1024`) |
| `n` | integer | No | Number of images to generate (default: 1) |

### Supported Models

| Model ID | Provider | Sizes | Pricing |
|----------|----------|-------|---------|
| `openai/gpt-image-1` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.02-0.04 |

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

curl -X POST https://blockrun.ai/api/v1/images/image2image \
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

The mask defines which parts of the image to edit:

- **White pixels** = areas to edit (AI generates new content here)
- **Black pixels** = areas to keep unchanged

If no mask is provided, the AI will edit the entire image based on the prompt.

## Pricing

Prices include 5% BlockRun margin:

| Model | Size | Price |
|-------|------|-------|
| GPT Image 1 | 1024x1024 | $0.021 |
| GPT Image 1 | 1536x1024 | $0.042 |
| GPT Image 1 | 1024x1536 | $0.042 |

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
