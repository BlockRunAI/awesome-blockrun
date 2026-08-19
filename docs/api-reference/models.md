---
title: Models
description: List and price 71 models across chat, image, video, music, and speech from one unified BlockRun API, with a flat 5% platform fee over provider rates.
---

# Models

BlockRun provides access to models from multiple providers through a unified API.

## List Models

```
GET https://blockrun.ai/api/v1/models
```

Returns a list of available models with pricing information. The response now includes extended metadata for each model.

### Response Fields

Each model object in the response includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Model identifier (e.g., `openai/gpt-5.5`) |
| `name` | string | Display name (e.g., "GPT-5.5") |
| `description` | string | Model description |
| `provider` | string | Provider name |
| `inputPrice` | number | Input price per 1M tokens |
| `outputPrice` | number | Output price per 1M tokens |
| `context_window` | number | Context window size in tokens |
| `max_output` | number | Maximum output tokens |
| `categories` | string[] | Model capabilities: `"chat"`, `"reasoning"`, `"coding"`, `"vision"` |
| `available` | boolean | Whether the model is currently available |

### Example Response

```json
{
  "models": [
    {
      "id": "openai/gpt-5.5",
      "name": "GPT-5.5",
      "description": "OpenAI's flagship — first fully retrained base since GPT-4.5; 1M context, 128K output, native agent + computer use",
      "provider": "openai",
      "inputPrice": 5.00,
      "outputPrice": 30.00,
      "context_window": 1050000,
      "max_output": 128000,
      "categories": ["chat", "coding", "vision"],
      "available": true
    }
  ]
}
```

## Available Models (chat / image / video / music / speech / sound effects)

:::note
**70 chat / LLM models** are publicly listed on mainnet, plus **9 image**, **8 video**, **1 music**, **5 text-to-speech**, and **1 sound-effects** model — covering chat, image, video, music, speech, and sound-effects generation from one API. Additional deprecated / superseded LLM IDs remain routable for backwards compatibility but are hidden from the catalog. Call `GET /api/v1/models` for the exact live list.
:::

All prices shown are provider rates — and, for per-token chat, also the billed rates: BlockRun adds **no platform margin** on chat tokens (we match OpenRouter), only the flat $0.001/request transaction fee. Media and Live Search still carry a 5% platform fee.

### OpenAI GPT-5.6 Family

Released 2026-07-09 — three fixed tiers (Sol / Terra / Luna) replacing the single-model-plus-effort-knob line. Note: on `/v1/chat/completions`, GPT-5.6 accepts function tools only with `reasoning_effort: "none"` — the BlockRun gateway sets this automatically when tools are present, so no client change is needed.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.6-sol` | GPT-5.6 Sol | $5.00/M | $30.00/M | 1M |
| `openai/gpt-5.6-terra` | GPT-5.6 Terra | $2.00/M | $12.00/M | 1M |
| `openai/gpt-5.6-luna` | GPT-5.6 Luna | $0.20/M | $1.20/M | 1M |

### OpenAI GPT-5.5 Family

Released 2026-04-23 — first fully retrained base since GPT-4.5.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.5` | GPT-5.5 | $5.00/M | $30.00/M | 1M |

### OpenAI GPT-5.4 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.4` | GPT-5.4 | $2.50/M | $15.00/M | 1M |
| `openai/gpt-5.4-pro` | GPT-5.4 Pro | $30.00/M | $180.00/M | 1M |
| `openai/gpt-5.4-mini` | GPT-5.4 Mini | $0.75/M | $4.50/M | 400K |
| `openai/gpt-5.4-nano` | GPT-5.4 Nano | $0.05/M | $0.40/M | 128K |

### OpenAI GPT-5 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.3` | GPT-5.3 | $2.00/M | $12.00/M | 400K |
| `openai/gpt-5.3-codex` | GPT-5.3 Codex | $2.00/M | $12.00/M | 400K |
| `openai/gpt-5.2` | GPT-5.2 | $1.75/M | $14.00/M | 400K |
| `openai/gpt-5.2-pro` | GPT-5.2 Pro | $21.00/M | $168.00/M | 400K |
| `openai/gpt-5-mini` | GPT-5 Mini | $0.25/M | $2.00/M | 200K |

### OpenAI O-Series (Reasoning)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/o1` | o1 | $15.00/M | $60.00/M | 200K |
| `openai/o1-mini` | o1-mini | $1.10/M | $4.40/M | 128K |
| `openai/o3` | o3 | $2.00/M | $8.00/M | 200K |
| `openai/o3-mini` | o3-mini | $1.10/M | $4.40/M | 128K |

### Anthropic Claude

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `anthropic/claude-fable-5` | Claude Fable 5 | $10.00/M | $50.00/M | 1M |
| `anthropic/claude-opus-5` | Claude Opus 5 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.8` | Claude Opus 4.8 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.7` | Claude Opus 4.7 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.6` | Claude Opus 4.6 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.5` | Claude Opus 4.5 | $5.00/M | $25.00/M | 200K |
| `anthropic/claude-sonnet-4.6` | Claude Sonnet 4.6 | $3.00/M | $15.00/M | 200K |
| `anthropic/claude-haiku-4.5` | Claude Haiku 4.5 | $1.00/M | $5.00/M | 200K |

:::warning{title="Opus 4.7 / 4.8 behavior"}
These flagship models reject all sampling parameters (`temperature`, `top_p`, `top_k`); the gateway drops them so calls succeed. They use adaptive thinking (built-in, not API-configurable). The model may decline a request with HTTP 200 and `stop_reason: "refusal"` (`finish_reason: "content_filter"` on the OpenAI-compatible endpoint) — check the stop reason before reading content.
:::

### Google Gemini

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `google/gemini-3.1-pro` | Gemini 3.1 Pro | $2.00/M | $12.00/M | 1M |
| `google/gemini-3.5-flash` | Gemini 3.5 Flash | $1.50/M | $9.00/M | 1M |
| `google/gemini-2.5-pro` | Gemini 2.5 Pro | $1.25/M | $10.00/M | 1M |
| `google/gemini-2.5-flash` | Gemini 2.5 Flash | $0.30/M | $2.50/M | 1M |
| `google/gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | $0.25/M | $1.50/M | 1M |
| `google/gemini-2.5-flash-lite` | Gemini 2.5 Flash Lite | $0.10/M | $0.40/M | 1M |

Gemini **Pro** models (`gemini-2.5-pro`, `gemini-3.1-pro`) bill a **long-context tier** — 2x input, 1.5x output above 200K prompt tokens (mirrors Google's official pricing: `gemini-2.5-pro` is $2.50/M in · $15.00/M out, `gemini-3.1-pro` is $4.00/M in · $18.00/M out above the threshold). Flash / Flash-Lite are flat-priced.

### xAI Grok

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `xai/grok-4.5` | Grok 4.5 | $2.50/M | $9.00/M | 500K |
| `xai/grok-4.3` | Grok 4.3 | $1.50/M | $4.00/M | 1M |
| `xai/grok-build-0.1` | Grok Build 0.1 | $1.50/M | $3.00/M | 256K |

Grok bills a **long-context tier** at 2x the rates above once a request's prompt reaches 200K tokens (mirrors xAI's official pricing — e.g. Grok 4.5 is $5.00/M in · $18.00/M out above the threshold). Live Search adds $0.025 per source used. Grok Imagine image/video SKUs are listed under Image / Video Generation below.

### DeepSeek

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `deepseek/deepseek-chat` | DeepSeek V4 Flash Chat | $0.14/M | $0.28/M | 1M |
| `deepseek/deepseek-v4-pro` | DeepSeek V4 Pro | $0.435/M | $0.87/M | 1M |
| `deepseek/deepseek-reasoner` | DeepSeek Reasoner | $0.14/M | $0.28/M | 128K |

### Z.AI

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `zai/glm-5.2` | GLM-5.2 (flagship) | $1.40/M | $4.40/M | 1M |
| `zai/glm-5.1` | GLM-5.1 | $1.40/M | $4.40/M | 200K |
| `zai/glm-5` | GLM-5 | $1.00/M | $3.20/M | 200K |
| `zai/glm-5-turbo` | GLM-5 Turbo | $1.20/M | $4.00/M | 200K |

### Moonshot

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `moonshot/kimi-k3` | Kimi K3 (flagship) | $3.00/M | $15.00/M | 1M |
| `moonshot/kimi-k2.7` | Kimi K2.7 | $0.95/M | $4.00/M | 256K |
| `moonshot/kimi-k2.6` | Kimi K2.6 | $0.95/M | $4.00/M | 256K |
| `moonshot/kimi-k2.5` | Kimi K2.5 (legacy) | $0.60/M | $3.00/M | 262K |

K3 is the current flagship — a 2.8-trillion-parameter open MoE with a **1M-token context window**, image + text input, returning `reasoning_content` on completions. K2.7 (256K, adds **video** input) remains routable but superseded; K2.6 and K2.5 are earlier multi-modal generations, still routable.

### MiniMax

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `minimax/minimax-m3` | MiniMax M3 | $0.30/M | $1.20/M | 1M |

### Qwen (Alibaba)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `qwen/qwen3.7-max` | Qwen3.7 Max | $1.48/M | $4.43/M | 1M |

### Free Tier (open-weight)

Open-weight models served free of charge (no x402 payment), subject to a small per-IP rate limit. The free tier auto-routes around any temporarily unavailable model, so the live set is best read from `GET /api/v1/models` (filter on `billingMode: "free"`). There are **5** free models listed on mainnet; the free tier's fallback workhorse is `nvidia/gpt-oss-120b`.

| Model ID | Name | Input Price | Output Price |
|----------|------|-------------|--------------|
| `nvidia/mistral-nemotron` | Mistral Nemotron | **FREE** | **FREE** |
| `nvidia/step-3.7-flash` | Step 3.7 Flash | **FREE** | **FREE** |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Nemotron 3 Nano Omni | **FREE** | **FREE** |
| `nvidia/nemotron-nano-9b-v2` | Nemotron Nano 9B v2 | **FREE** | **FREE** |
| `nvidia/nemotron-nano-12b-v2-vl` | Nemotron Nano 12B v2 VL | **FREE** | **FREE** |

### Image Generation

| Model ID | Name | Price |
|----------|------|-------|
| `openai/gpt-image-1` | GPT Image 1 | $0.02-0.04/image |
| `openai/gpt-image-2` | ChatGPT Images 2.0 | $0.06-0.12/image |
| `google/nano-banana` | Nano Banana | $0.05/image |
| `google/nano-banana-pro` | Nano Banana Pro | $0.10-0.15/image |
| `xai/grok-imagine-image` | Grok Imagine | $0.02/image |
| `xai/grok-imagine-image-pro` | Grok Imagine Pro | $0.07/image |
| `zai/cogview-4` | CogView-4 | $0.015-0.02/image |
| `bytedance/seedream-5-pro` | Seedream 5.0 Pro | $0.047-0.095/image (async, ~2 min) |

### Video Generation

Seedance defaults to **720p with synced audio** for text-to-video; pass `resolution` / `generate_audio` to override. See [Video Generation API](video-generation.md).

| Model ID | Name | Price (5s 720p default) | Max duration |
|----------|------|--------------------------|--------------|
| `xai/grok-imagine-video` | Grok Imagine Video | $0.05/sec @480p default · $0.07/sec @720p, + $0.001/generation (8s 480p = $0.401) | 15s |
| `xai/grok-imagine-video-1.5` | Grok Imagine Video 1.5 | $0.08/sec @480p default · $0.14/sec @720p · $0.25/sec @1080p, + $0.001/generation (8s 480p = $0.641) | 15s |
| `bytedance/seedance-1.5-pro` | Seedance 1.5 Pro | ~$0.070/sec ($0.35 / 5s clip) | 12s |
| `bytedance/seedance-2.0-fast` | Seedance 2.0 Fast | ~$0.165/sec ($0.83 / 5s clip) | 15s |
| `bytedance/seedance-2.0` | Seedance 2.0 Pro | ~$0.227/sec ($1.14 / 5s clip) | 15s |
| `bytedance/seedance-2.5` | Seedance 2.5 | ~$0.315/sec ($1.58 / 5s clip) | 30s |
| `azure/sora-2` | Sora 2 | $0.10/sec (4s = $0.42) | 12s |

For character consistency across multiple Seedance videos, enroll a [Virtual Portrait](virtual-portrait.md) ($0.011 one-time, no KYC) for AI characters, or a [RealFace](realface.md) ($0.011 one-time, no KYC, requires brief on-phone liveness check) for real people. Pass the returned `ta_xxx` as `real_face_asset_id`.

## Model Categories

Each model includes a `categories` array in the API response. Categories indicate model capabilities:

- **chat** - General conversation
- **reasoning** - Complex problem-solving
- **coding** - Code generation and analysis
- **vision** - Image understanding

Filter models by category:

```python
models = client.list_models()
reasoning_models = [m for m in models if "reasoning" in m.get("categories", [])]
```

## Pricing

Prices are per 1 million tokens. Your actual cost depends on:

1. **Input tokens** - Length of your prompt and context
2. **Output tokens** - Length of the model's response
3. **Platform fee** - 5% added to provider rates

The SDK calculates the exact price before each request.

**Want to save 88% automatically?** [ClawRouter](../products/routing/clawrouter.md) routes each request to the cheapest model that can handle it.

## Example

::::tabs

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()
models = client.list_models()

for model in models:
    print(f"{model['id']}: ${model['inputPrice']}/M input, context: {model['context_window']}")
    print(f"  Categories: {', '.join(model.get('categories', []))}")
```
:::

:::tab{label="TypeScript"}
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });
const models = await client.listModels();

for (const model of models) {
  console.log(`${model.id}: $${model.inputPrice}/M input, context: ${model.contextWindow}`);
  console.log(`  Categories: ${model.categories.join(', ')}`);
}
```
:::

::::

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Call any model ID from this catalog through the OpenAI-compatible endpoint.
:::

:::card{title="Image Generation" href="image-generation.md" icon="Image"}
Generate images with the GPT Image, Nano Banana, and CogView model family.
:::

:::card{title="Save 88% with ClawRouter" href="../products/routing/clawrouter.md" icon="Route"}
Route each prompt to the cheapest model that can handle it, automatically.
:::

::::
