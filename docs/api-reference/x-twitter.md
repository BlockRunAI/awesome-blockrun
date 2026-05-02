# X/Twitter API — Removed

The dedicated `/api/v1/x/*` endpoints (user lookup, follower lists, tweet lookups,
trending, etc.) have been removed and no longer exist. Calls to any of these paths
return `404`.

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
contact us at [vicky.fuyu@gmail.com](mailto:vicky.fuyu@gmail.com) — they may return
under a different gateway later, but not under `/api/v1/x/*`.
