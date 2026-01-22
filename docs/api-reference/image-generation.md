# Image Generation API

Generate images using DALL-E, Flux, or Google Nano Banana.

## Endpoint

```
POST https://blockrun.ai/api/v1/images/generations
```

## Request

```json
{
  "model": "dall-e-3",
  "prompt": "A futuristic city at sunset",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model to use (see below) |
| `prompt` | string | Yes | Image description |
| `size` | string | No | Image dimensions (default: "1024x1024") |
| `quality` | string | No | "standard" or "hd" (DALL-E only) |
| `n` | integer | No | Number of images (default: 1) |

### Available Models

| Model ID | Provider | Sizes | Pricing |
|----------|----------|-------|---------|
| `dall-e-3` | OpenAI | 1024x1024, 1024x1792, 1792x1024 | $0.04-0.12 |
| `dall-e-2` | OpenAI | 256x256, 512x512, 1024x1024 | $0.02-0.04 |
| `nano-banana` | Google | 1024x1024 | $0.05 |
| `nano-banana-pro` | Google | 1024x1024 | $0.10 |

## Response

```json
{
  "created": 1706000000,
  "data": [
    {
      "url": "https://blockrun.ai/images/...",
      "revised_prompt": "A futuristic cityscape at sunset with..."
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `data` | array | Array of generated images |
| `data[].url` | string | URL to generated image |
| `data[].revised_prompt` | string | Expanded prompt (DALL-E 3 only) |

## Examples

### cURL

```bash
curl https://blockrun.ai/api/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BLOCKRUN_WALLET_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A minimalist logo for an AI trading company",
    "size": "1024x1024"
  }'
```

### Python

```python
from blockrun_llm import LLMClient

client = LLMClient()
image_url = client.generate_image(
    prompt="A futuristic AI robot",
    model="dall-e-3",
    size="1024x1024"
)
print(image_url)
```

### TypeScript

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient();
const imageUrl = await client.generateImage({
  prompt: 'A futuristic AI robot',
  model: 'dall-e-3',
  size: '1024x1024'
});
console.log(imageUrl);
```

## Pricing

Prices include 5% BlockRun margin:

| Model | Size | Price |
|-------|------|-------|
| DALL-E 3 Standard | 1024x1024 | $0.042 |
| DALL-E 3 HD | 1024x1792 | $0.084 |
| DALL-E 3 HD Wide | 1792x1024 | $0.126 |
| DALL-E 2 | 1024x1024 | $0.021 |
| Nano Banana | 1024x1024 | $0.053 |
| Nano Banana Pro | 1024x1024 | $0.105 |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad prompt or parameters) |
| 402 | Payment required (insufficient balance) |
| 403 | Content policy violation |
| 429 | Rate limit exceeded |
| 500 | Server error |

### Error Response

```json
{
  "error": {
    "message": "Content policy violation detected",
    "type": "invalid_request_error",
    "code": "content_policy_violation"
  }
}
```

## Best Practices

### Prompt Tips

**Be specific:**
```
❌ "A dog"
✅ "A golden retriever puppy sitting in a sunlit meadow, soft focus background"
```

**Specify style:**
```
✅ "Digital art style, vibrant colors"
✅ "Photorealistic, 4K quality"
✅ "Minimalist vector illustration"
```

**Include composition:**
```
✅ "Centered composition, clean background"
✅ "Wide angle view, dramatic lighting"
```

### Model Selection

| Use Case | Recommended |
|----------|-------------|
| Highest quality | dall-e-3 HD |
| Fast & cheap | nano-banana |
| Multiple variations | dall-e-2 |
| Professional quality | nano-banana-pro |

### Rate Limits

| Model | Requests/minute |
|-------|-----------------|
| DALL-E 3 | 50 |
| DALL-E 2 | 100 |
| Nano Banana | 100 |

## OpenAI Compatibility

This endpoint is compatible with OpenAI's Images API. You can use the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://blockrun.ai/api/v1",
    api_key=os.environ["BLOCKRUN_WALLET_KEY"]
)

response = client.images.generate(
    model="dall-e-3",
    prompt="A futuristic city",
    size="1024x1024"
)
print(response.data[0].url)
```

## Links

- [nano-banana Skill](../products/creation/nano-banana.md)
- [Intelligence Pricing](../products/intelligence/pricing.md)
- [Error Handling](errors.md)
