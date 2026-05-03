# 0x Swap (DEX)

Best-execution DEX aggregation for AI agents. BlockRun proxies the [0x V2 Swap API](https://docs.0x.org/0x-swap-api/introduction) — Permit2 swaps and Gasless V2 — as a **free public passthrough**. No API key required from the caller. No x402 payment.

BlockRun monetizes via the upstream **0x affiliate program**: a fixed **20 bps** (0.20%) fee, taken in the `sellToken` at swap settlement and routed to the BlockRun treasury on-chain. The fee is paid out by 0x at trade time, not by your end user beyond the spread.

## What this is good for

AI agents that swap tokens. Ask an agent to rebalance a wallet, take profit, dollar-cost-average into ETH, or convert revenue to stables — under the hood, it calls these endpoints, signs the resulting EIP-712, and submits the trade. The agent never holds an API key.

---

## Endpoints

| Endpoint | Method | Affiliate fee | Description |
|----------|--------|---------------|-------------|
| `/api/v1/zerox/price` | GET | 20 bps | Indicative Permit2 swap price (no commitment) |
| `/api/v1/zerox/quote` | GET | 20 bps | Firm Permit2 quote — returns `permit2.eip712` + tx data |
| `/api/v1/zerox/gasless/price` | GET | 20 bps | Indicative gasless price |
| `/api/v1/zerox/gasless/quote` | GET | 20 bps | Firm gasless quote — returns `trade.eip712` (+ optional `approval.eip712`) |
| `/api/v1/zerox/gasless/submit` | POST | — | Submit signed gasless trade. 0x relayer pays gas; returns `tradeHash` |
| `/api/v1/zerox/gasless/status/{tradeHash}` | GET | — | Poll status of a submitted gasless trade |
| `/api/v1/zerox/gasless/approval-tokens` | GET | — | List tokens supporting Permit-based gasless approval |
| `/api/v1/zerox/gasless/chains` | GET | — | List chains where Gasless V2 is supported |
| `/api/v1/zerox/swap/chains` | GET | — | List chains where Swap V2 is supported |

> **Note on affiliate injection.** BlockRun force-sets `swapFeeRecipient`, `swapFeeBps=20`, and `swapFeeToken=<sellToken>` on every `price` and `quote` call (Swap and Gasless). Caller-supplied values for these three params are stripped before the request reaches 0x — this slot is BlockRun's.

---

## Pricing & disclosure

| Item | Value |
|------|-------|
| Caller pays BlockRun | **$0** — free public passthrough |
| BlockRun affiliate fee | **20 bps** (0.20%) of `sellAmount`, paid by 0x in `sellToken` |
| Fee recipient | BlockRun treasury on Base (`0xe9030014F5DAe217d0A152f02A043567b16c1aBf`) |
| Settlement | On-chain at swap time (no batching, no minimum) |
| Cap (per 0x) | 1000 bps default ceiling — we charge 20 bps, well below |

Per the [0x monetization guide](https://docs.0x.org/docs/0x-swap-api/guides/monetize-your-app-using-swap), integrators should disclose the affiliate fee to end users. Suggested copy:

> "Routed via BlockRun (DEX aggregator: 0x). 0.20% affiliate fee included in the quote, paid in your sell token."

The fee amount is also returned in the response under `fees.integratorFee`. Display it directly if you want a per-trade breakdown.

---

## Swap V2 — Permit2 flow

Three steps: get a firm quote → sign the Permit2 EIP-712 → submit the transaction yourself (you pay gas).

### 1. Indicative price

```bash
curl "https://blockrun.ai/api/v1/zerox/price?\
chainId=8453&\
sellToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&\
buyToken=0x4200000000000000000000000000000000000006&\
sellAmount=10000000&\
taker=0xYourWallet"
```

(Above: 10 USDC → WETH on Base. `chainId=8453` is Base mainnet.)

Use `price` to display a quote in your UI without committing the route. No EIP-712 is returned.

### 2. Firm quote

```bash
curl "https://blockrun.ai/api/v1/zerox/quote?\
chainId=8453&\
sellToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&\
buyToken=0x4200000000000000000000000000000000000006&\
sellAmount=10000000&\
taker=0xYourWallet"
```

Response contains:

- `transaction` — the calldata + value to broadcast
- `permit2.eip712` — the typed-data payload to sign
- `fees.integratorFee.amount` — the BlockRun affiliate amount in `sellToken` base units
- `fees.integratorFee.token` — same as `sellToken`
- `fees.integratorFee.type` — `"volume"`

The fee math is `(20 / 10000) * sellAmount` in the sell-token's smallest unit. For 10 USDC (10_000_000 base units), `integratorFee.amount` is `20000` (= $0.02).

### 3. Sign and submit

Sign `permit2.eip712` with the taker wallet, append the signature to `transaction.data` per the 0x Permit2 contract ABI, and broadcast `transaction`. Your caller pays gas. The 20 bps is settled to BlockRun in the same transaction.

For end-to-end signing examples in TypeScript/viem and Python/web3.py, see the [0x Permit2 quickstart](https://docs.0x.org/0x-swap-api/guides/swap-tokens-with-0x-swap-api).

---

## Gasless V2 flow — relayer pays gas

Four steps: firm gasless quote → sign EIP-712 (trade + optional approval) → submit signatures → poll status. Your caller never broadcasts a transaction.

### 1. Firm quote

```bash
curl "https://blockrun.ai/api/v1/zerox/gasless/quote?\
chainId=8453&\
sellToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&\
buyToken=0x4200000000000000000000000000000000000006&\
sellAmount=10000000&\
taker=0xYourWallet"
```

Response contains `trade.eip712` (always) and `approval.eip712` (only if the sell token requires a one-time Permit approval). The same `fees.integratorFee` block appears as in Swap V2.

### 2. Submit signed payload

```bash
curl -X POST "https://blockrun.ai/api/v1/zerox/gasless/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "trade": { "eip712": {...}, "signature": {...} },
    "approval": { "eip712": {...}, "signature": {...} },
    "chainId": 8453
  }'
```

Returns a `tradeHash`.

### 3. Poll status

```bash
curl "https://blockrun.ai/api/v1/zerox/gasless/status/<tradeHash>"
```

Status progresses `pending → submitted → confirmed`. The 0x relayer pays gas; the affiliate fee still applies and settles on-chain at fill time.

### Eligibility check

Gasless requires the sell token to support either a Permit signature or have a pre-existing AllowanceTarget approval. Check first:

```bash
curl "https://blockrun.ai/api/v1/zerox/gasless/approval-tokens?chainId=8453"
```

---

## Helper endpoints

For capability discovery in your client:

```bash
# Chains where the Swap API is supported
curl "https://blockrun.ai/api/v1/zerox/swap/chains"

# Chains where Gasless V2 is supported
curl "https://blockrun.ai/api/v1/zerox/gasless/chains"
```

These are passthrough GETs with no fee.

---

## Use cases

### 1. Agent rebalances to a target allocation

```typescript
// Quote 100 USDC → WETH on Base
const quote = await fetch(
  `https://blockrun.ai/api/v1/zerox/quote?chainId=8453` +
  `&sellToken=${USDC_BASE}` +
  `&buyToken=${WETH_BASE}` +
  `&sellAmount=100000000` +
  `&taker=${wallet.address}`
).then(r => r.json());

const sig = await wallet.signTypedData(quote.permit2.eip712);
const tx = await wallet.sendTransaction({
  to: quote.transaction.to,
  data: appendPermit2Sig(quote.transaction.data, sig),
  value: quote.transaction.value,
});
```

### 2. Gasless DCA — agent has no ETH for gas

```typescript
const q = await fetch(
  `https://blockrun.ai/api/v1/zerox/gasless/quote?chainId=8453&...`
).then(r => r.json());

const tradeSig    = await wallet.signTypedData(q.trade.eip712);
const approvalSig = q.approval ? await wallet.signTypedData(q.approval.eip712) : null;

const { tradeHash } = await fetch(
  "https://blockrun.ai/api/v1/zerox/gasless/submit",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chainId: 8453,
      trade: { eip712: q.trade.eip712, signature: tradeSig },
      approval: q.approval ? { eip712: q.approval.eip712, signature: approvalSig } : undefined,
    }),
  }
).then(r => r.json());

// Poll until confirmed
let status;
do {
  await sleep(2000);
  status = await fetch(`https://blockrun.ai/api/v1/zerox/gasless/status/${tradeHash}`)
    .then(r => r.json());
} while (status.status === "pending" || status.status === "submitted");
```

### 3. Pre-flight chain support

Probe before quoting to avoid wasted requests on unsupported chains:

```typescript
const { chains } = await fetch("https://blockrun.ai/api/v1/zerox/swap/chains")
  .then(r => r.json());
const supported = chains.find(c => c.chainId === 8453);
```

---

## Errors

The gateway is a thin passthrough — 0x error bodies are returned verbatim with their original status code. Common cases:

| Code | Cause |
|------|-------|
| 400 | Invalid params (bad token address, missing `taker`, etc.) — check 0x's error message |
| 404 | Unknown path — only the endpoints listed above are routed |
| 422 | Quote could not be served (no liquidity, sell amount too small, etc.) |
| 502 | 0x upstream error or timeout (we have a 30s timeout on every call) |
| 503 | `ZERO_EX_API_KEY` not configured on the gateway — should never happen in prod |

See [Error Handling](errors.md) for the gateway-wide error envelope.

---

## Internal-only endpoints

The two paths below are present on the gateway for **BlockRun reconciliation only**. They proxy 0x's Trade Analytics API under BlockRun's API key, and surface every trade routed through us — including other integrators' fields. Do not call these from end-user agents.

| Endpoint | Purpose |
|----------|---------|
| `/api/v1/zerox/trade-analytics/swap` | Swap V2 trade history under BlockRun's key |
| `/api/v1/zerox/trade-analytics/gasless` | Gasless V2 trade history under BlockRun's key |

> **TODO:** auth-gate these to admin callers only. Tracked separately; not blocking the public Swap surface.

---

## Links

- [0x Swap API docs](https://docs.0x.org/0x-swap-api/introduction)
- [0x monetization guide](https://docs.0x.org/docs/0x-swap-api/guides/monetize-your-app-using-swap)
- [Permit2 quickstart](https://docs.0x.org/0x-swap-api/guides/swap-tokens-with-0x-swap-api)
- [Gasless V2 docs](https://0x.org/docs/gasless/introduction)
- [Error Handling](errors.md)
