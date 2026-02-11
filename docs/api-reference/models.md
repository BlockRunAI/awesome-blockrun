# Models

BlockRun provides access to models from multiple providers through a unified API.

## List Models

```
GET https://blockrun.ai/api/v1/models
```

Returns a list of available models with pricing information.

## Available Models

All prices shown are provider rates. BlockRun adds a **5% platform fee** to cover infrastructure costs.

### OpenAI GPT-5 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.2` | GPT-5.2 | $1.75/M | $14.00/M | 400K |
| `openai/gpt-5-mini` | GPT-5 Mini | $0.25/M | $2.00/M | 200K |
| `openai/gpt-5-nano` | GPT-5 Nano | $0.05/M | $0.40/M | 128K |
| `openai/gpt-5.2-pro` | GPT-5.2 Pro | $21.00/M | $168.00/M | 400K |

### OpenAI GPT-4 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-4.1` | GPT-4.1 | $2.00/M | $8.00/M | 128K |
| `openai/gpt-4.1-mini` | GPT-4.1 Mini | $0.40/M | $1.60/M | 128K |
| `openai/gpt-4.1-nano` | GPT-4.1 Nano | $0.10/M | $0.40/M | 128K |
| `openai/gpt-4o` | GPT-4o | $2.50/M | $10.00/M | 128K |
| `openai/gpt-4o-mini` | GPT-4o Mini | $0.15/M | $0.60/M | 128K |

### OpenAI O-Series (Reasoning)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/o1` | o1 | $15.00/M | $60.00/M | 200K |
| `openai/o1-mini` | o1-mini | $1.10/M | $4.40/M | 128K |
| `openai/o3` | o3 | $2.00/M | $8.00/M | 200K |
| `openai/o3-mini` | o3-mini | $1.10/M | $4.40/M | 128K |
| `openai/o4-mini` | o4-mini | $1.10/M | $4.40/M | 128K |

### NVIDIA (Free Tier)

Apache 2.0 licensed open-weight models, hosted free by NVIDIA.

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `nvidia/gpt-oss-120b` | GPT-OSS 120B | **FREE** | **FREE** | 128K |
| `nvidia/gpt-oss-20b` | GPT-OSS 20B | **FREE** | **FREE** | 128K |
| `nvidia/kimi-k2.5` | Moonshot Kimi K2.5 | $0.001/request | - | 1M |

### Anthropic Claude

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `anthropic/claude-opus-4` | Claude Opus 4 | $15.00/M | $75.00/M | 200K |
| `anthropic/claude-opus-4.5` | Claude Opus 4.5 | $5.00/M | $25.00/M | 200K |
| `anthropic/claude-sonnet-4` | Claude Sonnet 4 | $3.00/M | $15.00/M | 200K |
| `anthropic/claude-haiku-4.5` | Claude Haiku 4.5 | $1.00/M | $5.00/M | 200K |

### Google Gemini

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `google/gemini-3-pro-preview` | Gemini 3 Pro | $2.00/M | $12.00/M | 1M |
| `google/gemini-2.5-pro` | Gemini 2.5 Pro | $1.25/M | $10.00/M | 1M |
| `google/gemini-2.5-flash` | Gemini 2.5 Flash | $0.15/M | $0.60/M | 1M |

### DeepSeek

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `deepseek/deepseek-chat` | DeepSeek V3.2 Chat | $0.28/M | $0.42/M | 128K |
| `deepseek/deepseek-reasoner` | DeepSeek V3.2 Reasoner | $0.28/M | $0.42/M | 128K |

### Qwen

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `qwen/qwen3-max` | Qwen3 Max | $0.46/M | $1.84/M | 262K |
| `qwen/qwen-plus` | Qwen Plus | $0.10/M | $0.30/M | 128K |
| `qwen/qwen-turbo` | Qwen Turbo | $0.02/M | $0.06/M | 128K |

### xAI (Grok)

| Model ID | Name | Input Price | Output Price | Context | Notes |
|----------|------|-------------|--------------|---------|-------|
| `xai/grok-3` | Grok 3 | $3.00/M | $15.00/M | 131K | Flagship |
| `xai/grok-3-fast` | Grok 3 Fast | $5.00/M | $25.00/M | 131K | Tool calling optimized |
| `xai/grok-3-mini` | Grok 3 Mini | $0.30/M | $0.50/M | 131K | Fast & affordable |
| `xai/grok-4-1-fast-reasoning` | Grok 4.1 Fast (Reasoning) | $0.20/M | $0.50/M | **2M** | Latest, chain-of-thought |
| `xai/grok-4-1-fast-non-reasoning` | Grok 4.1 Fast (Direct) | $0.20/M | $0.50/M | **2M** | Latest, direct response |
| `xai/grok-4-fast-reasoning` | Grok 4 Fast (Reasoning) | $0.20/M | $0.50/M | **2M** | Step-by-step reasoning |
| `xai/grok-4-fast-non-reasoning` | Grok 4 Fast (Direct) | $0.20/M | $0.50/M | **2M** | Quick responses |
| `xai/grok-code-fast-1` | Grok Code Fast 1 | $0.20/M | $1.50/M | 256K | Code generation |
| `xai/grok-4-0709` | Grok 4 (0709) | $3.00/M | $15.00/M | 256K | Premium quality |
| `xai/grok-2-vision` | Grok 2 Vision | $2.00/M | $10.00/M | 32K | Vision capabilities |

### Coming Soon

These models are configured but not yet available (no API keys):

- **Mistral**: Mistral Large 2, Mistral Medium 3, Codestral, Pixtral Large
- **Cohere**: Command R+, Command R
- **Perplexity**: Sonar Pro, Sonar
- **Meta**: Llama 3.3 70B, Llama 3.1 405B

### Image Generation

| Model ID | Name | Price |
|----------|------|-------|
| `openai/dall-e-3` | DALL-E 3 | $0.04-0.08/image |
| `openai/gpt-image-1` | GPT Image 1 | $0.02-0.04/image |
| `google/nano-banana` | Nano Banana | $0.05/image |
| `google/nano-banana-pro` | Nano Banana Pro | $0.10-0.15/image |
| `black-forest/flux-1.1-pro` | Flux 1.1 Pro | $0.04/image |

## Model Categories

Models are tagged with capabilities:

- **chat** - General conversation
- **reasoning** - Complex problem-solving
- **coding** - Code generation and analysis
- **vision** - Image understanding

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
    print(f"{model['id']}: ${model['inputPrice']}/M input")
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });
const models = await client.listModels();

for (const model of models) {
  console.log(`${model.id}: $${model.inputPrice}/M input`);
}
```
