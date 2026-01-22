# Risk Management

alpha-mcp has hardcoded safety limits to protect your capital. These limits **cannot be overridden** by the AI or by users.

## Built-in Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| **Max position size** | 15% | No single asset can exceed 15% of portfolio |
| **Total exposure cap** | 50% | Maximum 50% can be in risk assets |
| **Daily loss threshold** | 5% | Trading pauses if daily loss exceeds 5% |
| **Min cash reserve** | 50% | Always keep 50% in stablecoins |
| **Stop-loss trigger** | 15% | Auto-exit positions down 15% |

## How Enforcement Works

Every trade goes through `alpha_risk` before execution:

```
1. Claude wants to buy $500 ETH
2. alpha_risk checks:
   - Would this exceed 15% position size?
   - Would total exposure exceed 50%?
   - Would cash reserve drop below 50%?
   - Are we in daily loss lockout?
3. If any check fails → trade rejected with reason
4. If all checks pass → trade proceeds to alpha_swap
```

## Example Scenarios

### Scenario 1: Position Size Limit

```
Portfolio: $1000 total
Current ETH: $100 (10%)
Requested: Buy $100 more ETH

Check: Would ETH be 20%? > 15% limit
Result: REJECTED - "Would exceed 15% position limit"
```

### Scenario 2: Cash Reserve

```
Portfolio: $1000 total
Current cash: $600 (60%)
Requested: Buy $200 of tokens

Check: Would cash be 40%? < 50% minimum
Result: REJECTED - "Would violate 50% cash reserve"
```

### Scenario 3: Daily Loss Lockout

```
Portfolio started day: $1000
Current value: $940 (-6%)

Check: Daily loss > 5% threshold
Result: ALL TRADES REJECTED until next day
```

### Scenario 4: Approved Trade

```
Portfolio: $1000 total
Current cash: $700 (70%)
Current ETH: $50 (5%)
Requested: Buy $100 ETH

Checks:
- ETH would be 15% ✓ (at limit, not over)
- Cash would be 60% ✓ (above 50% minimum)
- Total exposure would be 40% ✓ (below 50% cap)
- No daily loss lockout ✓

Result: APPROVED
```

## Why These Limits?

### 15% Max Position

Prevents overconcentration. Even if AI is confident, diversification protects against being wrong.

### 50% Cash Reserve

Ensures you always have capital to:
- Average down on good opportunities
- Cover unexpected losses
- Exit positions gradually

### 50% Exposure Cap

Combined with cash reserve, this means:
- Max 50% in risk assets
- Min 50% in stablecoins
- Balanced exposure regardless of market conditions

### 5% Daily Loss Threshold

Circuit breaker to prevent catastrophic losses. If the day is going badly, stop trading and reassess.

### 15% Stop-Loss

Automatic exit to prevent holding losing positions indefinitely. Losses are cut, not hoped away.

## What You Cannot Do

Even if you ask Claude to:

❌ "Buy 50% of my portfolio in PEPE" → Rejected (exceeds position limit)

❌ "Go all-in on ETH" → Rejected (violates cash reserve)

❌ "Ignore the risk limits" → Limits are hardcoded, not prompts

❌ "Override safety for this one trade" → No override mechanism exists

## What You Can Do

✅ Trade within limits freely

✅ Ask Claude to optimize within constraints

✅ Use multiple smaller positions

✅ Let Claude manage risk automatically

## Viewing Current Risk Status

```
What's my current risk status?
```

Claude will show:
- Current positions as % of portfolio
- Remaining room in each limit
- Whether any limits are close
- Daily P&L status

## Best Practices

1. **Start small** — Test with amounts you can afford to lose
2. **Trust the limits** — They exist to protect you
3. **Review trades** — Check alpha_memory for decision history
4. **Monitor daily** — Check portfolio and P&L regularly

## Customization

Currently, risk limits are fixed. Future versions may support user-configurable limits with minimum safety floors.

## Next Steps

- [Tools Reference](tools.md)
- [Installation](installation.md)
- [Overview](overview.md)
