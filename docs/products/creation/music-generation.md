# music-generation

AI music generation via micropayments. No API keys needed.

Generate full-length music tracks with lyrics, instrumental, or custom style prompts — paid per track with USDC on Base.

> **Note:** MiniMax always generates a ~3 minute track per call. Generation takes 1-3 minutes. Plan accordingly.

## Available Models

| Model | Price | Notes |
|-------|-------|-------|
| minimax/music-2.5+ | $0.1575 | Latest MiniMax flagship, best quality |
| minimax/music-2.5 | $0.1575 | Stable version, same quality |

## Endpoint

```
POST /api/v1/audio/generations
```

## Request

```json
{
  "model": "minimax/music-2.5+",
  "prompt": "upbeat synthwave with warm neon pads and a driving beat",
  "instrumental": true,
  "lyrics": "optional lyrics if not instrumental",
  "duration_seconds": 30
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | No | Model ID (default: `minimax/music-2.5+`) |
| `prompt` | string | Yes | Music style, mood, or description |
| `instrumental` | boolean | No | Generate without vocals (default: false) |
| `lyrics` | string | No | Custom lyrics. Cannot be used with `instrumental: true` |
| `duration_seconds` | integer | No | Target duration hint 5-240s (default: 30). MiniMax ignores this — output is always ~3 min. |

## Response

```json
{
  "created": 1775488202,
  "model": "minimax/music-2.5+",
  "data": [
    {
      "url": "https://...",
      "duration_seconds": 186
    }
  ]
}
```

The `url` is a time-limited CDN link (expires in ~24h). Download immediately if you need to store the file.

## Payment

Same x402 flow as all BlockRun endpoints:

1. Call without payment → 402 with price + payment requirements
2. Sign USDC authorization locally (EIP-712)
3. Call again with `X-Payment` header → music generated + payment settled

```json
// 402 response body
{
  "error": "Payment Required",
  "price": { "amount": "0.157500", "currency": "USD" },
  "generation_info": {
    "output_duration": "~3 minutes of audio per track",
    "generation_time": "~2 minutes to generate"
  },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

## Usage with Python SDK

```python
import blockrun_llm
from blockrun_llm.x402 import parse_payment_required, create_payment_payload
from eth_account import Account
import requests

wallet_key = blockrun_llm.load_wallet()
account = Account.from_key(wallet_key)

# Step 1: get payment requirements
resp = requests.post(
    "https://blockrun.ai/api/v1/audio/generations",
    json={"model": "minimax/music-2.5+", "prompt": "chill lo-fi beats", "instrumental": True},
)
pr = parse_payment_required(resp.headers["PAYMENT-REQUIRED"])
acc = pr["accepts"][0]

# Step 2: sign & pay
payload = create_payment_payload(
    account=account,
    recipient=acc["payTo"],
    amount=str(acc["amount"]),
    network=acc["network"],
    resource_url=pr["resource"]["url"],
    resource_description="BlockRun music generation",
    max_timeout_seconds=acc["maxTimeoutSeconds"],
    extra=acc.get("extra"),
)

# Step 3: generate (takes 1-3 minutes)
result = requests.post(
    "https://blockrun.ai/api/v1/audio/generations",
    json={"model": "minimax/music-2.5+", "prompt": "chill lo-fi beats", "instrumental": True},
    headers={"X-Payment": payload},
    timeout=200,
)
track_url = result.json()["data"][0]["url"]
print(f"Track: {track_url}")
print(f"Tx: {result.headers['X-Payment-Receipt']}")
```

## Usage with curl

```bash
# Step 1: get 402
curl -s -X POST https://blockrun.ai/api/v1/audio/generations \
  -H "Content-Type: application/json" \
  -d '{"model": "minimax/music-2.5+", "prompt": "epic orchestral film score", "instrumental": true}'

# Step 2: pay and generate (use SDK for signing)
```

## Via BlockRun MCP (Claude Code)

```bash
claude mcp add blockrun -- npx @blockrun/mcp
```

Then in Claude:

```
Generate an upbeat pop track with lyrics about crypto and the future
```

```
Create an instrumental ambient track for a meditation app
```

## Limitations

- **Output is always ~3 minutes** — MiniMax does not support duration control
- **Generation takes 1-3 minutes** — do not set client timeout below 200s
- **MP3 only** — no WAV output currently
- **1 track per request** — batching not supported
- **No image reference inputs** — prompt-only generation

## Pricing Details

| Model | MiniMax Cost | BlockRun Price | Margin |
|-------|-------------|----------------|--------|
| music-2.5+ | ¥1.0 (~$0.138) | $0.1575 | ~14% |
| music-2.5 | ¥1.0 (~$0.138) | $0.1575 | ~14% |

Prices in USD, paid in USDC on Base network.

## Wallet Requirements

Funded wallet on Base mainnet. Recommended balance: $5+ for ~30 tracks.

```bash
# Check balance
python3 -c "from blockrun_llm import get_wallet_address; print(get_wallet_address())"
```

## Troubleshooting

### "Music generation timed out"
Generation can take up to 3 minutes. Increase your client timeout to at least 200 seconds.

### "Payment verification failed"
Insufficient USDC balance. Check your wallet on [Basescan](https://basescan.org).

### "Cannot specify lyrics when instrumental=true"
Remove `lyrics` field or set `instrumental: false`.

## Links

- [API Endpoint](https://blockrun.ai/api/v1/audio/generations)
- [Image Generation (nano-banana)](nano-banana.md)
- [Wallet Setup](../../getting-started/wallet-setup.md)
