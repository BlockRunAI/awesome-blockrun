---
title: Enterprise API
description: API-key access to every BlockRun model and service on api.blockrun.ai — Bearer auth, prepaid or invoiced credit, and endpoints to read your balance and usage programmatically.
---

# Enterprise API

The Enterprise API is the same gateway as the x402 API, reached with an **API key instead of a wallet**. You sign in at [user.blockrun.ai](https://user.blockrun.ai), mint a key, fund the account (prepaid credit or a monthly invoice), and every call is metered against that account.

Everything the x402 docs describe for `/v1/*` — chat completions, images, video, music, speech, search, prediction markets, RPC — works unchanged. The differences are the host, the header, and four extra endpoints for reading your own account.

One place this host is ahead of those docs: **reference video/audio** (`reference_videos` / `reference_audios` on `POST /v1/videos/generations`, Seedance 2.0 family) is on by default here, not "gated off". Each clip adds a per-clip surcharge to the duration quote; the `202` body's `price.amount` is the exact amount held and settled. Reference URLs must be `http(s)`; a `role` other than `"reference"` is refused; a model without the capability answers `400`; and when the operator has disabled the feature the POST answers `503` with `Retry-After` while jobs already submitted stay pollable.

:::tip{title="Base URL"}
```
https://api.blockrun.ai/v1
```
Not `blockrun.ai` (that host is x402-only) and not `user.blockrun.ai` (that host is the dashboard — `/v1/*` there returns a `wrong_host` error pointing you back here).
:::

## Authentication

Every request carries the key as a Bearer token. Keys are minted in the dashboard under **Keys** and start with `brk_live_`; the first 14 characters are the key's display prefix, which is how the dashboard and `/v1/usage/summary` refer to it.

```bash
curl https://api.blockrun.ai/v1/chat/completions \
  -H "Authorization: Bearer brk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-5.5", "messages": [{"role": "user", "content": "hello"}]}'
```

Any OpenAI-compatible SDK works by pointing its base URL at `https://api.blockrun.ai/v1` and its API key at your `brk_live_` key:

```python
from openai import OpenAI

client = OpenAI(base_url="https://api.blockrun.ai/v1", api_key="brk_live_...")
client.chat.completions.create(model="openai/gpt-5.5", messages=[{"role": "user", "content": "hello"}])
```

A missing or unknown key returns `401`:

```json
{"error": {"message": "Invalid API key", "type": "authentication_error", "code": "invalid_api_key"}}
```

## Account endpoints

Four `GET` endpoints answer questions about the key you are holding. They are **free**, never counted against your rate limit as paid traffic, and **never cached** — the balance you read is the balance the next call is gated on.

| Endpoint | Answers |
|----------|---------|
| `GET /v1/credits` | How much is left, and whether the next call will be refused |
| `GET /v1/account` | Same payload as `/v1/credits` |
| `GET /v1/usage/summary` | Totals over a window, broken down by day, model, endpoint and key |
| `GET /v1/usage` | The row-level ledger, newest first, paginated |

### `GET /v1/credits` — balance

```bash
curl https://api.blockrun.ai/v1/credits -H "Authorization: Bearer brk_live_..."
```

```json
{
  "object": "credit_balance",
  "account_id": "u-3f9c…",
  "billing_mode": "prepaid",
  "currency": "USD",
  "granted_usd": 500,
  "spent_usd": 137.42,
  "remaining_usd": 362.58,
  "blocked": false,
  "blocked_reason": null
}
```

| Field | Meaning |
|-------|---------|
| `billing_mode` | `prepaid` — bounded by credit you have paid for. `postpaid` — invoiced monthly, bounded by an agreed credit limit. `ungated` — no ceiling. |
| `granted_usd` | Credit granted to the account, lifetime. |
| `spent_usd` | Spend settled against it, lifetime. |
| `remaining_usd` | What the gate will still allow. **`null` means no ceiling** (an `ungated` account, or a `postpaid` account with no limit set). Render `null` as "unlimited", never as zero. |
| `blocked` | What the gateway would do with your **next** paid call. Read this rather than comparing the numbers yourself — it also covers suspension and the daily cap, which the numbers do not show. |
| `blocked_reason` | Set when `blocked` is `true`: one of the codes in [Refusals](#refusals) below. |

`/v1/account` returns exactly the same object; use whichever name reads better in your code.

:::info{title="Balance is the only limit on paid calls"}
Paying accounts carry **no practical requests-per-minute quota** on this gateway — the balance is the bound (see [Rate limits](#rate-limits)). That is why this endpoint exists: a client that cannot read its balance meets the limit as a surprise `402`. Poll it before a batch, and show `remaining_usd` in your CLI.
:::

### `GET /v1/usage/summary` — totals over a window

```bash
curl "https://api.blockrun.ai/v1/usage/summary?window=7d" -H "Authorization: Bearer brk_live_..."
```

| Query | Values | Default |
|-------|--------|---------|
| `window` | `today`, `24h`, `7d`, `30d` | `30d` |
| `from`, `to` | ISO 8601 date or date-time (UTC). Override `window`; `to` is exclusive and never in the future; at most 400 days apart. | — |

```json
{
  "object": "usage_summary",
  "window": {
    "from": "2026-09-07T00:00:00.000Z",
    "to": "2026-09-13T18:22:05.000Z",
    "preset": "7d",
    "timezone": "UTC",
    "day_aligned": false
  },
  "totals": { "usd": 41.17, "calls": 1284, "tokens": 9412330, "unpriced_calls": 0 },
  "per_day": [{ "date": "2026-09-07", "usd": 5.91, "calls": 190 }],
  "per_model": [{ "model": "openai/gpt-5.5", "calls": 900, "usd": 30.02, "input_tokens": 7100000, "output_tokens": 640000 }],
  "per_endpoint": [{ "path": "/v1/chat/completions", "calls": 1200, "usd": 39.10, "unpriced": 0 }],
  "per_key": [{ "key_prefix": "brk_live_Ab3xQ", "calls": 1284, "usd": 41.17, "unpriced": 0 }],
  "last_call_at": "2026-09-13T18:20:41.118Z",
  "unavailable_days": [],
  "counted_through": null
}
```

`today`, `7d` and `30d` start at 00:00 UTC (a 7-day window is today plus the six previous days); `24h` is a rolling day. `unpriced_calls` counts rows whose charge is still being computed and will move into `usd` once settled. `unavailable_days` names any day the ledger could not be read — it is listed, never silently counted as zero. `counted_through` is `null` when the figures run through now; otherwise it is the moment they are exact through — on a very busy account a read folds a bounded slice of today's newest records and stops, and the rest arrives within minutes. Treat a non-null value as "today is partial past this time", not as a day missing.

### `GET /v1/usage` — the ledger

```bash
curl "https://api.blockrun.ai/v1/usage?window=24h&limit=100" -H "Authorization: Bearer brk_live_..."
```

| Query | Values | Default |
|-------|--------|---------|
| `window` | same presets as `/v1/usage/summary` | last 30 days |
| `from`, `to` | ISO 8601; override `window` | — |
| `limit` | 1 – 500 | 50 |
| `cursor` | the `next_cursor` from the previous page | — |

```json
{
  "object": "list",
  "data": [
    {
      "request_id": "6664f0c1-362f-48a5-9da8-e0e6b36c30d3",
      "timestamp": "2026-09-13T18:20:41.118Z",
      "endpoint": "/v1/chat/completions",
      "model": "openai/gpt-5.5",
      "job_id": null,
      "job_status": null,
      "kind": "chat",
      "input_tokens": 812,
      "output_tokens": 240,
      "cache_creation_tokens": 0,
      "cache_read_tokens": 0,
      "usage_unit": null,
      "usage_units": null,
      "cost_usd": 0.0041,
      "cost_state": "priced",
      "service_tier": "flex",
      "status": 200
    }
  ],
  "next_cursor": "MjAyNi0wOS0xM1Qx…",
  "unavailable_days": []
}
```

Rows are newest first. Page with `cursor` until `next_cursor` is `null`; treat the cursor as opaque.

| Field | Meaning |
|-------|---------|
| `kind` | `chat` — a token-priced call you can re-derive from `input_tokens`/`output_tokens` and the [published rate](../products/intelligence/pricing.md) as adjusted by [what a call costs](#what-a-call-costs). `service` — a per-call or per-unit price (search, media, RPC) that only the gateway holds. |
| `cost_state` | `priced` — final. `free` — nothing to charge (a catalogue read, a free model). `pending` — usage recorded, charge not yet settled; it will change, do not treat it as $0. |
| `service_tier` | The processing tier the upstream reported for this call. `flex` is billed at **half** the standard rate, so this is what explains a half-price line against the published rate. Absent means standard — as it is on every row before 2026-09-23 and for every provider that reports no tier. See [What a call costs](#what-a-call-costs). |
| `job_id`, `job_status` | Media only. A `202` create and every later poll of the same job share one `job_id`; the charge lands on the poll that completed. Fold rows by `job_id` to get one line per generation. |
| `usage_unit`, `usage_units` | For non-token charges: what was billed (`image`, `second`, `character` …) and how many. `null` on token-priced rows. |
| `billing_basis`, `image_input_tokens` | `token` on an OpenAI image row (`openai/gpt-image-2`, `gpt-image-2.5-*`): a `service` by path, but one you can rebuild — `input_tokens`/`output_tokens` at OpenAI's published per-million rates, `image_input_tokens` being the slice of input at the image-input rate. Absent on every other row. See [Images from OpenAI are billed by token](#images-from-openai-are-billed-by-token). |
| `correction_of` | `null` on a normal row. When set, this row corrects the row whose `request_id` it names: its token and cost fields are signed **deltas** against that row, and it is not a call. Sum `cost_usd` including these; count calls excluding them. |

Pass the `request_id` from a row (also returned on every response as the `x-blockrun-request-id` header) when you contact support about a charge.

## What a call costs

**The base rate** is what `GET /v1/models` publishes for the model you called: `input` and `output` per million tokens, plus `cache_read` / `cache_write` on the models that have them. The account endpoints above, the catalogue reads and the free models cost nothing.

**There is no per-call fee and no minimum charge on this host.** The x402 transaction fee and the minimum payment exist to make on-chain micropayments viable; a key-metered account settles against credit, not a chain, so both are zero here. You pay metered usage times the rate, and nothing is added to it.

Two things move the rate away from the flat number on the catalogue. Both are visible on the ledger row, so any line you cannot reconcile against the published rate is explained by one of them.

### Long context

Some models reprice above a prompt-token threshold, and **the whole request reprices** — not only the tokens above the line. OpenAI's threshold is 272K, charged at 2× input and 1.5× output for the entire call; other makers set their own, and whether a prompt of exactly the threshold already counts as long differs by maker too.

The thresholds and the long-context rates are per model on the gateway's sheet, `GET https://blockrun.ai/api/pricing`, as the `longContextThreshold`, `longContextThresholdInclusive` and `longContext*Price` fields — 22 models carry them today. Where a catalog row from `GET /v1/models` carries `pricing.long_context`, it is the same ladder in the same order: a list of steps, so read the last one whose threshold your prompt cleared. A model that reprices more than once (some do) has more than one entry, and pricing off the first would put you under water above the second.

### Flex

Send `service_tier: "flex"` and the call is billed at **half** the standard rate when the upstream serves it at that tier — half on input, output, cached read and cached write alike, and half the long-context rate above the threshold. Flex queues behind priority traffic, so it is slower on purpose: OpenAI's own SDKs default to a ten-minute timeout for it, and you should raise your client timeout to match.

Flex is opt-in. A request that does not carry `service_tier: "flex"` is served and billed at the standard rate; nothing is silently moved onto the slower tier, and nothing is silently discounted.

Four things worth knowing before you build on it:

- **We bill from the tier the response reports, not from the tier you asked for.** Asking is not receiving, and the charge follows what actually happened.
- **An explicit Flex ask is never silently downgraded.** When the upstream has no Flex capacity it answers `429` with `resource_unavailable`; that response carries no usage, so nothing is metered. Retry with backoff, or drop `service_tier` to take standard processing at the standard rate.
- **Availability is the model provider's decision, and it is a limited beta.** OpenAI publishes the current list on the flex tab of their own pricing page; a model that does not offer Flex either rejects `service_tier` outright or serves the call at standard rates and bills accordingly. A model whose `openai/` id is served through a partner pool — the `-pro` tiers — is billed at standard rates whatever tier ran upstream, because the discount is not one we receive and so not one we can pass on.
- **`service_tier` on every `GET /v1/usage` row is how you confirm it.** `flex` on the row means that line was billed at half. Absent means standard, which is also the case for every row before 2026-09-23 and for every provider that reports no tier at all.

### If your account has negotiated terms

The two tiers interact with a contract differently, and deliberately so:

- An **absolute agreed price** per million **suppresses** both tiers. The long-context and Flex rates are not part of what was agreed, so layering them on either charges more or discounts more than the contract says.
- A **percentage discount** **follows** both tiers. A percentage is off whatever you would otherwise pay, and the tier is part of what you would otherwise pay.

## Images from OpenAI are billed by token

`openai/gpt-image-2`, `openai/gpt-image-2.5-flare` and `openai/gpt-image-2.5-sunburst` are metered the way OpenAI meters them — text input, image input and image output tokens at OpenAI's published per-million rates (times your contract margin, or under your provider discount), never a flat per-image price. The response says so:

```json
"price": {
  "amount": "0.006120", "currency": "USD", "basis": "per_token",
  "tokens": { "text_input": 48, "image_input": 0, "output": 196 },
  "rates_per_million": { "text_input": 5, "image_input": 8, "output": 30 }
},
"usage": { "input_tokens": 48, "output_tokens": 196, "total_tokens": 244 }
```

`amount` closes on `tokens × rates_per_million`; `usage` is OpenAI's own report, passed through. What a single image can cost is bounded by the per-size figure `GET /v1/images/models` lists as `max_per_image` — that is the amount reserved against your balance before generation, and the charge settles at the token figure once the image is delivered. `quality` is what moves the number: a `low` 1024×1024 is a few hundred output tokens, a `max` one several thousand.

Every other image model (Google, xAI, Z.ai, ByteDance) is billed per image, as its `price.basis: "per_image"` says.

## Refusals

A key whose account cannot pay is refused **before** the call goes upstream, so nothing is charged. The same code appears in `blocked_reason` on `/v1/credits`, so you can check ahead of time.

| Status | `code` | Meaning | Clears when |
|--------|--------|---------|-------------|
| `402` | `BALANCE_EXHAUSTED` | Prepaid credit is spent. | Credit is added in the dashboard. |
| `402` | `CREDIT_LIMIT_REACHED` | Postpaid limit reached. | The limit is raised. |
| `402` | `DAILY_SPEND_CAP` | Your account's opt-in daily cap fired — usually a leaked key or a runaway loop. | Midnight UTC, or support raises the cap. |
| `403` | `ACCOUNT_SUSPENDED` | Account frozen. | Support. |

```json
{"error": {"message": "Balance exhausted — add credit to continue", "type": "insufficient_quota", "code": "BALANCE_EXHAUSTED"}}
```

One exception: **free models** (`billing_mode: "free"` in `GET /v1/models`) keep working on an account that is only `BALANCE_EXHAUSTED`. A suspended or capped account is refused for everything.

Concurrent requests see each other: the worst-case cost of each in-flight call is reserved against the balance before it goes upstream, so ten calls arriving together against $1 of credit stop at $1 rather than all passing the same stale check.

## Rate limits

- **Paid calls on a funded account**: the balance is the bound. There is a per-key safety ceiling of 12,000 requests/minute that exists only to stop one burst degrading a shared upstream; you will meet the provider's own limit (`429` with `Retry-After`) long before it.
- **Free discovery** (`GET /v1/models`, `/v1/images/models`, `/v1/audio/voices`, the account endpoints) and **accounts with no billing terms**: 600 requests/minute per key, in a bucket separate from paid traffic, returned as `429` with `code: "rate_limit_exceeded"` and a `Retry-After` header.

## Errors

The envelope is OpenAI's. `code` is the field to switch on.

| Status | `code` | When |
|--------|--------|------|
| `400` | `invalid_json_body` | Body is not JSON |
| `400` | `invalid_parameter` | A bad `window`, `from`, `to` on the usage endpoints — `param` names it |
| `400` | `unpriceable_request` | The `model` is not one this service publishes; the message names the catalogue to check |
| `401` | `invalid_api_key` | Missing or unknown key |
| `402` / `403` | see [Refusals](#refusals) | |
| `404` | `unsupported_endpoint` | Not a `/v1` path the gateway serves |
| `404` | `wrong_host` | You called `user.blockrun.ai/v1/*` or `api.blockrun.ai/` outside `/v1` |
| `413` | `request_too_large` | Body over the size limit named in the message |
| `429` | `rate_limit_exceeded` | Per-key limit on free discovery |
| `502` | `upstream_unavailable`, `empty_upstream_response` | Provider fault; nothing charged; retry |

Every response carries `x-blockrun-request-id`. Quote it in support requests.

Three request-id headers can appear on a response, and they name three different hops:

| Header | Names |
|--------|-------|
| `x-blockrun-request-id` | This call, at this API. Always present. The `request_id` on your ledger row, and the id to quote to us. |
| `x-blockrun-gateway-request-id` | The routing hop behind this API. Present on routed calls; we store it beside your row, so you do not need to. |
| `x-request-id` (OpenAI-style) / `request-id` (Anthropic-style) | The model provider's own id for the call, when the provider returned one. This is the id to quote to the provider if you take a question to them directly. On a response with no provider hop (a `401`, a `404`, a refusal) it falls back to `x-blockrun-request-id`. |

## Dashboard

[user.blockrun.ai/dashboard](https://user.blockrun.ai/dashboard) shows the same balance and ledger these endpoints return, and is where you mint and revoke keys, add credit, and set a daily spend cap. The API is the source of truth for automation; the dashboard is a view of the same numbers.
