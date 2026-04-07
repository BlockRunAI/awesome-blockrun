# Image Generation API

Generate images using DALL-E, GPT Image, Google Nano Banana, or CogView-4.

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
| `quality` | string | No | "standard" or "hd" (DALL-E 3 only) |
| `n` | integer | No | Number of images (default: 1) |

### Available Models

| Model ID | Provider | Sizes | Price |
|----------|----------|-------|-------|
| `openai/dall-e-3` | OpenAI | 1024x1024, 1024x1792, 1792x1024 | $0.042 |
| `openai/gpt-image-1` | OpenAI | 1024x1024, 1536x1024, 1024x1536 | $0.021 |
| `google/nano-banana` | Google | 1024x1024 | $0.053 |
| `google/nano-banana-pro` | Google | 1024x1024, 2048x2048, 4096x4096 | $0.105 |
| `zai/cogview-4` | Zhipu AI | 512x512 – 1440x1440 | $0.015 |

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

## Response

```json
{
  "created": 1706000000,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "..."
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `data` | array | Array of generated images |
| `data[].url` | string | URL or base64 data URI of generated image |
| `data[].revised_prompt` | string | Expanded prompt (DALL-E 3 only) |

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

# DALL-E 3
result = client.generate(
    "A futuristic AI robot",
    model="openai/dall-e-3",
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

// DALL-E 3
const result2 = await client.generate('A futuristic AI robot', {
  model: 'openai/dall-e-3',
  size: '1024x1024',
});
console.log(result2.data[0].url);
```

## Pricing

| Model | Size | Price |
|-------|------|-------|
| CogView-4 | up to 1440x1440 | **$0.015** |
| CogView-4 | 1440x1440 | $0.02 |
| DALL-E 3 Standard | 1024x1024 | $0.042 |
| DALL-E 3 Wide | 1792x1024 | $0.084 |
| GPT Image 1 | 1024x1024 | $0.021 |
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
| Best prompt following | `openai/dall-e-3` |
| Image editing (img2img) | `openai/gpt-image-1` |

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

- [Image Editing (img2img)](image-editing.md)
- [Music Generation](music-generation.md)
- [nano-banana Skill](../products/creation/nano-banana.md)
- [Intelligence Pricing](../products/intelligence/pricing.md)
- [Error Handling](errors.md)
