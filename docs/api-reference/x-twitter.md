---
title: X/Twitter API — Removed
description: The dedicated /api/v1/x/* endpoints are removed and return 404 — use Grok Live Search with sources:["x"] for X/Twitter content discovery.
---

# X/Twitter API — Removed

The dedicated `/api/v1/x/*` endpoints (user lookup, follower lists, tweet lookups,
trending, etc.) have been removed and no longer exist. Calls to any of these paths
return `404`.

:::warning{title="These endpoints are gone"}
Any call to `/api/v1/x/*` now returns `404`. Use the Grok Live Search endpoint with `sources: ["x"]` instead — see below.
:::

## What to use instead

For X/Twitter content discovery, use the Grok-powered Live Search endpoint with
`sources: ["x"]`:

```
POST https://blockrun.ai/api/v1/search
```

```json
{
  "query": "your search query",
  "sources": ["x"],
  "max_results": 10
}
```

See [Search](search.md) for the full request/response shape and pricing.

There is currently **no replacement** for per-user lookups (followers, followings,
profile stats) or per-tweet lookups (replies, threads). If you need those, please
contact us at [care@blockrun.ai](mailto:care@blockrun.ai) — they may return
under a different gateway later, but not under `/api/v1/x/*`.

## What's next?

::::cards

:::card{title="Search API" href="search.md" icon="Search"}
Grok Live Search across X/Twitter, web, and news — the replacement for X content discovery.
:::

:::card{title="Chat Completions" href="chat-completions.md" icon="Brain"}
Add `search_parameters` with `sources: [{type:"x"}]` to any chat call.
:::

::::
