---
title: Enterprise API
description: API-key access to every BlockRun model and service on api.blockrun.ai — Bearer auth, prepaid or invoiced credit, and endpoints to read your balance and usage.
---

# Enterprise API

The Enterprise API is the same gateway as the x402 API, reached with an **API key instead of a wallet**. You sign in at [user.blockrun.ai](https://user.blockrun.ai), mint a key, fund the account (prepaid credit or a monthly invoice), and every call is metered against that account.

Everything the x402 docs describe for `/v1/*` — chat completions, images, video, music, speech, search, prediction markets, RPC — works unchanged. The differences are the host, the header, and four extra endpoints for reading your own account.

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
  "unavailable_days": []
}
```

`today`, `7d` and `30d` start at 00:00 UTC (a 7-day window is today plus the six previous days); `24h` is a rolling day. `unpriced_calls` counts rows whose charge is still being computed and will move into `usd` once settled. `unavailable_days` names any day the ledger could not be read — it is listed, never silently counted as zero.

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
| `kind` | `chat` — a token-priced call you can re-derive from `input_tokens`/`output_tokens` and the [published rate](../products/intelligence/pricing.md). `service` — a per-call or per-unit price (search, media, RPC) that only the gateway holds. |
| `cost_state` | `priced` — final. `free` — nothing to charge (a catalogue read, a free model). `pending` — usage recorded, charge not yet settled; it will change, do not treat it as $0. |
| `job_id`, `job_status` | Media only. A `202` create and every later poll of the same job share one `job_id`; the charge lands on the poll that completed. Fold rows by `job_id` to get one line per generation. |
| `usage_unit`, `usage_units` | For non-token charges: what was billed (`image`, `second`, `character` …) and how many. `null` on token-priced rows. |

Pass the `request_id` from a row (also returned on every response as the `x-blockrun-request-id` header) when you contact support about a charge.

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

## Dashboard

[user.blockrun.ai/dashboard](https://user.blockrun.ai/dashboard) shows the same balance and ledger these endpoints return, and is where you mint and revoke keys, add credit, and set a daily spend cap. The API is the source of truth for automation; the dashboard is a view of the same numbers.
