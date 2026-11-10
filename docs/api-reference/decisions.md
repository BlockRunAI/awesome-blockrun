---
title: Decisions (Typed Judgments)
description: Yes/no probabilities, labelled choices and rubric scores over text or images. OpenAI Decisions-compatible, priced per call or billed to a key.
---

# Decisions (Typed Judgments)

Send context and a set of questions with a fixed answer space; get back one typed answer per question instead of text.

The endpoint is compatible with OpenAI's Decisions API: same request, same response, served by `gpt-6-luna`. Any OpenAI SDK works with `base_url` set to `https://api.blockrun.ai/v1` and a key.

## Endpoint

| Endpoint | Auth | Price |
|----------|------|-------|
| `POST https://blockrun.ai/v1/decisions` | x402 (`payment-signature`, after the 402) | Estimated input tokens × $0.10 per 1M, plus the $0.001 transaction fee. Output is not billed. |
| `POST https://api.blockrun.ai/v1/decisions` | `Authorization: Bearer <your key>` | Input tokens the model reports, at the same rate, from your credit |

On x402 the 402 quotes the price before you pay, and that quote is what settles (`exact`). The estimate is an upper bound over the whole input as JSON: printable ASCII at 1.5 characters a token, a control character at 1, any other character at up to 3 (4 outside the BMP), and each inline `data:image/*` image at 1,600 tokens. Past 272K tokens the whole request is priced at $0.20 per 1M. A one-question call on a 2,000-character English message costs about $0.0012; a call at every limit below, in English, about $0.013. Nothing is charged unless the model returns an answer.

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
| `input` | string \| array | yes | The evidence. A string, or messages whose `content` holds text and inline base64 images. Hosted image URLs are not accepted. At most 120,000 characters of text and 8 images per call. |
| `questions` | array | yes | What to evaluate. Each has a `type`, a `name` you choose, and `instructions` in plain language. At most 64 questions, 30,000 characters in all, and 255 choices or levels each. |

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

---

## Ask questions the input can answer

The model judges only what you send. A question whose answer is not in the input still gets an answer, and it will look like a verdict. "Does this need a reply today?" over a message that says nothing about timing is your policy, not a property of the text — answer it in code.

The shape that works in a pipeline: build the input with every fact the judgment needs, ask the independent questions together in one call, combine the answers with checks your code already has, and send the narrow cases to a person or to a reasoning model through [Chat Completions](chat-completions.md).

## Errors

| Status | Meaning |
|--------|---------|
| 400 | The body did not match the schema or is over a cap; OpenAI's error envelope names the field |
| 401 | Missing or invalid key |
| 4xx from the model | Relayed as returned (for example, duplicate choice values) |
| 429 | Per-key hourly limit reached; the response carries when to retry |
| 502 / 504 | The model was unreachable or timed out |

See [Error Handling](errors.md) for the shared error shape.

## Migrating from `/v1/decide`

`POST https://api.blockrun.ai/v1/decide` — the older `state` + `noul` / `choice` / `score` shape — is still accepted as a compatibility alias, with the same key, and answered by the same model. New code should use `/v1/decisions`. See [Decide (legacy)](decide.md).

::::cards
:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Hand the narrow cases to a reasoning model.
:::
:::card{title="Exa Web Search" href="exa-search.md" icon="Search"}
Fetch the facts a judgment needs, then pass them in.
:::
::::
