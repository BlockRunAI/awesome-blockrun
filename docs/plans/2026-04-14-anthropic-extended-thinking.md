# Anthropic Extended Thinking Pass-Through

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Accept `thinking` parameter from clients and forward it to the Anthropic API, streaming thinking tokens back as `reasoning_content` in OpenAI-compatible format.

**Architecture:** Pure pass-through — clients send `thinking: { type: "enabled", budget_tokens: N }`, the server forwards it to Anthropic (direct + Bedrock), and converts `thinking_delta` events back to `reasoning_content` in SSE chunks. No server-side auto-enable; the client decides when to use thinking.

**Tech Stack:** Zod schema validation, Anthropic SDK, AWS Bedrock SDK, SSE streaming

---

## Context

Franklin agent added client-side extended thinking for Claude models. The server currently:
1. Strips `thinking` from Zod schema (unknown field)
2. Never passes `thinking` to Anthropic API calls
3. Drops `thinking_delta` events in streaming responses
4. Does NOT need billing changes (Anthropic includes thinking in `output_tokens`)

Key constraint: Anthropic requires `temperature=1` when thinking is enabled.

Existing patterns to follow:
- `reasoning_content` is already in `StreamChunk` type (ai-providers.ts:56)
- DeepSeek/kimi streaming already emits `reasoning_content` deltas (ai-stream.ts:1082)
- `anthropic-stream.ts` already converts `reasoning_content` → `thinking` blocks (reverse direction)
- History message cleanup (stripping thinking from past messages) is correct and stays

## Files to modify

| File | Change |
|------|--------|
| `src/types/index.ts:182-193` | Add `thinking` field to `ChatCompletionRequest` |
| `src/app/api/v1/chat/completions/route.ts:223-233` | Add `thinking` to Zod schema |
| `src/app/api/v1/chat/completions/route.ts:393-403` | Destructure `thinking` from parsed data |
| `src/app/api/v1/chat/completions/route.ts:655-664` | Pass `thinking` in free tier streaming call |
| `src/app/api/v1/chat/completions/route.ts:772-782` | Pass `thinking` in paid streaming call |
| `src/app/api/v1/chat/completions/route.ts:954-963` | Pass `thinking` in free tier non-streaming call |
| `src/app/api/v1/chat/completions/route.ts:1326-1335` | Pass `thinking` in paid non-streaming call |
| `src/app/api/v1/chat/completions/route.ts` (fallbacks) | Pass `thinking` in all `callAIProvider`/`streamAIProvider` calls |
| `src/lib/ai-providers.ts:1568-1581` | Forward `thinking` + force `temperature: 1` in `callAnthropic` `buildCreateParams` |
| `src/lib/ai-providers.ts:1608-1624` | Handle `thinking` content blocks in non-streaming response |
| `src/lib/ai-providers.ts:1838-1871` | Forward thinking config in `callBedrock` (if supported) |
| `src/lib/ai-stream.ts:1638-1659` | Forward `thinking` in `streamAnthropic` SDK call |
| `src/lib/ai-stream.ts:1707-1746` | Handle `thinking_delta` events → emit as `reasoning_content` |

---

### Task 1: Add `thinking` to type and schema

**Files:**
- Modify: `src/types/index.ts:192` (add field before closing brace)
- Modify: `src/app/api/v1/chat/completions/route.ts:223-233` (add to Zod schema)

**Step 1: Add `thinking` to `ChatCompletionRequest` interface**

In `src/types/index.ts`, add after the `reasoning_effort` line:

```typescript
  thinking?: { type: "enabled"; budget_tokens: number }; // Anthropic extended thinking
```

**Step 2: Add `thinking` to Zod schema**

In `src/app/api/v1/chat/completions/route.ts`, add to `ChatCompletionSchema`:

```typescript
  thinking: z.object({
    type: z.literal("enabled"),
    budget_tokens: z.number().min(1),
  }).optional(),
```

**Step 3: Verify build**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors

---

### Task 2: Pass `thinking` through route.ts to providers

**Files:**
- Modify: `src/app/api/v1/chat/completions/route.ts:393-403` (destructure thinking)
- Modify: All `streamAIProvider` and `callAIProvider` call sites in route.ts

**Step 1: Destructure `thinking` from parsed request**

At route.ts:393, add `thinking` to the destructured fields:

```typescript
    const {
      model: requestedModelId,
      messages: parsedMessages,
      max_tokens,
      temperature,
      top_p,
      stream,
      search_parameters,
      tools,
      tool_choice,
      thinking,   // <-- add this
    } = parseResult.data;
```

**Step 2: Add `thinking` to ALL provider call sites**

Every `streamAIProvider({...})` and `callAIProvider({...})` call in route.ts needs `thinking` added. There are ~8 call sites. Add `thinking,` to each object literal.

The key ones are:
- Line ~655: free tier streaming
- Line ~772: paid streaming
- Line ~954: free tier non-streaming
- Line ~1326: paid non-streaming
- Fallback calls (~1065, ~1150, ~1383, ~1456): these may use different models that don't support thinking — passing it is harmless since non-Anthropic providers will ignore it

**Step 3: Verify build**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx tsc --noEmit 2>&1 | head -20`
Expected: Type errors because `ChatCompletionRequest` now has `thinking` but providers don't use it yet — that's fine, move to Task 3.

---

### Task 3: Forward `thinking` in `callAnthropic` (non-streaming)

**Files:**
- Modify: `src/lib/ai-providers.ts:1568-1581` (buildCreateParams)
- Modify: `src/lib/ai-providers.ts:1608-1624` (response handling)

**Step 1: Forward `thinking` and enforce temperature=1 in `buildCreateParams`**

In `buildCreateParams` at ai-providers.ts:1568, modify the temperature line and add thinking:

```typescript
  const buildCreateParams = (
    system: string | Anthropic.TextBlockParam[],
    messages: Anthropic.MessageParam[]
  ) => ({
    model: modelName,
    max_tokens: request.max_tokens || 1024,
    betas: ["context-1m-2025-08-07"],
    ...((typeof system === "string" ? system : system.length > 0) && { system }),
    messages,
    // When thinking is enabled, Anthropic requires temperature=1
    ...(request.temperature !== undefined && !request.thinking && { temperature: request.temperature }),
    ...(request.top_p !== undefined && { top_p: request.top_p }),
    ...(anthropicTools && anthropicTools.length > 0 && { tools: anthropicTools }),
    ...(anthropicToolChoice && { tool_choice: anthropicToolChoice }),
    ...(request.thinking && { thinking: request.thinking, temperature: 1 }),
  });
```

**Step 2: Handle thinking blocks in non-streaming response**

In the response content block loop at ai-providers.ts:1612, the existing code only handles `text` and `tool_use`. When thinking is enabled, Anthropic returns `thinking` blocks too. These should be silently skipped for non-streaming (the OpenAI format response doesn't have a field for them — same as how DeepSeek non-streaming works).

The existing loop already skips unknown block types (no `else` clause), so **no change needed** for non-streaming response handling. The thinking tokens are still counted in `output_tokens` by Anthropic.

**Step 3: Verify build**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors for Anthropic paths

---

### Task 4: Forward `thinking` in `streamAnthropic` and handle `thinking_delta`

**Files:**
- Modify: `src/lib/ai-stream.ts:1638-1659` (streaming SDK call)
- Modify: `src/lib/ai-stream.ts:1707-1746` (event handling)

**Step 1: Forward `thinking` and enforce temperature=1 in stream call**

In `streamAnthropic` at ai-stream.ts:1638, add thinking to the SDK call:

```typescript
  const sdkStream = getAnthropic().beta.messages.stream(
    {
      model: modelName,
      max_tokens: request.max_tokens || 1024,
      betas: ["context-1m-2025-08-07"],
      ...((typeof cached.system === "string" ? cached.system : cached.system.length > 0) && {
        system: cached.system,
      }),
      messages: cached.messages,
      // When thinking is enabled, Anthropic requires temperature=1
      ...(request.temperature !== undefined && !request.thinking && {
        temperature: request.temperature,
      }),
      ...(request.top_p !== undefined && { top_p: request.top_p }),
      ...(anthropicTools &&
        anthropicTools.length > 0 && { tools: anthropicTools }),
      ...(anthropicToolChoice && {
        tool_choice: anthropicToolChoice,
      }),
      ...(request.thinking && { thinking: request.thinking, temperature: 1 }),
    } as any
  );
```

**Step 2: Handle `thinking_delta` events in the streaming loop**

In the event handler at ai-stream.ts:1707, add a case for `thinking_delta` between the existing `text_delta` and `input_json_delta` cases. Emit it as `reasoning_content` in OpenAI SSE format (same as DeepSeek does at ai-stream.ts:1082):

After the `text_delta` block (line ~1726) and before the `input_json_delta` block (line ~1727), add:

```typescript
            } else if (
              delta.type === "thinking_delta" &&
              delta.thinking
            ) {
              // Emit thinking as reasoning_content (OpenAI-compatible format)
              controller.enqueue(
                sseEncode(
                  makeChunk(chunkId, request.model, {
                    reasoning_content: delta.thinking,
                  })
                )
              );
            } else if (
```

**Step 3: Verify build**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx tsc --noEmit 2>&1 | head -20`
Expected: Clean build

---

### Task 5: Forward thinking in `callBedrock` (if Bedrock supports it)

**Files:**
- Modify: `src/lib/ai-providers.ts:1838-1871` (Bedrock converseInput)

**Step 1: Check Bedrock thinking support**

Bedrock's Converse API does NOT support the `thinking` parameter in the same way. The Bedrock SDK uses `inferenceConfig` and doesn't have a `thinking` field. For now, **skip Bedrock thinking** — log a warning if a client requests thinking on a Bedrock-routed model, and let it fall through without thinking.

No code change needed — Bedrock will simply ignore the parameter since it's not passed. The existing behavior (no thinking on Bedrock) is correct.

---

### Task 6: Verify end-to-end with build

**Step 1: Full type check**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx tsc --noEmit`
Expected: Clean

**Step 2: Verify no lint errors**

Run: `cd /Users/vickyfu/Documents/blockrun-web/blockrun && npx next lint 2>&1 | tail -10`
Expected: Clean

---

## Summary of changes

1. **Schema + types**: Accept `thinking` parameter from clients
2. **Route passthrough**: Forward `thinking` in all provider call paths
3. **callAnthropic**: Pass `thinking` to API, enforce `temperature=1` when thinking is on
4. **streamAnthropic**: Pass `thinking` to stream call, convert `thinking_delta` → `reasoning_content` in SSE
5. **Bedrock**: No change needed (doesn't support thinking via Converse API)
6. **Billing**: No change needed (thinking tokens already in `output_tokens`)
7. **History cleanup**: No change needed (existing stripping of thinking blocks from messages is correct)
