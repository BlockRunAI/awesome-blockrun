# Python SDK

The official Python SDK for BlockRun.

## Installation

```bash
pip install blockrun-llm
```

## Quick Start

```python
from blockrun_llm import LLMClient

client = LLMClient()
response = client.chat("openai/gpt-4o", "Hello!")
print(response)
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BLOCKRUN_WALLET_KEY` | Your Base chain wallet private key |
| `BLOCKRUN_API_URL` | API endpoint (default: https://blockrun.ai/api) |

### Client Options

```python
from blockrun_llm import LLMClient

client = LLMClient(
    private_key="0x...",           # Wallet key (or use env var)
    api_url="https://blockrun.ai/api",  # Optional
    timeout=60.0                   # Request timeout in seconds
)
```

## Methods

### `chat(model, prompt, **options)`

Simple one-line chat interface.

```python
response = client.chat(
    "openai/gpt-4o",
    "Explain quantum computing",
    system="You are a physics teacher.",  # Optional system prompt
    max_tokens=500,                        # Optional max output
    temperature=0.7                        # Optional temperature
)
```

**Returns:** `str` - The assistant's response text

### `chat_completion(model, messages, **options)`

Full OpenAI-compatible chat completion.

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]

result = client.chat_completion(
    "openai/gpt-4o",
    messages,
    max_tokens=100,
    temperature=0.7,
    top_p=0.9
)

print(result.choices[0].message.content)
print(f"Tokens used: {result.usage.total_tokens}")
```

**Returns:** `ChatResponse` object

### `list_models()`

Get available models with pricing.

```python
models = client.list_models()
for model in models:
    print(f"{model['id']}: ${model['inputPrice']}/M")
```

### `get_wallet_address()`

Get the wallet address being used.

```python
address = client.get_wallet_address()
print(f"Paying from: {address}")
```

## Smart Routing (ClawRouter)

**Save up to 94% on LLM costs automatically.**

The `smart_chat()` method uses ClawRouter's 14-dimension scoring algorithm to route each request to the optimal model. Routing decisions run locally in <1ms — your prompts never leave your machine for routing.

### Basic Usage

```python
from blockrun_llm import LLMClient

client = LLMClient()

# Let ClawRouter pick the best model automatically
result = client.smart_chat("What is 2+2?")

print(result.response)           # "4"
print(result.model)              # "deepseek/deepseek-chat" (cheap model for simple query)
print(result.routing.tier)       # "SIMPLE"
print(result.routing.savings)    # 0.94 (94% savings vs baseline)
```

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"free"` | Always uses free NVIDIA models | Development, testing |
| `"eco"` | Maximizes cost savings | Bulk processing |
| `"auto"` | Balances quality and cost (default) | Production workloads |
| `"premium"` | Always uses top-tier models | Critical tasks |

```python
# Force free models (great for development)
result = client.smart_chat(
    "Explain recursion",
    routing_profile="free"
)
print(result.model)  # "nvidia/gpt-oss-120b"

# Maximum savings mode
result = client.smart_chat(
    "Summarize this article: ...",
    routing_profile="eco"
)

# Premium mode for critical tasks
result = client.smart_chat(
    "Review this contract for legal issues...",
    routing_profile="premium"
)
print(result.model)  # "anthropic/claude-opus-4"
```

### 4-Tier Model Selection

ClawRouter classifies prompts into four tiers:

| Tier | Models | Use Case |
|------|--------|----------|
| **SIMPLE** | DeepSeek, Gemini Flash | Q&A, summaries, simple tasks |
| **MEDIUM** | GPT-4o, Claude Sonnet | Analysis, writing, coding |
| **COMPLEX** | Claude Opus, GPT-5 | Advanced reasoning, research |
| **REASONING** | DeepSeek-R1, o1, o3 | Math, logic, proofs |

### Routing Decision Details

```python
result = client.smart_chat("Prove that √2 is irrational")

# Access full routing decision
routing = result.routing
print(f"Model: {routing.model}")           # "deepseek/deepseek-reasoner"
print(f"Tier: {routing.tier}")             # "REASONING"
print(f"Confidence: {routing.confidence}") # 0.97
print(f"Reasoning: {routing.reasoning}")   # "Detected: math proof request..."
print(f"Estimated cost: ${routing.cost_estimate:.4f}")
print(f"Baseline cost: ${routing.baseline_cost:.4f}")
print(f"Savings: {routing.savings:.0%}")   # "97%"
```

### Smart Routing Types

```python
from blockrun_llm import (
    RoutingProfile,    # Literal["free", "eco", "auto", "premium"]
    RoutingTier,       # Literal["SIMPLE", "MEDIUM", "COMPLEX", "REASONING"]
    RoutingDecision,   # Full routing details
    SmartChatResponse, # Response + model + routing
)
```

### Async Smart Routing

```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        result = await client.smart_chat(
            "What's the weather like?",
            routing_profile="eco"
        )
        print(result.response)

asyncio.run(main())
```

## Testnet Usage

For development and testing without real USDC, use the Base Sepolia testnet:

```python
from blockrun_llm import testnet_client

# Create testnet client (uses Base Sepolia)
client = testnet_client()  # Uses BLOCKRUN_WALLET_KEY

# Chat with testnet model
response = client.chat("openai/gpt-oss-20b", "Hello!")
print(response)

# Check testnet USDC balance
balance = client.get_balance()
print(f"Testnet USDC: ${balance:.4f}")

# Verify you're on testnet
print(f"Is testnet: {client.is_testnet()}")  # True
```

### Testnet Setup

1. Get testnet ETH from [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Get testnet USDC from [Circle USDC Faucet](https://faucet.circle.com/)
3. Set your wallet key: `export BLOCKRUN_WALLET_KEY=0x...`

### Available Testnet Models

| Model | Price |
|-------|-------|
| `openai/gpt-oss-20b` | $0.001/request (flat) |
| `openai/gpt-oss-120b` | $0.002/request (flat) |

### Manual Testnet Configuration

```python
from blockrun_llm import LLMClient

# Configure manually with testnet API URL
client = LLMClient(api_url="https://testnet.blockrun.ai/api")
response = client.chat("openai/gpt-oss-20b", "Hello!")
```

## Async Client

For async/await usage:

```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        # Single request
        response = await client.chat("openai/gpt-4o", "Hello!")

        # Concurrent requests
        tasks = [
            client.chat("openai/gpt-4o", "What is 2+2?"),
            client.chat("anthropic/claude-sonnet-4", "What is 3+3?"),
        ]
        responses = await asyncio.gather(*tasks)

asyncio.run(main())
```

## Error Handling

```python
from blockrun_llm import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-4o", "Hello!")
except PaymentError as e:
    print(f"Payment failed: {e}")
    # Check your USDC balance
except APIError as e:
    print(f"API error ({e.status_code}): {e}")
    print(f"Details: {e.response}")
```

## Response Types

### ChatResponse

```python
class ChatResponse:
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: ChatUsage

class ChatChoice:
    index: int
    message: ChatMessage
    finish_reason: str

class ChatMessage:
    role: str
    content: str

class ChatUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
```

## Examples

### Multi-turn Conversation

```python
from blockrun_llm import LLMClient

client = LLMClient()
messages = [
    {"role": "system", "content": "You are a helpful assistant."}
]

while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        break

    messages.append({"role": "user", "content": user_input})
    result = client.chat_completion("openai/gpt-4o", messages)

    assistant_message = result.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_message})

    print(f"Assistant: {assistant_message}")
```

### Code Generation

```python
from blockrun_llm import LLMClient

client = LLMClient()

code = client.chat(
    "anthropic/claude-sonnet-4",
    "Write a Python function to calculate fibonacci numbers",
    system="You are an expert Python developer. Return only code, no explanations."
)

print(code)
```

## Testing

The SDK includes comprehensive test coverage.

### Running Unit Tests

Unit tests do not require API access or funded wallets:

```bash
pytest tests/unit                    # Run unit tests only
pytest tests/unit --cov              # Run with coverage report
pytest tests/unit -v                 # Verbose output
```

### Running Integration Tests

Integration tests call the production API and require:
- A funded Base wallet with USDC ($1+ recommended)
- `BLOCKRUN_WALLET_KEY` environment variable set
- Estimated cost: ~$0.05 per test run

```bash
# Set your funded wallet key
export BLOCKRUN_WALLET_KEY=0x...

# Run only integration tests
pytest tests/integration

# Run all tests (unit + integration)
pytest
```

Integration tests are automatically skipped if `BLOCKRUN_WALLET_KEY` is not set.

## Security Best Practices

### Private Key Management

> **Warning:** Never commit private keys to version control!

✅ **Do:**
- Use environment variables for private keys
- Use dedicated wallets for API payments (separate from your main holdings)
- Set spending limits by only funding payment wallets with small amounts
- Rotate keys periodically
- Use `.env` files and add them to `.gitignore`

❌ **Don't:**
- Hard-code private keys in your source code
- Commit `.env` files to git
- Share private keys in logs or error messages
- Use your main wallet with large holdings

### Example Secure Setup

```bash
# .env (add to .gitignore!)
BLOCKRUN_WALLET_KEY=0x...your_private_key_here
```

```python
# app.py
import os
from blockrun_llm import LLMClient
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("BLOCKRUN_WALLET_KEY"):
    raise ValueError("BLOCKRUN_WALLET_KEY not set")

client = LLMClient()  # Reads from environment
```

### Input Validation

The SDK validates all inputs before making API requests:

- Private keys (format, length, valid hex)
- API URLs (HTTPS required for production)
- Model names (non-empty strings)
- Parameters (max\_tokens, temperature, top\_p ranges)

### Error Response Sanitization

API errors are automatically sanitized to prevent leaking sensitive server information:

```python
from blockrun_llm import LLMClient, APIError

client = LLMClient()

try:
    response = client.chat('invalid-model', 'Hello')
except APIError as e:
    # Error messages only contain safe, user-facing information
    # No internal stack traces, file paths, or sensitive data
    print(e.message)
```

### Monitoring Spending

Check your transaction history on Base:

```python
client = LLMClient()
address = client.get_wallet_address()
print(f"View transactions: https://basescan.org/address/{address}")
```

### SDK Updates

Keep the SDK updated to receive security patches:

```bash
pip install --upgrade blockrun-llm
```
