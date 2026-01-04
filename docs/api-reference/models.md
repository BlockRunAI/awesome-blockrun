# Models

BlockRun provides access to models from multiple providers through a unified API.

## List Models

```
GET https://blockrun.ai/api/v1/models
```

Returns a list of available models with pricing information.

## Available Models

### OpenAI GPT-5 Family

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `openai/gpt-5.2` | GPT-5.2 | $1.75/M | $14.00/M | 400K |
| `openai/gpt-5.1` | GPT-5.1 | $1.25/M | $10.00/M | 400K |
| `openai/gpt-5` | GPT-5 | $1.25/M | $10.00/M | 400K |
| `openai/gpt-5-mini` | GPT-5 Mini | $0.25/M | $2.00/M | 400K |
| `openai/gpt-5-nano` | GPT-5 Nano | $0.05/M | $0.40/M | 400K |
| `openai/gpt-5.2-pro` | GPT-5.2 Pro | $21.00/M | $168.00/M | 400K |
| `openai/gpt-5-pro` | GPT-5 Pro | $15.00/M | $120.00/M | 400K |

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

### Anthropic Claude

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `anthropic/claude-opus-4` | Claude Opus 4 | $15.00/M | $75.00/M | 200K |
| `anthropic/claude-sonnet-4` | Claude Sonnet 4 | $3.00/M | $15.00/M | 200K |
| `anthropic/claude-haiku-4.5` | Claude Haiku 4.5 | $1.00/M | $5.00/M | 200K |

### Google Gemini

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `google/gemini-3-pro-preview` | Gemini 3 Pro | $2.00/M | $12.00/M | 1M |
| `google/gemini-2.5-pro` | Gemini 2.5 Pro | $1.25/M | $10.00/M | 1M |
| `google/gemini-2.5-flash` | Gemini 2.5 Flash | $0.15/M | $0.60/M | 1M |

### xAI

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `x-ai/grok-4-fast` | Grok 4 Fast | $0.20/M | $0.50/M | 2M |

### DeepSeek

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `deepseek/deepseek-v3-0324` | DeepSeek V3 | $0.20/M | $0.88/M | 164K |
| `deepseek/deepseek-r1` | DeepSeek R1 | $0.55/M | $2.19/M | 64K |

### Meta (via Together.ai)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `meta-llama/llama-3.3-70b-instruct` | Llama 3.3 70B | $0.12/M | $0.30/M | 128K |
| `meta-llama/llama-3.1-405b-instruct` | Llama 3.1 405B | $2.00/M | $2.00/M | 128K |

### Qwen (via Together.ai)

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `qwen/qwen-2.5-72b-instruct` | Qwen 2.5 72B | $0.07/M | $0.26/M | 128K |

### Mistral

| Model ID | Name | Input Price | Output Price | Context |
|----------|------|-------------|--------------|---------|
| `mistralai/mistral-large` | Mistral Large | $2.00/M | $6.00/M | 128K |

### Image Generation

| Model ID | Name | Price |
|----------|------|-------|
| `openai/dall-e-3` | DALL-E 3 | $0.04-0.08/image |
| `openai/gpt-image-1` | GPT Image 1 | $0.02-0.04/image |

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

The SDK calculates the exact price before each request.

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
