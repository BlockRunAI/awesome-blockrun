---
title: Modal Sandbox
description: Secure on-demand code runtime for AI agents — create a sandbox, execute commands, inspect output, and terminate, paid per call in USDC over x402.
---

# Modal Sandbox

Secure code runtime for AI agents. Create a sandbox session, execute commands, inspect outputs, and terminate — all via x402 payments.

## Why Agents Use It

AI agents that need to run code face a dilemma: executing on the host is unsafe, and provisioning cloud VMs is slow and expensive. Modal Sandbox gives agents a safe execution layer they can call on demand, keep alive across multiple steps, and tear down when the job is finished.

**A typical short CPU sandbox workflow costs $0.015:**
- 1 sandbox create ($0.011) — boot a Python container
- 1 exec ($0.002) — run the code
- 1 terminate ($0.002) — clean up

Every price on this page includes the flat $0.001 transaction fee added to each
paid call.

:::warning{title="Public beta limits"}
- Base only
- Managed Python 3.11 image only — custom images and `setup_commands` are not enabled on the public API yet
- CPU sandboxes: up to 1 vCPU and 1 GiB RAM. GPU sandboxes (`gpu` set): up to 8 vCPU and 32 GiB RAM
- Sandbox lifetime (`timeout`): 10 s to 24 h. Up to 300 s is billed at the flat create price; anything longer is billed per hour of the *requested* lifetime, charged upfront, with no refund on early terminate
- `exec` commands are capped at 60 s per call
:::

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/modal/sandbox/create` | POST | from $0.011 (see [pricing](#create-pricing)) | Create a managed sandbox session |
| `/api/v1/modal/sandbox/exec` | POST | $0.002 | Execute a command inside a running sandbox |
| `/api/v1/modal/sandbox/status` | POST | $0.002 | Check if a sandbox is running or terminated |
| `/api/v1/modal/sandbox/terminate` | POST | $0.002 | Terminate a sandbox and release resources |

### Create pricing

`sandbox/create` is priced by the requested `timeout` and `gpu`. The 402
response tells you which mode applies (`price.model` is `"flat"` or
`"hourly"`; hourly quotes also carry `hourly_rate_usd`, `duration_hours` and
`refund_policy`).

| Sandbox | Flat rate (`timeout` ≤ 300 s) | Hourly rate (`timeout` > 300 s) |
|---------|-------------------------------|---------------------------------|
| CPU (no `gpu`) | $0.011 | $0.10 / hour |
| `T4` | $0.051 | $1.50 / hour |
| `L4` | $0.081 | $2.00 / hour |
| `A10G` | $0.101 | $2.50 / hour |
| `A100` | $0.201 | $4.00 / hour |
| `H100` | $0.401 | $8.00 / hour |

Hourly billing is exact, not rounded up — a 3600 s CPU sandbox is quoted at
`$0.1010` (one hour at $0.10 plus the $0.001 fee), and 1801 s on a `T4` is
1801/3600 × $1.50. The full requested duration is settled in one x402 payment
at create time whether or not you terminate early.

---

## POST /api/v1/modal/sandbox/create

Create a managed Python 3.11 sandbox session with bounded resource and lifetime limits.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | No | Managed image. Only `python:3.11` is currently available |
| `timeout` | integer | No | Sandbox lifetime in seconds, 10–86400 (default: 300). Above 300 switches to hourly billing |
| `cpu` | number | No | CPU cores, max 1.0 for CPU sandboxes, 8 with a `gpu` (default: 1.0) |
| `memory` | integer | No | Memory in MB, max 1024 for CPU sandboxes, 32768 with a `gpu` (default: 512) |
| `gpu` | string | No | GPU type: `T4`, `L4`, `A10G`, `A100` or `H100`. Omit for a CPU-only sandbox |

The body is validated strictly: unknown fields, a non-managed `image`, an
unsupported `gpu`, out-of-range values, or a non-empty `setup_commands` array
return `400` with the offending `path` in `details`.

### Response

```json
{
  "sandbox_id": "sb-SKt5nLL9syMDmcmMTMfhHP",
  "status": "running",
  "created_at": "2026-04-09T16:16:27.857471+00:00",
  "config": {
    "image": "python:3.11",
    "timeout": 60,
    "cpu": 1.0,
    "memory": 512,
    "gpu": null
  }
}
```

---

## POST /api/v1/modal/sandbox/exec

Execute a command inside a running sandbox session. Returns stdout, stderr, and the exit code.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sandbox_id` | string | Yes | Sandbox ID from `/sandbox/create` |
| `command` | array | Yes | Command as array, e.g. `["python", "-c", "print(1)"]` — at most 32 segments of up to 2000 characters each |
| `timeout` | integer | No | Execution timeout in seconds, 1–60 (default: 60) |

### Response

```json
{
  "sandbox_id": "sb-SKt5nLL9syMDmcmMTMfhHP",
  "stdout": "Hello from Modal! Python 3.11.15\n",
  "stderr": "",
  "returncode": 0
}
```

---

## POST /api/v1/modal/sandbox/status

Check whether a sandbox session is still running or has been terminated.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sandbox_id` | string | Yes | Sandbox ID from `/sandbox/create` |

### Response

```json
{
  "sandbox_id": "sb-SKt5nLL9syMDmcmMTMfhHP",
  "status": "running",
  "returncode": null
}
```

---

## POST /api/v1/modal/sandbox/terminate

Terminate a running sandbox session and release all resources. No-op if already terminated.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sandbox_id` | string | Yes | Sandbox ID from `/sandbox/create` |

### Response

```json
{
  "sandbox_id": "sb-SKt5nLL9syMDmcmMTMfhHP",
  "status": "terminated"
}
```

---

## Quick Start

### Get the price (no payment needed)

```bash
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/create \
  -H "Content-Type: application/json" \
  -d '{"image": "python:3.11"}'
# Returns: 402 with price and payment instructions
```

The signed requirements are in the `X-Payment-Required` / `PAYMENT-REQUIRED`
headers (and `WWW-Authenticate: X402 requirements="…"`); the body restates the
price and mirrors the challenge itself (`x402Version`, `accepts`) for clients
that only read the body:

```json
{
  "x402Version": 2,
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "amount": "11000", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300 }],
  "error": "Payment Required",
  "message": "This endpoint requires x402 payment",
  "endpoint": "/api/v1/modal/sandbox/create",
  "method": "POST",
  "description": "Create a managed Python 3.11 sandbox. …",
  "price": { "amount": "0.0110", "currency": "USD", "model": "flat" },
  "paymentInfo": { "network": "eip155:8453", "networkName": "Base", "asset": "USDC", "x402Version": 2 }
}
```

A `GET` on any `/api/v1/modal/*` path also returns a `402` — it is discovery
metadata listing the `available` endpoints; the real calls are all `POST`.

### Full session with payment

::::steps

:::step{title="Create the sandbox ($0.011)"}
```bash
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/create \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"image": "python:3.11", "timeout": 300}'
```
:::

:::step{title="Execute code ($0.002)"}
```bash
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/exec \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"sandbox_id": "sb-xxx", "command": ["python", "-c", "print(2+2)"]}'
```
:::

:::step{title="Terminate ($0.002)"}
```bash
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/terminate \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"sandbox_id": "sb-xxx"}'
```
:::

::::

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| `400` | Invalid JSON, or the body failed validation — `details` lists each issue with its `path` | No |
| `400`–`4xx` | The sandbox service rejected the request (for example an unknown `sandbox_id`). Upstream `4xx` codes are passed through with `error: "Bad Request"` and the upstream body in `details` | No |
| `402` | No payment header — body carries `price`, headers carry the signed requirements | No |
| `402` | `error: "Payment verification failed"` with a machine-readable `code`: `PAYMENT_INVALID`, `PAYMENT_UNFUNDED` (insufficient USDC or expired `validBefore`) or `PAYMENT_BLOCKHASH_STALE`; `message` explains the fix when one is known | No |
| `402` | `code: "PAYMENT_REPLAY"` — the payment authorization was already used. Sign a fresh one per request | No |
| `402` | `error: "Payment settlement failed"` — the sandbox call ran but settlement did not land; `details` has the reason | No |
| `404` | Unknown endpoint — body lists `available` paths | No |
| `502` | Sandbox service error or timeout (`"Payment was NOT charged."`) | No |
| `503` | Sandbox integration not configured or paused | No |

Payment settles only after a successful upstream response. Successful responses
carry `X-Payment-Receipt` (transaction hash) and `X-Payment-Response`.

Upstream timeouts: `create` waits up to 120 s for the sandbox to boot (the
requested lifetime does not extend this); `exec` waits the command `timeout`
plus 5 s, capped at 120 s; `status` and `terminate` wait 15 s.

## Notes

- Sandboxes auto-terminate after the configured `timeout` (default: 5 minutes, max: 24 hours)
- Sandbox creation may take 5-15 seconds depending on the image; GPU cold starts take longer
- The `sandbox_id` is required for all subsequent operations — store it after creation
- Responses are served with `Cache-Control: no-store`

## What's next?

::::cards

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Pair sandbox execution with an LLM to write, run, and debug code autonomously.
:::

:::card{title="Error handling" href="errors.md" icon="Code"}
Status codes and how the SDKs surface payment and runtime failures.
:::

::::
