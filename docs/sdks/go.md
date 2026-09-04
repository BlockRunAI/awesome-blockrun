---
title: Go SDK
description: The Go SDK for BlockRun — call 99 AI models, generate images, video, music and speech, search the web, read market data and multi-chain RPC, and manage wallets over x402 micropayments with no API keys.
---

# Go SDK

The Go SDK for BlockRun provides access to 99 AI models via x402 micropayments — pay per call in USDC on **Base** or **Solana**, no API keys. Beyond chat it covers image, video, music and speech generation, web search, market data, prediction markets, DeFi and DEX data, and multi-chain JSON-RPC.

**Source:** [github.com/BlockRunAI/blockrun-llm-go](https://github.com/BlockRunAI/blockrun-llm-go) · `go get github.com/BlockRunAI/blockrun-llm-go@v0.20.0` · Go 1.22+ · MIT

:::tip{title="In a hurry?"}
New to BlockRun? Run the [5-Minute Quickstart](../getting-started/quickstart.md) first to fund a wallet, then come back for the full SDK reference.
:::

::::steps

:::step{title="Install"}
```bash
go get github.com/BlockRunAI/blockrun-llm-go@v0.20.0
```
:::

:::step{title="Make your first call"}
```go
package main

import (
    "context"
    "fmt"
    "log"

    blockrun "github.com/BlockRunAI/blockrun-llm-go"
)

func main() {
    ctx := context.Background()

    // Empty key → reads BLOCKRUN_WALLET_KEY (or BASE_CHAIN_WALLET_KEY)
    client, err := blockrun.NewLLMClient("")
    if err != nil {
        log.Fatal(err)
    }

    response, err := client.Chat(ctx, "openai/gpt-5.5", "Hello!")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(response)
}
```
:::

::::

Every method takes a `context.Context` first, and every constructor returns `(client, error)`.

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BLOCKRUN_WALLET_KEY` | Base wallet private key (`0x...`) | Yes for Base (or pass to constructor) |
| `BASE_CHAIN_WALLET_KEY` | Alias for `BLOCKRUN_WALLET_KEY` | No |
| `SOLANA_WALLET_KEY` | bs58 Solana private key, for the `*Solana` constructors | Yes for Solana (or pass to constructor) |
| `SOLANA_RPC_URL` | Solana RPC used for mint info / blockhash when the 402 does not carry one | No |
| `BLOCKRUN_API_URL` | Custom API endpoint | No (default: `https://blockrun.ai/api`) |

```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```

:::warning{title="Keep your key safe"}
Never commit private keys to version control. Use a dedicated payment wallet funded with only small amounts, and load the key from an environment variable. The key only signs payments locally — it is never transmitted.
:::

### Programmatic

```go
client, err := blockrun.NewLLMClient("0x...private_key...")

// With options
client, err := blockrun.NewLLMClient("0x...",
    blockrun.WithAPIURL("https://blockrun.ai/api"),
    blockrun.WithTimeout(120*time.Second),
    blockrun.WithCache(true),          // local response cache for search / prediction-market calls
    blockrun.WithHTTPClient(httpClient),
)
```

### Pay on Solana

Every client has a `New…Solana` counterpart that pays USDC on Solana via `sol.blockrun.ai` — same API, same responses. The second argument is an optional Solana RPC URL (empty → `SOLANA_RPC_URL` → BlockRun's free proxy).

```go
client, err := blockrun.NewLLMClientSolana("", "")  // key from SOLANA_WALLET_KEY
img, err    := blockrun.NewImageClientSolana("", "")
```

Payments on Solana are gasless: the SDK signs a USDC `TransferChecked` transaction locally and BlockRun's facilitator co-signs as fee payer, so the wallet needs no SOL. Solana wallets have the same helpers as EVM ones (`GetOrCreateSolanaWallet`, `ScanSolanaWallets`, `GetSolanaPayURI`, …). Buying USDC with a card via `Onramp` is Base-only; fund a Solana wallet by transfer.

## API Reference

### Chat Completion

```go
// Simple chat
response, err := client.Chat(ctx, "openai/gpt-5.5", "Hello!")

// With a system prompt
response, err := client.ChatWithSystem(ctx, "openai/gpt-5.5", "Explain x402", "You are a concise teacher.")

// Full completion with options
result, err := client.ChatCompletion(ctx, "openai/gpt-5.5", messages, &blockrun.ChatCompletionOptions{
    Temperature: 0.7,
    MaxTokens:   1000,
})
fmt.Println(result.Choices[0].Message.Content)
fmt.Println(result.Usage.TotalTokens)
```

`ChatCompletionOptions` also accepts `TopP`, `Stop`, `ResponseFormat` (e.g. `map[string]string{"type": "json_object"}`), `Tools` / `ToolChoice`, and `Search` / `SearchParameters` for live web search inside a chat call.

### Chat with Messages

```go
messages := []blockrun.ChatMessage{
    {Role: "system", Content: "You are a helpful assistant."},
    {Role: "user", Content: "What is x402?"},
}

result, err := client.ChatCompletion(ctx, "openai/gpt-5.5", messages, nil)
fmt.Println(result.Choices[0].Message.Content)
```

### Streaming

```go
stream, err := client.ChatCompletionStream(ctx, "openai/gpt-5.5", []blockrun.ChatMessage{
    {Role: "user", Content: "Write a poem about Go"},
}, nil)
if err != nil {
    log.Fatal(err)
}
defer stream.Close()

for {
    chunk, err := stream.Next()
    if err != nil {
        log.Fatal(err)
    }
    if chunk == nil {
        break // stream complete
    }
    fmt.Print(chunk.Choices[0].Delta.Content)
}
```

### Tool Calling

```go
result, err := client.ChatCompletion(ctx, "openai/gpt-5.5", messages, &blockrun.ChatCompletionOptions{
    Tools: []blockrun.Tool{{
        Type: "function",
        Function: blockrun.ToolFunction{
            Name:        "get_weather",
            Description: "Get current weather for a location",
            Parameters: map[string]any{
                "type": "object",
                "properties": map[string]any{
                    "location": map[string]any{"type": "string"},
                },
                "required": []string{"location"},
            },
        },
    }},
    ToolChoice: "auto",
})

if calls := result.Choices[0].Message.ToolCalls; len(calls) > 0 {
    fmt.Printf("Tool: %s(%s)\n", calls[0].Function.Name, calls[0].Function.Arguments)
}
```

### Smart Routing

`SmartChat` picks a model per request from a local classifier (<1ms, no extra model call). Profiles: `RoutingFree`, `RoutingEco`, `RoutingAuto` (default), `RoutingPremium`.

```go
resp, err := client.SmartChat(ctx, "What is 2+2?", &blockrun.SmartChatOptions{
    RoutingProfile: blockrun.RoutingFree,   // free models only — no USDC needed
})
fmt.Println(resp.Model)         // model that answered
fmt.Println(resp.Response)
fmt.Println(resp.Routing.Tier)  // SIMPLE / MEDIUM / COMPLEX / REASONING
```

### Anthropic Messages API

`NewAnthropicClient` speaks the native Messages format (content blocks, `StopReason`, input/output token usage) for Claude models and any other BlockRun model.

```go
ac, err := blockrun.NewAnthropicClient("")
resp, err := ac.Messages.Create(ctx, blockrun.AnthropicCreateParams{
    Model:     "claude-sonnet-4-6", // native Anthropic id form; "openai/gpt-5.5" etc. also accepted
    MaxTokens: 1024,
    Messages:  []blockrun.AnthropicMessage{{Role: "user", Content: "Hello!"}},
})
fmt.Println(resp.Text(), resp.StopReason)
```

If you need the **official** `anthropic-sdk-go` / `openai-go` client types with verbatim upstream responses (thinking-block signatures, native streaming), use the companion module [`blockrun-llm-go-vip`](https://github.com/BlockRunAI/blockrun-llm-go-vip): `vip.NewAnthropic()` / `vip.NewOpenAI()` return the official clients with x402 payment on the transport, with `vip.WithChain("solana")` for Solana.

### Image Generation

```go
imageClient, err := blockrun.NewImageClient("")

result, err := imageClient.Generate(ctx, "A futuristic city", &blockrun.ImageGenerateOptions{
    Model: "google/nano-banana",
    Size:  "1024x1024",
})
fmt.Println(result.Data[0].URL)   // permanent BlockRun-hosted URL
fmt.Println(result.TxHash)        // on-chain settlement tx

// Edit or fuse images (base64 data URIs)
result, err = imageClient.Edit(ctx, "make the sky purple",
    []string{"data:image/png;base64,..."}, nil)
```

Current image models: `openai/gpt-image-1`, `openai/gpt-image-2`, `google/nano-banana`, `google/nano-banana-2`, `google/nano-banana-pro`, `bytedance/seedream-5-pro`, `zai/cogview-4`, `xai/grok-imagine-image`, `xai/grok-imagine-image-pro`. `client.ListImageModels(ctx)` returns the live list with pricing.

### Video, Music and Speech

```go
videoClient, err := blockrun.NewVideoClient("")
video, err := videoClient.Generate(ctx, "a red apple spinning on a wooden table", &blockrun.VideoGenerateOptions{
    Model:    "bytedance/seedance-1.5-pro",
    ImageURL: "https://example.com/portrait.jpg", // optional image-to-video
})
fmt.Println(video.Data[0].URL) // blocks until the MP4 is ready

musicClient, err := blockrun.NewMusicClient("")
track, err := musicClient.Generate(ctx, "upbeat synthwave with neon pads", nil)
fmt.Println(track.Data[0].URL) // download promptly — URLs expire

speechClient, err := blockrun.NewSpeechClient("")
audio, err := speechClient.Generate(ctx, "Welcome to BlockRun.", &blockrun.SpeechGenerateOptions{
    Voice: "george",
})
fmt.Println(audio.Data[0].URL)
fx, err := speechClient.SoundEffect(ctx, "rain on a tin roof", nil)
```

Video options also support `LastFrameURL` (first/last-frame interpolation), `ReferenceImageURLs` (multi-reference, Seedance 2.0), `RealFaceAssetID` (character consistency via `NewPortraitClient` / `NewRealFaceClient`), `Resolution` and `GenerateAudio`.

### Web Search

```go
result, err := client.Search(ctx, "latest AI news", &blockrun.SearchOptions{
    Sources:    []string{"web", "x", "news"},
    MaxResults: 5,
    FromDate:   "2026-01-01",
})
fmt.Println(result.Summary)
fmt.Println(result.Citations)

// Neural search, similarity, content extraction, grounded answers
hits, err := client.ExaSearch(ctx, "latest AI safety research", map[string]any{"numResults": 5})
answer, err := client.ExaAnswer(ctx, "What is x402?", nil)
```

### Market Data

Realtime quotes and OHLC history for crypto, FX, commodities and equities. Crypto / FX / commodity reads are free; equities are paid.

```go
btc, err := client.Price(ctx, blockrun.CategoryCrypto, "BTC-USD", nil)
fmt.Println(btc.Price)

aapl, err := client.Price(ctx, blockrun.CategoryStocks, "AAPL", &blockrun.PriceOptions{Market: "us"})

bars, err := client.History(ctx, blockrun.CategoryCrypto, "BTC-USD", &blockrun.HistoryOptions{
    Resolution: "D", From: 1700000000, To: 1710000000,
})
symbols, err := client.ListSymbols(ctx, blockrun.CategoryCrypto, &blockrun.ListOptions{Query: "sol"})
```

### Prediction Markets

```go
events, err := client.PM(ctx, "polymarket/events", nil)
markets, err := client.PM(ctx, "markets/search", map[string]string{"q": "bitcoin"}) // cross-venue search
result, err := client.PMQuery(ctx, "polymarket/wallet/identities", map[string]any{"addresses": []string{"0x..."}}) // POST endpoints
```

### DeFi and DEX

```go
// DeFi data — protocols, TVL, yields, token prices
protocols, err := client.DefiProtocols(ctx)
pools, err := client.DefiYields(ctx, map[string]string{"chain": "Base"})
prices, err := client.DefiPrices(ctx, []string{"coingecko:bitcoin"})

// DEX swaps — free quotes, no x402 payment (affiliate fee on executed swaps)
price, err := client.DexPrice(ctx, map[string]string{
    "chainId": "8453", "sellToken": "0x...", "buyToken": "0x...", "sellAmount": "1000000",
})
quote, err := client.DexQuote(ctx, params)   // + "taker"
gq, err := client.DexGaslessQuote(ctx, params)
```

### Multi-chain RPC

`RPCClient` wraps `POST /v1/rpc/{network}` — JSON-RPC 2.0 to every [supported chain](../api-reference/multi-chain-rpc.md) through one endpoint, $0.003 per call including the $0.001 transaction fee (a batch charges per element).

```go
rpcClient, err := blockrun.NewRPCClient("")

block, err := rpcClient.Call(ctx, "ethereum", "eth_blockNumber", nil)
fmt.Println(string(block.Result))

slot, err := rpcClient.Call(ctx, "solana", "getSlot", nil)
tip, err := rpcClient.Call(ctx, "bitcoin", "getblockcount", nil)

out, err := rpcClient.Batch(ctx, "polygon", []blockrun.RPCBatchRequest{
    {Method: "eth_blockNumber"},
    {Method: "eth_gasPrice"},
})
```

Supported slugs are exported as `blockrun.RPCSupportedNetworks`; aliases (`eth`, `arb`, `sol`, `btc`, `xrp`, …) resolve server-side.

### Other Clients

`NewVoiceClient` (outbound AI phone calls), `NewPhoneClient` (number lookup and caller-ID provisioning), `NewSurfClient` (crypto intelligence endpoints), `NewPortraitClient` / `NewRealFaceClient` (reusable face assets for video), and `client.ModalSandboxCreate` / `ModalSandboxExec` (sandboxed compute). See the [README](https://github.com/BlockRunAI/blockrun-llm-go#features) for each.

### Wallet Operations

```go
// Get address
address := client.GetWalletAddress()
fmt.Printf("Address: %s\n", address)

// Check USDC balance on the chain this client pays from
balance, err := client.GetBalance(ctx)
fmt.Printf("Balance: $%.2f USDC\n", balance)

// Fund with a card — one-time Coinbase Onramp link (Base only, free)
res, err := client.Onramp(ctx, client.GetWalletAddress())
fmt.Println("Buy USDC:", res.URL)

// Autonomous agents: create + persist a wallet on first run
client, err := blockrun.SetupAgentWallet()
address, balance, err := client.Status(ctx)
```

`ListModels(ctx)`, `ListImageModels(ctx)` and `ListAllModels(ctx)` return the live catalog with current pricing.

## Error Handling

```go
response, err := client.Chat(ctx, "openai/gpt-5.5", prompt)
if err != nil {
    switch e := err.(type) {
    case *blockrun.PaymentError:
        fmt.Printf("Payment failed (fund the wallet?): %s\n", e.Message)
    case *blockrun.ValidationError:
        fmt.Printf("Invalid input: %s - %s\n", e.Field, e.Message)
    case *blockrun.APIError:
        fmt.Printf("API error %d: %s\n", e.StatusCode, e.Message)
        if e.StatusCode == 429 {
            time.Sleep(60 * time.Second)
        }
    default:
        fmt.Printf("Error: %v\n", err)
    }
}
```

## Available Models

```go
// OpenAI
client.Chat(ctx, "openai/gpt-5.2", prompt)
client.Chat(ctx, "openai/gpt-5.5", prompt)
client.Chat(ctx, "openai/o1", prompt)

// Anthropic
client.Chat(ctx, "anthropic/claude-opus-5", prompt)
client.Chat(ctx, "anthropic/claude-sonnet-4.6", prompt)

// Google
client.Chat(ctx, "google/gemini-3.1-pro", prompt)
client.Chat(ctx, "google/gemini-3-flash-preview", prompt)
client.Chat(ctx, "google/gemini-2.5-flash-lite", prompt)

// DeepSeek
client.Chat(ctx, "deepseek/deepseek-chat", prompt)

// xAI
client.Chat(ctx, "xai/grok-4.3", prompt)

// Free (no USDC needed)
client.Chat(ctx, "nvidia/nemotron-3.5-lightning", prompt)
```

## Concurrent Requests

```go
import "golang.org/x/sync/errgroup"

func processItems(ctx context.Context, client *blockrun.LLMClient, items []string) ([]string, error) {
    results := make([]string, len(items))
    g, ctx := errgroup.WithContext(ctx)

    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            response, err := client.Chat(ctx, "deepseek/deepseek-chat", item)
            if err != nil {
                return err
            }
            results[i] = response
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

## Cost Tracking

```go
// This session
spending := client.GetSpending()
fmt.Printf("Session: %d calls, $%.6f\n", spending.Calls, spending.TotalUSD)

// Persistent JSONL log across runs
summary, err := client.GetCostSummary()
fmt.Printf("Total: $%.4f across %d calls\n", summary.TotalUSD, summary.Calls)
for endpoint, cost := range summary.ByEndpoint {
    fmt.Printf("  %s: $%.4f\n", endpoint, cost)
}
```

## Example: Trading Bot

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    blockrun "github.com/BlockRunAI/blockrun-llm-go"
)

type TradingBot struct {
    client *blockrun.LLMClient
}

func (b *TradingBot) AnalyzeMarket(ctx context.Context, asset string) (string, error) {
    btc, err := b.client.Price(ctx, blockrun.CategoryCrypto, asset+"-USD", nil) // free quote
    if err != nil {
        return "", err
    }
    prompt := fmt.Sprintf("%s is trading at %.2f. Analyze technicals, sentiment, recommendation.", asset, btc.Price)
    return b.client.Chat(ctx, "openai/gpt-5.5", prompt)
}

func (b *TradingBot) Run(ctx context.Context) {
    for {
        analysis, err := b.AnalyzeMarket(ctx, "ETH")
        if err != nil {
            fmt.Printf("Error: %v\n", err)
        } else {
            fmt.Printf("Analysis: %s\n", analysis)
        }
        time.Sleep(time.Hour)
    }
}

func main() {
    client, err := blockrun.NewLLMClient("")
    if err != nil {
        log.Fatal(err)
    }
    bot := &TradingBot{client: client}
    bot.Run(context.Background())
}
```

## Links

- [GitHub: blockrun-llm-go](https://github.com/BlockRunAI/blockrun-llm-go)
- [GitHub: blockrun-llm-go-vip](https://github.com/BlockRunAI/blockrun-llm-go-vip) — official Anthropic / OpenAI Go clients over x402
- [pkg.go.dev reference](https://pkg.go.dev/github.com/BlockRunAI/blockrun-llm-go)
- [Models Reference](../api-reference/models.md)
- [Multi-chain RPC](../api-reference/multi-chain-rpc.md)
- [SDK Developer Guide](../getting-started/sdk-developers.md)

## What's next?

::::cards

:::card{title="5-Minute Quickstart" href="../getting-started/quickstart.md" icon="Rocket"}
Fund a wallet with USDC and make your first paid call in under five minutes.
:::

:::card{title="Models & pricing" href="../api-reference/models.md" icon="Brain"}
Browse all 75 models with live pricing to pick the right one for each call.
:::

:::card{title="How payment works" href="../x402/how-it-works.md" icon="Zap"}
Understand x402, USDC settlement, and why there are no API keys.
:::

::::
