---
title: Polymarket Funding API
description: Gaslessly fund an AI agent's Polymarket deposit wallet from its own Base USDC in one non-custodial x402 call — no Base ETH, no custody, Polymarket-only.
---

# Polymarket Funding API

Fund an agent's **Polymarket deposit wallet** from its own **Base USDC** in a single x402 call — **gaslessly** (the agent never needs Base ETH) and **non-custodially** (BlockRun never receives or holds the principal).

This is the one on-chain money-movement BlockRun performs for prediction markets. It is deliberately **constrained to Polymarket**: the destination is validated to be the Polymarket bridge address for the caller's own vault, so this is not a general-purpose transfer relay. For market **data** (prices, orderbooks, positions, wallet analytics) see the [Prediction Markets API](prediction-markets.md).

:::note
Pairs with `blockrun_polymarket action:"fund"` in [BlockRun MCP](../mcp/blockrun-mcp.md).
:::

## How it works

The agent signs **two** EIP-3009 (`transferWithAuthorization`) USDC authorizations and sends both in one request:

1. **Deposit** — the agent's USDC → the Polymarket bridge address for its vault.
2. **Fee** — `$0.01` USDC → the BlockRun treasury (the standard x402 payment).

BlockRun then:

1. Verifies the `$0.01` fee authorization and guards it against replay.
2. **Validates** that `recipient` really is the Polymarket bridge deposit address for the caller's `depositWallet` (live lookup against the bridge). A mismatch is rejected before any settlement.
3. Hands the **deposit** authorization to the CDP facilitator, which broadcasts it and **pays the gas**. The USDC settles **directly to the bridge** — BlockRun is never in the flow of funds.
4. Only after the deposit is confirmed on-chain does BlockRun charge the `$0.01` fee.
5. The Polymarket bridge wraps the USDC → **pUSD** and credits the agent's vault on **Polygon**.

**A deposit that does not confirm is never billed.** The fee is charged only after the deposit settles on-chain.

## Networks

This call is **cross-chain**: you sign and move **USDC on Base**, and it lands as **pUSD in your Polymarket vault on Polygon**.

| Leg | Chain | Asset |
|-----|-------|-------|
| API + fee | Base | USDC (via `https://blockrun.ai`) |
| Deposit authorization (what you sign) | Base | USDC → Polymarket bridge |
| Vault destination (where it arrives) | Polygon | pUSD |

Both authorizations you sign — the `$0.01` fee and the deposit — are **Base USDC**; you never touch Polygon or hold Base ETH for gas. The Polymarket bridge wraps the deposited USDC to **pUSD** and credits your vault on Polygon.

## Pricing

| Item | Amount | Paid to |
|------|--------|---------|
| Service fee | `$0.01` (`POLYMARKET_FUND_FEE_USD`) | BlockRun treasury (x402) |
| Gas | Sponsored by BlockRun | — |
| Deposit principal | Your chosen amount | Polymarket bridge (non-custodial) |

Maximum deposit per call: `$10,000` (`POLYMARKET_FUND_MAX_USD`).

---

## `POST /api/v1/polymarket/fund`

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `depositWallet` | string (address) | ✅ | Your Polymarket deposit wallet — the owner of the vault being funded. |
| `recipient` | string (address) | ✅ | The Polymarket bridge address for your vault. Obtain it from the bridge (`POST bridge.polymarket.com/deposit` with `{ "address": <depositWallet> }`) — it is validated server-side. |
| `amountMicro` | string | ✅ | Deposit amount in **micro-USDC** (6 decimals) as a canonical integer string, e.g. `"25000000"` for `$25`. **Must exactly equal the `value` in your signed deposit authorization.** |
| `depositAuthorization` | string | ✅ | Base64 x402 payload: your EIP-3009 signed USDC transfer of `amountMicro` to `recipient`. |

The `$0.01` fee authorization travels in the standard `X-Payment` header, exactly like every other paid BlockRun endpoint.

### Discovery (402)

Call the endpoint with no `X-Payment` header to receive the machine-readable payment requirement and body schema:

```bash
curl -X POST https://blockrun.ai/api/v1/polymarket/fund
```

```json
{
  "error": "Payment Required",
  "endpoint": "/api/v1/polymarket/fund",
  "method": "POST",
  "price": { "amount": "0.0100", "currency": "USD" },
  "paymentInfo": { "network": "base", "asset": "USDC", "x402Version": 2 }
}
```

### Success (200)

```json
{
  "success": true,
  "funded": false,
  "creditPending": true,
  "status": "deposit_submitted",
  "deposit": {
    "txHash": "0x…",
    "amountUsd": 25,
    "recipient": "0x…",
    "network": "base"
  },
  "fee": { "amountUsd": 0.01, "txHash": "0x…", "settled": true },
  "note": "Deposit submitted to the Polymarket bridge and confirmed on Base. The bridge credits pUSD to your Polygon vault asynchronously — usually within minutes, occasionally 30+. This endpoint cannot confirm the Polygon-side credit; poll your vault balance until pUSD appears."
}
```

The confirmed deposit transaction hash is also returned in the `X-Deposit-Tx` response header; the fee receipt is in `X-Payment-Receipt`.

:::warning Settlement is asynchronous
`success: true` means the deposit was **submitted to the bridge and confirmed on Base** — and the `$0.01` fee charged. It does **not** mean your vault is funded yet: `funded` is `false` and `creditPending` is `true`. The Polymarket bridge credits **pUSD on Polygon** off-chain and asynchronously — usually within minutes, occasionally **30+ minutes**. There is no on-chain bridge message to poll; check your Polygon vault's pUSD balance until it lands. Very small deposits and non-standard deposit wallets may take longer or require a real (setup-derived) vault.
:::

### Errors

| Status | Meaning | Billed? |
|--------|---------|---------|
| `400` | Missing/invalid field, or `amountMicro` does not match the signed authorization value | No |
| `402` | Fee authorization missing or failed verification | No |
| `403` | `recipient` is not the Polymarket bridge address for `depositWallet` | No |
| `502` | Deposit failed to settle / reverted on-chain — **no USDC moved** | No |
| `503` | Polymarket bridge temporarily unreachable — try again shortly | No |

Every non-2xx response that could otherwise be ambiguous states explicitly whether your USDC moved and whether the fee was charged. **The fee is charged only on a confirmed deposit.**

## Example

```bash
curl -X POST https://blockrun.ai/api/v1/polymarket/fund \
  -H "X-Payment: <base64 signed $0.01 fee authorization>" \
  -H "Content-Type: application/json" \
  -d '{
    "depositWallet": "0xYourVaultOwner…",
    "recipient": "0xPolymarketBridge…",
    "amountMicro": "25000000",
    "depositAuthorization": "<base64 signed USDC->bridge authorization>"
  }'
```

With the MCP, the agent does the two-signature dance for you:

```
Fund my Polymarket wallet with $25 from my Base USDC.
```

## Safety & design

- **Deposit-then-fee ordering** — the fee is billed only after the deposit confirms on-chain, so a failed or reverted deposit is never charged.
- **Polymarket-only** — `recipient` must be your own vault's bridge address, verified live before any settlement. This is not a general transfer relay.
- **Non-custodial** — the deposit settles directly to the bridge via the CDP facilitator; BlockRun never receives or holds the principal, and runs no server-side broadcaster or hot wallet. Gas is sponsored the same way as every other x402 call.
- **Amount integrity** — `amountMicro` is validated against the signed authorization value, so the amount you see is the amount that moves.
- **Idempotent** — retrying a request whose deposit already settled returns the original result instead of double-depositing.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `POLYMARKET_FUND_FEE_USD` | `0.01` | Service fee per funding call |
| `POLYMARKET_FUND_MAX_USD` | `10000` | Maximum deposit per call |
| `POLYMARKET_BRIDGE_HOST` | `https://bridge.polymarket.com` | Polymarket bridge host used for recipient validation |
