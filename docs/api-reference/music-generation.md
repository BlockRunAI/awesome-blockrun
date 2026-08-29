---
title: Music Generation API
description: Generate full-length music tracks with lyrics, instrumental, or custom style prompts via MiniMax, paid per call in USDC over x402.
---

# Music Generation API

Generate full-length music tracks with lyrics, instrumental, or custom style prompts.

:::warning{title="Generation is slow — be ready to poll"}
`minimax/music-2.5+` produces a ~3 minute track per call regardless of duration hints, and takes 1–3 minutes to do it. Tracks that finish within **60s** come back inline as `200`; slower ones return **`202` + `poll_url`** and you poll until `completed`. Set your client timeout to at least 100 seconds per request and handle both shapes.
:::

## Endpoint

```
POST https://blockrun.ai/api/v1/audio/generations          # submit (returns 200 inline or 202 + poll_url)
GET  https://blockrun.ai/api/v1/audio/generations/{id}     # poll an async job (settles on first completed poll)
GET  https://blockrun.ai/api/v1/audio/models               # list music models (free, rate-limited)
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
| `model` | string | No | Model ID (default: `minimax/music-2.5+`). The legacy id `minimax/music-2.5` is remapped to `minimax/music-2.5+` (same price, strict superset). |
| `prompt` | string | Yes | Music style, mood, or description |
| `instrumental` | boolean | No | No vocals (default: false) |
| `lyrics` | string | No | Custom lyrics. Cannot combine with `instrumental: true` (returns `400`). When omitted and not instrumental, lyrics are auto-generated. |
| `duration_seconds` | integer | No | Duration hint 5–240s (default: 30), appended to the prompt as a target. The model ignores it — output is always ~3 min. |

### Available Models

| Model ID | Price (quoted) | Notes |
|----------|-------|-------|
| `minimax/music-2.5+` | $0.1585 | MiniMax flagship — supports lyrics, instrumental, and style prompts; ~3 min output; up to 240s billed as one track |

`GET /api/v1/audio/models` returns the same list with `billing_mode: "per_track"`, `pricing.per_track` (the $0.15 base rate before margin and fee), `supports_lyrics` and `supports_instrumental`.

## How it works — inline or async

1. **`POST /api/v1/audio/generations`** without a payment header returns a `402` challenge (headers `X-Payment-Required` / `PAYMENT-REQUIRED` / `WWW-Authenticate`) whose body quotes the full price and repeats the ~3 min / 1–3 min facts under `generation_info`.
2. Re-send the POST with a signed `X-Payment` header. The gateway **verifies only** (no charge yet), claims the authorization's nonce so it cannot be reused, and starts generation.
3. **Fast path (finished within 60s):** the track is mirrored to BlockRun storage, the payment is settled, and you get `200` with the classic `{ created, model, data: [...] }` body plus `PAYMENT-RESPONSE` and `X-Payment-Receipt` headers.
4. **Slow path:** you get `202` with `{ id, poll_url, status: "queued" }`. Generation keeps running server-side. Poll `GET {poll_url}` every 3–10s with an `x-payment` header signed by the **same wallet** (a fresh signature is fine; an unsigned poll returns its own `402` challenge so x402 clients re-sign automatically). The first poll that observes `completed` mirrors the track, **settles the payment, and returns the URL**. A job that never completes is marked `failed` after 1 hour and is never charged.

:::note{title="No charge on failure"}
Settlement is the only step that moves USDC and it runs only after a track exists. A generation that throws, times out, or is polled as `failed` returns with `PAYMENT-RESPONSE: {success:false}` (or `payment_status: "not_charged"` on a poll) and nothing is charged. The gateway takes a per-job settlement lock before charging, so re-polling a finished job — or a concurrent poll — returns `payment.status: "already_settled"` and never bills twice.
:::

## Response

### `200` — inline (fast path)

```json
{
  "created": 1775488202,
  "model": "minimax/music-2.5+",
  "data": [
    {
      "url": "https://blockrun.ai/api/media/audios/2026/08/12/<id>.mp3",
      "duration_seconds": 186,
      "lyrics": "..."
    }
  ]
}
```

### `202` — async job submitted (slow path)

```json
{
  "id": "<job id>",
  "object": "audio.generation.job",
  "status": "queued",
  "model": "minimax/music-2.5+",
  "price": { "amount": "0.158500", "currency": "USD" },
  "payment_status": "verified",
  "created": 1775488202,
  "poll_url": "/api/v1/audio/generations/<job id>",
  "poll_instructions": "Slow model — generation exceeded the inline window. Send GET to poll_url with an x-payment header signed by the SAME wallet …"
}
```

### `GET {poll_url}` → `202` (still generating)

```json
{
  "id": "<job id>",
  "object": "audio.generation.job",
  "status": "in_progress",
  "model": "minimax/music-2.5+",
  "payment_status": "verified",
  "note": "Generation in progress. Poll again in 3-10s. No charge until status=completed."
}
```

### `GET {poll_url}` → `200` (completed — charged here)

```json
{
  "id": "<job id>",
  "object": "audio.generation.job",
  "status": "completed",
  "model": "minimax/music-2.5+",
  "created": 1775488202,
  "data": [
    { "url": "https://blockrun.ai/api/media/audios/2026/08/12/<id>.mp3", "duration_seconds": 186, "lyrics": "..." }
  ],
  "price": { "amount": "0.158500", "currency": "USD" },
  "payment": { "status": "settled", "tx_hash": "0x…", "network": "base" }
}
```

A re-poll returns the same body with `payment.status: "already_settled"`. A failed job returns `200` with `status: "failed"`, `error`, and `payment_status: "not_charged"`.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `created` | integer | Unix timestamp |
| `model` | string | Model used |
| `data[].url` | string | **Permanent BlockRun-hosted URL** — the track is mirrored to BlockRun storage before settlement. Only if the mirror fails does it fall back to the upstream's expiring URL. |
| `data[].duration_seconds` | integer | Actual duration of the generated track (omitted if the upstream did not report one) |
| `data[].lyrics` | string | Generated lyrics (omitted for instrumental tracks) |
| `price.amount` | string | Async responses only: the amount charged, fee included |
| `payment.status` | string | Async responses only: `settled` \| `already_settled` |
| `payment.tx_hash` | string | On-chain USDC settlement tx (also in the `X-Payment-Receipt` header) |

:::note{title="Save the track when convenient, not urgently"}
`data[].url` is BlockRun-hosted and does not expire. Download it whenever you like.
:::

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
import time
import requests
from blockrun_llm.x402 import parse_payment_required, create_payment_payload
from blockrun_llm import load_wallet
from eth_account import Account

wallet_key = load_wallet()
account = Account.from_key(wallet_key)
BASE = "https://blockrun.ai"
body = {
    "model": "minimax/music-2.5+",
    "prompt": "epic orchestral film score, dramatic strings",
    "instrumental": True,
}

def sign(resp):
    """Sign the x402 challenge carried by a 402 response."""
    pr = parse_payment_required(resp.headers["PAYMENT-REQUIRED"])
    acc = pr["accepts"][0]
    return create_payment_payload(
        account=account,
        recipient=acc["payTo"],
        amount=str(acc["amount"]),
        network=acc["network"],
        resource_url=pr["resource"]["url"],
        resource_description="BlockRun music generation",
        max_timeout_seconds=acc["maxTimeoutSeconds"],
        extra=acc.get("extra"),
    )

# Step 1: get the challenge, sign it, submit (waits up to ~60s inline)
challenge = requests.post(f"{BASE}/api/v1/audio/generations", json=body)
result = requests.post(
    f"{BASE}/api/v1/audio/generations",
    json=body,
    headers={"X-Payment": sign(challenge)},
    timeout=100,
)

# Step 2: fast path returned the track inline; slow path returned 202 + poll_url
if result.status_code == 202:
    poll_url = BASE + result.json()["poll_url"]
    while True:
        time.sleep(5)
        # An unsigned poll returns its own 402 — sign it with the SAME wallet
        poll = requests.get(poll_url, timeout=100)
        if poll.status_code == 402:
            poll = requests.get(poll_url, headers={"X-Payment": sign(poll)}, timeout=100)
        job = poll.json()
        if poll.status_code == 200 and job.get("status") == "completed":
            result = poll
            break
        if job.get("status") == "failed":
            raise RuntimeError(f"generation failed, not charged: {job.get('error')}")

track = result.json()["data"][0]
print(f"Track URL: {track['url']}")
print(f"Duration: {track.get('duration_seconds')}s")
print(f"Tx: {result.headers.get('X-Payment-Receipt')}")
```

### With Lyrics

```python
body = {
    "model": "minimax/music-2.5+",
    "prompt": "upbeat pop with piano",
    "lyrics": "Sunshine in the morning\nBrightens up my day\nEvery step I'm taking\nLeads me on my way",
    "instrumental": False,
}
# then run the same sign → submit → (poll) loop as above
```

## Pricing

| Model | Price/track (quoted) |
|-------|-------------|
| `minimax/music-2.5+` | $0.1585 |

Price = `$0.15 × 1.05 + $0.001` — the $0.15 base rate, the 5% BlockRun media margin, and the flat $0.001 per-transaction fee charged on every paid call. That is the `price.amount` the `402` body quotes and the amount settled on-chain; there is no other minimum. Paid in USDC on Base (or Solana via `sol.blockrun.ai`).

## Limitations

| Limitation | Detail |
|------------|--------|
| Output duration | Always ~3 minutes (model behaviour) |
| Generation time | 1–3 minutes per call; inline `200` only if it finishes within 60s, otherwise `202` + poll |
| Job lifetime | A job still `queued` / `in_progress` after 1 hour is marked `failed` (not charged) |
| Format | MP3 only |
| Tracks per request | 1 |
| Duration control | Not supported (prompt hint ignored) |
| Image reference | Not supported |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid JSON or parameters (`details` carries the schema issues), unknown model, or conflicting `lyrics` + `instrumental: true` |
| 402 | Payment required (challenge), verification failed (`code`: `PAYMENT_INVALID` default, `PAYMENT_UNFUNDED` for an unexecutable authorization — usually insufficient USDC on Base, `PAYMENT_REPLAY` for a reused authorization), or `Payment settlement failed` on a finished job (the track exists; retry the poll with a fresh signature — an expired authorization is the usual cause) |
| 403 | Poll signed by a wallet other than the one that submitted the job (`Payment payer mismatch`) |
| 404 | Poll for an unknown or expired job id |
| 429 | Upstream rate limit (`code: "RATE_LIMITED"`, `Retry-After` header) |
| 502 | Upstream provider rejected the request (content policy, quota) — not charged |
| 504 | Generation timed out — not charged; retry |
| 500 | Server error — not charged |

Every failure after a verified payment carries a `PAYMENT-RESPONSE` header with `success: false` so you can confirm nothing was settled.

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
The model will auto-generate matching lyrics and return them in `data[].lyrics`.

## What's next?

::::cards

:::card{title="Image Generation" href="image-generation.md" icon="Image"}
Generate images from a text prompt with the same pay-per-call model.
:::

:::card{title="Video Generation" href="video-generation.md" icon="Image"}
Generate video clips with Sora 2, Grok Imagine and Seedance.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes and how generation timeouts and payment failures surface.
:::

::::
