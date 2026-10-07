---
title: Decisions (Typed Judgments)
description: Yes/no probabilities, labelled choices and rubric scores over text or images. OpenAI Decisions-compatible. Free with a key, or pay per call over x402.
---

# Decisions (Typed Judgments)

Send context and a set of questions with a fixed answer space; get back one typed answer per question instead of text.

The endpoint is compatible with OpenAI's Decisions API: same request, same response, served by `gpt-6-luna`. Any OpenAI SDK works with the base URL changed.

:::note{title="Two ways in"}
**Free with an API key** at `api.blockrun.ai` — get a key at [user.blockrun.ai](https://user.blockrun.ai) (registration, not a card).
**Pay per call over x402** at `blockrun.ai` — for an agent that has a wallet and no key.
Both take the same body and return the same response.
:::

## Endpoints

| Endpoint | Auth | Price |
|----------|------|-------|
| `POST https://api.blockrun.ai/v1/decisions` | `Authorization: Bearer <your key>` | Free, with a per-key hourly limit |
| `POST https://blockrun.ai/api/v1/decisions` | x402 payment header | Input tokens at $0.10 per 1M, at least $0.001 a call, plus the $0.001 transaction fee |

Output tokens are not billed on either rail. On the paid rail almost every call lands on the minimum — $0.002 in total — because $0.001 buys 10,000 input tokens. Asking several questions in one call costs the same as asking one.

The per-key limit on the free rail is reported in the response when you reach it; read it there rather than copying a number from this page.

---

## Request

```bash
curl https://api.blockrun.ai/v1/decisions \
  -H "authorization: Bearer $BLOCKRUN_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "gpt-6-luna",
    "input": "Help! My payouts have been failing for 3 days.",
    "questions": [
      { "type": "predicate", "name": "is_urgent",
        "instructions": "Does the message convey urgency?" },
      { "type": "choice", "name": "department",
        "instructions": "Which team should handle this?",
        "choices": [
          { "value": "billing",   "description": "Payments, payouts, refunds" },
          { "value": "technical", "description": "Bugs and outages" }
        ] },
      { "type": "score", "name": "frustration",
        "instructions": "How frustrated is the customer?",
        "levels": [
          { "label": "calm",       "description": "Neutral tone" },
          { "label": "frustrated", "description": "Clearly unhappy" },
          { "label": "angry",      "description": "Hostile or threatening to leave" }
        ] }
    ]
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | no | `gpt-6-luna`, the only Decisions model. `openai/gpt-6-luna` is accepted too. |
| `input` | string \| array | yes | The evidence. A string, or messages whose `content` holds text and inline base64 images. Hosted image URLs are not accepted. |
| `questions` | array | yes | What to evaluate. Each has a `type`, a `name` you choose, and `instructions` in plain language. |

### Question types

| Type | You add | You get back |
|------|---------|--------------|
| `predicate` | nothing — it is true or false | `probability`, from 0 to 1 |
| `choice` | `choices`: `[{ value, description }]` | `choice` (the chosen value), `probabilities` per value, `confidence` |
| `score` | `levels`: `[{ label, description }]`, lowest first | `score` (a weighted position across the levels, indexed from 0), `probabilities` per level, `confidence` |

A question the model will not answer comes back with `type: "refusal"`.

## Response

```json
{
  "model": "gpt-6-luna",
  "answers": [
    { "type": "predicate", "name": "is_urgent", "probability": 0.95 },
    { "type": "choice", "name": "department", "choice": "billing",
      "probabilities": [ { "value": "billing", "probability": 1.0 },
                         { "value": "technical", "probability": 0.0 } ],
      "confidence": 1.0 },
    { "type": "score", "name": "frustration", "score": 0.94,
      "probabilities": [ { "value": 0, "label": "calm", "probability": 0.06 },
                         { "value": 1, "label": "frustrated", "probability": 0.94 },
                         { "value": 2, "label": "angry", "probability": 0.0 } ],
      "confidence": 0.91 }
  ],
  "usage": { "input_tokens": 399, "output_tokens": 0, "total_tokens": 399 }
}
```

The request above, measured 2026-10-07 (`usage` trimmed to its totals).

Answers come back in the order you asked. Pick thresholds by running your own labelled examples through the endpoint and looking at where the errors land.

---

## Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.blockrun.ai/v1",
    api_key=os.environ["BLOCKRUN_API_KEY"],
)

result = client.post(
    "/decisions",
    cast_to=dict,
    body={
        "model": "gpt-6-luna",
        "input": "The card was charged twice and the customer wants one refunded.",
        "questions": [
            {"type": "predicate", "name": "wants_refund",
             "instructions": "Does the customer want a refund?"},
        ],
    },
)
print(result["answers"][0]["probability"])
```

If your `openai` package has a typed `client.decisions.create(...)`, it works against the same base URL.

## TypeScript

```typescript
const res = await fetch("https://api.blockrun.ai/v1/decisions", {
  method: "POST",
  headers: {
    authorization: `Bearer ${process.env.BLOCKRUN_API_KEY}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-6-luna",
    input: "The card was charged twice and the customer wants one refunded.",
    questions: [
      { type: "predicate", name: "wants_refund", instructions: "Does the customer want a refund?" },
    ],
  }),
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const { answers } = await res.json();
console.log(answers[0].probability > 0.9 ? "refund requested" : "unclear");
```

## Paying per call instead (x402)

An agent with a wallet can skip the key. Send the same body to `https://blockrun.ai/api/v1/decisions`; the first response is a `402` quoting the price for that input, and an x402 client signs it and retries. With the [Python SDK](../sdks/python.md) or [TypeScript SDK](../sdks/typescript.md) wallet setup, any x402-aware HTTP client handles the round trip.

The `402` body names the rate in `paymentInfo` (`pricingUnit: "per-input-token"`, `inputPricePerMillion`, `minimumUsd`) so a caller can budget before paying.

---

## Ask questions the input can answer

The model judges only what you send. A question whose answer is not in the input still gets an answer, and it will look like a verdict. "Does this need a reply today?" over a message that says nothing about timing is your policy, not a property of the text — answer it in code.

The shape that works in a pipeline: build the input with every fact the judgment needs, ask the independent questions together in one call, combine the answers with checks your code already has, and send the narrow cases to a person or to a reasoning model through [Chat Completions](chat-completions.md).

## Errors

| Status | Meaning | Charged? |
|--------|---------|----------|
| 400 | The body did not match the schema; OpenAI's error envelope names the field | No |
| 401 | Free rail: missing or invalid key | No |
| 402 | Paid rail: payment required, or the payment did not verify | No |
| 4xx from the model | Relayed as returned (for example, duplicate choice values) | No |
| 429 | Free rail: per-key hourly limit reached; the response carries when to retry | No |
| 502 / 504 | The model was unreachable or timed out | No |

See [Error Handling](errors.md) for the shared error shape.

## Migrating from `/v1/decide`

`POST https://api.blockrun.ai/v1/decide` — the older `state` + `noul` / `choice` / `score` shape — is still accepted and answered by the same model. New code should use `/v1/decisions`. See [Decide (legacy)](decide.md).

::::cards
:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Hand the narrow cases to a reasoning model.
:::
:::card{title="Exa Web Search" href="exa-search.md" icon="Search"}
Fetch the facts a judgment needs, then pass them in.
:::
::::
