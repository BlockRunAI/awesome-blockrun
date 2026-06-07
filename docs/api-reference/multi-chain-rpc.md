# Multi-chain RPC — one endpoint, 40+ chains

Standard JSON-RPC 2.0 access to 40+ blockchains through a single endpoint. No account, no API key, no monthly plan — pay **$0.002 per call** in USDC over x402. Built for AI agents that read on-chain data across many chains from one wallet.

Powered by [Tatum](https://tatum.io). BlockRun proxies Tatum's RPC gateways with x402 settlement, so an agent can query any supported chain without onboarding to a node provider.

## The problem it solves

Traditional RPC providers (Alchemy, Infura, QuickNode) make you sign up, manage an API key, and pick a monthly plan with rate-limit tiers — **per chain**. An agent that needs Ethereum *and* Base *and* Solana *and* Polygon ends up with four accounts and four keys. BlockRun gives you one endpoint for 40+ chains, paid per call, with on-chain settlement receipts.

## Endpoint

```
POST /api/v1/rpc/{network}
```

Swap `{network}` for the chain. Body is a standard JSON-RPC 2.0 request; the response is returned verbatim from the upstream node. EVM (`eth_*`) and non-EVM (`getSlot`, …) methods both work. A JSON-RPC **batch** (array body) is priced per element.

**Flat price: $0.002 per call.** No payment header → HTTP 402 quoting the exact price; add an x402 payment header (a wallet signature) → the result, settled in USDC on Base. Hot reads are cached.

## Supported networks (40+)

EVM and non-EVM, one path each. A selection:

| Network | `{network}` slug | Aliases |
|---------|------------------|---------|
| Ethereum | `ethereum` | `eth` |
| Base | `base` | |
| Solana | `solana` | `sol` |
| Polygon | `polygon` | `matic` |
| BNB Smart Chain | `bsc` | `bnb` |
| Arbitrum | `arbitrum` | `arb` |
| Optimism | `optimism` | `op` |
| Avalanche | `avalanche` | `avax` |
| zkSync | `zksync` | |
| Bitcoin | `bitcoin` | `btc` |
| Litecoin | `litecoin` | `ltc` |
| Dogecoin | `dogecoin` | `doge` |
| XRP Ledger | `xrp` | `ripple` |
| Near | `near` | |
| Sui | `sui` | |
| Polkadot | `polkadot` | `dot` |

…and more. An unsupported `{network}` returns `400` with the full supported list. The live list is in `/openapi.json` and on [/marketplace/rpc](https://blockrun.ai/marketplace/rpc).

## Example

```bash
# Ethereum block number
curl -X POST https://blockrun.ai/api/v1/rpc/ethereum \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'
# → 402 with price $0.0020 + Base USDC payment instructions
# Re-send with the x402 PAYMENT-SIGNATURE header → {"jsonrpc":"2.0","id":1,"result":"0x..."}
```

```bash
# Solana slot
curl -X POST https://blockrun.ai/api/v1/rpc/solana \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getSlot","id":1}'
```

## MCP

Via the BlockRun MCP server, agents call the `blockrun_rpc` tool: `{ network, method, params }`.

## See also

- [Multi-chain RPC landing page](https://blockrun.ai/multi-chain-rpc) — overview + FAQ
- [BlockRun vs Alchemy](https://blockrun.ai/vs-alchemy) — when to use which
- [x402 endpoints](../x402/endpoints.md) — the full paid endpoint table
