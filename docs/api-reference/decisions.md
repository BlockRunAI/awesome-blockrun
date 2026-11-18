---
title: Decisions (Typed Judgments)
description: Up to 1,000 yes/no, choice and rubric questions about one input, a probability for each. Gemini Decision 1 by Google or OpenAI's gpt-6-luna.
---

# Decisions (Typed Judgments)

Ask an agent's yes/no, multiple-choice and rubric questions in one request and get a calibrated probability for each. Two decision models answer the same request shape: **Gemini Decision 1** by Google, up to 1,000 questions per call over text and images, and OpenAI's **gpt-6-luna**, the default.

The request and response follow OpenAI's Decisions API, so any OpenAI SDK works. Pay per call on `https://blockrun.ai/v1/decisions`, or use an API key at `https://api.blockrun.ai/v1` and pay from credit.

## Endpoint

| Endpoint | Auth | Price |
|----------|------|-------|
| `POST https://blockrun.ai/v1/decisions` | Pay per call: x402 `exact` (`payment-signature`, after the 402) | Estimated input tokens × $0.10 per 1M, plus the $0.001 per-call fee. Output is not billed. A Gemini Decision 1 call costs at most $0.027215. |
| `POST https://api.blockrun.ai/v1/decisions` | `Authorization: Bearer <your key>` | $0.10 per million input tokens, plus your account margin, from your credit |

Both models cost $0.10 per million input tokens.

## Choosing a model

| | `gemini-decision-1` | `gpt-6-luna` |
|---|---|---|
| Made by | Google | OpenAI |
| Questions per call | up to 1,000 | up to 64 |
| Input | text and images | text and images |
| Context | 262,144 tokens, input and questions together | 272K tokens before the long-context rate |
| Input price | $0.10 per 1M tokens | $0.10 per 1M tokens ($0.20 past 272K) |
| Default | no | yes, when `model` is omitted |

- Many questions about the same input: use Gemini Decision 1. The input is sent once and every question is answered in the same call.
- Omit `model` and nothing changes for existing code: you get `gpt-6-luna`.
- Both models answer in the same shape. `score` means the same thing on both: a probability-weighted position across your levels, indexed from 0. Two differences: a Gemini Decision 1 `probability` is always between 0.01 and 0.99, where luna can return 0 or 1, and a Gemini predicate also carries a `confidence`.

## Billing: pay per call (x402)

The 402 quotes the price before you pay, and on `exact` that quote is what settles. The estimate is an upper bound over the input and questions: every ASCII character at 1 token, any other character at up to 3 (4 outside the BMP), and each inline `data:image/*` image at 2,500 tokens.

- **Gemini Decision 1** also counts 8 tokens per choice or level, and its priced tokens never exceed its 262,144-token window, so a call costs at most $0.027215.
- **gpt-6-luna**: past 272K tokens the whole request is priced at $0.20 per 1M.

A one-question call on a 2,000-character English message costs about $0.0012 on either model. Nothing is charged unless the model returns an answer.

## Billing: API key and credit

A decision on `api.blockrun.ai` is paid from your credit. Register at [user.blockrun.ai](https://user.blockrun.ai), create an API key, and add credit.

- You pay for the input tokens the model reports, at $0.10 per million. Your account margin is added.
- There is no output charge.
- Several questions in one call are one call. You pay for its input tokens.
- A prepaid account with no balance gets `402`.
- There is no hourly limit. Your balance is the limit.

Before the call goes to the model, we hold the price of some input tokens, plus your margin. For `gpt-6-luna` that is 64,000 tokens, $0.0064 before margin at today's price. For `gemini-decision-1` it is this request's own estimate, at most 262,144 tokens. A served call is then charged its real input tokens, not the hold.

What you pay when a call does not go to plan:

| Outcome | You pay |
|---------|---------|
| The model times out (`504`; after 30 seconds on luna, 15 on Gemini Decision 1) | The hold. The model may have done the work. |
| A `200` whose token count cannot be read | The hold |
| Your own `4xx` | Nothing |
| A `4xx` or `5xx` from the model | Nothing |
| The model could not be reached (`502`) | Nothing |

There are no refunds.

---

## Request

```bash
curl https://api.blockrun.ai/v1/decisions \
  -H "authorization: Bearer $BLOCKRUN_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "gemini-decision-1",
    "input": "The customer wrote: I was charged twice for my order and nobody answers my emails.",
    "questions": [
      { "type": "predicate", "name": "complaint",
        "instructions": "Is this a complaint?" },
      { "type": "choice", "name": "topic",
        "instructions": "What is the topic?",
        "choices": [
          { "value": "billing",  "description": "Payments and charges" },
          { "value": "shipping", "description": "" },
          { "value": "account",  "description": "Login and account" }
        ] },
      { "type": "score", "name": "anger",
        "instructions": "How angry is the customer?",
        "levels": [
          { "label": "calm",    "description": "" },
          { "label": "annoyed", "description": "" },
          { "label": "furious", "description": "" }
        ] }
    ]
  }'
```

Drop `"model"`, or set it to `"gpt-6-luna"`, to ask luna the same questions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | no | `gemini-decision-1` (or `google/gemini-decision-1`), or `gpt-6-luna` (or `openai/gpt-6-luna`). Omitted: `gpt-6-luna`. |
| `input` | string \| array | yes | The evidence. A string, or messages whose `content` holds text and inline base64 images. Hosted image URLs and file references are not accepted. gpt-6-luna: at most 120,000 characters of text and 8 images. Gemini Decision 1: at most 1,048,576 characters of text and 32 images (PNG, JPEG, WebP, HEIC, HEIF or GIF). |
| `questions` | array | yes | What to evaluate. Each has a `type`, a `name` you choose, and `instructions` in plain language. gpt-6-luna: at most 64 questions and 30,000 characters in all. Gemini Decision 1: at most 1,000 questions and 262,144 characters. Both: 255 choices or levels each. |

### Question types

| Type | You add | You get back |
|------|---------|--------------|
| `predicate` | nothing — it is true or false | `probability`, from 0 to 1 (Gemini Decision 1 also returns `confidence`) |
| `choice` | `choices`: `[{ value, description }]` | `choice` (the chosen value), `probabilities` per value, `confidence` |
| `score` | `levels`: `[{ label, description }]`, lowest first | `score` (a weighted position across the levels, indexed from 0), `probabilities` per level, `confidence` |

A question the model will not answer comes back with `type: "refusal"`.

### Rules for Gemini Decision 1

These are checked before you pay, and a request that breaks one gets a `400` and is not charged.

- A question's `name` is 1 to 64 characters of `A-Z a-z 0-9 _ -`, and each name is used once.
- `instructions` is non-empty text. Images go in `input`, not in a question.
- A `choice` has 2 to 255 choices. Each `value` is unique, 1 to 128 characters and at most 512 bytes, with no leading or trailing spaces and no control characters; spaces inside are fine. `description` is a string and may be empty.
- A `score` has 2 to 255 levels, each with a non-empty `label` and a string `description`.
- Images are inline `data:image/*` URLs; the `ultra_high` resolution is not offered. Audio, video and PDF are not accepted yet.

## Response

```json
{
  "model": "gemini-decision-1",
  "answers": [
    { "type": "predicate", "name": "complaint",
      "probability": 0.985, "confidence": 0.985 },
    { "type": "choice", "name": "topic", "choice": "billing",
      "probabilities": [ { "value": "billing",  "probability": 0.997 },
                         { "value": "shipping", "probability": 0.001 },
                         { "value": "account",  "probability": 0.001 } ],
      "confidence": 0.997 },
    { "type": "score", "name": "anger", "score": 1.49,
      "probabilities": [ { "value": 0, "label": "calm",    "probability": 0.012 },
                         { "value": 1, "label": "annoyed", "probability": 0.485 },
                         { "value": 2, "label": "furious", "probability": 0.503 } ],
      "confidence": 0.503 }
  ],
  "usage": {
    "input_tokens": 210,
    "input_tokens_details": { "cached_tokens": 0, "cache_write_tokens": 0, "text_tokens": 210 },
    "output_tokens": 0,
    "output_tokens_details": { "reasoning_tokens": 0 },
    "total_tokens": 210
  }
}
```

The request above, measured 2026-11-17 (probabilities rounded). The same request to `gpt-6-luna` used 398 input tokens and scored the anger question at 1.02. When the input includes images, `input_tokens_details` also carries `image_tokens`.

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
        "model": "gemini-decision-1",
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
    model: "gemini-decision-1",
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
| 400 | The body did not match the schema or is over a cap; the error envelope names the field. Refused before payment |
| 400 `content_blocked` | Gemini Decision 1's safety filters blocked the input. Not charged |
| 401 | Missing or invalid key |
| 402 | x402: the payment quote (pay it and retry), or `payment_status: "not_charged"` when your payment did not settle — the answer is withheld and nothing moved; sign a fresh payment. Key: no balance left, or a credit limit or daily cap reached. Add credit at [user.blockrun.ai](https://user.blockrun.ai/dashboard/credits) |
| 4xx from the model | Relayed as returned (for example, a request past the model's context window). Not charged |
| 413 | The body is over 10 MB, counted in bytes; refused before payment |
| 429 | x402: too many unpaid quote requests. Key: too many bad-key attempts from your address. The response carries when to retry |
| 500 | x402 only: `payment_status: "unknown"` — the settlement outcome could not be confirmed (a `tx_hash` is included when there is one). The answer is withheld. Check the hash before paying again |
| 502 | The model returned an error or could not be reached. Not charged |
| 503 `MODEL_UNAVAILABLE` | The model you named is not available right now. Refused before payment; omit `model` to use `gpt-6-luna` |
| 504 | The model timed out. On a key, charged the hold (see [Billing](#billing-api-key-and-credit)); on x402, not charged |

See [Error Handling](errors.md) for the shared error shape.

## Migrating from `/v1/decide`

`POST https://api.blockrun.ai/v1/decide` — the older `state` + `noul` / `choice` / `score` shape — is still accepted as a compatibility alias, with the same key. It is answered by `gpt-6-luna` only and billed like a `gpt-6-luna` call, with the 64,000-token hold. To use Gemini Decision 1, call `/v1/decisions`. See [Decide (legacy)](decide.md).

::::cards
:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Hand the narrow cases to a reasoning model.
:::
:::card{title="Exa Web Search" href="exa-search.md" icon="Search"}
Fetch the facts a judgment needs, then pass them in.
:::
::::
