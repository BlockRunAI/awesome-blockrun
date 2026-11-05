---
title: Anchorage integration and result recovery
description: Avoid duplicate submissions, schema failures and truncated paid results when using BlockRun through an agent wallet.
---

# Anchorage integration and result recovery

The November 5, 2026 audit tested the Base and Solana x402 gateways. It did not test the separate MPP gateway. A successful on-chain payment, a successful HTTP response and a result delivered to the agent are separate observations; record all three.

## Long requests and lost responses

Handle HTTP `202` and retain `id`, `poll_url`, the original signed credential and any receipt before retrying. Music submits hand off after about ten seconds. Search also returns a recovery handle when it runs longer than that window. An exact search credential recovers the original task pointer for 24 hours. Retrieve the result and receipt through `GET /api/v1/search/{id}` using a fresh wallet message proof from the same wallet (Base also accepts an unused payment authorization); the poll never settles another payment. A historical payment credential or job URL alone grants no content access.

A recoverable replay returns `202` with the original task pointer. Poll that task. A new authorization starts a separate billable submission. Do not treat every `402`, timeout or missing client response as proof that nothing settled: inspect the original receipt or ledger first.

Solana transactions have a limited recent-blockhash lifetime. An already paid music or search task should be located through its original submission binding, then polled with a wallet ownership proof or fresh identity authorization. Re-simulating the old transaction is unnecessary. A genuinely new payment requires a newly constructed transaction with a current blockhash.

For Solana search, sign `blockrun-poll:v1:search:<id>:<unix seconds>` as a UTF-8 ed25519 message. Send the public key as `x-poll-wallet`, timestamp as `x-poll-timestamp` and base58 signature as `x-poll-signature`. The original submit credential retrieves only the pointer; it is not a permanent read token. Polling never simulates or settles a transaction. These recovery records are created by the fixed submit flow; a historical lost response without a saved job cannot be reconstructed retroactively.

## Response contracts and size limits

Search citations are `{ "url": "https://example.org", "title": "Example" }` objects. Image editing returns short media URLs. Polling an older paid image job repairs a missing backup from its stored image without another generation or charge.

For DeFiLlama, use `?format=compact&limit=25` and optionally `fields=name,slug,tvl`. Responses remain below 256 KiB and include `pagination.next_offset`. Protocol detail omits large historical arrays by default in compact mode. Each page is a separately priced request. Raw passthrough is still available; a client with a response cap may truncate it even when the gateway returned the complete data.

## Media formats, exact prices and funding metadata

Generated image MIME types and extensions follow the encoded bytes rather than an upstream label. A JPEG must be served as `image/jpeg` with a `.jpg` URL, even when a provider labels it PNG. Existing historical objects keep their original URLs; correction applies when an asset is backed up or generated through the fixed flow.

USDC amounts use six decimal places. Solana quotes and displayed image-result prices derive from the same integer micro-USDC amount. Floating-point noise such as `0.05 * 1.05` must not add an extra micro-USDC; a genuine fractional micro-USDC still rounds up. The audit's one-micro difference was between a display field and the quote; the actual charge matched the quote.

Batch funding challenges identify the configured public resource URL, never Cloud Run's internal `0.0.0.0:8080` address or an arbitrary forwarded host. This corrects challenge metadata; the audit did not execute a real channel deposit or establish a signature exploit.

## Discover supported requests before paying

- Read the current model list. `openai/gpt-4.1-nano` was retired by OpenAI on October 23, 2026; use an available replacement such as `openai/gpt-4.1-mini`.
- Music costs **$0.20 per track including the transaction fee**. Read the live `402` quote before signing.
- FX and commodity spot prices are available, but their free historical-bar source is unsupported (`501`). Equity symbol lists may return `available: false`; a listed symbol is not a promise of price coverage.
- UMA markets requires `state`. Kalshi trades requires `ticker` or `event_ticker`.
- Smart activity requires at least one meaningful threshold: PnL of 5000, ROI of 0.15, 100 trades, or volume of 10000. Per-market smart money uses a PnL threshold of 1000; the alternative thresholds remain valid.
- Binance minute candles need a short time range. When both timestamps are omitted, the wrapper requests the last hour. Unix timestamps are seconds.
- Register stable submit/discovery endpoints. A historical `/audio/generations/{id}` URL is a particular task, not a reusable public API entry. Unauthorized access to an old job says nothing about whether new music generation works.

## Free wallet authentication

`POST /api/v1/onramp/token` and `POST /api/v1/phone/numbers/release` support wallet messages instead of zero-value payments: EIP-191 on Base (hex signature), ed25519 on Solana (base58 signature). Send the owner address in `X-Wallet-Address` to obtain the message in a `401` response, sign it locally, and resend the identical body with `X-Wallet-Address`, `X-Wallet-Timestamp` and `X-Wallet-Signature`. The proof binds origin, method, path, wallet, body hash and timestamp, expires after five minutes and can be used once. The Onramp destination must match the signer and number release still requires ownership. GET returns a message template with HTTP 401, not an x402 quote. POST returns the exact body-bound message. No transaction or payment is necessary.

A payment-only wallet tool that cannot sign messages needs client support for this flow. Increasing the fee is not a substitute for an identity proof on a free operation.

## Distinguish unresolved client state from merchant defects

Endpoint-registration throttling is an Anchorage-side limit. Reuse registrations and honor retry/backoff guidance instead of creating a new registration for every job URL. BlockRun cannot change the wallet service's internal limiter.

A `pending_confirmation` amount can be a budget hold. It is not evidence of a second on-chain charge. Reconcile wallet payment IDs, original merchant job IDs and chain transactions before refunding or submitting another payment. A pending task that later completes is not a permanent service outage.

The audit's video poll encountered a facilitator payload-schema rejection, but the original signed header was unavailable. Envelope normalization and validation improve interoperability and diagnostics; they do not establish which side produced that original malformed envelope. Capture redacted field names and versions for future diagnosis, never private keys or complete signed credentials.
