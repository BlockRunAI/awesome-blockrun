---
title: Decisions (Typed Judgments)
description: Yes/no probabilities, labelled choices and rubric scores over text or images. OpenAI Decisions-compatible. Free with a BlockRun API key at api.blockrun.ai.
---

# Decisions (Typed Judgments)

Send context and a set of questions with a fixed answer space; get back one typed answer per question instead of text.

The endpoint is compatible with OpenAI's Decisions API: same request, same response, served by `gpt-6-luna`. Any OpenAI SDK works with `base_url` set to `https://api.blockrun.ai/v1`.

:::note{title="Free with a key — the only way in"}
Register at [user.blockrun.ai](https://user.blockrun.ai) and create an API key (registration, not a card). Decisions is served only at `api.blockrun.ai`. It is **not** sold per call over x402 on `blockrun.ai`: the smallest payment an x402 call can settle is more than a judgment costs, so a paid route would charge more than the answer is worth.
:::

## Endpoint

| Endpoint | Auth | Price |
|----------|------|-------|
| `POST https://api.blockrun.ai/v1/decisions` | `Authorization: Bearer <your key>` | Free, with a per-key hourly limit |

Asking several questions in one call is still one call against the limit. The per-key limit is reported in the response when you reach it; read it there rather than copying a number from this page.

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
