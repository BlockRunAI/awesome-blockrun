# Modal Sandbox

Secure code runtime for AI agents. Create a sandbox session, execute commands, inspect outputs, and terminate — all via x402 payments.

## Why Agents Use It

AI agents that need to run code face a dilemma: executing on the host is unsafe, and provisioning cloud VMs is slow and expensive. Modal Sandbox gives agents a safe execution layer they can call on demand, keep alive across multiple steps, and tear down when the job is finished.

**A typical sandbox workflow costs $0.012:**
- 1 sandbox create ($0.01) — boot a Python container
- 1 exec ($0.001) — run the code
- 1 terminate ($0.001) — clean up

## Public Beta Limits

- Base only
- Managed Python 3.11 sandbox
- Up to 1 vCPU, 1 GiB RAM, 5 minute sandbox lifetime
- Custom images, GPU sandboxes, and `setup_commands` are not enabled on the public API yet

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/modal/sandbox/create` | POST | $0.01 | Create a managed sandbox session |
| `/api/v1/modal/sandbox/exec` | POST | $0.001 | Execute a command inside a running sandbox |
| `/api/v1/modal/sandbox/status` | POST | $0.001 | Check if a sandbox is running or terminated |
| `/api/v1/modal/sandbox/terminate` | POST | $0.001 | Terminate a sandbox and release resources |

---

## POST /api/v1/modal/sandbox/create

Create a managed Python 3.11 sandbox session with bounded resource and lifetime limits.

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | No | Managed image. Only `python:3.11` is currently available |
| `timeout` | integer | No | Sandbox lifetime in seconds, max 300 (default: 300) |
| `cpu` | number | No | CPU cores, max 1.0 (default: 1.0) |
| `memory` | integer | No | Memory in MB, max 1024 (default: 512) |

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
| `command` | array | Yes | Command as array, e.g. `["python", "-c", "print(1)"]` |
| `timeout` | integer | No | Execution timeout in seconds (default: 60) |

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

### Full session with payment

```bash
# 1. Create sandbox ($0.01)
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/create \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"image": "python:3.11", "timeout": 300}'

# 2. Execute code ($0.001)
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/exec \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"sandbox_id": "sb-xxx", "command": ["python", "-c", "print(2+2)"]}'

# 3. Terminate ($0.001)
curl -X POST https://blockrun.ai/api/v1/modal/sandbox/terminate \
  -H "Content-Type: application/json" \
  -H "x-payment: <x402_payment_token>" \
  -d '{"sandbox_id": "sb-xxx"}'
```

## Notes

- Sandboxes auto-terminate after the configured timeout (default: 5 minutes, max: 5 minutes)
- Sandbox creation may take 5-15 seconds depending on the image
- The `sandbox_id` is required for all subsequent operations — store it after creation
