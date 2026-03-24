# Anthropic Messages API Endpoint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Anthropic Messages API compatible endpoint (`POST /api/v1/messages`) to BlockRun so that Claude Code (and any Anthropic SDK client) can use BlockRun as their API gateway, routing requests to any supported model.

**Architecture:** New Next.js API route at `/api/v1/messages` that accepts Anthropic Messages API format requests, maps model IDs to BlockRun's internal model catalog, converts to OpenAI-internal format for non-Anthropic providers, and returns responses in Anthropic Messages API format. Reuses existing x402 payment, rate limiting, logging, and provider routing infrastructure.

**Tech Stack:** Next.js App Router, Zod validation, Anthropic SDK types, existing x402/provider infrastructure

---

## Background: Anthropic Messages API Format

**Request:**
```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 8192,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "tools": [...],
  "tool_choice": {"type": "auto"},
  "stream": true
}
```

**Non-streaming response:**
```json
{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-6",
  "content": [{"type": "text", "text": "Hello!"}],
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 10, "output_tokens": 5}
}
```

**Streaming SSE events (in order):**
```
event: message_start
data: {"type":"message_start","message":{"id":"msg_xxx","type":"message","role":"assistant","model":"claude-sonnet-4-6","content":[],"usage":{"input_tokens":10,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":5}}

event: message_stop
data: {"type":"message_stop"}
```

**Key differences from OpenAI format:**
- `system` is a top-level field, not a message
- `content` is always an array of blocks (text, tool_use, tool_result, image)
- `stop_reason` not `finish_reason` (`end_turn`, `tool_use`, `max_tokens`)
- Tool calls are `tool_use` content blocks, not separate `tool_calls` array
- Tool results are `tool_result` content blocks in user messages
- Streaming uses named events (`message_start`, `content_block_delta`, etc.) not just `data:` chunks
- Auth via `x-api-key` header (not `Authorization: Bearer`)

---

## Task 1: Anthropic Request/Response Type Definitions

**Files:**
- Modify: `/src/types/index.ts`

**Step 1: Add Anthropic Messages API types**

Add to `/src/types/index.ts`:

```typescript
// Anthropic Messages API types (for /v1/messages endpoint)

export interface AnthropicTextBlock {
  type: "text";
  text: string;
}

export interface AnthropicImageBlock {
  type: "image";
  source:
    | { type: "base64"; media_type: string; data: string }
    | { type: "url"; url: string };
}

export interface AnthropicToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface AnthropicToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string | AnthropicContentBlock[];
  is_error?: boolean;
}

export type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicImageBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock;

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

export type AnthropicToolChoice =
  | { type: "auto" }
  | { type: "any" }
  | { type: "tool"; name: string }
  | { type: "none" };

export interface AnthropicMessagesRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  system?: string | Array<{ type: "text"; text: string }>;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  tools?: AnthropicTool[];
  tool_choice?: AnthropicToolChoice;
  metadata?: { user_id?: string };
}

export interface AnthropicMessagesResponse {
  id: string;
  type: "message";
  role: "assistant";
  model: string;
  content: AnthropicContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence" | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Anthropic Messages API type definitions"
```

---

## Task 2: Anthropic↔OpenAI Format Converter

**Files:**
- Create: `/src/lib/anthropic-compat.ts`

This module converts between Anthropic Messages API format and BlockRun's internal OpenAI-compatible format, so we can reuse `callAIProvider` / `streamAIProvider`.

**Step 1: Write the converter**

Create `/src/lib/anthropic-compat.ts`:

```typescript
import type {
  AnthropicMessagesRequest,
  AnthropicMessagesResponse,
  AnthropicContentBlock,
  AnthropicToolUseBlock,
  AnthropicMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  Tool,
  ToolChoice,
} from "@/types";

// Model ID mapping: Anthropic model names → BlockRun model IDs
// Claude Code sends raw Anthropic model IDs like "claude-sonnet-4-6"
// BlockRun uses "anthropic/claude-sonnet-4.6" internally
const ANTHROPIC_TO_BLOCKRUN_MODEL: Record<string, string> = {
  "claude-haiku-4-5-20251001": "anthropic/claude-haiku-4.5",
  "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
  "claude-haiku-4.5": "anthropic/claude-haiku-4.5",
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  "claude-sonnet-4.6": "anthropic/claude-sonnet-4.6",
  "claude-opus-4-6": "anthropic/claude-opus-4.6",
  "claude-opus-4.6": "anthropic/claude-opus-4.6",
  "claude-opus-4-5-20251101": "anthropic/claude-opus-4.5",
  "claude-opus-4-5": "anthropic/claude-opus-4.5",
  "claude-opus-4.5": "anthropic/claude-opus-4.5",
};

export function resolveModelId(anthropicModelId: string): string {
  return ANTHROPIC_TO_BLOCKRUN_MODEL[anthropicModelId] || anthropicModelId;
}

// Convert Anthropic Messages request → OpenAI ChatCompletion request
export function anthropicToOpenAI(req: AnthropicMessagesRequest): ChatCompletionRequest {
  const messages: ChatMessage[] = [];

  // System message
  if (req.system) {
    const systemText = typeof req.system === "string"
      ? req.system
      : req.system.map((b) => b.text).join("\n");
    messages.push({ role: "system", content: systemText });
  }

  // Convert messages
  for (const msg of req.messages) {
    const contentBlocks = typeof msg.content === "string"
      ? [{ type: "text" as const, text: msg.content }]
      : msg.content;

    if (msg.role === "user") {
      // Check for tool_result blocks — these become separate tool messages
      const toolResults = contentBlocks.filter((b) => b.type === "tool_result");
      const nonToolBlocks = contentBlocks.filter((b) => b.type !== "tool_result");

      // Add tool result messages first
      for (const tr of toolResults) {
        if (tr.type === "tool_result") {
          const resultContent = typeof tr.content === "string"
            ? tr.content
            : tr.content?.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n") || "";
          messages.push({
            role: "tool",
            tool_call_id: tr.tool_use_id,
            content: resultContent,
          });
        }
      }

      // Add remaining user content if any
      if (nonToolBlocks.length > 0) {
        const hasImages = nonToolBlocks.some((b) => b.type === "image");
        if (hasImages) {
          const parts = nonToolBlocks.map((b) => {
            if (b.type === "text") return { type: "text" as const, text: b.text };
            if (b.type === "image") {
              const src = b.source;
              const url = src.type === "base64"
                ? `data:${src.media_type};base64,${src.data}`
                : src.url;
              return { type: "image_url" as const, image_url: { url } };
            }
            return { type: "text" as const, text: "" };
          });
          messages.push({ role: "user", content: parts });
        } else {
          const text = nonToolBlocks
            .filter((b) => b.type === "text")
            .map((b) => (b as { text: string }).text)
            .join("\n");
          messages.push({ role: "user", content: text });
        }
      }
    } else if (msg.role === "assistant") {
      // Check for tool_use blocks
      const toolUseBlocks = contentBlocks.filter((b): b is AnthropicToolUseBlock => b.type === "tool_use");
      const textBlocks = contentBlocks.filter((b) => b.type === "text");
      const text = textBlocks.map((b) => (b as { text: string }).text).join("");

      if (toolUseBlocks.length > 0) {
        messages.push({
          role: "assistant",
          content: text || null,
          tool_calls: toolUseBlocks.map((tu) => ({
            id: tu.id,
            type: "function" as const,
            function: {
              name: tu.name,
              arguments: JSON.stringify(tu.input),
            },
          })),
        });
      } else {
        messages.push({ role: "assistant", content: text });
      }
    }
  }

  // Convert tools
  let tools: Tool[] | undefined;
  if (req.tools && req.tools.length > 0) {
    tools = req.tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.input_schema,
      },
    }));
  }

  // Convert tool_choice
  let toolChoice: ToolChoice | undefined;
  if (req.tool_choice) {
    switch (req.tool_choice.type) {
      case "auto": toolChoice = "auto"; break;
      case "any": toolChoice = "required"; break;
      case "none": toolChoice = "none"; break;
      case "tool": toolChoice = { type: "function", function: { name: req.tool_choice.name } }; break;
    }
  }

  return {
    model: resolveModelId(req.model),
    messages,
    max_tokens: req.max_tokens,
    ...(req.temperature !== undefined && { temperature: req.temperature }),
    ...(req.top_p !== undefined && { top_p: req.top_p }),
    ...(req.stream !== undefined && { stream: req.stream }),
    ...(tools && { tools }),
    ...(toolChoice && { tool_choice: toolChoice }),
  };
}

// Convert OpenAI ChatCompletion response → Anthropic Messages response
export function openAIToAnthropic(
  res: ChatCompletionResponse,
  requestModel: string
): AnthropicMessagesResponse {
  const choice = res.choices[0];
  const content: AnthropicContentBlock[] = [];

  // Add text content
  if (choice.message.content) {
    content.push({ type: "text", text: choice.message.content });
  }

  // Add tool calls as tool_use blocks
  if (choice.message.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      let input: Record<string, unknown> = {};
      try { input = JSON.parse(tc.function.arguments); } catch { /* empty */ }
      content.push({
        type: "tool_use",
        id: tc.id,
        name: tc.function.name,
        input,
      });
    }
  }

  // If no content at all, add empty text block
  if (content.length === 0) {
    content.push({ type: "text", text: "" });
  }

  // Map finish_reason → stop_reason
  let stopReason: AnthropicMessagesResponse["stop_reason"] = "end_turn";
  if (choice.finish_reason === "tool_calls") stopReason = "tool_use";
  else if (choice.finish_reason === "length") stopReason = "max_tokens";

  return {
    id: res.id.startsWith("msg_") ? res.id : `msg_${res.id}`,
    type: "message",
    role: "assistant",
    model: requestModel,
    content,
    stop_reason: stopReason,
    stop_sequence: null,
    usage: {
      input_tokens: res.usage?.prompt_tokens || 0,
      output_tokens: res.usage?.completion_tokens || 0,
    },
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/anthropic-compat.ts
git commit -m "feat: add Anthropic↔OpenAI format converter for /v1/messages"
```

---

## Task 3: Anthropic-format SSE Streaming Helper

**Files:**
- Create: `/src/lib/anthropic-stream.ts`

Wraps the existing OpenAI-format SSE stream from `streamAIProvider` and re-encodes it as Anthropic-format SSE events.

**Step 1: Write the streaming adapter**

Create `/src/lib/anthropic-stream.ts`:

```typescript
import type { StreamResult } from "./ai-stream";

const encoder = new TextEncoder();

function sseEvent(event: string, data: object): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Wrap an OpenAI-format SSE stream into Anthropic-format SSE events
export function wrapAsAnthropicStream(
  openaiStream: ReadableStream<Uint8Array>,
  metadata: StreamResult["metadata"],
  requestModel: string,
  msgId: string
): { stream: ReadableStream<Uint8Array>; metadata: StreamResult["metadata"] } {
  const decoder = new TextDecoder();
  let inputTokens = 0;
  let blockStarted = false;
  let contentIndex = 0;
  let fullContent = "";

  const reader = openaiStream.getReader();

  const anthropicStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Emit message_start (input_tokens will be updated via metadata)
        controller.enqueue(
          sseEvent("message_start", {
            type: "message_start",
            message: {
              id: msgId,
              type: "message",
              role: "assistant",
              model: requestModel,
              content: [],
              stop_reason: null,
              stop_sequence: null,
              usage: { input_tokens: 0, output_tokens: 0 },
            },
          })
        );

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            let chunk;
            try { chunk = JSON.parse(data); } catch { continue; }

            const delta = chunk.choices?.[0]?.delta;
            const finishReason = chunk.choices?.[0]?.finish_reason;

            // Text content delta
            if (delta?.content) {
              if (!blockStarted) {
                controller.enqueue(
                  sseEvent("content_block_start", {
                    type: "content_block_start",
                    index: contentIndex,
                    content_block: { type: "text", text: "" },
                  })
                );
                blockStarted = true;
              }
              fullContent += delta.content;
              controller.enqueue(
                sseEvent("content_block_delta", {
                  type: "content_block_delta",
                  index: contentIndex,
                  delta: { type: "text_delta", text: delta.content },
                })
              );
            }

            // Stream finished
            if (finishReason !== null && finishReason !== undefined) {
              if (blockStarted) {
                controller.enqueue(
                  sseEvent("content_block_stop", {
                    type: "content_block_stop",
                    index: contentIndex,
                  })
                );
              }

              let stopReason: string = "end_turn";
              if (finishReason === "tool_calls") stopReason = "tool_use";
              else if (finishReason === "length") stopReason = "max_tokens";

              // Get final token counts from metadata
              const meta = await metadata;
              controller.enqueue(
                sseEvent("message_delta", {
                  type: "message_delta",
                  delta: { stop_reason: stopReason, stop_sequence: null },
                  usage: { output_tokens: meta.outputTokens },
                })
              );

              controller.enqueue(
                sseEvent("message_stop", { type: "message_stop" })
              );
            }
          }
        }

        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(
          sseEvent("error", { type: "error", error: { type: "api_error", message: msg } })
        );
        controller.close();
      }
    },
  });

  return { stream: anthropicStream, metadata };
}
```

**Step 2: Commit**

```bash
git add src/lib/anthropic-stream.ts
git commit -m "feat: add Anthropic SSE stream adapter for /v1/messages"
```

---

## Task 4: The Route Handler

**Files:**
- Create: `/src/app/api/v1/messages/route.ts`

This is the main endpoint. It follows the same structure as `/api/v1/chat/completions/route.ts` but with Anthropic format I/O.

**Step 1: Create the route**

Create `/src/app/api/v1/messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callAIProvider } from "@/lib/ai-providers";
import { streamAIProvider } from "@/lib/ai-stream";
import { getModel, calculatePrice, estimateInputTokens, MARGIN_PERCENT, MIN_PAYMENT_USD } from "@/lib/models";
import { getNetworkMode } from "@/lib/network-config";
import {
  initializeResourceServer,
  buildPaymentRequirements,
  createPaymentRequired,
  create402Headers,
  verifyPayment,
  settlePaymentWithRetry,
} from "@/lib/x402";
import { logLLMCall, recordSuccess, recordFailure, recordRecentCall } from "@/lib/gcs-logger";
import { rateLimit, getClientIdentifier, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { anthropicToOpenAI, openAIToAnthropic, resolveModelId } from "@/lib/anthropic-compat";
import { wrapAsAnthropicStream } from "@/lib/anthropic-stream";
import type { AnthropicMessagesResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 540;

let serverInitialized = false;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

// Anthropic Messages API request schema
const AnthropicContentBlockSchema = z.object({
  type: z.string(),
}).passthrough();

const AnthropicMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.union([z.string(), z.array(AnthropicContentBlockSchema)]),
});

const AnthropicToolSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  input_schema: z.record(z.string(), z.unknown()),
});

const AnthropicToolChoiceSchema = z.union([
  z.object({ type: z.literal("auto") }),
  z.object({ type: z.literal("any") }),
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("tool"), name: z.string() }),
]);

const AnthropicMessagesSchema = z.object({
  model: z.string(),
  messages: z.array(AnthropicMessageSchema),
  max_tokens: z.number().min(1),
  system: z.union([
    z.string(),
    z.array(z.object({ type: z.literal("text"), text: z.string() })),
  ]).optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  top_k: z.number().optional(),
  stream: z.boolean().optional().default(false),
  tools: z.array(AnthropicToolSchema).optional(),
  tool_choice: AnthropicToolChoiceSchema.optional(),
  metadata: z.object({ user_id: z.string().optional() }).optional(),
});

function anthropicError(status: number, type: string, message: string) {
  return NextResponse.json(
    { type: "error", error: { type, message } },
    { status, headers: NO_CACHE_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIdentifier(request.headers);

  // Auth: accept x-api-key or Authorization bearer
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  // Size check
  const contentLength = parseInt(request.headers.get("content-length") || "0");
  if (contentLength > 5_000_000) {
    return anthropicError(413, "request_too_large", "Request exceeds 5MB limit");
  }

  try {
    if (!serverInitialized) {
      await initializeResourceServer();
      serverInitialized = true;
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return anthropicError(400, "invalid_request_error", "Request body is not valid JSON");
    }

    const parseResult = AnthropicMessagesSchema.safeParse(body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return anthropicError(400, "invalid_request_error", issues);
    }

    const anthropicRequest = parseResult.data;
    const requestModel = anthropicRequest.model;

    // Resolve model ID
    const blockrunModelId = resolveModelId(requestModel);
    const model = getModel(blockrunModelId);
    if (!model) {
      return anthropicError(400, "invalid_request_error", `Unknown model: ${requestModel}`);
    }
    if (!model.available) {
      return anthropicError(400, "invalid_request_error", `Model ${requestModel} is not currently available`);
    }

    // Convert to internal format
    const openaiRequest = anthropicToOpenAI(anthropicRequest);

    // Estimate tokens for pricing
    const messagesForEstimate = openaiRequest.messages.map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : (m.content ? JSON.stringify(m.content) : ""),
    }));
    const estimatedInputTokens = estimateInputTokens(messagesForEstimate);
    const maxOutputTokens = Math.min(anthropicRequest.max_tokens, model.maxOutput || 16384);
    const pricing = calculatePrice(blockrunModelId, estimatedInputTokens, maxOutputTokens);

    const isFreeModel = model.billingMode === "free";
    const isLocalTest = request.headers.get("x-local-test") === "true" &&
      (request.headers.get("host")?.includes("localhost") || request.headers.get("host")?.includes("127.0.0.1"));

    // Payment handling
    const paymentHeader =
      request.headers.get("x-payment") ||
      request.headers.get("payment-signature") ||
      request.headers.get("X-Payment");

    const requirements = await buildPaymentRequirements(pricing.withMargin);

    // Rate limit free tier
    if (isFreeModel && !isLocalTest) {
      const rl = rateLimit(`free:${clientIp}`, RATE_LIMIT_CONFIGS.freeTier);
      if (!rl.success) {
        return anthropicError(429, "rate_limit_error", "Free tier: max 60 requests/hour");
      }
    }

    // Require payment for paid models
    if (!isFreeModel && !isLocalTest && !paymentHeader) {
      const host = request.headers.get("host") || "blockrun.ai";
      const protocol = host.includes("localhost") ? "http" : "https";
      const resourceUrl = `${protocol}://${host}/api/v1/messages`;
      const paymentRequired = createPaymentRequired(requirements, `${model.name} API call`, resourceUrl);
      const headers402 = create402Headers(paymentRequired);
      return NextResponse.json(
        {
          type: "error",
          error: {
            type: "payment_required",
            message: "This endpoint requires x402 payment",
            price: { amount: pricing.withMargin.toFixed(6), currency: "USD" },
            paymentInfo: { network: "base", asset: "USDC", x402Version: 2 },
          },
        },
        { status: 402, headers: { ...headers402, ...NO_CACHE_HEADERS } }
      );
    }

    // Verify payment for paid models
    let payer = isFreeModel || isLocalTest ? "free-tier" : "unknown";
    if (!isFreeModel && !isLocalTest && paymentHeader) {
      const verification = await verifyPayment(paymentHeader, requirements);
      if (!verification.valid) {
        return anthropicError(402, "payment_error", verification.error || "Payment verification failed");
      }
      payer = verification.payer || "unknown";
      console.log(`[Payment] Verified payer=${payer} model=${blockrunModelId} price=$${pricing.withMargin.toFixed(6)} (messages)`);
    }

    // ========== STREAMING ==========
    if (anthropicRequest.stream) {
      try {
        const { stream: sseStream, metadata } = await streamAIProvider({
          ...openaiRequest,
          stream: true,
        });

        const msgId = `msg_${Date.now()}`;
        const { stream: anthropicStream, metadata: wrappedMeta } = wrapAsAnthropicStream(
          sseStream,
          metadata,
          requestModel,
          msgId
        );

        // Async logging
        wrappedMeta.then(async (meta) => {
          const latencyMs = Date.now() - startTime;
          recordSuccess(model.provider, latencyMs);
          recordRecentCall({
            model: blockrunModelId,
            wallet: payer,
            inputTokens: meta.inputTokens,
            outputTokens: meta.outputTokens,
            latencyMs,
            status: "success",
            timestamp: Date.now(),
          });

          if (!isFreeModel && paymentHeader) {
            try {
              const settlement = await settlePaymentWithRetry(paymentHeader, requirements, 3);
              if (settlement.success && settlement.txHash) {
                console.log(`[Settlement] OK tx=${settlement.txHash} payer=${payer} (messages stream)`);
              }
            } catch (e) {
              console.error("[Settlement] Error (messages stream):", e);
            }
          }

          logLLMCall({
            wallet_address: payer,
            model: blockrunModelId,
            prompt: openaiRequest.messages,
            response: meta.fullContent.slice(0, 10000),
            finish_reason: meta.finishReason,
            input_tokens: meta.inputTokens,
            output_tokens: meta.outputTokens,
            latency_ms: latencyMs,
            status: "success",
            tx_hash: "",
            created_at: new Date().toISOString(),
            client_ip: clientIp,
          }).catch(console.error);
        }).catch(console.error);

        return new Response(anthropicStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        recordFailure(model.provider, blockrunModelId, errorMsg);
        return anthropicError(503, "api_error", errorMsg);
      }
    }

    // ========== NON-STREAMING ==========
    try {
      const { response: openaiResponse, inputTokens, outputTokens } = await callAIProvider(openaiRequest);
      const latencyMs = Date.now() - startTime;

      // Settle payment
      if (!isFreeModel && paymentHeader) {
        settlePaymentWithRetry(paymentHeader, requirements, 3)
          .then((s) => {
            if (s.success && s.txHash) {
              console.log(`[Settlement] OK tx=${s.txHash} payer=${payer} (messages)`);
            }
          })
          .catch(console.error);
      }

      recordSuccess(model.provider, latencyMs);
      recordRecentCall({
        model: blockrunModelId,
        wallet: payer,
        inputTokens,
        outputTokens,
        latencyMs,
        status: "success",
        timestamp: Date.now(),
      });

      logLLMCall({
        wallet_address: payer,
        model: blockrunModelId,
        prompt: openaiRequest.messages,
        response: openaiResponse.choices[0]?.message?.content?.slice(0, 10000) || "",
        finish_reason: openaiResponse.choices[0]?.finish_reason || "stop",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        latency_ms: latencyMs,
        status: "success",
        tx_hash: "",
        created_at: new Date().toISOString(),
        client_ip: clientIp,
      }).catch(console.error);

      const anthropicResponse = openAIToAnthropic(openaiResponse, requestModel);
      return NextResponse.json(anthropicResponse);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      recordFailure(model.provider, blockrunModelId, errorMsg);
      return anthropicError(503, "api_error", errorMsg);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Messages] Unexpected error:", errorMsg);
    return anthropicError(500, "api_error", errorMsg);
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/v1/messages/route.ts
git commit -m "feat: add Anthropic Messages API endpoint at /api/v1/messages"
```

---

## Task 5: Local Testing

**Step 1: Build and verify no type errors**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun && pnpm build
```

Fix any type errors.

**Step 2: Test with curl (non-streaming)**

```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test" \
  -H "x-local-test: true" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Expected: Anthropic-format JSON response with `type: "message"`, `content` array, `stop_reason`, `usage`.

**Step 3: Test streaming**

```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test" \
  -H "x-local-test: true" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 100,
    "stream": true,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Expected: SSE events with `event: message_start`, `event: content_block_start`, `event: content_block_delta`, etc.

**Step 4: Test with non-Claude model**

```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test" \
  -H "x-local-test: true" \
  -d '{
    "model": "openai/gpt-5.4",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Expected: Same Anthropic-format response, but powered by GPT-5.4.

**Step 5: Test with Claude Code**

```bash
ANTHROPIC_BASE_URL="http://localhost:3000/api" ANTHROPIC_API_KEY="test" claude
```

Note: This requires `x-local-test` bypass logic to also check `x-api-key` header, or temporarily set the model to a free model.

**Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during local testing"
```

---

## Task 6: Deploy to sol.blockrun.ai

**Step 1: Deploy**

Follow existing deployment process to deploy to sol.blockrun.ai (the Solana gateway instance).

**Step 2: Smoke test on sol.blockrun.ai**

```bash
curl -X POST https://sol.blockrun.ai/api/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Expected: 402 Payment Required with x402 payment info.

**Step 3: Test with Claude Code (using x402 client)**

```bash
ANTHROPIC_BASE_URL="https://sol.blockrun.ai/api" ANTHROPIC_API_KEY="any" claude
```

Note: Claude Code doesn't natively speak x402. This will return 402. Full Claude Code integration requires either:
- A local x402 signing proxy (separate project)
- Or an API key auth bypass for registered users (future work)

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Type definitions | `src/types/index.ts` |
| 2 | Format converter | `src/lib/anthropic-compat.ts` (new) |
| 3 | Stream adapter | `src/lib/anthropic-stream.ts` (new) |
| 4 | Route handler | `src/app/api/v1/messages/route.ts` (new) |
| 5 | Local testing | — |
| 6 | Deploy to sol | — |

**Key design decisions:**
- Reuses `callAIProvider` / `streamAIProvider` — no duplicate provider logic
- Only 2 new files + 1 modified file + 1 new route
- x402 payment flow identical to chat/completions
- Model ID mapping handles both Anthropic native IDs and BlockRun IDs
