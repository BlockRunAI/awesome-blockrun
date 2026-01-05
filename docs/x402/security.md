# Security

How x402 keeps your funds and data safe.

## Key Security Properties

### Private Key Never Sent

Your private key never leaves your device. The x402 protocol uses **signatures**, not key transmission:

```
Client                              Server
  |                                    |
  |  Private key stays here            |
  |  Only signature is sent ---------> |
  |                                    |
```

### Payment Authorization, Not Transfer

You don't send USDC directly. Instead, you sign an **authorization** that allows a specific recipient to claim a specific amount within a time window.

```json
{
  "from": "your-wallet",
  "to": "service-wallet",
  "value": "1000",
  "validAfter": "1234567890",
  "validBefore": "1234568190"
}
```

Benefits:
- **Revocable** - Expires if not claimed
- **Specific** - Only the named recipient can claim
- **Limited** - Only the specified amount

### EIP-3009 Standard

x402 uses [EIP-3009 TransferWithAuthorization](https://eips.ethereum.org/EIPS/eip-3009), a standard for gasless token transfers:

- Widely audited and used
- Supported by major stablecoins (USDC, EURC)
- Battle-tested in production

### EIP-712 Typed Data

Signatures use [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed structured data:

- Human-readable in wallet signing prompts
- Domain-separated to prevent replay attacks
- Includes chain ID to prevent cross-chain replay

## Threat Model

### What x402 Protects Against

| Threat | Protection |
|--------|------------|
| Key theft during transmission | Private key never sent |
| Overpayment | Exact amount specified in signature |
| Replay attacks | Unique nonce per transaction |
| Cross-chain replay | Chain ID in signature domain |
| Stale authorizations | Time-bounded validity window |
| Man-in-the-middle | Cryptographic signature verification |

### What You Must Protect

| Responsibility | How |
|----------------|-----|
| Private key security | Use secure storage (env vars, secret managers) |
| Wallet balance | Only fund wallets with needed amounts |
| Network security | Use HTTPS endpoints |

## Best Practices

### Private Key Storage

**Development:**
```bash
# .env file (git-ignored)
BLOCKRUN_WALLET_KEY=0x...
```

**Production:**
```bash
# Use secret managers
# AWS Secrets Manager, GCP Secret Manager, etc.
```

### Wallet Hygiene

1. **Use a dedicated wallet** - Don't use your main wallet
2. **Fund incrementally** - Add USDC as needed
3. **Monitor balance** - Set up alerts for low balance

### Request Validation

The SDKs validate responses:

```python
# SDK validates:
# - Response came from expected endpoint
# - Payment amount matches quoted price
# - Response is properly formatted
```

## Facilitator Security

The CDP Facilitator (Coinbase Developer Platform) provides:

| Feature | Benefit |
|---------|---------|
| Signature verification | Ensures only valid payments accepted |
| Rate limiting | Prevents abuse |
| Audit logging | Transaction traceability |
| Multi-sig operations | Enterprise-grade security |

## FAQ

### Can BlockRun steal my funds?

No. BlockRun can only claim the exact amount you authorized for a specific request. Your wallet remains under your control.

### What if I sign but the request fails?

If the AI request fails, the payment is not settled. You only pay for successful requests.

### Can someone replay my payment?

No. Each payment has a unique nonce that can only be used once.

### What if BlockRun's servers are compromised?

Attackers could only claim payments for requests they process. They cannot access your wallet or claim more than authorized amounts.

## Audits

- EIP-3009 (USDC): Audited by Trail of Bits
- x402 Protocol: Open source, community reviewed
- CDP Facilitator: Operated by Coinbase with SOC 2 compliance

## Reporting Issues

Found a security issue? Please report responsibly:

1. Do not disclose publicly
2. Email security concerns to the BlockRun team
3. Allow time for fixes before disclosure
