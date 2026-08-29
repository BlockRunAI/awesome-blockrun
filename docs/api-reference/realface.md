---
title: RealFace Enrollment
description: Enroll a real person's face (no KYC, ~1-min on-phone liveness) as a ta_xxx asset for consistent likeness across Seedance 2.0 / 2.0-fast videos.
---

# RealFace Enrollment

Enroll a real person's face as a `ta_xxxxxxxx` asset you can pass as `real_face_asset_id` on any Seedance 2.0 / 2.0-fast call. Use this when you want **a real person to appear consistently across multiple videos** (talking head, spokesperson, character continuity).

:::note{title="No KYC required"}
No government ID, no account login, no name verification. Just a brief on-phone liveness check (nod + blink, ~1 minute) that proves the person enrolling is the same as the person in the photo. The biometric data is processed by the upstream identity service — BlockRun never sees it. For purely AI-generated characters (no real person involved), use [Virtual Portrait](virtual-portrait.md) instead ($0.011, no liveness step).
:::

| | |
|---|---|
| **Endpoints** | `POST /v1/realface/init` (free, returns h5Link) · `POST /v1/realface/enroll` ($0.011 USDC, finalizes) · `GET /v1/realface/status?groupId=…` (free polling) |
| **Price** | **$0.011 USDC** per enrollment, one-time, settled to BlockRun's Base wallet via x402 |
| **Auth** | x402 micropayment header on finalize — no API key needed |
| **Network** | Base (USDC, EIP-3009 `exact`) |
| **Returns** | `ta_xxxxxxxx…` asset id, usable as `real_face_asset_id` on Seedance 2.0 / 2.0-fast |

You can use the web UI at [blockrun.ai/studio/realface](https://blockrun.ai/studio/realface) — connect wallet, paste image URL, get QR for the rights-holder to scan, pay $0.011, copy the `ta_xxx`. The endpoints below are for SDK / programmatic use.

## Flow

```
[1] POST /v1/realface/init                       — FREE, rate-limited
    body: { "name": "..." }
    →    { group_id: "legacy_rf_…",
           h5_link: "https://kyc.byteintl.com/?...",
           expires_in_seconds: 120 }

[2] The rights-holder scans h5_link on their phone (use it as a QR code or
    just open it on mobile). They complete a brief liveness check —
    record a 2-4 second video doing two prompted actions (nod, blink).
    NO login, NO ID upload, NO personal info.

[3] GET /v1/realface/status?groupId=legacy_rf_…  — poll every 3-5s
    →    { status: "pending_validation", ready_to_finalize: false }
    →    ... (after H5 completes)
    →    { status: "active", ready_to_finalize: true }

[4] POST /v1/realface/enroll                     — PAID ($0.011 USDC)
    body: { "name": "...", "image_url": "https://...", "group_id": "..." }
    headers: { "x-payment": "<x402 base64>" }
    →    { asset_id: "ta_…", group_id: "...", ... }
```

The whole sequence typically completes in under 3 minutes (mostly the user finding their phone and tapping through the H5).

::::steps

:::step{title="Initialize (FREE)"}

```
POST https://blockrun.ai/api/v1/realface/init
```

### Request

```json
{
  "name": "Spokesperson — Q3 campaign"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Display name for your reference (1–64 chars). Stored upstream + in your list |
| `groupId` | string | No | If set, refresh the h5Link for this existing group instead of creating a new one. Use when the original 120s session expired |

### Response

```json
{
  "object": "realface.init",
  "group_id": "legacy_rf_8137",
  "h5_link": "https://kyc.byteintl.com/?accessKeyId=...&sessionToken=...&configId=...",
  "status": "pending_validation",
  "expires_in_seconds": 120,
  "next_steps": { ... }
}
```

### Rate limiting

Free but **rate-limited to 10 init calls per hour per IP** because each call generates an upstream session (real cost). For honest single-user usage this is plenty; if you hit `429` (`{ "error": "Rate limit exceeded", "retryAfterSeconds": n }` with a `Retry-After` header), wait or use the refresh path on an existing group. The refresh response carries `"refreshed": true` and no `next_steps`. An upstream failure on either path is `502`.
:::

:::step{title="H5 (the rights-holder's phone)"}

Send the `h5_link` to the rights-holder. Easiest way: render it as a QR they scan with their phone camera. The H5 page does the liveness verification — no account, no ID, just camera or video recording.

The H5 session token expires after **120 seconds**. If they don't finish in time, call `/init` again with `{ "groupId": "<existing>" }` to refresh.

### What the rights-holder sees on their phone

| Step | What happens |
|---|---|
| 1 | They open the link (scan the QR with their phone camera — iOS / Android both auto-detect QR codes — and tap the banner that pops up). The H5 page loads in their phone browser, hosted by the upstream identity-verification service |
| 2 | Browser asks **"Allow camera access?"** — they tap **Allow** |
| 3 | A circle appears with a live camera feed. They position their face inside |
| 4 | The page prompts **"please nod"** then **"please blink"** — they do each action for ~1-2 seconds. Total recording is **2-4 seconds** |
| 5 | Page shows **"Verification completed. You can close this page now."** — they close the tab |

Total time: **~60 seconds** including the QR scan and camera permission prompt. No login, no password, no email confirmation, no ID upload, no name entry.

### Alternate path (camera blocked or not available)

If they tap **Deny** on camera permission, the H5 offers a fallback:

1. Page shows "Use the alternate authentication method"
2. They record a 2-4 second video using the phone's native camera app, doing the same nod + blink
3. They upload the video file
4. Same end result, ~30s slower

### What data leaves their phone

- Live face video (or alternate uploaded video) → the upstream identity service
- **Nothing goes to BlockRun** during the phone session. We don't see the video, the camera feed, or any biometric template
- The upstream service stores enough to perform a one-time face-match against the photo you supply in step 4. Once the match is decided, your photo is the asset of record — the live video is not referenced again in subsequent Seedance generations

### Failure modes on the phone

| What they see | Cause | Recovery |
|---|---|---|
| "Session expired" | They took longer than 120s | Operator clicks "Generate fresh QR" in the studio (or calls `/init` again with `{groupId: …}`), they re-scan and try again |
| "Verification failed" | Poor lighting, face out of frame, didn't complete the action prompt | The H5 typically offers an in-session retry |
| 404 / "Not found" | Historical backend webhook race at our partner (fixed 2026-05-24) | If it recurs, contact support — this is a regression, not user error |

### No phone? Use a laptop

The H5 link works in any modern browser with a webcam. The rights-holder can open it on a laptop and grant the webcam permission — same flow.
:::

:::step{title="Poll for completion (FREE)"}

```
GET https://blockrun.ai/api/v1/realface/status?groupId=legacy_rf_…
```

### Response

```json
{
  "object": "realface.status",
  "group_id": "legacy_rf_8137",
  "status": "pending_validation",
  "asset_count": 0,
  "ready_to_finalize": false
}
```

When `status` transitions to `"active"` (and `ready_to_finalize: true`), the rights-holder has completed the H5 and you can move to step 4.

Poll every 3-5 seconds. Free but rate-limited (same bucket as wallet reconciliation, 120/hour/IP). A `groupId` that is missing or not of the form `legacy_rf_<digits>` is `400`; a well-formed id that does not exist is `404` (`{ "error": "Asset group not found: …" }`) — only a genuine upstream failure is `502`.
:::

:::step{title="Finalize (PAID, $0.011 USDC)"}

```
POST https://blockrun.ai/api/v1/realface/enroll
```

### Request

```json
{
  "name": "Spokesperson — Q3 campaign",
  "image_url": "https://example.com/person.jpg",
  "group_id": "legacy_rf_8137"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Display name (1–64 chars) |
| `image_url` | string | Yes | Public `https://` URL to the face photo. JPG / PNG / WEBP, ≤10 MB. Clear, front-facing, single subject, neutral expression. This photo is matched against the live face from the H5 |
| `group_id` | string | Yes | The `group_id` returned by `/init`. Must be in `active` state (H5 already completed) |

### x402 payment

Same two-step pattern as other paid BlockRun endpoints:

1. First call without `X-Payment` → server returns `402 Payment Required` with x402 challenge headers (`X-Payment-Required` / `PAYMENT-REQUIRED` base64, plus `WWW-Authenticate: X402 requirements="…"`) and a body of `{ "error": "Payment Required", "message": "Enrolling a RealFace asset costs $0.0110 USDC. …", "price": { "amount": "0.0110", "currency": "USD" }, "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 } }`
2. Sign the EIP-3009 transfer authorization for **$0.011 USDC on Base** (`$0.01` enrolment + `$0.001` transaction fee — the requirements say `11000` micro-USDC)
3. Retry the same request with `X-Payment: <base64>` (`Payment-Signature` is accepted too)

Settlement happens **after** the upstream face-match succeeds. Failure modes that do NOT settle:

- `402` — payment verification failed: `{ "error": "Payment verification failed", "code": "PAYMENT_INVALID" | "PAYMENT_UNFUNDED" | "PAYMENT_BLOCKHASH_STALE", "message"?, "debug", "payer" }`, or `code: "PAYMENT_REPLAY"` when the authorization was already used — sign a fresh one
- `425 Too Early` — group is not yet `active` (rights-holder hasn't done H5); body carries `group_status` and a `hint`
- `422 Unprocessable` — the face service rejected the image (bad/oversized photo, no clear single face; may carry a `code`) or the face-match failed (uploaded photo doesn't match the live face)
- `502 Bad Gateway` — the upstream group-status check or the upload itself failed

If settlement itself fails after a successful enrollment, BlockRun absorbs the cost.

### Response

```json
{
  "object": "realface",
  "asset_id": "ta_f85b20b9394e47be9502d819bee7929c",
  "group_id": "legacy_rf_8137",
  "byteplus_asset_id": "asset-20260525001905-…",
  "name": "Spokesperson — Q3 campaign",
  "image_url": "https://example.com/person.jpg",
  "created_at": "2026-05-24T16:19:00.000Z",
  "usage": {
    "compatible_models": ["bytedance/seedance-2.0", "bytedance/seedance-2.0-fast"],
    "how_to_use": "Pass \"real_face_asset_id\": \"ta_f85b20b9394e47be9502d819bee7929c\" on a Seedance video generation request."
  },
  "price": { "amount": "0.0110", "currency": "USD" },
  "settlement": {
    "success": true,
    "tx_hash": "0x…",
    "network": "base"
  }
}
```

The settlement receipt is also returned in the `X-Payment-Response` / `PAYMENT-RESPONSE` headers.
:::

::::

## Using the enrolled ta_xxx

Pass it as `real_face_asset_id` on any Seedance 2.0 / 2.0-fast call:

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bytedance/seedance-2.0-fast",
    "prompt": "she smiles warmly and waves at the camera in soft studio light",
    "real_face_asset_id": "ta_f85b20b9394e47be9502d819bee7929c"
  }'
```

The same `ta_xxx` can be reused across as many videos as you want — pay only the per-clip token cost each time. No re-enrollment fee.

## Listing enrolled RealFaces

```
GET https://blockrun.ai/api/v1/wallet/<address>/realfaces
```

Returns the wallet's enrolled RealFaces. Free, rate-limited (same 120/hour/IP bucket as `/portraits`); accepts EVM `0x…` or Solana base58 addresses (`400` otherwise). Responses are cacheable for 30 s.

```json
{
  "wallet": "0xCC8c44AD3dc2A58D841c3EB26131E49b22665EF8",
  "realfaces": [
    {
      "assetId": "ta_f85b20b9394e47be9502d819bee7929c",
      "groupId": "legacy_rf_8137",
      "name": "Spokesperson — Q3 campaign",
      "imageUrl": "https://example.com/person.jpg",
      "createdAt": "2026-05-24T16:19:00.000Z",
      "enrollmentTxHash": "0x…",
      "byteplusAssetId": "asset-20260525001905-…"
    }
  ],
  "count": 1
}
```

The video playground reads this same list and shows it in the `real_face_asset_id` dropdown alongside your Virtual Portraits.

## Error codes

| Code | When | Did payment settle? |
|------|------|---------------------|
| 400 | Invalid request body, malformed `group_id`, bad image URL; on `/status`, missing/malformed `groupId` | – (pre-payment) |
| 402 | Payment Required (first probe), or payment verification failed with `code` `PAYMENT_INVALID` / `PAYMENT_UNFUNDED` / `PAYMENT_BLOCKHASH_STALE` / `PAYMENT_REPLAY` | – |
| 404 | `/status`: `groupId` does not exist upstream | – |
| 425 | `group_id` is in `pending_validation` — the rights-holder hasn't completed the H5 yet | **No** |
| 422 | Image rejected by the face service, or face-match failed — uploaded photo doesn't match the live H5 face | **No** |
| 429 | Rate limit on `/init` (10/hour/IP), `/status` or the listing (120/hour/IP) | – |
| 502 | Upstream failure on `/init`, `/status`, the group-status check or the upload | **No** |
| 200 | Asset enrolled and active | **Yes** |

## Storage and privacy

- Wallet → enrolled RealFace list stored in BlockRun's GCS (`gs://blockrun-prod-2026-logs/realfaces/<wallet>.json`)
- The image URL you supplied is kept for previewing in the UI
- The face/liveness data goes **directly from the rights-holder's phone to the upstream identity service** — BlockRun servers never receive face image bytes during the H5
- We do not analyze, redistribute, or use enrolled faces for any purpose other than serving the asset id back to your wallet and forwarding requests for Seedance generation

## Comparison with Virtual Portrait

| | Virtual Portrait | RealFace |
|---|---|---|
| Asset target | AI-generated character | Real person |
| Price | $0.011 USDC | $0.011 USDC |
| Liveness check | Not required | Required (~1 minute on phone) |
| Upstream verification | None | Biometric match against H5 live face |
| KYC / government ID | Not required | Not required |
| Compatible models | Seedance 2.0 / 2.0-fast | Seedance 2.0 / 2.0-fast |

## What's next?

::::cards

:::card{title="Video Generation" href="video-generation.md" icon="Image"}
Pass the `ta_xxx` you just enrolled as `real_face_asset_id` on a Seedance 2.0 / 2.0-fast call.
:::

:::card{title="Virtual Portrait" href="virtual-portrait.md" icon="Boxes"}
The zero-liveness option for AI-generated characters — same `ta_xxx` mechanic, $0.011.
:::

:::card{title="x402 Payment Flow" href="../x402/payment-flow.md" icon="Zap"}
How the 402 / sign / retry handshake works behind the paid finalize call.
:::

::::

Also useful: [Real-person video walkthrough](https://blockrun.ai/docs/video/real-person-ip) (screenshots) · [RealFace Studio UI](https://blockrun.ai/studio/realface) (web flow for non-developers).
