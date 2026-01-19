# Payment Flow

Step-by-step breakdown of how x402 payments work.

## Overview

Every x402 payment follows this sequence:

1. Client sends request without payment
2. Server returns 402 with payment requirements
3. Client signs payment authorization
4. Client retries with signed payment
5. Server verifies, executes, and settles

## Detailed Flow

### Step 1: Initial Request

Client sends a normal API request:

```bash
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-4o", "messages": [...]}'
```

### Step 2: 402 Response

Server returns payment requirements:

```http
HTTP/1.1 402 Payment Required
X-Payment-Required: <base64-encoded-requirements>

{
  "error": "Payment Required",
  "price": {"amount": "0.001000", "currency": "USD"}
}
```

The `X-Payment-Required` header contains:

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "1000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x..."
  }],
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "mimeType": "application/json"
  }
}
```

### Step 3: Sign Authorization

The client creates an EIP-3009 `TransferWithAuthorization` signature:

```typescript
const authorization = {
  from: walletAddress,
  to: paymentDetails.payTo,
  value: paymentDetails.amount,
  validAfter: Math.floor(Date.now() / 1000) - 600,
  validBefore: Math.floor(Date.now() / 1000) + 300,
  nonce: randomBytes32()
};

const signature = await wallet.signTypedData({
  domain: USDC_DOMAIN,
  types: TRANSFER_WITH_AUTHORIZATION_TYPES,
  primaryType: 'TransferWithAuthorization',
  message: authorization
});
```

Key points:
- Private key never leaves the client
- Authorization expires in 5 minutes (`validBefore`)
- Clock skew tolerance of 10 minutes (`validAfter`)

### Step 4: Retry with Payment

Client sends the request again with the `PAYMENT-SIGNATURE` header (x402 v2):

```bash
curl -X POST https://blockrun.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment>" \
  -d '{"model": "openai/gpt-4o", "messages": [...]}'
```

The payment payload contains:

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://blockrun.ai/api/v1/chat/completions",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "1000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x..."
  },
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "1000",
      "validAfter": "1234567890",
      "validBefore": "1234568190",
      "nonce": "0x..."
    }
  }
}
```

### Step 5: Verify, Execute, Settle

The server:

1. **Verifies** the payment signature with the Facilitator
2. **Executes** the API request (calls the AI model)
3. **Settles** the payment on-chain

```
Server                          Facilitator                    Blockchain
  |                                 |                              |
  |  1. Verify signature            |                              |
  |-------------------------------->|                              |
  |                                 |                              |
  |  2. Signature valid             |                              |
  |<--------------------------------|                              |
  |                                 |                              |
  |  3. Execute AI request          |                              |
  |  (call OpenAI/Anthropic/etc)    |                              |
  |                                 |                              |
  |  4. Settle payment              |                              |
  |-------------------------------->|                              |
  |                                 |  5. Execute transfer         |
  |                                 |----------------------------->|
  |                                 |                              |
  |  6. Settlement confirmed        |                              |
  |<--------------------------------|                              |
  |                                 |                              |
  |  7. Return response to client   |                              |
```

## SDK Handling

The SDKs handle this entire flow automatically:

```python
# Python - all 5 steps happen behind the scenes
response = client.chat("openai/gpt-4o", "Hello!")
```

```typescript
// TypeScript - all 5 steps happen behind the scenes
const response = await client.chat('openai/gpt-4o', 'Hello!');
```

## Error Scenarios

### Insufficient Balance

If your wallet doesn't have enough USDC:

```json
{
  "error": "Payment verification failed",
  "details": "Insufficient balance"
}
```

### Expired Authorization

If too much time passed between signing and settling:

```json
{
  "error": "Payment verification failed",
  "details": "Authorization expired"
}
```

### Invalid Signature

If the signature doesn't match:

```json
{
  "error": "Payment verification failed",
  "details": "Invalid signature"
}
```

## Timing

Typical payment flow timing:

| Step | Time |
|------|------|
| Initial 402 response | ~50ms |
| Client signing | ~10ms |
| Signature verification | ~100ms |
| AI model execution | 1-30s (varies) |
| On-chain settlement | ~2s |
| **Total overhead** | **~200ms** |

The payment overhead is minimal compared to AI model execution time.
