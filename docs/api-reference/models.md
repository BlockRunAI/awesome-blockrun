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

## Available Models (33 visible)

All prices shown are provider rates. BlockRun adds a **5% platform fee** to cover infrastructure costs.

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
| `anthropic/claude-opus-4.6` | Claude Opus 4.6 | $5.00/M | $25.00/M | 1M |
| `anthropic/claude-opus-4.5` | Claude Opus 4.5 | $5.00/M | $25.00/M | 200K |
| `anthropic/claude-sonnet-4.6` | Claude Sonnet 4.6 | $3.00/M | $15.00/M | 200K |
| `anthropic/claude-haiku-4.5` | Claude Haiku 4.5 | $1.00/M | $5.00/M | 200K |

### Google Gemini

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `google/gemini-3.1-pro` | Gemini 3.1 Pro | $2.00/M | $12.00/M | 1M |
| `google/gemini-3-pro-preview` | Gemini 3 Pro Preview | $1.50/M | $10.00/M | 1M |
| `google/gemini-3-flash-preview` | Gemini 3 Flash Preview | $0.50/M | $3.00/M | 1M |
| `google/gemini-2.5-pro` | Gemini 2.5 Pro | $1.25/M | $10.00/M | 1M |
| `google/gemini-2.5-flash` | Gemini 2.5 Flash | $0.30/M | $2.50/M | 1M |
| `google/gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | $0.10/M | $0.40/M | 1M |
| `google/gemini-2.5-flash-lite` | Gemini 2.5 Flash Lite | $0.10/M | $0.40/M | 1M |

### DeepSeek

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `deepseek/deepseek-chat` | DeepSeek V3.2 Chat | $0.28/M | $0.42/M | 128K |
| `deepseek/deepseek-reasoner` | DeepSeek V3.2 Reasoner | $0.28/M | $0.42/M | 128K |

### Z.AI

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `zhipu/glm-5` | GLM-5 | $1.20/M | $5.00/M | 128K |
| `zhipu/glm-5-turbo` | GLM-5 Turbo | $1.00/M | $3.20/M | 128K |

### Moonshot

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `moonshot/kimi-k2.6` | Kimi K2.6 (flagship) | $0.95/M | $4.00/M | 256K |
| `moonshot/kimi-k2.5` | Kimi K2.5 (legacy) | $0.60/M | $3.00/M | 262K |

K2.6 is multi-modal (vision + text input) and returns `reasoning_content` on completions. K2.5 is still routable but superseded.

### MiniMax

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `minimax/minimax-m2.7` | MiniMax M2.7 | $0.30/M | $1.20/M | 204K |

### NVIDIA (Free Tier)

Apache 2.0 licensed open-weight models, hosted free by NVIDIA.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `nvidia/gpt-oss-120b` | GPT-OSS 120B | **FREE** | **FREE** | 128K |
| `nvidia/gpt-oss-20b` | GPT-OSS 20B | **FREE** | **FREE** | 128K |
| `nvidia/kimi-k2.5` | Kimi K2.5 (NVIDIA) | **FREE** | **FREE** | 1M |

### Image Generation

| Model ID | Name | Price |
|----------|------|-------|
| `openai/dall-e-3` | DALL-E 3 | $0.04-0.08/image |
| `openai/gpt-image-1` | GPT Image 1 | $0.02-0.04/image |
| `openai/gpt-image-2` | ChatGPT Images 2.0 | $0.06-0.12/image |
| `google/nano-banana` | Nano Banana | $0.05/image |
| `google/nano-banana-pro` | Nano Banana Pro | $0.10-0.15/image |
| `black-forest/flux-1.1-pro` | Flux 1.1 Pro | $0.04/image |

### Video Generation

| Model ID | Name | Price |
|----------|------|-------|
| `xai/grok-imagine-video` | Grok Imagine Video | $0.05/sec (8s default) |
| `bytedance/seedance-1.5-pro` | Seedance 1.5 Pro | $0.03/sec (5s default) |
| `bytedance/seedance-2.0-fast` | Seedance 2.0 Fast | $0.15/sec (5s default) |
| `bytedance/seedance-2.0` | Seedance 2.0 Pro | $0.30/sec (5s default) |

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

**Want to save 78% automatically?** [ClawRouter](../products/routing/clawrouter.md) routes each request to the cheapest model that can handle it.

## Example

**Python:**
```python
from blockrun_llm import LLMClient

client = LLMClient()
models = client.list_models()

for model in models:
    print(f"{model['id']}: ${model['inputPrice']}/M input, context: {model['context_window']}")
    print(f"  Categories: {', '.join(model.get('categories', []))}")
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });
const models = await client.listModels();

for (const model of models) {
  console.log(`${model.id}: $${model.inputPrice}/M input, context: ${model.contextWindow}`);
  console.log(`  Categories: ${model.categories.join(', ')}`);
}
```
