---
title: Phone & Voice
description: Outbound AI voice calls, wallet-owned phone numbers and carrier lookups for agents — $5 per number (30 days), $0.541 flat per call, no telecom account.
---

# Phone & Voice

Outbound AI voice calls, wallet-owned phone numbers and carrier lookups — for AI agents. No telecom account, no voice-AI signup, no carrier dashboard. Your wallet *is* the phone account.

**Default country:** US (no regulatory friction). Other countries can be requested via the `country` parameter — see [Country availability](#country-availability) below.

:::info{title="Costs"}
A number is **$5.001 / 30 days** (renew for $5.001). Each outbound call is **$0.541 flat** (up to 30 min, default 5). Polling status / fetching a transcript is **free**, and so is releasing a number. Carrier lookups are **$0.011** (or **$0.051** with fraud signals). A call that the voice provider refuses to place (502) is **not charged** — the charge settles only once the call is accepted for dialing. All settled in USDC on Base or Solana via x402.
:::

Voice AI and carrier numbers are provisioned by BlockRun's telephony stack, with x402 settlement at every step.

## The Problem This Solves

An autonomous agent wants to call a restaurant to confirm a reservation, or call a vendor to verify a price. Traditionally that requires: a carrier account, a voice-AI account, KYC, a credit card, a long-lived API key, an outbound caller ID number you bought and manage, plus per-minute billing reconciliation.

BlockRun collapses all of it to two endpoints and one wallet:
1. `POST /v1/phone/numbers/buy` — $5.001, get a US number for 30 days (default; other countries via `country` parameter).
2. `POST /v1/voice/call` — $0.541, place an outbound call with an AI voice + a conversational `task`.

Wallet ownership is recorded by the gateway — only the wallet that bought a number can use it to place calls, and only that wallet can renew or release it. The number is bound to the chain it was bought on (`base` on blockrun.ai, `solana` on sol.blockrun.ai).

---

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/phone/lookup` | POST | $0.011 | Carrier + line type lookup for an E.164 number |
| `/api/v1/phone/lookup/fraud` | POST | $0.051 | Carrier lookup plus fraud signals (SIM swap, call forwarding) |
| `/api/v1/phone/numbers/buy` | POST | **$5.001** | Provision a new number for the calling wallet (30-day lease). US default; other countries via `country` parameter (may require carrier regulatory approval — see below). |
| `/api/v1/phone/numbers/renew` | POST | **$5.001** | Extend an active number's lease by 30 days |
| `/api/v1/phone/numbers/list` | POST | $0.002 | List the calling wallet's numbers |
| `/api/v1/phone/numbers/release` | POST | **Free** | Release a number you own back to the pool (still signed via x402 so the gateway knows which wallet is asking) |
| `/api/v1/voice/call` | POST | **$0.541** | Place an outbound AI call (max 30 min, default 5 min) |
| `/api/v1/voice/call/{call_id}` | GET | **Free** | Poll call status / fetch transcript |

All prices include the flat $0.001 transaction fee. Every `/v1/phone/*` endpoint is `POST` with a JSON body; request bodies are validated **strictly** — an unknown key (for example `area_code` instead of `areaCode`) is a `400 Invalid request body` with the offending `keys` listed in `details`. Validation runs before the 402, so an unpaid probe still needs a well-formed body.

---

## POST /api/v1/phone/lookup and /lookup/fraud

Carrier information and line type for any phone number; the `/fraud` variant adds SIM-swap and call-forwarding signals.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | Yes | Number to look up, E.164 format |

The upstream lookup result is returned as-is. If the carrier rejects the lookup, the 4xx is forwarded with its original status and you are **not charged**.

---

## POST /api/v1/phone/numbers/buy

Provisions a new phone number from the carrier catalog in your chosen country, registers ownership against the calling wallet's address, and grants a 30-day lease. The purchase happens **before** settlement, so a failed purchase is never charged.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | No | ISO 2-letter code. Default: `"US"`. See [Country availability](#country-availability) for which other countries are pre-enabled. |
| `areaCode` | string | No | Preferred area code (US/CA: 3 digits). Best-effort — falls back to any in-country number if none available. |

### Country availability

| Country | Status |
|---------|--------|
| **US** | ✅ default — always works, all area codes |
| **CA** | ✅ usually works without friction |
| All others (MX, BR, AR, CL, CO, EU, AU, JP, KR, IN, etc.) | ⚠️ requires carrier regulatory (KYC) approval on our account first |

Most non-US/CA countries require per-country KYC documentation (address proof, business identity) before a number can be purchased. The approval is account-level — once it's in place for a country, all subsequent purchases work transparently.

**If you need a number outside the US:** call the endpoint with your desired `country` code. If the carrier rejects the purchase with a regulatory error, our gateway returns a `502 Purchase failed` with the upstream message in `details` (not charged). Email `care@blockrun.ai` with the country you need — we'll complete the regulatory registration (usually 1–5 business days for carrier review) and let you know when the country is live.

Pricing is flat **$5.001 / 30 days** regardless of country (we absorb the carrier cost difference). Renewal also $5.001.

### Response

```json
{
  "phone_number": "+14155551234",
  "expires_at": "2026-06-17T12:00:00Z",
  "chain": "base",
  "message": "Number provisioned for 30 days. Use it as 'from' in voice calls."
}
```

The settlement transaction hash is in the `X-Payment-Receipt` response header (full receipt in `X-Payment-Response`). The returned `phone_number` can be used immediately as the `from` field on `POST /v1/voice/call`. After `expires_at`, the number is reclaimed and re-pooled (call `renew` before that to keep it).

If no number is available in the requested country / area code, the response is `404 No numbers available` — not charged.

---

## POST /api/v1/phone/numbers/renew

Extends an active number's lease by 30 days from its **current expiry**. **Only the original owner wallet can renew, and only before the number expires** — an expired number cannot be renewed; buy a new one.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | Yes | E.164 format (e.g. `"+14155551234"`) |

### Response

```json
{
  "phone_number": "+14155551234",
  "expires_at": "2026-07-17T12:00:00Z"
}
```

### Errors

- `403 Forbidden` with `reason: "wrong_wallet"` — the calling wallet doesn't own this number. The body carries `payer_wallet` so you can see which wallet actually signed.
- `403 Forbidden` with `reason: "expired"` — the lease already lapsed; buy a new number.
- `403 Forbidden` with `reason: "not_found"` — the number is not in our registry.

---

## POST /api/v1/phone/numbers/list

Returns the phone numbers owned by the calling wallet (identity revealed via the x402 payer field). Send an empty JSON object `{}` as the body.

### Response

```json
{
  "numbers": [
    {
      "phone_number": "+14155551234",
      "chain": "base",
      "expires_at": "2026-06-17T12:00:00Z",
      "active": true
    }
  ],
  "count": 1
}
```

Expired numbers still appear with `active: false` until they are reclaimed.

---

## POST /api/v1/phone/numbers/release

Releases a number you own back to the pool, immediately. Free — the request still goes through the x402 flow (a $0 authorization) so the gateway knows which wallet is asking.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | Yes | E.164 format |

### Response

```json
{ "released": true, "phone_number": "+14155551234" }
```

`403 Forbidden` (`reason: "wrong_wallet"`) if another wallet owns it; `404 Not Found` if it isn't in the registry.

---

## POST /api/v1/voice/call

Places an outbound AI conversation call. The AI voice agent dials the destination, follows the `task` you give it, and returns when the call ends (or hits the duration cap).

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Destination in E.164 (e.g. `"+12133610872"`). Calls to emergency numbers (911, 112, 999, …) are refused with `403`. |
| `task` | string | Yes | Free-text instructions for the AI — what to say, what to ask, when to hang up. 10–4000 characters. |
| `from` | string | No | Your wallet-owned BlockRun number (E.164). Omit if your wallet owns exactly one active number — it's used automatically. If you own multiple, this is required (otherwise `400 ambiguous_from`). If you own none, `403 no_active_number` with a buy hint. |
| `voice` | string | No | Voice preset: `nat`, `josh`, `maya`, `june`, `paige`, `derek`, `florian` — or a voice ID from the voice catalog |
| `language` | string | No | Language tag for speech recognition + synthesis. Default: `"en-US"` |
| `max_duration` | integer | No | Max call duration in minutes. Default: `5`. Range: `1`–`30`. |
| `first_sentence` | string | No | Exact opener (≤ 500 chars) — overrides the AI's default greeting |
| `wait_for_greeting` | boolean | No | Wait for the callee to speak first before the AI starts (useful for IVRs) |
| `interruption_threshold` | integer | No | Milliseconds of silence before the AI can interrupt. Range: `50`–`500` |
| `model` | string | No | Voice model tier: `base`, `enhanced`, or `turbo` |
| `voicemail_action` | string | No | What to do if voicemail answers: `hangup`, `leave_message`, or `ignore` |
| `voicemail_message` | string | No | Message to leave (≤ 1000 chars). **Required** when `voicemail_action` is `leave_message`. |

The body is validated strictly (unknown keys → `400`), and validation runs **before** the payment check — so the unpaid discovery request must already carry a valid `to` + `task`.

### Response

```json
{
  "call_id": "01HXY9...",
  "status": "queued",
  "poll_url": "https://blockrun.ai/api/v1/voice/call/01HXY9...",
  "message": "Call initiated. Poll poll_url for status, transcript, and recording."
}
```

The settlement transaction hash is in the `X-Payment-Receipt` header. The call is asynchronous — `status: "queued"` means dialing is about to start. Poll `poll_url` (`GET /v1/voice/call/{call_id}`) to track progress.

### Errors

- `403 no_active_number` — your wallet hasn't bought a number yet (or every number it owns has expired). Buy one at `/v1/phone/numbers/buy`; the body includes `buy_endpoint`.
- `403 Forbidden` with `reason: "wrong_wallet"` / `"not_found"` — you passed a `from` you don't own. Response includes `your_active_numbers` (what your wallet *does* own).
- `403 Forbidden` with `reason: "expired"` — the `from` number's lease lapsed; renew or buy a new one.
- `403 Forbidden` — destination is an emergency-services number.
- `400 ambiguous_from` — wallet owns multiple active numbers; specify `from` explicitly. Response includes `your_active_numbers`.
- `502 Call initiation failed` — the voice provider refused to place the call. **Not charged**; upstream reason in `details`.

---

## GET /api/v1/voice/call/{call_id}

Poll for call status, transcript, and final outcome. **Free** — no payment required (no `X-Payment` header needed).

### Response

```json
{
  "call_id": "01HXY9...",
  "from": "+14155551234",
  "to": "+12133610872",
  "status": "completed",
  "answered_by": "human",
  "call_length": 1.42,
  "call_ended_by": "USER",
  "ended_by": "USER",
  "ended_by_reason": "The callee (the person you called) hung up. This is normal — humans typically end calls once they've answered your question. Not a system error.",
  "summary": "Called Andy to ask him to take a break. Andy agreed and said he'd log off at 6pm.",
  "transcript": [
    { "role": "assistant", "text": "Hi Andy, this is Vicky's assistant calling..." },
    { "role": "user", "text": "Oh hey, what's up?" }
  ],
  "recording_url": "https://..."
}
```

The upstream call record is passed through as-is (field set may vary by call); BlockRun adds `ended_by` and `ended_by_reason` on top. `status` values: `queued`, `started`, `ringing`, `in-progress`, `completed`, `error`. Use `ended_by` rather than `status` to decide whether the call is finished.

An unknown `call_id` returns `404 Call not found`. Requesting the literal `{call_id}` placeholder returns a 402-shaped discovery record (`price.free: true`) — substitute the real id.

### `ended_by` — why the call ended

BlockRun synthesizes an `ended_by` field on the GET response so you can distinguish "the callee hung up" (normal) from "the system errored" (bug). Always check this field before assuming a failure.

| `ended_by` | Meaning | Charge? |
|------------|---------|---------|
| `USER` | **The callee hung up.** Most common outcome. After they answer your AI's question, humans typically end the call. The transcript will look "cut off" because the AI was mid-response — that's expected. Not a system error. | Yes (already settled) |
| `ASSISTANT` | The AI ended the call gracefully — task complete, exit-instruction triggered, or `max_duration` approached. | Yes |
| `TIMEOUT` | Hit the `max_duration` cap (within ~5 s of it). Pass a larger value next time if you expect long conversations. | Yes |
| `NO_ANSWER` | Line rang out, no human picked up. | Yes |
| `BUSY` | Destination was busy. | Yes |
| `VOICEMAIL` | Voicemail picked up — the AI hung up (unless you set `voicemail_action`). | Yes |
| `ERROR` | The voice provider or carrier surfaced an explicit error after the call was accepted (routing, carrier, etc.). | The $0.541 settled when the call was accepted for dialing; there is no automatic refund. Email `care@blockrun.ai` with the `call_id` if an error leg should be credited. |
| `IN_PROGRESS` | Call hasn't ended yet — keep polling. | Already settled |

If you keep seeing `ended_by: USER` and want longer conversations, **update your `task`** to give the AI a clearer exit instruction:

```text
Call my friend Andy at +12133610872. Ask him whether he wants Italian or Sushi for dinner tonight. After he answers, confirm the restaurant choice back to him, then thank him politely and end the call. Do not keep talking past the answer.
```

Without an explicit "end the call after X" instruction, the AI tends to keep volunteering follow-up questions, and the callee — having already answered what they thought you wanted — hangs up first.

---

## SDK Usage

::::tabs

:::tab{label="TypeScript"}
```typescript
import { PhoneClient, VoiceClient } from '@blockrun/llm';

const phone = new PhoneClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });
const voice = new VoiceClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });

// 1) One-time setup: buy a number
const number = await phone.buyNumber({ country: 'US', areaCode: '415' });
console.log('Got number:', number.phone_number);

// 2) Place a call (uses the bought number automatically)
const call = await voice.call({
  to: '+12133610872',
  task: 'Call Andy and ask him politely to take a break. Be friendly. Hang up after he confirms.',
  max_duration: 3,
});

// 3) Poll until done (free)
let status;
do {
  await new Promise(r => setTimeout(r, 5000));
  status = await voice.getStatus(call.call_id);
} while (status.ended_by === 'IN_PROGRESS');

console.log('Call ended:', status.summary);
```
:::

:::tab{label="Python"}
```python
from blockrun_llm import PhoneClient, VoiceClient

phone = PhoneClient()
voice = VoiceClient()

# One-time: buy a number
number = phone.buy_number(country='US', area_code='415')

# Place a call
call = voice.call(
    to='+12133610872',
    task='Confirm the 7pm reservation for two under Vicky.',
    max_duration=2,
)

# Poll
import time
while True:
    status = voice.get_status(call['call_id'])
    if status['ended_by'] != 'IN_PROGRESS':
        break
    time.sleep(5)

print(status['summary'])
```
:::

:::tab{label="MCP"}
```text
Use blockrun_wallet to confirm I own a phone number, then use blockrun_phone to call +14155551234 and tell them I'll be 10 minutes late.
```

The `blockrun_phone` MCP tool ships with [BlockRun MCP](../mcp/blockrun-mcp.md) and handles the x402 settlement automatically.
:::

::::

---

## Use Cases

### 1. Reservation confirmer ($0.541 per restaurant)

Agent calls a restaurant to confirm a booking. Hangs up after confirmation.

### 2. Vendor price-check bot ($0.541 per vendor)

Procurement agent calls suppliers, reads off a SKU, asks for current price + lead time, logs the answer.

### 3. AI receptionist for your wallet's inbound (coming soon)

The wallet-owned numbers can also receive inbound calls — feature is in development. Track `awesome-blockrun/ROADMAP.md`.

### 4. Wellness check bot ($0.541)

Agent calls a family member on a schedule, has a short conversation, summarizes the call into a Slack message.

### 5. Pre-dial hygiene ($0.011)

Run `/v1/phone/lookup` on a number before calling it: skip landlines that can't take an AI conversation, or use `/lookup/fraud` to flag recently SIM-swapped numbers before an agent reads out anything sensitive.

---

## Pricing

| Action | Price | Notes |
|--------|-------|-------|
| Carrier lookup | $0.011 | `/v1/phone/lookup`; `/lookup/fraud` is $0.051 |
| Buy a number | $5.001 | 30-day lease, US default (other countries on request) |
| Renew | $5.001 | +30 days from the current expiry |
| List numbers | $0.002 | `/v1/phone/numbers/list` |
| Release a number | Free | `/v1/phone/numbers/release` |
| Place a call | $0.541 | Up to 30 min, default 5 min |
| Poll status / fetch transcript | Free | `GET /v1/voice/call/{id}` |

All prices include the flat $0.001 transaction fee and are settled in USDC on Base (or Solana) via x402. The exact amount is always in the `PAYMENT-REQUIRED` / `X-Payment-Required` header of the 402 (`accepts[0].amount`, in USDC micro-units — `541000` for a call).

### Why flat-rate for calls?

Competitors (StablePhone et al) charge $0.54 *per minute* — a 30-min call becomes $16+. BlockRun charges $0.541 *per call* regardless of length (up to the 30-min cap). The math:
- Short calls (<1 min, e.g. "is it open?"): we lose pennies, you win big.
- Long calls (15+ min): we eat the upstream per-minute cost, but the call cost is bounded for you.

This is intentional — autonomous agents need predictable per-action costs, not per-minute billing they have to model.

---

## Required Setup

1. **Fund your wallet with USDC on Base** — at least $5.55 covers one number + one call.
2. **Buy a number** — first call creates it under your wallet's ownership.
3. **Place a call** — uses your owned number as caller ID automatically.

The number is owned by **the wallet address that paid the buy x402**. Lose your wallet's private key, you lose the number after expiry.

---

## Limitations

- **Number provisioning**: US is the default and always works. Other countries are supported via the `country` parameter but typically require carrier regulatory (KYC) approval first — see [Country availability](#country-availability). Request a country via `care@blockrun.ai`.
- **Call destinations**: any international destination the voice stack supports — no geo restriction on the `to` (callee) field, only on the `from` (caller-ID) number. Emergency-services numbers are always refused.
- **Outbound only.** Inbound receive is on the roadmap.
- **30-min hard cap per call.** Longer dial-and-stay use cases require a custom integration.
- **Preset voices only.** Custom voice cloning is not available through the anonymous x402 flow yet.
- **No SMS.** Text messaging is intentionally not exposed (it requires sender registration that can't be done per-wallet).

---

## Error Handling

| Code | Description |
|------|-------------|
| 200 | Success — `X-Payment-Receipt` carries the settlement tx hash |
| 400 | `Invalid request body` — missing/short `to` or `task`, unknown keys, `max_duration` out of range; also `ambiguous_from`. Validated before payment, **not charged** |
| 402 | Payment required — sign and retry. Verification failures carry a machine-readable `code`: `PAYMENT_INVALID`, `PAYMENT_UNFUNDED`, or `PAYMENT_BLOCKHASH_STALE` (plus `message` / `details`); re-using an authorization returns `code: "PAYMENT_REPLAY"` — sign a fresh one per request |
| 403 | `no_active_number` / `Forbidden` (`reason`: `wrong_wallet`, `expired`, `not_found`) — buy, renew, or use a different `from`; also emergency-number destinations |
| 404 | Unknown `call_id` on poll; unknown `/v1/phone/<path>`; no numbers available for the requested country/area code; releasing a number not in the registry |
| 502 | Voice provider or carrier rejected the request (call initiation, number purchase, lookup 5xx) — **not charged** |
| 503 | Phone / voice integration not configured, or temporarily paused |

Upstream 4xx on lookups is forwarded with its original status. Upstream calls time out after 30 seconds (15 seconds for status polls) and surface as `502` / `500`, never charged.

---

## What's next?

::::cards

:::card{title="Text-to-Speech" href="text-to-speech.md" icon="Zap"}
Standalone voice synthesis and sound effects, billed per character.
:::

:::card{title="Rate Limits" href="rate-limits.md" icon="TrendingUp"}
How upstream telephony throttling surfaces as 429 / 502 — and why you're not charged.
:::

:::card{title="Error Handling" href="errors.md" icon="Code"}
The gateway-wide error envelope across all paid endpoints.
:::

::::

Also useful: [Phone & Voice service page](https://blockrun.ai/services/phone).
