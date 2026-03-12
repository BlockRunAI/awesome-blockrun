# Image-to-Image (Edit) Design

**Date:** 2026-03-10
**Status:** Approved

## Summary

Add image editing (inpainting) capability to BlockRun + ClawRouter.
Users pass a local image path via a new `/img2img` slash command in ClawRouter, which reads the file and calls a new BlockRun API endpoint.

---

## Architecture

```
User: /img2img --image /path/to/photo.png 把背景换成星空
         ↓
ClawRouter (local)
  - reads file → base64
  - optional: reads mask file → base64
  - POST /v1/images/image2image (with x402 payment)
         ↓
BlockRun API (blockrun.ai)
  - verify x402 payment
  - call openai gpt-image-1 /images/edits
  - settle payment
  - return image URL
         ↓
ClawRouter
  - save data URI to ~/.openclaw/blockrun/images/
  - return localhost URL to chat client
```

---

## Part 1: BlockRun API — `/v1/images/image2image`

### Endpoint

```
POST /api/v1/images/image2image
```

### Request Body (JSON)

```json
{
  "model": "openai/gpt-image-1",
  "prompt": "把背景换成星空",
  "image": "data:image/png;base64,<base64-data>",
  "mask": "data:image/png;base64,<base64-data>",  // optional
  "size": "1024x1024",
  "n": 1
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `model` | string | yes | — |
| `prompt` | string | yes | — |
| `image` | string (data URI) | yes | — |
| `mask` | string (data URI) | no | null |
| `size` | string | no | `1024x1024` |
| `n` | number | no | 1 |

**Supported models:** `openai/gpt-image-1` only (v1)

### Pricing

Same as `/v1/images/generations` for gpt-image-1:
- 1024×1024: $0.02/image
- 1536×1024 / 1024×1536: $0.04/image

### Response (200)

```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "data:image/png;base64,...",
      "revised_prompt": "..."
    }
  ]
}
```

### Implementation: `ai-providers.ts`

New function `editOpenAIImage(model, prompt, imageBase64, maskBase64, size, n)`:
- Strip `data:image/...;base64,` prefix from image/mask
- Convert base64 → `Buffer` → `File` (required by OpenAI SDK)
- Call `openai.images.edit({ model: "gpt-image-1", image, mask, prompt, n, size })`
- Return `{ images, revisedPrompts }`

### Implementation: `route.ts`

New file: `src/app/api/v1/images/image2image/route.ts`
Structure mirrors `/v1/images/generations/route.ts` with:
- New Zod schema including `image` (required) and `mask` (optional)
- Calls `editImage()` from `ai-providers.ts`
- Same x402 payment flow
- Resource URL: `/api/v1/images/image2image`

---

## Part 2: ClawRouter — `/img2img` Command

### Slash Command Syntax

```
/img2img [--model <model>] [--mask <path>] [--size <WxH>] <prompt>
         --image <path>   (required)
```

Examples:
```
/img2img --image ~/photo.png 把背景换成星空
/img2img --image ./portrait.jpg --mask ./mask.png remove the background
/img2img --image /tmp/cat.png --size 1536x1024 --model gpt-image add a hat
```

### Implementation in `proxy.ts`

Add new slash command handler after `/imagegen` block (~line 2414):

1. **Parse args**: `--image`, `--mask`, `--size`, `--model`, remaining text = prompt
2. **Read files**: `fs.readFileSync(imagePath)` → base64 data URI
3. **Build JSON body**: `{ model, prompt, image, mask?, size, n: 1 }`
4. **Call**: `payFetch(`${apiBase}/v1/images/image2image`, { method: "POST", body })`
5. **Handle response**: same as `/imagegen` — save data URIs locally, return localhost URL
6. **Error handling**: file not found, unsupported format, payment failed

### File Reading Helper

```typescript
function readImageAsDataUri(filePath: string): string {
  const resolved = filePath.replace(/^~/, homedir());
  const ext = extname(resolved).toLowerCase().slice(1);
  const mimeMap: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp"
  };
  const mime = mimeMap[ext] ?? "image/png";
  const data = readFileSync(resolved);
  return `data:${mime};base64,${data.toString("base64")}`;
}
```

### Usage Help Text

```
Usage: /img2img --image <path> <prompt>

Options:
  --image <path>   Source image path (required)
  --mask <path>    Mask image path (optional, white = edit area)
  --model <model>  Model (default: gpt-image)
  --size <WxH>     Output size (default: 1024x1024)

Examples:
  /img2img --image ~/photo.png 把背景换成星空
  /img2img --image ./cat.jpg --mask ./mask.png remove the background
```

---

## Files to Change

### BlockRun (`/Users/vickyfu/Documents/blockrun-web/blockrun`)

| File | Change |
|------|--------|
| `src/app/api/v1/images/image2image/route.ts` | **New** — endpoint handler |
| `src/lib/ai-providers.ts` | Add `editOpenAIImage()` + export `editImage()` |
| `src/app/api/.well-known/x402/route.ts` | Add new endpoint to discovery |

### ClawRouter (`/Users/vickyfu/Documents/blockrun-web/ClawRouter`)

| File | Change |
|------|--------|
| `src/proxy.ts` | Add `/img2img` slash command handler |

---

## Out of Scope (v1)

- Google Nano Banana img2img
- DALL-E 3 img2img (doesn't support image input)
- Web UI upload
- Multiple input images
