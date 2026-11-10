---
title: Decide (legacy)
description: The older /v1/decide request shape. Still accepted on api.blockrun.ai; new code should use Decisions, the OpenAI-compatible endpoint.
---

# Decide (legacy)

`POST https://api.blockrun.ai/v1/decide` is the older shape of the typed-judgment endpoint. It is still accepted, and it is now answered by the same model as [Decisions](decisions.md). New code should use `/v1/decisions`.

:::note{title="What changed on 2026-10-07"}
The endpoint used to be served by OpenJev, an open-source NLI model BlockRun hosted itself. OpenJev is retired. Typed judgments are now OpenAI Decisions-compatible and served by `gpt-6-luna` at `https://api.blockrun.ai/v1/decisions` (billed to your key's credit) and, since 2026-11-10, per call over x402 at `https://blockrun.ai/v1/decisions`. See [Decisions](decisions.md) for the price.
:::

## How the old shape maps

| `/v1/decide` | `/v1/decisions` |
|--------------|-----------------|
| `state` | `input` |
| `questions` as a map of id → question | `questions` as an array; the id becomes `name` |
| `noul` | `predicate` |
| `choice` with `criteria: { label: meaning }` | `choice` with `choices: [{ value, description }]` |
| `score` with `criteria: ["rung", …]` | `score` with `levels: [{ label, description }]` |

Auth is unchanged: `Authorization: Bearer <your key>` from [user.blockrun.ai](https://user.blockrun.ai).

## Billing

`/v1/decide` is billed exactly like [Decisions](decisions.md#billing-api-key-and-credit): input tokens at the `gpt-6-luna` input price, plus your account margin, paid from credit.

One extra case. If OpenAI answers but the answer cannot be turned into the old shape, you get `502` and pay for the input tokens used.

::::cards
:::card{title="Decisions" href="decisions.md" icon="Brain"}
The current endpoint: request, response, limits and errors.
:::
::::
