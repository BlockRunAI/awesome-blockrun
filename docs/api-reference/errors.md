# Error Handling

BlockRun uses standard HTTP status codes and returns detailed error information.

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 402 | Payment Required - Sign and retry with payment |
| 500 | Server Error - Something went wrong |

## Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": {}
}
```

## Common Errors

### 400 - Invalid Request

```json
{
  "error": "Invalid request body",
  "details": [
    {"path": ["model"], "message": "Required"}
  ]
}
```

**Causes:**
- Missing required fields (`model`, `messages`)
- Invalid model ID
- Malformed JSON

### 402 - Payment Required

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "price": {
    "amount": "0.001000",
    "currency": "USD"
  }
}
```

**This is not an error** - it's part of the normal x402 flow. The SDK handles this automatically.

### 402 - Payment Rejected

```json
{
  "error": "Payment verification failed",
  "details": "Insufficient balance"
}
```

**Causes:**
- Insufficient USDC balance
- Invalid signature
- Expired payment authorization

### 500 - Server Error

```json
{
  "error": "Internal server error"
}
```

**Causes:**
- Upstream provider error
- Temporary service issue

## SDK Error Classes

**Python:**
```python
from blockrun_llm import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-4o", "Hello!")
except PaymentError as e:
    # Payment failed - check USDC balance
    print(f"Payment error: {e}")
except APIError as e:
    # API returned an error
    print(f"API error ({e.status_code}): {e}")
    print(f"Response: {e.response}")
except Exception as e:
    # Network or other error
    print(f"Error: {e}")
```

**TypeScript:**
```typescript
import { LLMClient, APIError, PaymentError } from '@blockrun/llm';

const client = new LLMClient({ privateKey: '0x...' });

try {
  const response = await client.chat('openai/gpt-4o', 'Hello!');
} catch (error) {
  if (error instanceof PaymentError) {
    // Payment failed - check USDC balance
    console.error('Payment error:', error.message);
  } else if (error instanceof APIError) {
    // API returned an error
    console.error(`API error (${error.statusCode}):`, error.message);
  } else {
    // Network or other error
    console.error('Error:', error);
  }
}
```

## Troubleshooting

### "Payment verification failed"

1. Check your USDC balance on Base
2. Ensure your wallet is on the correct network
3. Verify your private key is correct

### "Unknown model"

1. Check the model ID matches exactly (e.g., `openai/gpt-4o`)
2. See [available models](models.md) for valid IDs

### "Timeout"

1. Increase the timeout in client options
2. Try a faster model (e.g., `gpt-4o-mini` instead of `o1`)

### "Network error"

1. Check your internet connection
2. Verify `blockrun.ai/api` is accessible
