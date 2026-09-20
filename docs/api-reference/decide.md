---
title: Decide (Typed Judgments)
description: Turn text or JSON into a yes/no probability, a labelled choice, or a score. Free with a registered BlockRun API key — served by api.blockrun.ai, not the x402 gateway.
---

# Decide (Typed Judgments)

Send a state and a set of questions, get back typed answers with a number
beside each one. No prose to parse, no schema to police.

**This endpoint is different from every other one in this reference.** It is
free, it needs an API key, and it is served by `api.blockrun.ai` rather than the
x402 gateway at `blockrun.ai`. There is no payment header and no wallet path.

Get a key at [user.blockrun.ai](https://user.blockrun.ai) — registration, not a
card.

## Why it is free

A judgment costs less to serve than the smallest amount the x402 rail can
settle. Metering it would cost more than the answer. So it is free behind a
registered key, and the key is the same one that reaches the paid endpoints.

## Endpoint

| Endpoint | Method | Price | Auth |
|----------|--------|-------|------|
| `https://api.blockrun.ai/v1/decide` | POST | Free | `Authorization: Bearer <your key>` |

There is a per-key hourly limit. It is generous for interactive use and it is
reported in the response when you reach it — read it there rather than copying
a number from this page.

---

## Request

```bash
curl -X POST https://api.blockrun.ai/v1/decide \
  -H "authorization: Bearer $BLOCKRUN_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "state": "Help! My payouts have been failing for 3 days.",
    "questions": {
      "is_urgent":   { "type": "noul",   "instructions": "Does this convey urgency?" },
      "department":  { "type": "choice", "instructions": "Which team should handle this?",
                       "criteria": { "billing": "Payments, refunds",
                                     "technical": "Bugs, outages" } },
      "frustration": { "type": "score",  "instructions": "How frustrated is the customer?",
                       "criteria": ["Calm", "Frustrated", "Very angry"] }
    }
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `state` | string \| object \| array | yes | What to judge. A message, a ticket, a diff, a tool result, a row of data. |
| `questions` | object | yes | Map of your own id to a question. One to sixty-four per call. |
| `model` | string | no | Defaults to `openjev`, the only backend. |

### Question types

| Type | You define | You get back |
|------|-----------|--------------|
| `noul` | nothing — it is true or false | a number for how strongly the state supports the claim |
| `choice` | `criteria`: a map of label to its meaning, two to 255 of them | the top label, plus a share for every option |
| `score` | `criteria`: the rungs, in words, two to 255 of them | a weighted position across the rungs, plus the distribution |

`instructions` is the question itself, in plain language, and is required on all
three.

---

## What the number means

This is the part worth reading before you build a threshold on it.

Under all three types is one operation: natural-language inference. The model
takes your state as a premise and your question as a hypothesis and returns how
strongly the premise entails it. A `noul` is that score directly.

For a `choice`, every option is scored the same way and the scores are then
**divided by their total** so they sum to one. That step throws information
away:

- Three options each scoring `0.1` — the model supporting none of them — come
  back as an even `0.33 / 0.33 / 0.33`.
- Two options scoring `0.9` and `0.85` — both strongly supported — come back as
  `0.51 / 0.49`.

Those are opposite situations and they are indistinguishable in the response.

So the number beside a choice is a **share of the agreement the model found**,
not the probability that the answer is correct. It ranks the options against
each other and says nothing about whether any of them fit.

This is where a model trained for **calibrated** decisions differs. A calibrated
model's probabilities are fitted against real outcomes, so across many
predictions the ones it calls 0.7 come true about seventy percent of the time.
Nothing here has been fitted that way. Pick your threshold by running your own
labelled examples through it and looking at where the errors land, not by
reading the number as a percentage.

---

## OpenJev is not Jev

The backend is called OpenJev. It is an unaffiliated open-source NLI
cross-encoder, MIT licensed, that we host ourselves. It is **not** Jev, it is
not made by the people who make Jev, and it is not a smaller version of it. The
name belongs to the open model.

We expect it to be materially weaker than Jev and we have **not** benchmarked
the two against each other, so we are not going to put a number on the gap. Try
it on your own data before you depend on it.

We do not resell Jev. There is one backend, and the `x-blockrun-backend`
response header names it on every call, so you are never quietly handed
something other than what you asked for.

---

## Response

```json
{
  "model": "openjev",
  "answers": {
    "is_urgent":   { "type": "noul", "noul": 0.986 },
    "department":  { "type": "choice", "choice": "billing",
                     "probabilities": { "billing": 0.71, "technical": 0.29 },
                     "confidence": 0.71 },
    "frustration": { "type": "score", "score": 1.42,
                     "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
                     "probabilities": { "0": 0.11, "1": 0.36, "2": 0.53 },
                     "confidence": 0.53 }
  }
}
```

| Header | Meaning |
|--------|---------|
| `x-blockrun-backend` | which backend served the call |

---

## Python

```python
import os, requests

resp = requests.post(
    "https://api.blockrun.ai/v1/decide",
    headers={"Authorization": f"Bearer {os.environ['BLOCKRUN_API_KEY']}"},
    json={
        "state": "The card was charged twice and the customer wants one refunded.",
        "questions": {
            "dept": {
                "type": "choice",
                "instructions": "Which team should handle this?",
                "criteria": {
                    "billing": "a charge, refund or payment problem",
                    "technical": "the product is broken",
                },
            },
            "refund": {"type": "noul", "instructions": "Does the customer want a refund?"},
        },
    },
    timeout=90,
)
resp.raise_for_status()
answers = resp.json()["answers"]

print(answers["dept"]["choice"], answers["dept"]["confidence"])
print(answers["refund"]["noul"])
```

Prints `billing 0.968` and `0.9495`. The `timeout=90` is deliberate: the
first call after an idle period waits for a cold container, which takes
around 32 seconds. Warm calls return in about a second.

## TypeScript

```typescript
const res = await fetch("https://api.blockrun.ai/v1/decide", {
  method: "POST",
  headers: {
    authorization: `Bearer ${process.env.BLOCKRUN_API_KEY}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    state: "The card was charged twice and the customer wants one refunded.",
    questions: {
      dept: {
        type: "choice",
        instructions: "Which team should handle this?",
        criteria: {
          billing: "a charge, refund or payment problem",
          technical: "the product is broken",
        },
      },
      refund: { type: "noul", instructions: "Does the customer want a refund?" },
    },
  }),
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const { answers } = await res.json();

console.log(answers.dept.choice, answers.dept.confidence);
console.log(answers.refund.noul > 0.9 ? "refund requested" : "unclear");
```

No SDK and no payment step. The key is the whole of the auth.

## Ask questions the text can answer

The model reads only the `state` you send. A question whose answer is not in
that text gets scored against the words anyway, and the number will look like
a verdict. Four `noul` questions over the state above, measured 2026-09-21:

| Question | Score | Why |
|---|---|---|
| Has the customer been billed more than once? | 0.9487 | stated outright |
| Does the customer want a refund? | 0.9495 | stated outright |
| Is this about money? | 0.6509 | true, but one inference away |
| Does this need a reply today? | 0.0238 | **not in the text at all** |

The last row is the trap. Nothing about the message says when it must be
answered — that is your policy, not a property of the sentence — so the score
is close to zero and reads like a confident "no". Ask "does the customer want a
refund", branch on it, and apply your own SLA rule to the result.

## Using it in a workflow

A judgment is rarely the decision on its own. The shape that works is judgment
for the part a program cannot read, and ordinary code for everything else:

1. Build the state: the customer's message, the transactions it refers to, the
   policy that governs it.
2. Ask the independent questions together in one call.
3. Combine the answers with deterministic checks your code already has — the
   amount, the account age, whether a refund was issued before.
4. Route. Act automatically where the margin is wide and the checks agree; send
   the rest to a person or to a reasoning model.

Step 4 is why the margin is in the response at all. Hand the narrow cases to
something slower and better — on this platform that is a reasoning model through
[Chat Completions](chat-completions.md).

---

## What it does not do

It does not write, summarise, or explain, and there is no free-text field in the
response. It has no memory between calls. It judges what you send rather than
looking anything up: if a fact matters, put it in the state. For search, fetch
with [Exa Web Search](exa-search.md) and pass the result in.

## Errors

| Status | Meaning |
|--------|---------|
| 400 | The request did not match the schema — the body names the field and the problem |
| 401 | Missing or invalid API key |
| 429 | Per-key hourly limit reached; the response carries when to retry |

See [Error Handling](errors.md) for the shared error shape.
