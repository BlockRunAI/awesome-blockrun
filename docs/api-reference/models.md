---
title: Models
description: List and price 116 models — chat, image, video, music and speech — from one BlockRun API — vendor list prices, a 5% platform fee on chat, $0.001 per call.
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
| `object` | string | Always `"model"` (OpenAI-compatible envelope) |
| `owned_by` | string | Model maker (e.g., `openai`, `anthropic`, `xai`) |
| `name` | string | Display name (e.g., "GPT-5.5") |
| `description` | string | Model description |
| `context_window` | number | Context window size in tokens |
| `max_output` | number | Maximum output tokens |
| `categories` | string[] | Model capabilities: `"chat"`, `"reasoning"`, `"coding"`, `"vision"`, `"search"` (media rows carry `"image"`, `"video"`, `"music"`, `"speech"`, `"tts"`, `"sound_effect"`; the Decisions row carries `"judgment"`) |
| `billing_mode` | string | `"paid"` (per-token chat models), `"free"`, or a media mode: `"per_image"`, `"per_second"`, `"per_track"`, `"per_character"`, `"per_generation"`. The one Decisions judgment row (not a chat model) uses `"per_token"` |
| `pricing` | object | `{ input, output }` in USD per 1M tokens for per-token models, plus `cache_read` / `cache_write` where the model has them and `long_context` (a list of repricing steps) on models that reprice above a prompt threshold; `{ per_image }`, `{ per_second }`, `{ per_track }`, `{ per_1k_chars }`, `{ per_generation }` with `transaction_fee` for media |

Only models that are currently available are returned. Chat rows also carry `available: true`.

### Example Response

```json
{
  "object": "list",
  "data": [
    {
      "id": "openai/gpt-5.5",
      "object": "model",
      "created": 1700000000,
      "owned_by": "openai",
      "name": "GPT-5.5",
      "description": "First fully retrained base since GPT-4.5. 1M context, 128K output, native agent + computer use",
      "context_window": 1050000,
      "max_output": 128000,
      "categories": ["chat", "reasoning", "coding", "vision"],
      "billing_mode": "paid",
      "available": true,
      "pricing": {
        "input": 5,
        "output": 30,
        "cache_read": 0.5,
        "long_context": [
          { "threshold": 272000, "inclusive": false, "input": 10, "output": 45, "cache_read": 1 }
        ]
      }
    }
  ]
}
```

## Available Models (chat / image / video / music / speech / sound effects)

:::note
**93 chat / LLM models** are publicly listed on mainnet, plus **14 image**, **7 video**, **1 music**, **5 text-to-speech**, and **1 sound-effects** model — covering chat, image, video, music, speech, and sound-effects generation from one API. Additional deprecated / superseded LLM IDs remain routable for backwards compatibility but are hidden from the catalog. The catalog also carries one `judgment` row, `openai/gpt-6-luna-decisions`, for the [Decisions](decisions.md) endpoint. Call `GET /api/v1/models` for the exact live list.
:::

All prices shown are the vendor's list rates. Per-token chat paid per call adds a **5% platform fee** on the token amount, then the flat $0.001/request transaction fee. Media carries a 5% platform margin; Live Search is a flat per-call price (see [Search](search.md)).

### OpenAI GPT-6 Family

GPT-6.2 Astra (released 2026-11-17) is OpenAI's most capable model, with output 20% below GPT-6 Astra's; GPT-6.2 Sol is the everyday tier at Sol's price, with knowledge through June 2026. Astra is the GPT-6 flagship; Sol (released 2026-09-22 with Luna) is the cost-efficient tier below it, and GPT-6.1 Sol (released 2026-09-29) is its refresh at the same price with a cheaper cached rate ($0.10/M against Sol's $0.20/M). GPT-6.1 Terra (released 2026-10) is OpenAI's cost-efficient tier at half GPT-6.1 Sol's rate, with knowledge through June 2026. All seven bill a **long-context tier** — 2x input and cached rates, 1.5x output for the whole request once the prompt exceeds 272K tokens (mirrors OpenAI's official pricing: `gpt-6-sol` and `gpt-6.1-sol` are $4.00/M in · $15.00/M out above the threshold, `gpt-6.1-terra` $2.00/M · $7.50/M). Astra, Sol, Luna and GPT-6.1 Terra serve [Flex](/docs/getting-started/enterprise-api#flex) at half the standard rate; GPT-6.1 Sol and GPT-6.2 do not offer Flex, and a `service_tier: "flex"` request to them is refused before payment. GPT-6.2 and GPT-6.1 Terra write a prompt cache by default, which OpenAI bills at 1.25x input ($10/M on GPT-6.2 Astra, $2.50/M on GPT-6.2 Sol, $1.25/M on GPT-6.1 Terra), so their `exact` quote prices input at that write rate.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-6.2-astra` | GPT-6.2 Astra | $8.00/M | $40.00/M | 1M |
| `openai/gpt-6.2-sol` | GPT-6.2 Sol | $2.00/M | $10.00/M | 1M |
| `openai/gpt-6-astra` | GPT-6 Astra | $10.00/M | $50.00/M | 1M |
| `openai/gpt-6.1-sol` | GPT-6.1 Sol | $2.00/M | $10.00/M | 1M |
| `openai/gpt-6.1-terra` | GPT-6.1 Terra | $1.00/M | $5.00/M | 1M |
| `openai/gpt-6-sol` | GPT-6 Sol | $2.00/M | $10.00/M | 1M |
| `openai/gpt-6-luna` | GPT-6 Luna | $0.10/M | $0.50/M | 1M |

GPT-6 models accept `reasoning_effort` `low` through `max` and reject `temperature` other than 1, `top_p`, penalties, `logprobs` and `stop`. On plain chat the gateway lowers `max` to `xhigh`. Tool calls, which it serves through OpenAI's Responses API, run at the effort you ask for, `max` included, and at `medium` when none is sent. Higher effort spends more reasoning, which bills as output and counts against `max_tokens`. An `exact` payment is already quoted at the full `max_tokens`, so effort does not change its price; set `max_tokens` high enough for the reasoning you ask for. `none` and `minimal` are raised to `low` on Astra, GPT-6.1 Sol and both GPT-6.2 models; Sol, Luna and GPT-6.1 Terra accept `none`, and raise `minimal` to `low`. Raising `none` does not change an `exact` price (it is the full `max_tokens` either way); on `upto`, the little reasoning `low` spends bills as output.

### OpenAI GPT-5.6 Family

Released 2026-07-09 — three fixed tiers (Sol / Terra / Luna) replacing the single-model-plus-effort-knob line. Note: on `/v1/chat/completions`, GPT-5.6 accepts function tools only with `reasoning_effort: "none"` — the BlockRun gateway sets this automatically when tools are present, so no client change is needed.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.6-sol` | GPT-5.6 Sol | $4.00/M | $20.00/M | 1M |
| `openai/gpt-5.6-sol-pro` | GPT-5.6 Sol Pro | $4.00/M | $20.00/M | 1M |
| `openai/gpt-5.6-terra` | GPT-5.6 Terra | $2.00/M | $12.00/M | 1M |
| `openai/gpt-5.6-terra-pro` | GPT-5.6 Terra Pro | $2.00/M | $12.00/M | 1M |
| `openai/gpt-5.6-luna` | GPT-5.6 Luna | $0.20/M | $1.20/M | 1M |
| `openai/gpt-5.6-luna-pro` | GPT-5.6 Luna Pro | $0.20/M | $1.20/M | 1M |

### OpenAI GPT-5.5 Family

Released 2026-04-23 — first fully retrained base since GPT-4.5.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.5-pro` | GPT-5.5 Pro | $30.00/M | $180.00/M | 1M |
| `openai/chat-latest` | ChatGPT Instant (GPT-5.5) | $5.00/M | $30.00/M | 128K |
| `openai/gpt-5.5` | GPT-5.5 | $5.00/M | $30.00/M | 1M |

### OpenAI GPT-5.4 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.4-pro` | GPT-5.4 Pro | $30.00/M | $180.00/M | 1M |
| `openai/gpt-5.4` | GPT-5.4 | $2.50/M | $15.00/M | 1M |
| `openai/gpt-5.4-mini` | GPT-5.4 Mini | $0.75/M | $4.50/M | 400K |
| `openai/gpt-5.4-nano` | GPT-5.4 Nano | $0.20/M | $1.25/M | 1M |

### OpenAI GPT-5 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.2-pro` | GPT-5.2 Pro | $21.00/M | $168.00/M | 400K |
| `openai/gpt-5.2` | GPT-5.2 | $1.75/M | $14.00/M | 400K |
| `openai/gpt-5.3-codex` | GPT-5.3 Codex | $1.75/M | $14.00/M | 400K |
| `openai/gpt-5.1` | GPT-5.1 | $1.25/M | $10.00/M | 400K |

### OpenAI O-Series (Reasoning)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|

### OpenAI GPT-4.1 / GPT-4o

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-4o` | GPT-4o | $2.50/M | $10.00/M | 128K |
| `openai/gpt-4.1` | GPT-4.1 | $2.00/M | $8.00/M | 128K |
| `openai/gpt-4.1-mini` | GPT-4.1 Mini | $0.40/M | $1.60/M | 128K |
| `openai/gpt-4o-mini` | GPT-4o Mini | $0.15/M | $0.60/M | 128K |

### Anthropic Claude

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `anthropic/claude-fable-5.2` | Claude Fable 5.2 | $8.00/M | $40.00/M | 1M |
| `anthropic/claude-fable-5.1` | Claude Fable 5.1 | $10.00/M | $50.00/M | 1M |
| `anthropic/claude-fable-5` | Claude Fable 5 | $10.00/M | $50.00/M | 1M |
| `anthropic/claude-opus-4.5` | Claude Opus 4.5 | $5.00/M | $25.00/M | 200K |
| `anthropic/claude-opus-4.7` | Claude Opus 4.7 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.8` | Claude Opus 4.8 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-5` | Claude Opus 5 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-5.5` | Claude Opus 5.5 | $4.00/M | $20.00/M | 1M |
| `anthropic/claude-sonnet-4.5` | Claude Sonnet 4.5 | $3.00/M | $15.00/M | 200K |
| `anthropic/claude-sonnet-4.6` | Claude Sonnet 4.6 | $3.00/M | $15.00/M | 1M |
| `anthropic/claude-sonnet-5` | Claude Sonnet 5 | $2.00/M | $10.00/M | 1M |
| `anthropic/claude-sonnet-5.5` | Claude Sonnet 5.5 | $2.00/M | $10.00/M | 1M |
| `anthropic/claude-haiku-4.5` | Claude Haiku 4.5 | $1.00/M | $5.00/M | 200K |

:::warning{title="Claude Opus 4.7 / 4.8 / 5 / 5.5, Fable 5 / 5.1 and Sonnet 5 / 5.5 behavior"}
These models reject all sampling parameters (`temperature`, `top_p`, `top_k`); the gateway drops them so calls succeed. They use adaptive thinking (built-in, not API-configurable). The model may decline a request with HTTP 200 and `stop_reason: "refusal"` (`finish_reason: "content_filter"` on the OpenAI-compatible endpoint) — check the stop reason before reading content.

**Opus 5.5 and Sonnet 5.5** add three differences, all absorbed by the gateway so a request that works on Opus 5 still works here:

- **Fable 5.2.** Anthropic retains requests to this model for 30 days, so it is not available under zero data retention. It has no fallback model. If it fails before you are charged, you get an error and pay nothing. A stream is charged when it starts producing output, and a non-streaming call on an `exact` quote once it has run 45 seconds; a failure after that returns 502 saying you were charged, so do not pay again. A refusal that produced no output is not charged when the input is 100K tokens or less, unless the call was already charged at 45 seconds. `speed: "fast"` is refused.
- **Forced tool choice.** Both — and Fable 5.1 and 5.2 — reject `tool_choice: "required"` / a named tool (Anthropic `any` / `tool`). The gateway serves it as `auto`; name the tool in your prompt if the call must happen.
- **Turning thinking off.** Opus 5.5 cannot turn thinking off at all — a `{"type": "disabled"}` block is dropped and the model thinks adaptively; use a low `output_config.effort` to keep it short. Sonnet 5.5 calls "off" `between_tools`; the gateway translates `disabled` for you and caps effort at `high`, the most that mode allows.
- **Cache reads on Opus 5.5** are $0.20/M — 0.05x input, where other Claude models read at 0.1x.
:::

### Google Gemini

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `google/gemini-4-neon` | Gemini 4 Neon | $3.00/M | $15.00/M | 1M |
| `google/gemini-4-carbon` | Gemini 4 Carbon | $2.00/M | $10.00/M | 1M |
| `google/gemini-4-argon` | Gemini 4 Argon | $2.00/M | $10.00/M | 1M |
| `google/gemini-4-hydrogen` | Gemini 4 Hydrogen | $1.50/M | $7.50/M | 1M |
| `google/gemini-3.1-pro` | Gemini 3.1 Pro | $2.00/M | $12.00/M | 1M |
| `google/gemini-3.8-flash` | Gemini 3.8 Flash | $0.75/M | $3.75/M | 1M |
| `google/gemini-3.6-flash` | Gemini 3.6 Flash | $0.75/M | $3.75/M | 1M |
| `google/gemini-3-flash-preview` | Gemini 3 Flash Preview | $0.50/M | $3.00/M | 1M |
| `google/gemini-3.5-flash-lite` | Gemini 3.5 Flash Lite | $0.30/M | $2.50/M | 1M |
| `google/gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | $0.25/M | $1.50/M | 1M |
| `google/gemini-2.5-flash-lite` | Gemini 2.5 Flash Lite | $0.10/M | $0.40/M | 1M |

Gemini **3.1 Pro** (`gemini-3.1-pro`) bills a **long-context tier** — 2x input, 1.5x output above 200K prompt tokens (mirrors Google's official pricing: $4.00/M in · $18.00/M out above the threshold). Flash / Flash-Lite are flat-priced.

### xAI Grok

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `xai/grok-4.7` | Grok 4.7 | $2.00/M | $6.00/M | 500K |
| `xai/grok-4.6` | Grok 4.6 | $2.00/M | $6.00/M | 500K |
| `xai/grok-4.5` | Grok 4.5 | $2.00/M | $6.00/M | 500K |
| `xai/grok-4.3` | Grok 4.3 | $1.25/M | $2.50/M | 1M |
| `xai/grok-build-0.1` | Grok Build 0.1 | $1.00/M | $2.00/M | 256K |

Grok bills a **long-context tier** at 2x the rates above once a request's prompt reaches 200K tokens (mirrors xAI's official pricing — e.g. Grok 4.7 is $4.00/M in · $12.00/M out above the threshold). Live Search adds one flat surcharge per call: $0.30 on Grok 4.5 / 4.6 / 4.7 / 4.20, $0.12 on Grok 4.3 and below. Grok Imagine image/video SKUs are listed under Image / Video Generation below.

### DeepSeek

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `deepseek/deepseek-v4-pro` | DeepSeek V4 Pro | $1.32/M | $3.96/M | 1M |
| `deepseek/deepseek-v4-flash-vision-exp` | DeepSeek V4 Flash Vision (image input) | $0.30/M | $1.20/M | 1M |
| `deepseek/deepseek-v4.1-flash` | DeepSeek V4.1 Flash (non-thinking) | $0.14/M | $0.28/M | 1M |
| `deepseek/deepseek-chat` | DeepSeek Chat (V4.1 Flash) — compatibility id, same model as `deepseek/deepseek-v4.1-flash` | $0.14/M | $0.28/M | 1M |
| `deepseek/deepseek-reasoner` | DeepSeek Reasoner (V4.1 Flash) — same model with thinking on | $0.14/M | $0.28/M | 1M |

### Z.AI

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `zai/glm-5.1` | GLM-5.1 | $1.40/M | $4.40/M | 200K |
| `zai/glm-5.2` | GLM-5.2 | $1.40/M | $4.40/M | 1M |
| `zai/glm-5.3` | GLM-5.3 | $1.40/M | $4.40/M | 1M |
| `zai/glm-5-turbo` | GLM-5 Turbo | $1.20/M | $4.00/M | 200K |
| `zai/glm-5` | GLM-5 | $1.00/M | $3.20/M | 200K |
| `zai/glm-5.3-flash` | GLM-5.3 Flash | $0.15/M | $0.50/M | 1M |

### Moonshot

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `moonshot/kimi-k3.1-pro` | Kimi K3.1 Pro | $2.00/M | $10.00/M | 1M |

K3.1 Pro is the current flagship — Moonshot's post-trained successor to K3, built for long-horizon coding and agents, with a **1M-token context window**, image + text input, and `reasoning_content` on completions. Cached input is $0.20/M. K3 ($3.00/$15.00) remains routable but superseded. K2.7 (256K, adds **video** input) remains routable but superseded; K2.6 and K2.5 are earlier multi-modal generations, still routable.

### MiniMax

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `minimax/minimax-m2.7` | MiniMax M2.7 | $0.30/M | $1.20/M | 200K |
| `minimax/minimax-m3` | MiniMax M3 | $0.30/M | $1.20/M | 1M |

### Qwen (Alibaba)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `qwen/qwen3.8-max` | Qwen3.8 Max (flagship) | $2.00/M | $6.00/M | 1M |
| `qwen/qwen3.7-max` | Qwen3.7 Max | $1.475/M | $4.425/M | 1M |
| `qwen/qwen3.7-plus` | Qwen3.7 Plus | $0.32/M | $1.28/M | 1M |
| `qwen/qwen3.7-flash` | Qwen3.7 Flash | $0.03/M | $0.13/M | 1M |
| `qwen/qwen3.8-flash` | Qwen3.8 Flash (image input) | $0.15/M | $0.47/M | 1M |

### Tencent

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `tencent/hy4-preview` | Tencent Hy4 Preview (770B MoE, reasoning) | $0.834/M | $2.501/M | 1M |

### Poolside

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `poolside/laguna-s-2.1` | Laguna S 2.1 (coding) | $0.09/M | $0.18/M | 1M |

### Mistral

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `mistral/mistral-large-4` | Mistral Large 4 (reasoning, image input) | $1.36/M | $4.18/M | 512K |

### Xiaomi

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `xiaomi/mimo-v2.5` | Xiaomi MiMo-V2.5 (multimodal) | $0.14/M | $0.28/M | 1M |
| `xiaomi/mimo-v2.5-pro` | Xiaomi MiMo-V2.5 Pro | $0.435/M | $0.87/M | 1M |

### Free Tier (open-weight)

Open-weight models served free of charge (no x402 payment), subject to a small per-IP rate limit. The free tier auto-routes around any temporarily unavailable model, so the live set is best read from `GET /api/v1/models` (filter on `billing_mode: "free"`). There are **9** free models listed on mainnet.

| Model ID | Name | Input Price | Output Price |
|----------|------|-------------|--------------|
| `nvidia/nemotron-3-ultra-550b` | Nemotron 3 Ultra 550B (1M ctx) | **FREE** | **FREE** |
| `nvidia/nemotron-3.5-lightning` | Nemotron 3.5 Lightning (1M ctx) | **FREE** | **FREE** |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Nemotron 3 Nano Omni (vision) | **FREE** | **FREE** |
| `nvidia/nemotron-3-super-120b` | Nemotron 3.5 Super 120B (reasoning, vision) | **FREE** | **FREE** |
| `nvidia/nemotron-3.5-bolt` | Nemotron 3.5 Bolt (fast, vision) | **FREE** | **FREE** |
| `nvidia/minimax-m3.1-flash` | MiniMax M3.1 Flash (reasoning, tools) | **FREE** | **FREE** |
| `poolside/laguna-xs-2.1` | Poolside Laguna XS 2.1 (coding) | **FREE** | **FREE** |
| `nvidia/muse-glimmer-30b` | Muse Glimmer 30B (Meta, reasoning) | **FREE** | **FREE** |

### Image Generation

Media prices below include the 5% media margin; the flat $0.001 transaction fee is added per call.

| Model ID | Name | Price |
|----------|------|-------|
| `openai/gpt-image-1` | GPT Image 1 | $0.021-0.042/image |
| `openai/gpt-image-2` | ChatGPT Images 2.0 | $0.063-0.126/image |
| `openai/gpt-image-2.5-flare` | GPT Image 2.5 Flare | $0.294-0.588/image |
| `openai/gpt-image-2.5-sunburst` | GPT Image 2.5 Sunburst | $0.294-0.588/image |
| `google/nano-banana` | Nano Banana | $0.0525/image |
| `google/nano-banana-2` | Nano Banana 2 | $0.0945/image |
| `google/nano-banana-2-lite` | Nano Banana 2 Lite | $0.0525/image |
| `google/nano-banana-2.1` | Nano Banana 2.1 | $0.0735/image |
| `google/nano-banana-pro` | Nano Banana Pro | $0.1785-0.315/image |
| `xai/grok-imagine-image` | Grok Imagine | $0.021/image |
| `xai/grok-imagine-image-2.0` | Grok Imagine 2.0 | $0.042/image |
| `xai/grok-imagine-image-pro` | Grok Imagine Pro | $0.063/image |
| `zai/cogview-4` | CogView-4 | $0.01575-0.021/image |
| `bytedance/seedream-5-pro` | Seedream 5.0 Pro | $0.047-0.095/image (async, ~2 min) |

### Video Generation

Seedance defaults to **720p with synced audio** on every clip, whatever the input; pass `resolution` / `generate_audio` to override. See [Video Generation API](video-generation.md).

| Model ID | Name | Price (5s 720p default) | Max duration |
|----------|------|--------------------------|--------------|
| `xai/grok-imagine-video` | Grok Imagine Video | $0.05/sec @480p default · $0.07/sec @720p, + $0.001/generation (8s 480p = $0.401) | 15s |
| `xai/grok-imagine-video-1.5` | Grok Imagine Video 1.5 | $0.08/sec @480p default · $0.14/sec @720p · $0.25/sec @1080p, + $0.001/generation (8s 480p = $0.641) | 15s |
| `bytedance/seedance-1.5-pro` | Seedance 1.5 Pro | ~$0.070/sec ($0.35 / 5s clip) | 12s |
| `bytedance/seedance-2.0-mini` | Seedance 2.0 Mini | ~$0.080/sec ($0.40 / 5s clip) | 15s |
| `bytedance/seedance-2.0-fast` | Seedance 2.0 Fast | ~$0.165/sec ($0.83 / 5s clip) | 15s |
| `bytedance/seedance-2.0` | Seedance 2.0 Pro | ~$0.227/sec ($1.14 / 5s clip) | 15s |
| `bytedance/seedance-2.5` | Seedance 2.5 | ~$0.315/sec ($1.58 / 5s clip) | 30s |

### Music, Speech and Sound Effects

Prices include the 5% media margin; the flat $0.001 transaction fee is added per call.

| Model ID | Name | Price |
|----------|------|-------|
| `minimax/music-2.5+` | MiniMax Music 2.5+ | $0.199/track |
| `elevenlabs/flash-v2.5` | ElevenLabs Flash v2.5 | $0.0525 per 1k characters (up to 40,000 per call) |
| `elevenlabs/turbo-v2.5` | ElevenLabs Turbo v2.5 | $0.0525 per 1k characters (up to 40,000 per call) |
| `elevenlabs/multilingual-v2` | ElevenLabs Multilingual v2 | $0.105 per 1k characters (up to 10,000 per call) |
| `elevenlabs/v3` | ElevenLabs v3 | $0.105 per 1k characters (up to 5,000 per call) |
| `bytedance/seed-audio-1.0` | Seed Audio 1.0 | $0.003 per second of audio, estimated from input length (about $0.315 per 1k characters; up to 120s) |
| `elevenlabs/sound-effects` | ElevenLabs Sound Effects | $0.0525/generation (up to 22s) |

For character consistency across multiple Seedance videos, enroll a [Virtual Portrait](virtual-portrait.md) ($0.011 one-time, no government ID) for AI characters, or a [RealFace](realface.md) ($0.011 one-time, no government ID, requires brief on-phone liveness check) for real people. Pass the returned `ta_xxx` as `real_face_asset_id`.

### Decisions (typed judgments)

Entries with `categories: ["judgment"]` are Decisions models. Call them on [`POST /v1/decisions`](decisions.md), not `/v1/chat/completions`; only input tokens are billed.

| Model ID | Name | Input | Notes |
|----------|------|-------|-------|
| `google/gemini-decision-1` | Gemini Decision 1 | $0.10/M | Up to 1,000 questions per call; text and images; at most $0.027215 per call |
| `openai/gpt-6-luna-decisions` | GPT-6 Luna Decisions | $0.10/M | The default when `model` is omitted; up to 64 questions per call |

## Model Categories

Each model includes a `categories` array in the API response. Categories indicate model capabilities:

- **chat** - General conversation
- **reasoning** - Complex problem-solving
- **coding** - Code generation and analysis
- **vision** - Image understanding
- **judgment** - Decisions models, served on `/v1/decisions`

Filter models by category:

```python
models = client.list_models()
reasoning_models = [m for m in models if "reasoning" in m.get("categories", [])]
```

## Pricing

Prices are per 1 million tokens. Your actual cost depends on:

1. **Input tokens** - Length of your prompt and context
2. **Output tokens** - Length of the model's response
3. **Transaction fee** - a flat $0.001 per request; per-token chat also carries a 5% platform fee (most media carries a 5% margin; Live Search is a flat price)

The SDK calculates the exact price before each request.

**Want to save 84% automatically?** [ClawRouter](../products/routing/clawrouter.md) routes each request to the cheapest model that can handle it.

## Example

::::tabs

:::tab{label="Python"}
```python
from blockrun_llm import LLMClient

client = LLMClient()
models = client.list_models()

for model in models:
    pricing = model.get("pricing", {})
    print(f"{model['id']}: ${pricing.get('input')}/M input, context: {model['context_window']}")
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

:::card{title="Save 84% with ClawRouter" href="../products/routing/clawrouter.md" icon="Route"}
Route each prompt to the cheapest model that can handle it, automatically.
:::

::::

`openai/o1`, `openai/o1-mini`, `openai/o3-mini` and `openai/o4-mini` were retired by OpenAI on October 23, 2026; requests for them now route to `openai/gpt-5.4-mini` and are billed at its price. `google/gemini-3.5-flash` now routes to `google/gemini-3.6-flash`, which Google already served under that name, at 3.6 Flash's price. Since December 1, 2026, `google/gemini-2.5-flash` routes to `google/gemini-3.5-flash-lite` (same price) and `google/gemini-2.5-pro` to `google/gemini-3.8-flash`, the models Google moved them to. Since December 11, 2026, when OpenAI shut them down, `openai/o3` routes to `openai/gpt-5.4-mini` and `openai/gpt-5-mini` to `openai/gpt-5.6-luna`, each billed at the new model's price. OpenAI shut down `openai/gpt-5-nano` the same day, but no current OpenAI model is as cheap, so it is still served at its own price on chat completions until February 9, 2027; it no longer accepts `service_tier: "flex"`. The free `cohere/north-mini-code` routes to `poolside/laguna-xs-2.1`.

`openai/gpt-4.1-nano` was retired by OpenAI on October 23, 2026 and is no longer advertised as available. On Base, chat requests for it now route to `openai/gpt-5-nano`. `openai/gpt-4.1-mini` is available, though OpenAI has scheduled its dated snapshot for removal on January 14, 2027.
