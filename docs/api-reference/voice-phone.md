# Phone & Voice

Outbound AI voice calls and wallet-owned US/CA phone numbers — for AI agents. No telecom account, no Bland.ai signup, no Twilio dashboard. Your wallet *is* the phone account.

Powered by [Bland.ai](https://bland.ai) (voice AI) + [Twilio](https://twilio.com) (carrier numbers), with x402 settlement at every step.

## The Problem This Solves

An autonomous agent wants to call a restaurant to confirm a reservation, or call a vendor to verify a price. Traditionally that requires: a Twilio account, a Bland.ai account, KYC, a credit card, a long-lived API key, an outbound caller ID number you bought and manage, plus per-minute billing reconciliation.

BlockRun collapses all of it to two endpoints and one wallet:
1. `POST /v1/phone/numbers/buy` — $5, get a US/CA number for 30 days.
2. `POST /v1/voice/call` — $0.54, place an outbound call with an AI voice + Bland conversational task.

Wallet ownership is recorded in Firestore — only the wallet that bought a number can use it to place calls, and only that wallet can renew it.

---

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/phone/numbers/buy` | POST | **$5.00** | Provision a new US/CA number for the calling wallet (30-day lease) |
| `/api/v1/phone/numbers/renew` | POST | **$5.00** | Extend an active number's lease by 30 days |
| `/api/v1/phone/numbers/list` | POST | $0.001 | List the calling wallet's active numbers |
| `/api/v1/voice/call` | POST | **$0.54** | Place an outbound AI call (max 30 min, default 5 min) |
| `/api/v1/voice/call/{id}` | GET | **Free** | Poll call status / fetch transcript |

---

## POST /api/v1/phone/numbers/buy

Provisions a new US or Canada phone number from Twilio's catalog, registers ownership against the calling wallet's address, and grants a 30-day lease.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | No | `"US"` or `"CA"`. Default: `"US"` |
| `area_code` | string | No | Preferred US/CA area code (e.g. `"415"`, `"212"`). Best-effort — falls back to a random number in-country if none available. |

### Response

```json
{
  "phone_number": "+14155551234",
  "country": "US",
  "owner_wallet": "0xCC8c44AD3dc2A58D841c3EB26131E49b22665EF8",
  "expires_at": "2026-06-17T12:00:00Z",
  "transaction": "0xabcd...1234"
}
```

The returned `phone_number` can be used immediately as the `from` field on `POST /v1/voice/call`. After `expires_at`, the number is reclaimed and re-pooled (call `renew` before that to keep it).

---

## POST /api/v1/phone/numbers/renew

Extends an active number's lease by 30 days. **Only the original owner wallet can renew.**

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone_number` | string | Yes | E.164 format (e.g. `"+14155551234"`) |

### Response

```json
{
  "phone_number": "+14155551234",
  "expires_at": "2026-07-17T12:00:00Z",
  "transaction": "0xabcd...1234"
}
```

### Errors

- `403 wrong_wallet` — the calling wallet doesn't own this number. Response body includes `actualOwner` and `your_active_numbers` (the numbers your wallet *does* own).

---

## POST /api/v1/phone/numbers/list

Returns the list of active phone numbers owned by the calling wallet (identity revealed via the x402 payer field).

### Response

```json
{
  "wallet": "0xCC8c44...665EF8",
  "numbers": [
    {
      "phone_number": "+14155551234",
      "country": "US",
      "expires_at": "2026-06-17T12:00:00Z",
      "days_remaining": 28
    }
  ],
  "transaction": "0xabcd...1234"
}
```

---

## POST /api/v1/voice/call

Places an outbound AI conversation call. The AI voice agent dials the destination, follows the `task` you give it, and returns when the call ends (or hits the duration cap).

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone_number` | string | Yes | Destination in E.164 (e.g. `"+12133610872"`) |
| `task` | string | Yes | Free-text instructions for the AI — what to say, what to ask, when to hang up |
| `from` | string | No | Your wallet-owned BlockRun number (E.164). Omit if your wallet owns exactly one — it's used automatically. If you own multiple, this is required (otherwise `400 ambiguous_from`). If you own none, `403` with buy hint. |
| `voice` | string | No | Voice ID — see [Bland voice catalog](https://bland.ai/voices) |
| `language` | string | No | ISO 639-1 (`"en"`, `"es"`, `"zh"`, etc.) |
| `max_duration` | integer | No | Max call duration in minutes. Default: `5`. Cap: `30`. |
| `first_sentence` | string | No | Exact opener — overrides AI's default greeting |
| `wait_for_greeting` | boolean | No | Wait for callee to speak first before AI starts (useful for IVRs). Default: `false` |
| `interruption_threshold` | integer | No | Milliseconds of silence before AI can interrupt. Default: `100` |

### Response

```json
{
  "call_id": "01HXY9...",
  "from": "+14155551234",
  "to": "+12133610872",
  "status": "started",
  "expected_duration_minutes": 5,
  "transaction": "0xabcd...1234"
}
```

The call is asynchronous — `status: "started"` means dialing is in progress. Poll `GET /v1/voice/call/{call_id}` to track progress.

### Errors

- `403 no_owned_numbers` — your wallet hasn't bought a number yet. Buy one at `/v1/phone/numbers/buy`.
- `403 wrong_wallet` — you passed a `from` you don't own. Response includes `your_active_numbers`.
- `400 ambiguous_from` — wallet owns multiple numbers; specify `from` explicitly.

---

## GET /api/v1/voice/call/{call_id}

Poll for call status, transcript, and final outcome. **Free** — no payment required.

### Response

```json
{
  "call_id": "01HXY9...",
  "from": "+14155551234",
  "to": "+12133610872",
  "status": "completed",
  "answered_by": "human",
  "duration_seconds": 142,
  "ended_reason": "user_hangup",
  "summary": "Called Andy to ask him to take a break. Andy agreed and said he'd log off at 6pm.",
  "transcript": [
    { "role": "assistant", "text": "Hi Andy, this is Vicky's assistant calling..." },
    { "role": "user", "text": "Oh hey, what's up?" }
  ],
  "recording_url": "https://..."
}
```

`status` values: `started`, `ringing`, `in-progress`, `completed`, `failed`, `no_answer`, `busy`.

---

## SDK Usage

### TypeScript

```typescript
import { LLMClient } from '@blockrun/llm';

const client = new LLMClient({ privateKey: process.env.BASE_CHAIN_WALLET_KEY });

// 1) One-time setup: buy a number
const number = await client.phoneBuy({ country: 'US', area_code: '415' });
console.log('Got number:', number.phone_number);

// 2) Place a call (uses the bought number automatically)
const call = await client.voiceCall({
  phone_number: '+12133610872',
  task: 'Call Andy and ask him politely to take a break. Be friendly. Hang up after he confirms.',
  max_duration: 3,
});

// 3) Poll until done (free)
let status;
do {
  await new Promise(r => setTimeout(r, 5000));
  status = await client.voiceCallStatus(call.call_id);
} while (status.status === 'started' || status.status === 'in-progress');

console.log('Call ended:', status.summary);
```

### Python

```python
from blockrun_llm import LLMClient

client = LLMClient()

# One-time: buy a number
number = client.phone_buy(country='US', area_code='415')

# Place a call
call = client.voice_call(
    phone_number='+12133610872',
    task='Confirm the 7pm reservation for two under Vicky.',
    max_duration=2,
)

# Poll
import time
while True:
    status = client.voice_call_status(call['call_id'])
    if status['status'] in ('completed', 'failed', 'no_answer', 'busy'):
        break
    time.sleep(5)

print(status['summary'])
```

### MCP (Claude Code / OpenClaw)

```text
Use blockrun_wallet to confirm I own a phone number, then use the BlockRun voice tool to call +14155551234 and tell them I'll be 10 minutes late.
```

(Voice MCP tools may ship under different names — check the BlockRun MCP tool list.)

---

## Use Cases

### 1. Reservation confirmer ($0.54 per restaurant)

Agent calls a restaurant to confirm a booking. Hangs up after confirmation.

### 2. Vendor price-check bot ($0.54 per vendor)

Procurement agent calls suppliers, reads off a SKU, asks for current price + lead time, logs the answer.

### 3. AI receptionist for your wallet's inbound (coming soon)

The wallet-owned numbers can also receive inbound calls — feature is in development. Track `awesome-blockrun/ROADMAP.md`.

### 4. Wellness check bot ($0.54)

Agent calls a family member on a schedule, has a short conversation, summarizes the call into a Slack message.

---

## Pricing

| Action | Price | Notes |
|--------|-------|-------|
| Buy a number | $5.00 | 30-day lease, US or CA |
| Renew | $5.00 | +30 days |
| Place a call | $0.54 | Up to 30 min, default 5 min |
| Poll status / fetch transcript | Free | `GET /v1/voice/call/{id}` |

All settled in USDC on Base (or Solana) via x402.

### Why flat-rate for calls?

Competitors (StablePhone et al) charge $0.54 *per minute* — a 30-min call becomes $16+. BlockRun charges $0.54 *per call* regardless of length (up to the 30-min cap). The math:
- Short calls (<1 min, e.g. "is it open?"): we lose pennies, you win big.
- Long calls (15+ min): we eat the upstream Bland cost, but the call cost is bounded for you.

This is intentional — autonomous agents need predictable per-action costs, not per-minute billing they have to model.

---

## Required Setup

1. **Fund your wallet with USDC on Base** — at least $5.55 covers one number + one call.
2. **Buy a number** — first call creates it under your wallet's ownership.
3. **Place a call** — uses your owned number as caller ID automatically.

The number is owned by **the wallet address that paid the buy x402**. Lose your wallet's private key, you lose the number after expiry.

---

## Limitations

- **US and CA only** for now. International numbers + international destinations coming later.
- **Outbound only.** Inbound receive is on the roadmap.
- **30-min hard cap per call.** Longer dial-and-stay use cases require a custom integration.
- **One Bland voice model per call.** Custom voice cloning requires upstream Bland account (we can't pass that through anonymously yet).

---

## Error Handling

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request — missing E.164, invalid `from`, task too short, `ambiguous_from` |
| 402 | Payment required — sign and retry |
| 403 | `no_owned_numbers` / `wrong_wallet` — buy or use a different `from` |
| 404 | Unknown `call_id` on poll |
| 429 | Upstream rate limit (Bland or Twilio) — `Retry-After` header set, **not charged** |
| 502 | Upstream Bland/Twilio error — **not charged** |

---

## Links

- [Phone & Voice marketplace page](https://blockrun.ai/marketplace/phone)
- [Bland.ai (upstream voice)](https://bland.ai)
- [Rate Limits](rate-limits.md)
- [Error Handling](errors.md)
