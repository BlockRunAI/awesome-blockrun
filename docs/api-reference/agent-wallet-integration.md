---
title: Agent wallet integration and result recovery
description: Avoid duplicate submissions, schema failures and truncated paid results when using BlockRun through an agent wallet.
---

# Agent wallet integration and result recovery

This page applies to the Base and Solana x402 gateways, not the separate MPP gateway. A successful on-chain payment, a successful HTTP response and a result delivered to the agent are separate observations; record all three.

## Long requests and lost responses

Handle HTTP `202` and retain `id`, `poll_url`, the original signed credential and any receipt before retrying. Music submits hand off after about ten seconds. Search keeps the connection open until the result is ready; send `Prefer: respond-async` to get `202` with `id` and `poll_url` after about ten seconds instead. Either way, an exact search credential recovers the original task pointer for 24 hours. Retrieve the result and receipt through `GET /api/v1/search/{id}` using a fresh wallet message proof from the same wallet (Base also accepts an unused payment authorization); the poll never settles another payment. A historical payment credential or job URL alone grants no content access.

Replaying the original credential returns the original task pointer even after payment has settled. Search returns `409` with code `SEARCH_ALREADY_SUBMITTED` unless the caller sends `Prefer: respond-async`, which opts into `202`; music and images use `202`. Poll that task rather than paying for another submission. Solana image generation and editing persist an owner-bound job and canonical credential digest before charging, and recover the pointer before simulating an expired or spent transaction. A recovered pointer does not authorize delivery: the poll withholds images while the original POST payment is pending or definitely refused. An unknown settlement outcome may already have charged, so check the original receipt before authorizing another payment. Batch and charge-on-completion jobs keep their existing completion-payment flow. A search that recorded no result ends differently on each gateway: on Base the poll returns `502` with code `RESULT_UNAVAILABLE` after about 15 minutes, and on Solana it returns `200` with `status: "failed"` after about an hour. Either way, check the original receipt before authorizing another. A new authorization starts a separate billable submission. Do not treat every `402`, timeout or missing client response as proof that nothing settled: inspect the original receipt or ledger first.

Solana transactions have a limited recent-blockhash lifetime. An already paid music, image or search task should be located through its original submission binding, then polled. Re-simulating the old transaction is unnecessary. A genuinely new payment requires a newly constructed transaction with a current blockhash.

For Solana search, sign `blockrun-poll:v1:search:<id>:<unix seconds>` as a UTF-8 ed25519 message. Send the public key as `x-poll-wallet`, timestamp as `x-poll-timestamp` and base58 signature as `x-poll-signature`. This is the only way to read a Solana search result: a payment-only wallet that cannot sign messages gets `401`, so it can recover the task pointer but not the content. The original submit credential retrieves only the pointer; it is not a permanent read token. Polling never simulates or settles a transaction. These recovery records are created by the current submit flow; a historical lost response without a saved job cannot be reconstructed retroactively.

## Response contracts and size limits

Search citations are `{ "url": "https://example.org", "title": "Example" }` objects. Image editing returns short media URLs. On Base, polling an older paid image job repairs a missing backup from its stored image without another generation or charge.

On Base, DeFiLlama accepts `?format=compact&limit=25` and optionally `fields=name,slug,tvl`. Compact responses stay below 256 KiB. A selection that cannot fit returns `413` without a charge; a nonempty page whose selected fields produce only empty objects returns `400` without a charge. An actually empty page remains valid. List responses include `pagination.next_offset`, which is `null` on the last page; detail responses have `pagination: null`. Protocol detail omits large historical arrays by default in compact mode. Each page is a separately priced request. Raw passthrough is still available; a client with a response cap may truncate it even when the gateway returned the complete data. The Solana gateway has no DeFiLlama route.

## Recovery windows and stored data

The application limits search-result and media-submission recovery to 24 hours. Recovery records use a separate 2-day lifecycle eligibility rule; generated media and media-job records retain their existing 30-day rule. Lifecycle deletion runs asynchronously, and bucket soft delete or versioning can retain copies afterward. A read-window limit is not a promise of immediate physical deletion. Operators must apply and verify the bucket rules before deploying the recovery flow.

## Media formats, exact prices and funding metadata

Generated image MIME types and extensions follow the encoded bytes rather than an upstream label. A JPEG must be served as `image/jpeg` with a `.jpg` URL, even when a provider labels it PNG. Existing historical objects keep their original URLs; correction applies when an asset is backed up or generated through the current flow.

USDC amounts use six decimal places. Solana quotes and displayed image-result prices derive from the same integer micro-USDC amount. Floating-point noise such as `0.05 * 1.05` must not add an extra micro-USDC; a genuine fractional micro-USDC still rounds up.

Solana batch funding challenges identify the configured public resource URL, not an internal or forwarded host.

## Discover supported requests before paying

- Read the current model list. `openai/gpt-4.1-nano` was retired by OpenAI on October 23, 2026. `openai/gpt-4.1-mini` is available, though OpenAI has scheduled its dated snapshot for removal on January 14, 2027.
- Music costs **$0.20 per track including the transaction fee**. Read the live `402` quote before signing.
- FX and commodity spot prices are available, but their free historical-bar source is unsupported (`501`). Equity symbol lists may return `available: false`; a listed symbol is not a promise of price coverage.
- UMA markets requires `state`. Kalshi trades requires `ticker` or `event_ticker`.
- Smart activity requires at least one meaningful threshold: PnL of 5000, ROI of 0.15, 100 trades, or volume of 10000. Per-market smart money uses a PnL threshold of 1000; the alternative thresholds remain valid.
- The Base gateway rejects requests missing these market parameters before payment. The Solana gateway does not pre-check them, so send them yourself.
- On Base, Binance minute candles default to the last hour when both timestamps are omitted. Elsewhere, send a short time range. Unix timestamps are seconds.
- Register stable submit/discovery endpoints. A historical `/audio/generations/{id}` URL is a particular task, not a reusable public API entry. Unauthorized access to an old job says nothing about whether new music generation works.

## Free wallet authentication

`POST /api/v1/onramp/token` and `POST /api/v1/phone/numbers/release` support wallet messages instead of zero-value payments: EIP-191 on Base (hex signature), ed25519 on Solana (base58 signature). Send the owner address in `X-Wallet-Address` to obtain the message in a `401` response, sign it locally, and resend the identical body with `X-Wallet-Address`, `X-Wallet-Timestamp` and `X-Wallet-Signature`. The proof binds origin, method, path, wallet, body hash and timestamp, expires after five minutes and can be used once. The Onramp destination must match the signer and number release still requires ownership. GET returns a message template with HTTP 401, not an x402 quote. POST returns the exact body-bound message. No transaction or payment is necessary.

A payment-only wallet tool that cannot sign messages needs client support for this flow. Increasing the fee is not a substitute for an identity proof on a free operation.

## Distinguish unresolved client state from merchant defects

Endpoint-registration throttling is a limit inside the wallet service, not on BlockRun. Reuse registrations and honor retry/backoff guidance instead of creating a new registration for every job URL.

A `pending_confirmation` amount can be a budget hold. It is not evidence of a second on-chain charge. Reconcile wallet payment IDs, original merchant job IDs and chain transactions before refunding or submitting another payment. A pending task that later completes is not a permanent service outage.

If a facilitator rejects a payment payload's schema, capture redacted field names and versions for diagnosis, never private keys or complete signed credentials.
