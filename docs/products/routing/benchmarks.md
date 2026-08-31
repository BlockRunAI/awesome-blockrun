# Routing Benchmarks

How much does automatic routing actually save? This page states the claim, names
the baseline, and shows the inputs, so you can recompute it rather than trust it.

## The claim

Against pinning `anthropic/claude-opus-5` for every request:

| Profile | Cost vs the pinned baseline |
|---|---|
| `auto` | save 84% |
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
| SIMPLE | `nvidia/nemotron-3.5-lightning` | `google/gemini-2.5-flash` |
| MEDIUM | `google/gemini-3.1-flash-lite` | `deepseek/deepseek-v4-pro` |
| COMPLEX | `google/gemini-3.1-flash-lite` | `google/gemini-3.1-pro` |
| REASONING | `deepseek/deepseek-reasoner` | `deepseek/deepseek-reasoner` |

`eco` reaches the higher figure because its SIMPLE tier costs nothing — the free
tier absorbs the majority of traffic. `auto` trades some of that for headroom on
quality, which is why it is the default.

These are the **priced** picks, and they are not always the router's actual
primary. ClawRouter's `auto` MEDIUM primary is `moonshot/kimi-k2.7` and its
REASONING primary (both profiles) is `xai/grok-4-1-fast-reasoning`; both are
withheld from `GET /api/v1/models`, and a public claim priced on a model you
cannot look up is not defensible. Where the primary is hidden, the mix prices
the cheapest *visible* model in the same tier's fallback chain instead. That
substitution only ever moves the published figure down, so the number is
conservative. The `eco` SIMPLE row moved the same way when NVIDIA retired
`deepseek-v4-flash` on 2026-08-12 — its replacement is also free, so the `eco`
figure did not change.

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

## Does the router pick *better*, not just cheaper?

The savings figure above is a price calculation. Whether the router's choices
actually complete tasks is a separate question, and it is measured separately —
on full agent sessions, in [router-core](https://github.com/BlockRunAI/router-core),
the engine that makes the decision for ClawRouter, the SDKs, Franklin and
ClawRouter-Hermes.

Three public benchmark families, run through one host framework with their own
validators, three arms per task — the previous rules router, the constraint-first
V3.4 router, and a pinned flagship — sharing a frozen model catalog, pricing
snapshot, tool surface and scorer:

| Source family | Share of strict cohort | What it measures |
|---|---:|---|
| τ-bench family | 55% | Stateful tool use under domain policies |
| BrowseComp | 25% | Multi-hop web research ending in an exact answer |
| Terminal-Bench | 20% | End-to-end terminal and repository work |

**V3.4 checkpoint:** verified task success **49% → 57%** (+8 points) over the
previous rules router. Normalized cost per *successful* task fell **6.4%**.
Against pinning the flagship on every task, the router used **8.9%** of the
normalized token cost while giving up 10 points of success.

And the limits, because a benchmark that only publishes wins is not evidence:
the paired 95% interval on the quality gain is **−1.9 to +15.5 points** and
crosses zero; the router is *not* statistically proven better across the
production distribution; it does not match flagship quality; p95 session
latency regressed. The machine-readable scorecard records
`releaseEligible: false`. Method, figures and the four failure classes are in
the [constraint-first router report](https://blockrun.ai/signal/router-v3-4-constraint-first-auto-routing).

The decision itself is cheap: **~0.05 ms warm, ~0.15 ms including JIT warm-up**
on mixed prompt shapes up to 33KB (Node 22, M-series laptop). Feature extraction
is bounded, so a 400KB prompt still routes in under 0.1 ms. No network call is
made to decide.

## Per-model latency is a dated snapshot

ClawRouter's repo also carries a gateway latency run — every model at the time,
two coding prompts each, 256 max tokens, non-streaming, measured end-to-end
through payment verification. It is dated **March 16, 2026**, deliberately not
refreshed, and should be read as a measurement of that day rather than a current
ranking: Grok 4 Fast answered in 1,143 ms while GPT-5.4 took 6,213 ms for the
same request. The write-up is
[LLM Router Benchmark: 39 models](https://github.com/BlockRunAI/ClawRouter/blob/main/docs/llm-router-benchmark-46-models-sub-1ms-routing.md);
for current per-model latency, p95, uptime and error rate, use the
[Observatory](https://blockrun.ai/observatory), which is also the feed
router-core's `speed` and `reliability` terms are designed to consume.

## What this does not claim

Three things this page is **not** saying:

**Not that our per-token prices are lower than anyone else's.** Per-token chat
pricing carries zero margin — you pay what the model costs. There is no
per-token discount to claim, because there is no per-token markup to discount.

**Not that every call gets cheaper.** Add the $0.001 per-request fee and a single
call to a frontier model costs marginally *more* here than buying that model's
tokens directly. The saving comes from the 80% of requests that never needed the
frontier model, not from a better rate on the ones that did.

**Not a quality benchmark.** The savings figures are cost figures. A profile that
routes a COMPLEX request to a smaller model saves money and may answer worse.
`auto` exists because that trade is real; the agent checkpoint above is the
closest thing to a quality measurement, and it is published with its confidence
interval for a reason. Measure it on your own traffic before adopting `eco`.

## Related

- [ClawRouter](/docs/products/routing/clawrouter) — how constraints pick a model
- [router-core](https://github.com/BlockRunAI/router-core) — the shared routing
  engine, its benchmark method and the decision-snapshot corpus
- [Pricing](/docs/products/intelligence/pricing) — per-model rates and the
  per-request fee
