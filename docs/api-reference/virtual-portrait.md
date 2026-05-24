# Virtual Portrait Enrollment

Enroll an AI-generated character image as a Virtual Portrait and get back a `ta_xxxxxxxx` id you can pass as `real_face_asset_id` on any Seedance 2.0 / 2.0-fast call. Use this when you want **the same character across multiple videos** without dealing with KYC.

> **No KYC required.** Use this for AI-generated personas, mascots, avatars, virtual spokespeople — no liveness step needed because the asset is understood to be a synthetic character. For **real-person likeness**, use [RealFace](realface.md) (also no KYC, but requires a brief liveness check on the rights-holder's phone to prove consent).

| | |
|---|---|
| **Endpoint** | `POST https://blockrun.ai/api/v1/portrait/enroll` |
| **Price** | **$0.01 USDC** per enrollment (one-time, settled to BlockRun's Base wallet via x402) |
| **Auth** | x402 micropayment header — no API key needed |
| **Network** | Base (USDC, EIP-3009 `exact`) |
| **Returns** | `ta_xxxxxxxx…` asset id for use with `real_face_asset_id` on Seedance 2.0 / 2.0-fast |

You can use the web UI at [blockrun.ai/studio/portrait](https://blockrun.ai/studio/portrait) — wallet connect, paste an image URL, sign once, copy the `ta_xxx`. The endpoint below is for SDK / programmatic use.

## Request

```json
{
  "name": "My Spokesperson",
  "image_url": "https://example.com/character.jpg"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Display name for organization in your portrait list (1–64 chars) |
| `image_url` | string | Yes | Public `https://` URL pointing to a JPG / PNG / WEBP image. Server-side fetched and registered as a Virtual Portrait asset. **Max 10 MB.** |

### What makes a good portrait image

Seedance conditions video generation on the supplied image as a face/character reference. Best results when:

- **Single subject, face clearly visible** (front or 3/4 angle, eyes open)
- **Neutral expression** — extreme expressions reduce the model's ability to apply prompted emotions
- **Clean background** (or at least not visually competing with the subject)
- **Even lighting** — heavy shadows on the face degrade character consistency
- **High resolution** — 1024×1024 or larger; we downscale gracefully but blurry inputs propagate

Images that fail the upstream content filter (NSFW, recognizable real-celebrity likeness without consent) will be rejected at enrollment.

## Payment flow (x402)

Standard BlockRun two-step:

1. **First request without `X-Payment`** → server returns `402 Payment Required` with x402 challenge headers
2. Sign the EIP-3009 transfer authorization for **$0.01 USDC on Base**
3. **Retry the same request with `X-Payment: <base64>`** → server verifies, registers the portrait, settles the payment after registration succeeds, returns the `ta_xxx`

Settlement happens **after** the portrait is successfully enrolled. If enrollment fails (content filter, network error), no payment is taken — the route returns 502 and the caller can retry with a fresh signature. If settlement itself fails after a successful enrollment, BlockRun absorbs the cost rather than leave the user with a paid-but-unrecoverable state.

If you're using `clawrouter` locally, this flow is fully automatic — just call the endpoint.

## Response

```json
{
  "object": "virtual_portrait",
  "asset_id": "ta_abcdef1234567890",
  "group_id": "tg_xyz9876543210",
  "name": "My Spokesperson",
  "image_url": "https://example.com/character.jpg",
  "created_at": "2026-05-22T14:32:11.000Z",
  "usage": {
    "compatible_models": ["bytedance/seedance-2.0", "bytedance/seedance-2.0-fast"],
    "how_to_use": "Pass \"real_face_asset_id\": \"ta_abcdef1234567890\" on a Seedance video generation request."
  },
  "price": { "amount": "0.500000", "currency": "USD" },
  "settlement": {
    "success": true,
    "tx_hash": "0x9f3a…",
    "network": "base"
  }
}
```

| Field | Description |
|-------|-------------|
| `asset_id` | The `ta_…` id to pass as `real_face_asset_id` on Seedance |
| `group_id` | Internal asset-group id — exposed for debugging / future delete operations |
| `usage.compatible_models` | Which BlockRun video models accept this asset id |
| `settlement.tx_hash` | The Base settlement transaction (verify on BaseScan) |

## Examples

### Via cURL (manual x402 flow)

```bash
# Step 1: probe — returns 402 with challenge headers
curl -i -X POST https://blockrun.ai/api/v1/portrait/enroll \
  -H "Content-Type: application/json" \
  -d '{"name":"My Spokesperson","image_url":"https://example.com/character.jpg"}'

# Step 2: sign the x402 challenge with your wallet (see x402/payment-flow.md)
# Step 3: retry with the signature
curl -X POST https://blockrun.ai/api/v1/portrait/enroll \
  -H "Content-Type: application/json" \
  -H "X-Payment: $PAYMENT_HEADER" \
  -d '{"name":"My Spokesperson","image_url":"https://example.com/character.jpg"}'
```

### Via ClawRouter

ClawRouter handles the x402 dance for you:

```bash
curl -X POST http://localhost:8402/v1/portrait/enroll \
  -H "Content-Type: application/json" \
  -d '{"name":"My Spokesperson","image_url":"https://example.com/character.jpg"}'
```

### Using the enrolled portrait

Take the returned `asset_id` and pass it as `real_face_asset_id` on a Seedance call:

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bytedance/seedance-2.0-fast",
    "prompt": "the character smiles warmly and waves at the camera",
    "real_face_asset_id": "ta_abcdef1234567890"
  }'
```

The same `ta_xxx` can be reused across as many video generations as you want — you pay the per-clip token cost each time, but you don't re-pay the enrollment fee.

## Listing enrolled portraits

```
GET https://blockrun.ai/api/v1/wallet/<address>/portraits
```

Returns the list of portraits the given wallet has enrolled. Free (rate-limited to 20 requests / hour / IP, shared with the wallet-reconciliation bucket). Works for both EVM (`0x…`) and Solana (base58) addresses, though Virtual Portrait enrollment itself is currently Base-only.

```json
{
  "wallet": "0xCC8c44AD3dc2A58D841c3EB26131E49b22665EF8",
  "portraits": [
    {
      "assetId": "ta_abcdef1234567890",
      "groupId": "tg_xyz9876543210",
      "name": "My Spokesperson",
      "imageUrl": "https://example.com/character.jpg",
      "createdAt": "2026-05-22T14:32:11.000Z",
      "enrollmentTxHash": "0x9f3a…"
    }
  ],
  "count": 1
}
```

The video playground at `/models/bytedance-seedance-2.0-fast` reads this same list and renders it as a dropdown when the connected wallet has any enrolled portraits.

## Error codes

| Code | Body `error` | Cause / fix |
|------|-------------|-------------|
| 400 | `Invalid request body` | Missing `name`, invalid `image_url`, name > 64 chars |
| 400 | `image_url must be an http(s) URL` | URL missing `https://` scheme |
| 402 | `Payment Required` | First request — sign + retry with `X-Payment` header |
| 402 | `Payment verification failed` | Signature didn't match what was quoted (amount, recipient, nonce) — re-sign |
| 502 | varies | Enrollment failed (content filter, image too big, network) — **no payment taken**, safe to retry with a different image |
| 429 | `Rate limit exceeded` | Listing endpoint only — back off per `Retry-After` header |

## Storage and privacy

- Wallet → portrait list is stored in BlockRun's GCS (`gs://blockrun-prod-2026-logs/portraits/<wallet>.json`)
- The image URL you supplied is kept for previewing in the UI; the canonical image bytes are stored upstream with the inference provider
- We do not analyze, redistribute, or use your portrait images for any purpose other than serving the asset back to your wallet and forwarding it for Seedance generation
- Delete is not currently exposed via API — open a GitHub issue or email vicky@blockrun.ai if you need an entry removed

## Links

- [Video Generation API](video-generation.md) — using the `ta_xxx` you just enrolled
- [RealFace Enrollment](realface.md) — same `ta_xxx` mechanic but for a real person (requires liveness check, still no KYC)
- [Real-person video walkthrough](https://blockrun.ai/docs/video/real-person-ip) — visual walkthrough of the RealFace flow
- [Portrait Studio UI](https://blockrun.ai/studio/portrait) — web flow for non-developers
- [x402 Payment Flow](../x402/payment-flow.md) — how the 402 / sign / retry handshake works
