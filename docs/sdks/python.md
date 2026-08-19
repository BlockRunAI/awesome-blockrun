---
title: Python SDK
description: The official BlockRun Python SDK — call 70 LLMs, smart routing, and prediction markets over x402 micropayments with no API keys.
---

# Python SDK

The official Python SDK for BlockRun — pay per call in USDC, no API keys or subscriptions.

**Source:** [github.com/BlockRunAI/blockrun-llm](https://github.com/BlockRunAI/blockrun-llm) · [PyPI: blockrun-llm](https://pypi.org/project/blockrun-llm/) · MIT

:::tip{title="In a hurry?"}
New to BlockRun? Run the [5-Minute Quickstart](../getting-started/quickstart.md) first to fund a wallet, then come back for the full SDK reference.
:::

::::steps

:::step{title="Install"}
```bash
pip install blockrun-llm
```
:::

:::step{title="Make your first call"}
```python
from blockrun_llm import LLMClient

client = LLMClient()
response = client.chat("openai/gpt-5.5", "Hello!")
print(response)
```
:::

::::

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BLOCKRUN_WALLET_KEY` | Your Base chain wallet private key |
| `BLOCKRUN_API_URL` | API endpoint (default: https://blockrun.ai/api) |

### Client Options

```python
from blockrun_llm import LLMClient

client = LLMClient(
    private_key="0x...",           # Wallet key (or use env var)
    api_url="https://blockrun.ai/api",  # Optional
    timeout=60.0                   # Request timeout in seconds
)
```

## Methods

### `chat(model, prompt, **options)`

Simple one-line chat interface.

```python
response = client.chat(
    "openai/gpt-5.5",
    "Explain quantum computing",
    system="You are a physics teacher.",  # Optional system prompt
    max_tokens=500,                        # Optional max output
    temperature=0.7                        # Optional temperature
)
```

**Returns:** `str` - The assistant's response text

### `chat_completion(model, messages, **options)`

Full OpenAI-compatible chat completion.

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "What is 2+2?"}
]

result = client.chat_completion(
    "openai/gpt-5.5",
    messages,
    max_tokens=100,
    temperature=0.7,
    top_p=0.9
)

print(result.choices[0].message.content)
print(f"Tokens used: {result.usage.total_tokens}")
```

**Returns:** `ChatResponse` object

### `list_models()`

Get available models with pricing.

```python
models = client.list_models()
for model in models:
    print(f"{model['id']}: ${model['inputPrice']}/M")
```

### `get_wallet_address()`

Get the wallet address being used.

```python
address = client.get_wallet_address()
print(f"Paying from: {address}")
```

## Smart Routing (Router Core)

**Save <!-- br:savings.autoVsBaselinePct -->88<!-- /br:savings.autoVsBaselinePct -->% on LLM costs automatically.**

Routing runs on [Router Core](https://github.com/BlockRunAI/router-core) — the same engine the TypeScript SDK and the BlockRun gateway use, so an identical request routes identically everywhere. Decisions are local (<1ms, no extra model call): your prompts never leave your machine to be routed.

Three stages:

1. **Classify** — <!-- br:clawrouter.dimensions -->15<!-- /br:clawrouter.dimensions --> weighted dimensions map the request onto a capability tier, and a task classifier labels the shape of the work (`chat`, `code_edit`, `code_agent`, `tool_agent`, `reasoning_math`, `long_context`, `extraction`, `vision`, …).
2. **Filter** — capability constraints are hard filters. A model that cannot hold the conversation, emit the requested `max_tokens`, call tools, or read images is dropped *before* scoring, so the router never picks a model the request would fail on.
3. **Rank** — survivors are scored on task affinity, cost, speed and reliability. The winner serves the request; the rest become the fallback chain, walked automatically on a timeout, a saturated upstream (429) or a 5xx.

### Basic Usage

```python
from blockrun_llm import LLMClient

client = LLMClient()

result = client.smart_chat("Summarize this changelog entry in one line")

print(result.response)
print(result.model)              # "google/gemini-2.5-flash"
print(result.routing.tier)       # "SIMPLE"
print(result.routing.task_type)  # "chat"
print(result.routing.savings)    # 0.90 (90% savings vs the baseline flagship)
```

### Inspect a decision without paying

`route()` runs the same routing and returns the decision only — no model call, no payment.

```python
decision = client.route("Prove that the square root of 2 is irrational")

print(decision.model)       # "deepseek/deepseek-v4-pro"
print(decision.tier)        # "REASONING"
print(decision.task_type)   # "reasoning"
print(decision.method)      # "portfolio"
print(decision.candidates)  # ordered chain; smart_chat walks it on a transient failure
print(decision.reasoning)   # human-readable explanation of the pick
```

### Routing a full message list

`smart_chat_completion()` is the routing counterpart of `chat_completion()`. Tools, `tool_choice` and `response_format` are inputs to the *decision*, not just the request, and capacity is checked against the whole transcript rather than the last message.

```python
result = client.smart_chat_completion(
    [{"role": "user", "content": "Cancel order B-42 using the tool."}],
    tools=[{"type": "function", "function": {"name": "cancel_order", "parameters": {}}}],
    tool_choice="required",
)

print(result.model)                              # "openai/gpt-5-mini" — tool-capable
print(result.routing.task_type)                  # "tool_agent"
print(result.response.choices[0].message.content)
```

### Virtual model ids

Passing `blockrun/auto`, `blockrun/eco` or `blockrun/premium` to the ordinary chat methods routes the turn instead of calling a model by that name — one string change to opt existing OpenAI-compatible code into routing.

```python
response = client.chat_completion("blockrun/auto", messages)
```

### Routing Profiles

| Profile | Behavior | Best For |
|---------|----------|----------|
| `"free"` | Only the <!-- br:models.free -->5<!-- /br:models.free --> $0 NVIDIA models — no wallet needed | Development, testing |
| `"eco"` | Cheapest capable model per tier | Bulk processing |
| `"auto"` | Balances quality and cost (default) | Production workloads |
| `"premium"` | Top-tier models | Critical tasks |

```python
# Free models only — a paid model can never leak into this profile
result = client.smart_chat("Explain recursion", routing_profile="free")
print(result.model)                 # "nvidia/step-3.7-flash"
print(result.routing.cost_estimate) # 0.0

# Maximum savings
result = client.smart_chat("Summarize this article: ...", routing_profile="eco")
print(result.model)  # "google/gemini-3.1-flash-lite"

# Premium for critical tasks
result = client.smart_chat("Review this contract for legal issues...", routing_profile="premium")
```

### Capability tiers

The classifier places every request in one of <!-- br:clawrouter.tiers -->4<!-- /br:clawrouter.tiers --> tiers. Under `auto`, the tier primary is the starting point — the portfolio then ranks the eligible candidates and may promote a better-suited model for the task.

| Tier | Auto primary | Use Case |
|------|--------------|----------|
| **SIMPLE** | `google/gemini-2.5-flash` | Q&A, summaries, simple tasks |
| **MEDIUM** | `moonshot/kimi-k2.7` | Analysis, writing, coding |
| **COMPLEX** | `google/gemini-3.1-pro` | Advanced reasoning, research, long documents |
| **REASONING** | `xai/grok-4-1-fast-reasoning` | Math, logic, proofs |

Under uncertainty the router fails **upward**: a score too close to a tier boundary is treated as ambiguous and defaults to MEDIUM, never SIMPLE.

### Routing Decision Details

```python
result = client.smart_chat("Prove that the square root of 2 is irrational")
routing = result.routing

print(routing.model)             # the model that served the request
print(routing.tier)              # "REASONING"
print(routing.task_type)         # "reasoning"
print(routing.method)            # "portfolio" ("rules" for the free profile)
print(routing.router_version)    # "v3-portfolio"
print(routing.confidence)        # 0.85
print(routing.reasoning)         # why this model won
print(routing.candidates)        # ordered candidate chain
print(routing.candidate_scores)  # per-model quality / cost / speed / reliability
print(routing.fallbacks)         # candidates[1:], the runtime retry chain
print(f"${routing.cost_estimate:.4f} vs ${routing.baseline_cost:.4f}")
print(f"Savings: {routing.savings:.0%}")
```

### Smart Routing Types

```python
from blockrun_llm import (
    RoutingProfile,              # Literal["free", "eco", "auto", "premium"]
    RoutingTier,                 # Literal["SIMPLE", "MEDIUM", "COMPLEX", "REASONING"]
    RoutingDecision,             # Full routing details
    CandidateScore,              # One row of routing.candidate_scores
    SmartChatResponse,           # response + model + routing
    SmartChatCompletionResponse, # ChatResponse + model + routing
)
```

### Every client routes

`LLMClient`, `AsyncLLMClient`, `SolanaLLMClient` and `AsyncSolanaLLMClient` all expose `route()`, `smart_chat()` and `smart_chat_completion()`. Both chains run the same engine over the same catalog, so the same request picks the same model; only the x402 minimum in the cost estimate differs ($0.002 on Base, $0.001 on Solana).

```python
import asyncio
from blockrun_llm import AsyncLLMClient, SolanaLLMClient

# Async, Base
async def main():
    async with AsyncLLMClient() as client:
        result = await client.smart_chat("What's the weather like?", routing_profile="eco")
        print(result.response)

asyncio.run(main())

# Solana — same routing, USDC on Solana
solana = SolanaLLMClient()
print(solana.route("Prove this theorem").model)
```

## Specialized clients

`LLMClient` covers chat and routing. Everything else — image, video, music, speech, voice, search, prices, RPC, and more — lives in a dedicated client class. Each is imported from `blockrun_llm` and constructed independently.

:::note{title="Every client shares one constructor"}
`Client(private_key=None, api_url=None, timeout=...)`. The key is resolved in order: the `private_key` argument → `BLOCKRUN_WALLET_KEY` → `BASE_CHAIN_WALLET_KEY` → `~/.blockrun/.session`. So if you've run `blockrun_wallet setup`, no argument is needed. Every client also exposes `get_wallet_address()` and `close()`.
:::

### Media generation

#### `ImageClient`

```python
from blockrun_llm import ImageClient

img = ImageClient()  # timeout defaults to 200s (gpt-image-2 at high res is slow)

# Generate — default model google/nano-banana, default size 1024x1024
res = img.generate("A cute cat astronaut, studio lighting", model="google/nano-banana-pro", size="1024x1024", n=1)
print(res.data[0].url)

# Edit / fusion — pass one data URI, or 2–4 to fuse (OpenAI ≤4, Nano Banana ≤3)
res = img.edit("Place this logo on the t-shirt", image=["data:image/png;base64,...", "data:image/png;base64,..."])
print(res.data[0].url)
```

Models: `google/nano-banana`, `google/nano-banana-pro`, `openai/gpt-image-1`, `openai/gpt-image-2`, `zai/cogview-4`, `xai/grok-imagine-image(-pro)`.

#### `VideoClient`

```python
from blockrun_llm import VideoClient

vid = VideoClient()  # timeout 360s; submit→poll handled for you (budget 900s, re-signs mid-poll)

res = vid.generate(
    "a red apple spinning on a marble counter",
    model="bytedance/seedance-2.0",
    duration_seconds=5,
    resolution="720p",          # 360p|480p|540p|720p|1080p|1K (Seedance); 4K only on seedance-2.0
    aspect_ratio="16:9",        # adaptive | 16:9 | 9:16 | 1:1 | 4:3 | 3:4 | 21:9 | 9:21
    generate_audio=True,
)
print(res.data[0].url)
```

:::note{title="Image-to-video inputs are mutually exclusive"}
Pass exactly one of `image_url` (first-frame), `real_face_asset_id` (a `ta_…` Virtual Portrait / RealFace asset), or `reference_image_urls` (≤9). `last_frame_url` seeds the final frame. `generate_from_content(content=[...])` accepts the Seedance `content[]` array.
:::

#### `MusicClient`

```python
from blockrun_llm import MusicClient

music = MusicClient()
res = music.generate("upbeat synthwave, driving bassline", model="minimax/music-2.5+", instrumental=True)
print(res.data[0].url)   # URL expires ~24h; download promptly. ~$0.1575/track
# For vocals: instrumental=False with lyrics="..." (passing both instrumental=True and lyrics raises ValueError)
```

#### `SpeechClient`

```python
from blockrun_llm import SpeechClient

tts = SpeechClient()
res = tts.generate("Hello from BlockRun!", model="elevenlabs/flash-v2.5", voice="sarah", response_format="mp3", speed=1.0)
print(res.data[0].url)

# Sound effects (flat $0.0535/generation)
sfx = tts.sound_effect("rain on a tin roof", duration_seconds=6.0)

voices = tts.list_voices()  # free, 60 req/min/IP
```

Voices: `sarah`, `george`, `laura`, `charlie`, `river`, `roger`, `callum`, `harry`, or a raw ElevenLabs `voice_id`. Formats: `mp3` (default), `opus`, `pcm`, `wav`. Speed `0.7`–`1.2`. Billed per character (`chars/1000 × rate`, $0.003 floor) — flash/turbo cap 40k chars, multilingual-v2 10k, v3 5k.

### Data & infrastructure

#### `SearchClient` — Grok Live Search

```python
from blockrun_llm import SearchClient

search = SearchClient()
res = search.search("latest agent-payments news", sources=["web", "news"], max_results=10)  # web | news
print(res.summary)
for c in res.citations:
    print(c)
```

`max_results` 1–50 (default 10); optional `from_date`/`to_date` (`YYYY-MM-DD`). Priced ~$0.025/source.

#### `PriceClient` — crypto / FX / commodities / stocks

```python
from blockrun_llm import PriceClient

px = PriceClient()                              # set require_wallet=False to use only free categories
btc = px.price("crypto", "BTC-USD")             # crypto, fx, commodity are FREE; usstock, stocks are paid
print(btc.price, btc.publishTime)

bars = px.history("crypto", "BTC-USD", resolution="D", from_ts=1700000000, to_ts=1710000000)
symbols = px.list_symbols("crypto", q="ETH", limit=20)
```

For `stocks`, pass `market` (`us`, `hk`, `jp`, `kr`, `gb`, `de`, `fr`, `nl`, `ie`, `lu`, `cn`, `ca`) and optionally `session` (`pre`/`post`/`on`). Resolutions: `1,5,15,60,240,D,W,M`.

#### `SurfClient` — crypto data (80+ endpoints)

```python
from blockrun_llm import SurfClient

surf = SurfClient()
ranking = surf.call("market/ranking", params={"limit": 20})   # auto GET/POST from the catalog
catalog = surf.endpoints()                                     # static: every path + tier + price
```

Tiers: T1 `$0.0085` (reads/lists), T2 `$0.0085` (AI rankings/trends/search), T3 `$0.0085` (heavy LLM + on-chain SQL). Use `surf.get(path, params)` / `surf.post(path, body)` for explicit verbs.

#### `RpcClient` — multi-chain JSON-RPC

```python
from blockrun_llm import RpcClient

rpc = RpcClient()
res = rpc.call("ethereum", "eth_blockNumber")          # $0.003/call
print(int(res.result, 16), "cache_hit:", res.cache_hit)

# JSON-RPC 2.0 batch — billed $0.003 x N
batch = rpc.batch("polygon", [{"method": "eth_blockNumber"}, {"method": "eth_gasPrice"}])
```

Networks accept names or aliases: `ethereum`/`eth`, `base`, `arbitrum`/`arb`, `optimism`/`op`, `polygon`/`matic`, `bsc`/`bnb`, `solana`/`sol`, `bitcoin`/`btc`, `ripple`/`xrp`, and ~30 more (EVM + non-EVM).

### Identity & telephony

#### `PhoneClient` — number provisioning + lookups

```python
from blockrun_llm import PhoneClient

phone = PhoneClient()
info  = phone.lookup("+14155552671")          # $0.011 - carrier + line type
fraud = phone.lookup_fraud("+14155552671")    # $0.051 - + SIM-swap / call-forwarding signals
num   = phone.buy_number(country="US", area_code="415")  # $5 / 30 days (settles after Twilio confirms)
phone.renew_number(num["phone_number"])       # $5 / +30 days
phone.list_numbers()                          # $0.003
phone.release_number(num["phone_number"])     # free
```

#### `VoiceClient` — outbound AI phone calls

```python
from blockrun_llm import VoiceClient

voice = VoiceClient()
call = voice.call(
    to="+14155552671",
    task="Confirm the 3pm dental appointment and offer to reschedule if needed.",
    voice="maya",            # nat | josh | maya | june | paige | derek | florian, or a Bland.ai id
    max_duration=5,          # 1–30 minutes
    language="en-US",
)
print(call["call_id"])
status = voice.get_status(call["call_id"])   # free; transcript + recording_url once completed
```

`$0.541`/call. `from_` is auto-picked if your wallet owns exactly one provisioned number (see `PhoneClient.buy_number`).

#### `PortraitClient` & `RealFaceClient` — `ta_…` identity assets for video

```python
from blockrun_llm import PortraitClient, RealFaceClient

# Virtual Portrait — AI character, no KYC, $0.011 one-time
portrait = PortraitClient()
p = portrait.enroll("My Spokesperson", "https://example.com/character.jpg")
print(p.asset_id)   # ta_xxxxxxxx → pass to VideoClient(real_face_asset_id=...)

# RealFace — real person, requires on-phone liveness check, $0.011
rf = RealFaceClient()
init = rf.init("Jane Doe")            # render init.h5_link as a QR for the subject
rf.wait_for_active(init.group_id)     # blocks until liveness passes (default 180s)
asset = rf.enroll("Jane Doe", "https://example.com/jane.jpg", init.group_id)
print(asset.asset_id)                 # ta_xxxxxxxx
```

### LLMClient extras: sandbox, DeFi, DEX, on-ramp, balances

Beyond chat, `LLMClient` exposes:

```python
from blockrun_llm import LLMClient
client = LLMClient()

# Modal secure sandbox
sb = client.modal_sandbox_create()
out = client.modal_sandbox_exec(sb["id"], code="print(2+2)")
client.modal_sandbox_status(sb["id"]); client.modal_sandbox_terminate(sb["id"])

# DeFi (DeFiLlama) + DEX (0x)
yields = client.defi_yields(); protocols = client.defi_protocols()
quote  = client.dex_quote(...); gasless = client.dex_gasless_quote(...)

# Wallet helpers
print(client.get_balance())    # USDC on the active chain
print(client.get_spending())   # session totals: {"total_usd": ..., "calls": ...}
print(client.onramp())         # Coinbase on-ramp link
```

## Prediction Markets (Powered by Predexon)

Access real-time prediction market data from Polymarket, Kalshi, Limitless, Opinion, Predict.Fun and Binance via [Predexon](https://predexon.com). No API keys needed — pay-per-request via x402.

> **Retired upstream.** `pm_markets` / `pm_listings` / `pm_outcome` (and
> `matching-markets`) hit endpoints Predexon sunset on 2026-07-20 — they return
> `410`. The dFlow endpoints return `404`; that category is gone. Use
> `markets/search` for cross-venue lookups. `sports/*` is returning an upstream
> `500` as of 2026-08-04 and is withheld from discovery until it recovers.


### `pm(path, **params)`

Query prediction market GET endpoints. $0.0085 per request.

```python
from blockrun_llm import LLMClient

client = LLMClient()

# List Polymarket markets
markets = client.pm("polymarket/markets")

# List Polymarket events
events = client.pm("polymarket/events")

# Get Polymarket trades
trades = client.pm("polymarket/trades")

# Get candlestick data for a specific condition
candles = client.pm("polymarket/candlesticks/0xabc123...")

# Get wallet profile
wallet = client.pm("polymarket/wallet/0x1234...")

# Get wallet P&L
pnl = client.pm("polymarket/wallet/pnl/0x1234...")

# Get Polymarket leaderboard
leaders = client.pm("polymarket/leaderboard")

# List Kalshi markets
kalshi_markets = client.pm("kalshi/markets")

# Get Kalshi trades
kalshi_trades = client.pm("kalshi/trades")

# Get Binance candles for a symbol
btc_candles = client.pm("binance/candles/BTCUSDT")
eth_candles = client.pm("binance/candles/ETHUSDT")

# Cross-venue search (matching-markets was sunset by Predexon 2026-07-20)
results = client.pm("markets/search", q="Fed rate")
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `str` | Endpoint path, e.g. `"polymarket/markets"`, `"kalshi/markets"` |
| `**params` | keyword args | Query parameters passed to the endpoint |

**Returns:** `Dict[str, Any]` — Raw JSON response from Predexon API

### `pm_query(path, query)`

Structured query for prediction market POST endpoints. Used for bulk wallet identity lookup and any future POST endpoints.

```python
# Bulk wallet identity lookup ($0.0085)
batch = client.pm_query("polymarket/wallet/identities", {
    "addresses": ["0xabc...", "0xdef...", "0x123..."],  # up to 200
})
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `str` | Endpoint path for a POST query, e.g. `"polymarket/wallet/identities"` |
| `query` | `Dict[str, Any]` | JSON body for the structured query |

**Returns:** `Dict[str, Any]` — Raw JSON response from Predexon API

### Predexon v2 Convenience Helpers

Thin wrappers over `pm()` / `pm_query()` for the most common v2 endpoints. Each forwards keyword arguments as query parameters.

```python
# Cross-venue search (Tier 2)
found     = client.pm("markets/search", q="bitcoin 2026")

# Polymarket keyset pagination (Tier 1)
page      = client.pm_polymarket_markets_keyset(limit="100")
next_page = client.pm_polymarket_events_keyset(pagination_key=page["pagination"]["next_key"])

# Wallet identity & on-chain clustering (Tier 2)
ident   = client.pm_wallet_identity("0xabc...")
batch   = client.pm_wallet_identities(["0xabc...", "0xdef..."])  # up to 200
cluster = client.pm_wallet_cluster("0xabc...")
```

### Available Platforms

| Platform | Available Data |
|----------|---------------|
| Polymarket | Markets, Events, Trades, Candlesticks (market + token), Orderbooks, Prices, Volume, Open Interest, Activity, Positions, Leaderboards, Cohort Stats, Top Holders, Wallet Analytics, Smart Money, Wallet Identity & Clustering |
| UMA Oracle | Resolution questions, status, event timeline (Polymarket markets) |
| Kalshi | Markets, Trades, Orderbooks |
| Binance Futures | Candles, Ticks |
| Limitless | Markets, Orderbooks |
| Opinion | Markets, Orderbooks |
| Predict.Fun | Markets, Orderbooks |
| Matching | Cross-platform market matching, exact-match pairs, unified search |

### Async Usage

```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        markets = await client.pm("polymarket/markets")
        events = await client.pm("polymarket/events")
        candles = await client.pm("binance/candles/SOLUSDT")

asyncio.run(main())
```

### Solana Usage

```python
from blockrun_llm.solana_client import SolanaLLMClient

client = SolanaLLMClient()
markets = client.pm("polymarket/markets")
```

Works on all clients: `LLMClient` (Base), `AsyncLLMClient`, and `SolanaLLMClient`.

## Testnet Usage

For development and testing without real USDC, use the Base Sepolia testnet:

```python
from blockrun_llm import testnet_client

# Create testnet client (uses Base Sepolia)
client = testnet_client()  # Uses BLOCKRUN_WALLET_KEY

# Chat with testnet model
response = client.chat("openai/gpt-oss-20b", "Hello!")
print(response)

# Check testnet USDC balance
balance = client.get_balance()
print(f"Testnet USDC: ${balance:.4f}")

# Verify you're on testnet
print(f"Is testnet: {client.is_testnet()}")  # True
```

### Testnet Setup

1. Get testnet ETH from [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Get testnet USDC from [Circle USDC Faucet](https://faucet.circle.com/)
3. Set your wallet key: `export BLOCKRUN_WALLET_KEY=0x...`

### Available Testnet Models

| Model | Price |
|-------|-------|
| `openai/gpt-oss-20b` | $0.003/request (flat) |
| `openai/gpt-oss-120b` | $0.004/request (flat) |

### Manual Testnet Configuration

```python
from blockrun_llm import LLMClient

# Configure manually with testnet API URL
client = LLMClient(api_url="https://testnet.blockrun.ai/api")
response = client.chat("openai/gpt-oss-20b", "Hello!")
```

## Async Client

For async/await usage:

```python
import asyncio
from blockrun_llm import AsyncLLMClient

async def main():
    async with AsyncLLMClient() as client:
        # Single request
        response = await client.chat("openai/gpt-5.5", "Hello!")

        # Concurrent requests
        tasks = [
            client.chat("openai/gpt-5.5", "What is 2+2?"),
            client.chat("anthropic/claude-sonnet-4.6", "What is 3+3?"),
        ]
        responses = await asyncio.gather(*tasks)

asyncio.run(main())
```

## Error Handling

```python
from blockrun_llm import LLMClient, APIError, PaymentError

client = LLMClient()

try:
    response = client.chat("openai/gpt-5.5", "Hello!")
except PaymentError as e:
    print(f"Payment failed: {e}")
    # Check your USDC balance
except APIError as e:
    print(f"API error ({e.status_code}): {e}")
    print(f"Details: {e.response}")
```

## Response Types

### ChatResponse

```python
class ChatResponse:
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatChoice]
    usage: ChatUsage

class ChatChoice:
    index: int
    message: ChatMessage
    finish_reason: str

class ChatMessage:
    role: str
    content: str

class ChatUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
```

## Examples

### Multi-turn Conversation

```python
from blockrun_llm import LLMClient

client = LLMClient()
messages = [
    {"role": "system", "content": "You are a helpful assistant."}
]

while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        break

    messages.append({"role": "user", "content": user_input})
    result = client.chat_completion("openai/gpt-5.5", messages)

    assistant_message = result.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_message})

    print(f"Assistant: {assistant_message}")
```

### Code Generation

```python
from blockrun_llm import LLMClient

client = LLMClient()

code = client.chat(
    "anthropic/claude-sonnet-4.6",
    "Write a Python function to calculate fibonacci numbers",
    system="You are an expert Python developer. Return only code, no explanations."
)

print(code)
```

## Testing

The SDK includes comprehensive test coverage.

### Running Unit Tests

Unit tests do not require API access or funded wallets:

```bash
pytest tests/unit                    # Run unit tests only
pytest tests/unit --cov              # Run with coverage report
pytest tests/unit -v                 # Verbose output
```

### Running Integration Tests

Integration tests call the production API and require:
- A funded Base wallet with USDC ($1+ recommended)
- `BLOCKRUN_WALLET_KEY` environment variable set
- Estimated cost: ~$0.05 per test run

```bash
# Set your funded wallet key
export BLOCKRUN_WALLET_KEY=0x...

# Run only integration tests
pytest tests/integration

# Run all tests (unit + integration)
pytest
```

Integration tests are automatically skipped if `BLOCKRUN_WALLET_KEY` is not set.

## Security Best Practices

### Private Key Management

:::warning{title="Never commit private keys"}
Never commit private keys to version control. A leaked key can drain your funded wallet.
:::

✅ **Do:**
- Use environment variables for private keys
- Use dedicated wallets for API payments (separate from your main holdings)
- Set spending limits by only funding payment wallets with small amounts
- Rotate keys periodically
- Use `.env` files and add them to `.gitignore`

❌ **Don't:**
- Hard-code private keys in your source code
- Commit `.env` files to git
- Share private keys in logs or error messages
- Use your main wallet with large holdings

### Example Secure Setup

```bash
# .env (add to .gitignore!)
BLOCKRUN_WALLET_KEY=0x...your_private_key_here
```

```python
# app.py
import os
from blockrun_llm import LLMClient
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("BLOCKRUN_WALLET_KEY"):
    raise ValueError("BLOCKRUN_WALLET_KEY not set")

client = LLMClient()  # Reads from environment
```

### Input Validation

The SDK validates all inputs before making API requests:

- Private keys (format, length, valid hex)
- API URLs (HTTPS required for production)
- Model names (non-empty strings)
- Parameters (max\_tokens, temperature, top\_p ranges)

### Error Response Sanitization

API errors are automatically sanitized to prevent leaking sensitive server information:

```python
from blockrun_llm import LLMClient, APIError

client = LLMClient()

try:
    response = client.chat('invalid-model', 'Hello')
except APIError as e:
    # Error messages only contain safe, user-facing information
    # No internal stack traces, file paths, or sensitive data
    print(e.message)
```

### Monitoring Spending

Check your transaction history on Base:

```python
client = LLMClient()
address = client.get_wallet_address()
print(f"View transactions: https://basescan.org/address/{address}")
```

### SDK Updates

Keep the SDK updated to receive security patches:

```bash
pip install --upgrade blockrun-llm
```

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet with USDC and make your first paid call in under five minutes.
:::

:::card{title="Models & pricing" href="../api-reference/models.md" icon="Brain"}
Browse all 70 models with live pricing to pick the right one for each call.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
