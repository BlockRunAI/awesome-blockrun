# Routing Benchmarks

How much does automatic routing actually save? This page states the claim, names
the baseline, and shows the inputs, so you can recompute it rather than trust it.

## The claim

Against pinning `anthropic/claude-opus-5` for every request:

| Profile | Cost vs the pinned baseline |
|---|---|
| `auto` | save 88% |
| `eco` | save 98% |

That is the whole claim. It is a statement about **which model runs your
request**, not about our per-token prices — see [What this does not
claim](#what-this-does-not-claim) below.

## The baseline is named, not implied

Savings are stated against pinning `anthropic/claude-opus-5` for **100% of
traffic** — the flagship a developer would otherwise default to for everything.

This matters more than the percentage does. A bare "up to N% cheaper" against an
unstated baseline is unfalsifiable, and we shipped four different values of
exactly that shape across four repos before pinning it down. Naming the baseline
is what makes the figure checkable — including checkable as *wrong*.

## The workload mix

Routing only saves money if most requests do not need the flagship. So the mix
is an input, and it is an assumption we are stating rather than hiding:

| Tier | Share of requests |
|---|---|
| SIMPLE | 55% |
| MEDIUM | 25% |
| COMPLEX | 15% |
| REASONING | 5% |

Weighted toward SIMPLE because real agent traffic is: retries, tool-result
summarisation, classification and formatting outnumber the calls that genuinely
need frontier reasoning.

Token shape per request: **8,000 input, 1,200 output** — an input-heavy
coding-agent workload. Output tokens dominate cost at flagship prices, so this
ratio moves the result materially. Change it and you should expect a different
number.

## Which model each profile picks

| Tier | `eco` | `auto` |
|---|---|---|
| SIMPLE | `nvidia/deepseek-v4-flash` | `google/gemini-2.5-flash` |
| MEDIUM | `google/gemini-3.1-flash-lite` | `deepseek/deepseek-v4-pro` |
| COMPLEX | `google/gemini-3.1-flash-lite` | `google/gemini-3.1-pro` |
| REASONING | `deepseek/deepseek-reasoner` | `deepseek/deepseek-reasoner` |

`eco` reaches the higher figure because its SIMPLE tier costs nothing — the free
tier absorbs the majority of traffic. `auto` trades some of that for headroom on
quality, which is why it is the default.

## Reproduce it

Prices are **not** frozen into the figure. They are read from the live model
catalog when the number is built, so a price change moves the published
percentage instead of silently invalidating it.

1. Fetch current prices from [`GET /api/v1/models`](/docs/api-reference/models).
2. Cost one request per tier at 8,000 input / 1,200 output tokens, for the
   baseline and for each profile's pick.
3. Weight by the mix above and compare.

The assumptions live in `src/brand/savings-mix.json`, and the published result
is served at [`/brand/numbers.json`](https://blockrun.ai/brand/numbers.json). If
your arithmetic disagrees with ours, the inputs are all there to find out why.

## What this does not claim

Three things this page is **not** saying:

**Not that our per-token prices are lower than anyone else's.** Per-token chat
pricing carries zero margin — you pay what the model costs. There is no
per-token discount to claim, because there is no per-token markup to discount.

**Not that every call gets cheaper.** Add the $0.001 per-request fee and a single
call to a frontier model costs marginally *more* here than buying that model's
tokens directly. The saving comes from the 80% of requests that never needed the
frontier model, not from a better rate on the ones that did.

**Not a quality benchmark.** These are cost figures. A profile that routes a
COMPLEX request to a smaller model saves money and may answer worse. `auto`
exists because that trade is real; measure it on your own traffic before
adopting `eco`.

## Related

- [ClawRouter](/docs/products/routing/clawrouter) — how constraints pick a model
- [Pricing](/docs/products/intelligence/pricing) — per-model rates and the
  per-request fee
