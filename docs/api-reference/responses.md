---
title: Responses API
description: OpenAI-native Responses API endpoint — the protocol Codex CLI and modern agent frameworks speak, paid per request in USDC over x402.
---

# Responses API

`POST /v1/responses` is a drop-in replacement for `api.openai.com/v1/responses` — the native protocol for Codex CLI and agents that need **tools + reasoning together** on GPT-5.x (a combination OpenAI rejects on `/v1/chat/completions`). Same body shape, same response bytes, same SSE event stream; you pay per request in USDC over x402 instead of with an API key.

If your client speaks Chat Completions, use [Chat Completions](chat-completions.md) instead — both endpoints serve the same models at the same prices.

## Endpoint

```
POST https://blockrun.ai/api/v1/responses
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `PAYMENT-SIGNATURE` | Conditional | Base64-encoded x402 payment payload (required after 402, x402 v2). `X-Payment` is accepted as an alias |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | OpenAI model ID (e.g., `gpt-5.5`, `openai/gpt-5.4-pro`, `gpt-5.3-codex`) |
| `input` | string \| array | Yes | A prompt string, or an array of Responses input items (messages, `function_call_output`, reasoning replays, …) |
| `instructions` | string | No | System/developer instructions |
| `max_output_tokens` | integer | No | Maximum tokens to generate. Defaults to the model's `max_output` when omitted, and is clamped to it — it bounds the x402 quote, so set it deliberately |
| `stream` | boolean | No | Stream native Responses SSE events (default: `false`) |
| `tools` | array | No | Responses tool definitions — works together with `reasoning` on all GPT-5.x models |
| `tool_choice` | string \| object | No | Tool selection strategy |
| `reasoning` | object | No | Reasoning config, e.g. `{"effort": "high"}` |
| `include` | array | No | Extra output fields, e.g. `["reasoning.encrypted_content"]` for reasoning continuity across turns |
| `text` | object | No | Output format options (`json_object`, `json_schema`, verbosity) |
| `temperature` / `top_p` | number | No | Sampling parameters (legacy models only; reasoning models ignore/reject them upstream) |

### Stateless gateway — what is different from OpenAI

BlockRun's upstream calls run under shared credentials, so server-side state is disabled. `store: false` is **enforced** on every request, and these parameters are rejected with a `400` (`invalid_request_error`):

| Parameter | Why |
|-----------|-----|
| `store: true` | Responses are never retained upstream |
| `previous_response_id` | No stored responses to reference — resend full context in `input` |
| `conversation` | No server-side conversation state |
| `prompt` | No stored prompt templates |

This is the same model Codex CLI uses by default (`store: false` + full-context resend). For reasoning continuity across turns, request `include: ["reasoning.encrypted_content"]` and replay the returned reasoning items in the next call's `input`.

`background: true` is accepted only for enterprise-allowlisted wallets (`403` otherwise) and cannot be combined with `stream: true`: create the response non-streaming, it returns immediately with `status: "queued"`, then attach with `GET /v1/responses/{id}?stream=true` (resume after a disconnect with `&starting_after=<sequence_number>`) or cancel with `POST /v1/responses/{id}/cancel`. The signed quote is settled at create time. Everyone else: keep generations inside one HTTP exchange.

Missing `model`, or a body with neither `input` nor `instructions`, is a `400`. A non-OpenAI or free model id is a `400` pointing you to `/v1/chat/completions`.

## Supported models

All paid OpenAI models: GPT-5.x (including `-pro` tiers), o-series, and the codex family. `GET /v1/models` lists current IDs and prices; the `openai/` prefix is optional. Other providers (Claude, Gemini, DeepSeek, …) are served via [Chat Completions](chat-completions.md) and the Anthropic-compatible `POST /api/v1/messages` endpoint.

## Payment flow

Identical to Chat Completions: send the request without payment, receive a `402` with a USDC quote, sign the x402 authorization, and resend with the `PAYMENT-SIGNATURE` header. The [SDKs](../getting-started/sdk-developers.md) handle this automatically.

The quote is estimated input tokens plus **10% of `max_output_tokens`** at the model's list rates (per-token chat carries no platform margin), floored at $0.001, plus the flat **$0.001 transaction fee** — so the smallest possible charge is $0.002. The `402` body uses the OpenAI error envelope:

```json
{
  "x402Version": 2,
  "accepts": [{"scheme": "exact", "network": "eip155:8453", "amount": "24685", "asset": "0x8335…", "payTo": "0x…", "maxTimeoutSeconds": 300}],
  "error": {"message": "This endpoint requires x402 payment", "type": "payment_required", "param": null, "code": null},
  "price": {"amount": "0.024685", "currency": "USD"},
  "paymentInfo": {"network": "base", "asset": "USDC", "x402Version": 2}
}
```

The signed requirements are in the `X-Payment-Required` / `PAYMENT-REQUIRED` / `WWW-Authenticate` headers; the header amount is authoritative and includes the transaction fee, and the body `price.amount` quotes the same fee-inclusive number. `x402Version`/`accepts` at the top of the body mirror that header challenge for clients that only read the body — they sit alongside the OpenAI-shaped `error` object, not inside it. A payment that fails verification is a `402` in the same OpenAI envelope — `"Payment verification failed: …"` — and a reused authorization is `402` `"Payment authorization already used — sign a fresh authorization for each request."`; this endpoint keeps OpenAI's error schema rather than the `code` field the native BlockRun endpoints carry. Nothing is charged on either.

## Examples

### Non-streaming

```bash
curl https://blockrun.ai/api/v1/responses \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-x402-payload>" \
  -d '{
    "model": "gpt-5.2",
    "input": "Explain x402 in one sentence.",
    "max_output_tokens": 200
  }'
```

### Tools + reasoning (the combination Chat Completions rejects)

```bash
curl https://blockrun.ai/api/v1/responses \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-x402-payload>" \
  -d '{
    "model": "gpt-5.4",
    "input": "What is the weather in SF? Use the tool.",
    "reasoning": {"effort": "high"},
    "tools": [{
      "type": "function",
      "name": "get_weather",
      "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }]
  }'
```

### Streaming

Set `"stream": true` and consume native Responses SSE events (`response.created`, `response.output_text.delta`, …, `response.completed`). The stream is piped through byte-for-byte, so the official OpenAI SDK's event parsing works unchanged.

## Response

The native OpenAI Responses object (or SSE event stream) is returned unmodified — `id` (`resp_…`), `output` array with `reasoning` / `message` / `function_call` items, and `usage` with `input_tokens`, `output_tokens`, `input_tokens_details.cached_tokens`, and `output_tokens_details.reasoning_tokens`. The `X-Payment-Response` header (base64 JSON `{"success","transaction","network","payer"}`) carries the settlement transaction hash on non-streaming calls. Upstream 4xx/5xx errors are passed through in OpenAI's envelope with the upstream status; nothing is settled on a failed call.
