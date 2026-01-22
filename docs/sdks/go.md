# Go SDK

The Go SDK for BlockRun provides access to 30+ AI models via x402 micropayments.

## Installation

```bash
go get github.com/blockrunai/blockrun-llm-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "os"
    blockrun "github.com/blockrunai/blockrun-llm-go"
)

func main() {
    // Uses BLOCKRUN_WALLET_KEY env var
    client := blockrun.NewClient("")

    response, err := client.Chat("openai/gpt-4o", "Hello!")
    if err != nil {
        panic(err)
    }
    fmt.Println(response)
}
```

## Configuration

### Environment Variable

```bash
export BLOCKRUN_WALLET_KEY=0x...your_private_key...
```

### Programmatic

```go
client := blockrun.NewClient("0x...private_key...")

// With options
client := blockrun.NewClientWithOptions(blockrun.Options{
    PrivateKey:    "0x...",
    APIURL:        "https://blockrun.ai/api",
    SessionBudget: 10.00,
})
```

## API Reference

### Chat Completion

```go
// Simple chat
response, err := client.Chat("openai/gpt-4o", "Hello!")

// With options
response, err := client.ChatWithOptions("openai/gpt-4o", "Explain x402", blockrun.ChatOptions{
    Temperature: 0.7,
    MaxTokens:   1000,
})
```

### Chat with Messages

```go
messages := []blockrun.Message{
    {Role: "system", Content: "You are a helpful assistant."},
    {Role: "user", Content: "What is x402?"},
}

response, err := client.ChatMessages("openai/gpt-4o", messages)
```

### Image Generation

```go
imageURL, err := client.GenerateImage(blockrun.ImageRequest{
    Prompt: "A futuristic city",
    Model:  "dall-e-3",
    Size:   "1024x1024",
})
```

### Wallet Operations

```go
// Get address
address := client.GetAddress()
fmt.Printf("Address: %s\n", address)

// Check balance
balance, err := client.GetBalance()
fmt.Printf("Balance: $%.2f USDC\n", balance)
```

## Error Handling

```go
response, err := client.Chat("openai/gpt-4o", prompt)
if err != nil {
    switch e := err.(type) {
    case *blockrun.InsufficientBalanceError:
        fmt.Println("Need to fund wallet")
    case *blockrun.ModelNotFoundError:
        fmt.Printf("Invalid model: %s\n", e.Model)
    case *blockrun.RateLimitError:
        fmt.Println("Rate limited, waiting...")
        time.Sleep(60 * time.Second)
    default:
        fmt.Printf("Error: %v\n", err)
    }
}
```

## Available Models

```go
// OpenAI
client.Chat("openai/gpt-5.2", prompt)
client.Chat("openai/gpt-4o", prompt)
client.Chat("openai/o1", prompt)

// Anthropic
client.Chat("anthropic/claude-opus-4", prompt)
client.Chat("anthropic/claude-sonnet-4", prompt)

// Google
client.Chat("google/gemini-3-pro", prompt)
client.Chat("google/gemini-2.5-flash", prompt)

// DeepSeek
client.Chat("deepseek/deepseek-v3", prompt)

// xAI
client.Chat("xai/grok-4-fast", prompt)
```

## Concurrent Requests

```go
import "golang.org/x/sync/errgroup"

func processItems(client *blockrun.Client, items []string) ([]string, error) {
    results := make([]string, len(items))
    g := new(errgroup.Group)

    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            response, err := client.Chat("deepseek/deepseek-v3", item)
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

## Session Budgets

```go
client := blockrun.NewClientWithOptions(blockrun.Options{
    SessionBudget: 10.00,  // Max $10 per session
})

// Will return error if budget exceeded
response, err := client.Chat("openai/gpt-4o", prompt)
if err != nil {
    if _, ok := err.(*blockrun.BudgetExceededError); ok {
        fmt.Println("Session budget exceeded")
    }
}
```

## Example: Trading Bot

```go
package main

import (
    "fmt"
    "time"
    blockrun "github.com/blockrunai/blockrun-llm-go"
)

type TradingBot struct {
    client *blockrun.Client
}

func (b *TradingBot) AnalyzeMarket(asset string) (string, error) {
    prompt := fmt.Sprintf("Analyze %s for trading: technicals, sentiment, recommendation", asset)
    return b.client.Chat("openai/gpt-4o", prompt)
}

func (b *TradingBot) Run() {
    for {
        analysis, err := b.AnalyzeMarket("ETH")
        if err != nil {
            fmt.Printf("Error: %v\n", err)
        } else {
            fmt.Printf("Analysis: %s\n", analysis)
        }
        time.Sleep(time.Hour)
    }
}

func main() {
    bot := &TradingBot{
        client: blockrun.NewClient(""),
    }
    bot.Run()
}
```

## Links

- [GitHub: blockrun-llm-go](https://github.com/blockrunai/blockrun-llm-go)
- [Models Reference](../api-reference/models.md)
- [SDK Developer Guide](../getting-started/sdk-developers.md)
