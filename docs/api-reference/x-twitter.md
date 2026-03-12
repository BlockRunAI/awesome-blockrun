# X/Twitter API

Access Twitter/X user data via x402 micropayments. Powered by [AttentionVC](https://attentionvc.ai).

## Networks

| Network | Base URL | Asset |
|---------|----------|-------|
| Base (Ethereum L2) | `https://blockrun.ai` | USDC |
| Solana | `https://sol.blockrun.ai` | USDC |

## Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/v1/x/users/lookup` | POST | $0.002/user | Batch user profile lookup |
| `/api/v1/x/users/followers` | POST | $0.05/page | Follower list with pagination |
| `/api/v1/x/users/followings` | POST | $0.05/page | Following list with pagination |

---

## User Lookup

Batch lookup Twitter/X user profiles — followers, bio, verification status, and more.

```
POST https://blockrun.ai/api/v1/x/users/lookup      # Base
POST https://sol.blockrun.ai/api/v1/x/users/lookup   # Solana
```

### Pricing

| Per User | Minimum | Maximum |
|----------|---------|---------|
| $0.002 | $0.02 (10 users) | $0.20 (100 users) |

### Request

```json
{
  "usernames": ["elonmusk", "sama", "vitalikbuterin"]
}
```

Also accepts a comma-separated string:

```json
{
  "usernames": "elonmusk, sama, vitalikbuterin"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `usernames` | `string[] \| string` | Yes | Array or comma-separated string of Twitter usernames. `@` prefix auto-stripped. |

### Response

```json
{
  "users": [
    {
      "id": "44196397",
      "userName": "elonmusk",
      "name": "Elon Musk",
      "profilePicture": "https://pbs.twimg.com/...",
      "description": "...",
      "followers": 210000000,
      "following": 900,
      "isBlueVerified": true,
      "verifiedType": "Business",
      "location": "...",
      "joined": "2009-06-02T20:12:29.000Z"
    }
  ],
  "not_found": [],
  "total_requested": 3,
  "total_found": 3
}
```

### Notes

- Fewer than 10 users: charged minimum $0.02
- More than 100 users: first 100 queried, charged $0.20 max
- Duplicates removed automatically
- Not charged if zero users are returned

### Example

```bash
# Base
curl -X POST https://blockrun.ai/api/v1/x/users/lookup \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["elonmusk", "sama", "vitalikbuterin"]}'

# Solana
curl -X POST https://sol.blockrun.ai/api/v1/x/users/lookup \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["elonmusk", "sama", "vitalikbuterin"]}'
```

Returns `402` with payment requirements. Attach an x402 payment header to get results.

---

## Follower List

Fetch a Twitter/X user's follower list — ~200 followers per page with cursor-based pagination.

```
POST https://blockrun.ai/api/v1/x/users/followers      # Base
POST https://sol.blockrun.ai/api/v1/x/users/followers   # Solana
```

### Pricing

| Per Page | Followers per Page | Pagination |
|----------|--------------------|------------|
| $0.05 | ~200 | Cursor-based |

### Request

```json
{
  "username": "elonmusk",
  "cursor": "1234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | Yes | Twitter username to fetch followers for. `@` prefix auto-stripped. |
| `cursor` | `string` | No | Pagination cursor from previous response (`next_cursor` field). |

### Response

```json
{
  "followers": [
    {
      "id": "12345678",
      "name": "Alice Smith",
      "screen_name": "alicesmith",
      "userName": "alicesmith",
      "location": "San Francisco, CA",
      "description": "Builder. Investor.",
      "protected": false,
      "verified": false,
      "followers_count": 1200,
      "following_count": 400,
      "friends_count": 400,
      "favourites_count": 8500,
      "statuses_count": 3500,
      "created_at": "2015-03-12T10:00:00.000Z",
      "profile_banner_url": "https://pbs.twimg.com/...",
      "profile_image_url_https": "https://pbs.twimg.com/...",
      "can_dm": false
    }
  ],
  "has_next_page": true,
  "next_cursor": "1234567891",
  "total_returned": 200,
  "username": "elonmusk"
}
```

### Pagination

Pass `next_cursor` from the response as `cursor` in the next request to fetch the next page:

```json
{
  "username": "elonmusk",
  "cursor": "1234567891"
}
```

Each page costs $0.05. Continue until `has_next_page` is `false`.

### Notes

- Returns ~200 followers per page
- Not charged if no followers are returned
- Rate limit: 120 requests per hour per client

### Example

```bash
# First page (Base)
curl -X POST https://blockrun.ai/api/v1/x/users/followers \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'

# First page (Solana)
curl -X POST https://sol.blockrun.ai/api/v1/x/users/followers \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'

# Next page (using cursor from previous response)
curl -X POST https://sol.blockrun.ai/api/v1/x/users/followers \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "cursor": "1234567891"}'
```

---

## Following List

Fetch the list of accounts a Twitter/X user follows — ~200 per page with cursor-based pagination.

```
POST https://blockrun.ai/api/v1/x/users/followings      # Base
POST https://sol.blockrun.ai/api/v1/x/users/followings   # Solana
```

### Pricing

| Per Page | Followings per Page | Pagination |
|----------|--------------------|------------|
| $0.05 | ~200 | Cursor-based |

### Request

```json
{
  "username": "elonmusk",
  "cursor": "1234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | Yes | Twitter username to fetch followings for. `@` prefix auto-stripped. |
| `cursor` | `string` | No | Pagination cursor from previous response (`next_cursor` field). |

### Response

```json
{
  "followings": [
    {
      "id": "12345678",
      "name": "Alice Smith",
      "screen_name": "alicesmith",
      "userName": "alicesmith",
      "location": "San Francisco, CA",
      "description": "Builder. Investor.",
      "protected": false,
      "verified": false,
      "followers_count": 1200,
      "following_count": 400,
      "friends_count": 400,
      "favourites_count": 8500,
      "statuses_count": 3500,
      "created_at": "2015-03-12T10:00:00.000Z",
      "profile_banner_url": "https://pbs.twimg.com/...",
      "profile_image_url_https": "https://pbs.twimg.com/...",
      "can_dm": false
    }
  ],
  "has_next_page": true,
  "next_cursor": "1234567891",
  "total_returned": 200,
  "username": "elonmusk"
}
```

### Pagination

Pass `next_cursor` from the response as `cursor` in the next request to fetch the next page:

```json
{
  "username": "elonmusk",
  "cursor": "1234567891"
}
```

Each page costs $0.05. Continue until `has_next_page` is `false`.

### Notes

- Returns ~200 followings per page
- Not charged if no followings are returned
- Rate limit: 120 requests per hour per client

### Example

```bash
# First page (Base)
curl -X POST https://blockrun.ai/api/v1/x/users/followings \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'

# First page (Solana)
curl -X POST https://sol.blockrun.ai/api/v1/x/users/followings \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'

# Next page (using cursor from previous response)
curl -X POST https://sol.blockrun.ai/api/v1/x/users/followings \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "cursor": "1234567891"}'
```

---

## Rate Limits

All endpoints: **120 requests per hour** per client (identified by wallet address or IP).

## Partner

These endpoints are powered by [AttentionVC](https://attentionvc.ai) — an X/Twitter data and intelligence platform with 35+ endpoints. Payments go directly to the AttentionVC treasury via x402 on both Base and Solana networks.

For the full AttentionVC API (direct access), visit [api.attentionvc.ai/docs](https://api.attentionvc.ai/docs).
