# Music Generation API

Generate full-length music tracks with lyrics, instrumental, or custom style prompts.

> **Heads up:** MiniMax generates a ~3 minute track per call regardless of duration hints. Generation takes 1-3 minutes. Set your client timeout to at least 200 seconds.

## Endpoint

```
POST https://blockrun.ai/api/v1/audio/generations
```

## Request

```json
{
  "model": "minimax/music-2.5+",
  "prompt": "upbeat synthwave with warm neon pads and a driving beat",
  "instrumental": true,
  "duration_seconds": 30
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Model ID (default: `minimax/music-2.5+`) |
| `prompt` | string | Yes | Music style, mood, or description |
| `instrumental` | boolean | No | No vocals (default: false) |
| `lyrics` | string | No | Custom lyrics. Cannot combine with `instrumental: true` |
| `duration_seconds` | integer | No | Duration hint 5-240s (default: 30). Note: MiniMax ignores this — output is always ~3 min. |

### Available Models

| Model ID | Price | Notes |
|----------|-------|-------|
| `minimax/music-2.5+` | $0.1575 | Latest flagship, best quality |
| `minimax/music-2.5` | $0.1575 | Stable version |

## Response

```json
{
  "created": 1775488202,
  "model": "minimax/music-2.5+",
  "data": [
    {
      "url": "https://cdn.minimax.io/music/...",
      "duration_seconds": 186
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `model` | string | Model used |
| `data[].url` | string | Time-limited CDN URL (expires ~24h). Download immediately. |
| `data[].duration_seconds` | integer | Actual duration of generated track |
| `data[].lyrics` | string | Generated lyrics (if not instrumental) |

## Examples

### Via ClawRouter (recommended)

ClawRouter handles x402 payments automatically. Start it with `openclaw gateway start`, then call `localhost:8402` directly.

```bash
curl -X POST http://localhost:8402/v1/audio/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "minimax/music-2.5+",
    "prompt": "chill lo-fi hip hop, late night study vibes",
    "instrumental": true
  }'
```

Save the track:
```bash
URL=$(curl -s -X POST http://localhost:8402/v1/audio/generations \
  -H "Content-Type: application/json" \
  -d '{"model":"minimax/music-2.5+","prompt":"chill lo-fi hip hop","instrumental":true}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['url'])")

curl -L "$URL" -o track.mp3
```

### Direct API (Python)

```python
import requests
from blockrun_llm.x402 import parse_payment_required, create_payment_payload
from blockrun_llm import load_wallet
from eth_account import Account

wallet_key = load_wallet()
account = Account.from_key(wallet_key)

# Step 1: get payment requirements
resp = requests.post(
    "https://blockrun.ai/api/v1/audio/generations",
    json={
        "model": "minimax/music-2.5+",
        "prompt": "epic orchestral film score, dramatic strings",
        "instrumental": True,
    },
)
pr = parse_payment_required(resp.headers["PAYMENT-REQUIRED"])
acc = pr["accepts"][0]

# Step 2: sign payment
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
    json={
        "model": "minimax/music-2.5+",
        "prompt": "epic orchestral film score, dramatic strings",
        "instrumental": True,
    },
    headers={"X-Payment": payload},
    timeout=200,
)

track = result.json()["data"][0]
print(f"Track URL: {track['url']}")
print(f"Duration: {track['duration_seconds']}s")
print(f"Tx: {result.headers['X-Payment-Receipt']}")
```

### With Lyrics

```python
result = requests.post(
    "https://blockrun.ai/api/v1/audio/generations",
    json={
        "model": "minimax/music-2.5+",
        "prompt": "upbeat pop with piano",
        "lyrics": "Sunshine in the morning\nBrightens up my day\nEvery step I'm taking\nLeads me on my way",
        "instrumental": False,
    },
    headers={"X-Payment": payload},
    timeout=200,
)
```

## Pricing

| Model | MiniMax Cost | BlockRun Price |
|-------|-------------|----------------|
| minimax/music-2.5+ | ¥1.0 (~$0.138) | $0.1575 |
| minimax/music-2.5 | ¥1.0 (~$0.138) | $0.1575 |

Prices include 5% BlockRun margin. Paid in USDC on Base network.

## Limitations

| Limitation | Detail |
|------------|--------|
| Output duration | Always ~3 minutes (MiniMax limitation) |
| Generation time | 1-3 minutes per call |
| Format | MP3 only |
| Tracks per request | 1 |
| Duration control | Not supported (prompt hint ignored) |
| Image reference | Not supported |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request (bad parameters or conflicting lyrics + instrumental) |
| 402 | Payment required or verification failed |
| 429 | Rate limit exceeded |
| 504 | Generation timed out (retry) |
| 500 | Server error |

## Prompt Tips

**Describe the style clearly:**
```
✅ "upbeat pop with piano and synth bass, energetic chorus"
✅ "dark ambient drone, slow evolving pads, cinematic tension"
✅ "jazz trio, upright bass, brushed snare, bebop swing"
```

**Specify mood and tempo:**
```
✅ "120 BPM, danceable, happy summer vibes"
✅ "slow and melancholic, solo piano, minor key"
```

**For lyrics generation (no custom lyrics):**
```json
{
  "model": "minimax/music-2.5+",
  "prompt": "pop song about chasing dreams",
  "instrumental": false
}
```
MiniMax will auto-generate matching lyrics.

## Links

- [Image Generation](image-generation.md)
- [Intelligence Pricing](../products/intelligence/pricing.md)
- [Error Handling](errors.md)
