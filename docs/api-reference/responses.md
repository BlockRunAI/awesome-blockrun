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
| `PAYMENT-SIGNATURE` | Conditional | Base64-encoded x402 payment payload (required after 402, x402 v2) |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | OpenAI model ID (e.g., `gpt-5.5`, `openai/gpt-5.4-pro`, `gpt-5.3-codex`) |
| `input` | string \| array | Yes | A prompt string, or an array of Responses input items (messages, `function_call_output`, reasoning replays, …) |
| `instructions` | string | No | System/developer instructions |
| `max_output_tokens` | integer | No | Maximum tokens to generate (bounds the x402 quote) |
| `stream` | boolean | No | Stream native Responses SSE events (default: `false`) |
| `tools` | array | No | Responses tool definitions — works together with `reasoning` on all GPT-5.x models |
| `tool_choice` | string \| object | No | Tool selection strategy |
| `reasoning` | object | No | Reasoning config, e.g. `{"effort": "high"}` |
| `include` | array | No | Extra output fields, e.g. `["reasoning.encrypted_content"]` for reasoning continuity across turns |
| `text` | object | No | Output format options (`json_object`, `json_schema`, verbosity) |
| `temperature` / `top_p` | number | No | Sampling parameters (legacy models only; reasoning models ignore/reject them upstream) |

### Stateless gateway — what is different from OpenAI

BlockRun's upstream calls run under one org key shared by all payers, so server-side state is disabled. `store: false` is **enforced** on every request, and these parameters are rejected with a `400`:

| Parameter | Why |
|-----------|-----|
| `store: true` | Responses are never retained upstream |
| `previous_response_id` | No stored responses to reference — resend full context in `input` |
| `conversation` | No server-side conversation state |
| `prompt` | No stored prompt templates |
| `background: true` | Background jobs complete after the HTTP exchange — nothing to bill against |

This is the same model Codex CLI uses by default (`store: false` + full-context resend). For reasoning continuity across turns, request `include: ["reasoning.encrypted_content"]` and replay the returned reasoning items in the next call's `input`.

## Supported models

All paid OpenAI models: GPT-5.x (including `-pro` tiers), o-series, and the codex family. `GET /v1/models` lists current IDs and prices; the `openai/` prefix is optional. Other providers (Claude, Gemini, DeepSeek, …) are served via [Chat Completions](chat-completions.md) and [Anthropic Messages](chat-completions.md#anthropic-compatible-endpoint).

## Payment flow

Identical to Chat Completions: send the request without payment, receive a `402` with a USDC quote (estimated input tokens + 10% of `max_output_tokens`, minimum $0.003), sign the x402 authorization, and resend with the `PAYMENT-SIGNATURE` header. The [SDKs](../getting-started/sdk-developers.md) handle this automatically.

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

The native OpenAI Responses object (or SSE event stream) is returned unmodified — `id` (`resp_…`), `output` array with `reasoning` / `message` / `function_call` items, and `usage` with `input_tokens`, `output_tokens`, `input_tokens_details.cached_tokens`, and `output_tokens_details.reasoning_tokens`. The `X-Payment-Response` header carries the settlement transaction hash on non-streaming calls.
