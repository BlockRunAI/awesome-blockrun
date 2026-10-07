---
title: Decide (legacy)
description: The older /v1/decide request shape. Still accepted on api.blockrun.ai; new code should use Decisions, the OpenAI-compatible endpoint.
---

# Decide (legacy)

`POST https://api.blockrun.ai/v1/decide` is the older shape of the typed-judgment endpoint. It is still accepted, and it is now answered by the same model as [Decisions](decisions.md). New code should use `/v1/decisions`.

:::note{title="What changed on 2026-10-07"}
The endpoint used to be served by OpenJev, an open-source NLI model BlockRun hosted itself. OpenJev is retired. Typed judgments are now OpenAI Decisions-compatible and served by `gpt-6-luna` at `https://api.blockrun.ai/v1/decisions`, free with a registered key. There is no pay-per-call (x402) version on `blockrun.ai`.
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

::::cards
:::card{title="Decisions" href="decisions.md" icon="Brain"}
The current endpoint: request, response, limits and errors.
:::
::::
