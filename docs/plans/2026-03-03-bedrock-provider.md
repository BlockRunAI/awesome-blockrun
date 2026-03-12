# Amazon Bedrock Provider Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route all `anthropic/*` model calls through Amazon Bedrock when `BEDROCK_ENABLED=true`, so AWS credits cover Claude inference costs transparently — no change to model IDs or user-facing behavior.

**Architecture:** Add a `callBedrock()` function in `ai-providers.ts` that reuses existing message/tool conversion logic from `callAnthropic()` but calls the AWS Bedrock Converse API. In `callProviderByName()`, when provider is `"anthropic"` and `BEDROCK_ENABLED=true`, delegate to `callBedrock()` instead of `callAnthropic()`. Falls back to direct Anthropic API when env var is absent.

**Tech Stack:** `@aws-sdk/client-bedrock-runtime` (Converse API), existing `filterOrphanedToolMessages`, `sanitizeToolId` helpers.

---

### Task 1: Install AWS Bedrock SDK

**Files:**
- Modify: `package.json` (via pnpm)

**Step 1: Install the SDK**

```bash
pnpm add @aws-sdk/client-bedrock-runtime
```

**Step 2: Verify install**

```bash
node -e "require('@aws-sdk/client-bedrock-runtime'); console.log('ok')"
```
Expected: `ok`

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @aws-sdk/client-bedrock-runtime"
```

---

### Task 2: Write failing test for `callBedrock` routes through Bedrock when BEDROCK_ENABLED=true

**Files:**
- Modify: `src/lib/ai-providers.test.ts` (create if missing)

**Step 1: Write the failing test**

Add to `src/lib/ai-providers.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock AWS SDK
vi.mock("@aws-sdk/client-bedrock-runtime", () => ({
  BedrockRuntimeClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      output: {
        message: {
          role: "assistant",
          content: [{ text: "Hello from Bedrock" }],
        },
      },
      usage: { inputTokens: 10, outputTokens: 5 },
      stopReason: "end_turn",
    }),
  })),
  ConverseCommand: vi.fn().mockImplementation((input) => ({ input })),
}));

vi.mock("./network-config", () => ({
  getCurrentNetworkConfig: vi.fn(() => ({
    network: "eip155:8453",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdcDomainName: "USD Coin",
    networkName: "Base",
    apiBaseUrl: "https://blockrun.ai",
  })),
}));

import { callAIProvider } from "./ai-providers";

const MOCK_REQUEST = {
  model: "anthropic/claude-sonnet-4.6",
  messages: [{ role: "user" as const, content: "hello" }],
};

describe("Bedrock transparent routing", () => {
  afterEach(() => {
    delete process.env.BEDROCK_ENABLED;
    delete process.env.AWS_BEDROCK_REGION;
    vi.unstubAllEnvs();
  });

  it("routes anthropic/* calls through Bedrock when BEDROCK_ENABLED=true", async () => {
    process.env.BEDROCK_ENABLED = "true";
    process.env.AWS_BEDROCK_REGION = "us-east-1";
    process.env.AWS_BEDROCK_ACCESS_KEY_ID = "test-key";
    process.env.AWS_BEDROCK_SECRET_ACCESS_KEY = "test-secret";

    const { BedrockRuntimeClient } = await import("@aws-sdk/client-bedrock-runtime");

    const result = await callAIProvider(MOCK_REQUEST);

    // BedrockRuntimeClient should have been instantiated
    expect(BedrockRuntimeClient).toHaveBeenCalled();
    expect(result.response.choices[0].message.content).toBe("Hello from Bedrock");
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);
  });

  it("routes anthropic/* calls to direct Anthropic when BEDROCK_ENABLED is not set", async () => {
    // BEDROCK_ENABLED not set — direct Anthropic path
    const { BedrockRuntimeClient } = await import("@aws-sdk/client-bedrock-runtime");
    vi.mocked(BedrockRuntimeClient).mockClear();

    // callAnthropic will throw (no ANTHROPIC_API_KEY in test env) — that's fine
    // We just want to confirm BedrockRuntimeClient was NOT called
    try {
      await callAIProvider(MOCK_REQUEST);
    } catch {
      // expected
    }

    expect(BedrockRuntimeClient).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/ai-providers.test.ts
```
Expected: FAIL — `callBedrock` not implemented, Bedrock client not called.

---

### Task 3: Implement `callBedrock()` and env-var gate

**Files:**
- Modify: `src/lib/ai-providers.ts`

**Step 1: Add Bedrock model ID map** (after `ANTHROPIC_MODEL_MAP` at line ~1100)

```typescript
// Maps BlockRun model IDs → Bedrock cross-region inference profile IDs
// Cross-region profiles (us.*) provide higher availability across AWS regions
const BEDROCK_MODEL_MAP: Record<string, string> = {
  "claude-haiku-4.5":  "us.anthropic.claude-haiku-4-5-20251001-v1:0",
  "claude-sonnet-4":   "us.anthropic.claude-sonnet-4-5-20251101-v1:0",
  "claude-sonnet-4.6": "us.anthropic.claude-sonnet-4-5-20251101-v1:0",
  "claude-opus-4":     "us.anthropic.claude-opus-4-5-20251101-v1:0",
  "claude-opus-4.5":   "us.anthropic.claude-opus-4-5-20251101-v1:0",
  "claude-opus-4.6":   "us.anthropic.claude-opus-4-5-20251101-v1:0",
};
```

> **Note:** Bedrock model IDs use `-v1:0` suffix and specific dates. As of Mar 2026, Claude 4.6 is not yet on Bedrock — map to 4.5 (closest available). Update when 4.6 is available.

**Step 2: Add lazy Bedrock client factory** (after the model map)

```typescript
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

let _bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
  if (!_bedrockClient) {
    _bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_BEDROCK_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _bedrockClient;
}

export function resetBedrockClient(): void {
  _bedrockClient = null; // for testing
}
```

**Step 3: Add `callBedrock()` function** (add after `callAnthropic`, before `callOpenAICompatible`)

```typescript
export async function callBedrock(
  request: ChatCompletionRequest
): Promise<{ response: ChatCompletionResponse; inputTokens: number; outputTokens: number }> {
  const modelKey = request.model.replace("anthropic/", "");
  const bedrockModelId = BEDROCK_MODEL_MAP[modelKey] || `us.anthropic.${modelKey}-v1:0`;

  // Reuse Anthropic message prep: filter orphans, strip thinking, sanitize tool IDs
  const validRoles = new Set(["user", "assistant", "system", "tool"]);
  const filteredMessages = filterOrphanedToolMessages(
    filterOrphanedToolMessages(request.messages).filter((m) => validRoles.has(m.role))
  );

  const systemMessage = filteredMessages.find((m) => m.role === "system");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherMessages = filteredMessages.filter((m) => m.role !== "system").map((m: any) => {
    const clean = { ...m };
    delete clean.reasoning_content;
    delete clean.thinking;
    if (Array.isArray(clean.content)) {
      clean.content = clean.content.filter(
        (b: { type?: string }) => b.type !== "thinking" && b.type !== "reasoning"
      );
    }
    return clean;
  });

  // Build tool ID map for sanitization consistency
  const toolIdMap = new Map<string, string>();
  for (const m of otherMessages) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) {
        if (tc.id && !toolIdMap.has(tc.id)) toolIdMap.set(tc.id, sanitizeToolId(tc.id));
      }
    }
    if (m.role === "tool" && m.tool_call_id && !toolIdMap.has(m.tool_call_id)) {
      toolIdMap.set(m.tool_call_id, sanitizeToolId(m.tool_call_id));
    }
  }

  // Convert messages to Bedrock Converse format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bedrockMessages: any[] = [];
  for (const m of otherMessages) {
    if (m.role === "tool") {
      const sanitizedId = toolIdMap.get(m.tool_call_id!) || sanitizeToolId(m.tool_call_id!);
      bedrockMessages.push({
        role: "user",
        content: [{ toolResult: { toolUseId: sanitizedId, content: [{ text: m.content || "" }] } }],
      });
    } else if (m.role === "assistant" && m.tool_calls?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [];
      if (m.content) content.push({ text: m.content });
      for (const tc of m.tool_calls) {
        const sanitizedId = toolIdMap.get(tc.id) || sanitizeToolId(tc.id);
        content.push({
          toolUse: {
            toolUseId: sanitizedId,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments || "{}"),
          },
        });
      }
      bedrockMessages.push({ role: "assistant", content });
    } else {
      // Regular text message
      const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      bedrockMessages.push({ role: m.role === "assistant" ? "assistant" : "user", content: [{ text }] });
    }
  }

  // Build Converse request
  const converseInput: ConverseCommandInput = {
    modelId: bedrockModelId,
    messages: bedrockMessages,
    inferenceConfig: {
      maxTokens: request.max_tokens || 1024,
      ...(request.temperature !== undefined && { temperature: request.temperature }),
      ...(request.top_p !== undefined && { topP: request.top_p }),
    },
    ...(systemMessage && {
      system: [{
        text: typeof systemMessage.content === "string"
          ? systemMessage.content
          : JSON.stringify(systemMessage.content),
      }],
    }),
    ...(request.tools?.length && {
      toolConfig: {
        tools: request.tools.map((t) => ({
          toolSpec: {
            name: t.function.name,
            description: t.function.description || "",
            inputSchema: { json: t.function.parameters || { type: "object", properties: {} } },
          },
        })),
      },
    }),
  };

  const command = new ConverseCommand(converseInput);
  const result = await getBedrockClient().send(command);

  // Parse response
  let textContent = "";
  const toolCalls: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> = [];

  for (const block of result.output?.message?.content || []) {
    if ("text" in block && block.text) {
      textContent += block.text;
    } else if ("toolUse" in block && block.toolUse) {
      toolCalls.push({
        id: block.toolUse.toolUseId || `tool_${Date.now()}`,
        type: "function",
        function: {
          name: block.toolUse.name || "",
          arguments: JSON.stringify(block.toolUse.input || {}),
        },
      });
    }
  }

  const stopReason = result.stopReason;
  const finishReason: "stop" | "length" | "tool_calls" =
    stopReason === "tool_use" ? "tool_calls" :
    stopReason === "max_tokens" ? "length" : "stop";

  const response: ChatCompletionResponse = {
    id: `bedrock-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: request.model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: textContent,
        ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
      },
      finish_reason: finishReason,
    }],
    usage: {
      prompt_tokens: result.usage?.inputTokens || 0,
      completion_tokens: result.usage?.outputTokens || 0,
      total_tokens: (result.usage?.inputTokens || 0) + (result.usage?.outputTokens || 0),
    },
  };

  return {
    response,
    inputTokens: result.usage?.inputTokens || 0,
    outputTokens: result.usage?.outputTokens || 0,
  };
}
```

**Step 4: Add env-var gate in `callProviderByName()`**

Change the `"anthropic"` case:
```typescript
case "anthropic":
  return process.env.BEDROCK_ENABLED === "true"
    ? callBedrock(request)
    : callAnthropic(request);
```

**Step 5: Run tests to verify GREEN**

```bash
npx vitest run src/lib/ai-providers.test.ts
```
Expected: 2 tests pass.

**Step 6: Run full suite**

```bash
npx vitest run
```
Expected: all tests pass.

**Step 7: Commit**

```bash
git add src/lib/ai-providers.ts src/lib/ai-providers.test.ts
git commit -m "feat: add Amazon Bedrock transparent routing for anthropic/* models"
```

---

### Task 4: Add env vars to Cloud Run

**Step 1: Add to `.env.local` for local dev**

Add to `.env.local`:
```
AWS_BEDROCK_ACCESS_KEY_ID=<your-iam-access-key>
AWS_BEDROCK_SECRET_ACCESS_KEY=<your-iam-secret>
AWS_BEDROCK_REGION=us-east-1
BEDROCK_ENABLED=true
```

**Step 2: Add to Cloud Run production service**

```bash
gcloud run services update blockrun-web \
  --region=us-central1 \
  --project=blockrun-prod-2026 \
  --set-env-vars="BEDROCK_ENABLED=true,AWS_BEDROCK_REGION=us-east-1,AWS_BEDROCK_ACCESS_KEY_ID=<key>,AWS_BEDROCK_SECRET_ACCESS_KEY=<secret>"
```

**Step 3: Verify routing in logs**

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="blockrun-web" AND textPayload=~"bedrock"' \
  --project=blockrun-prod-2026 --freshness=1h --limit=5
```

Expected: no errors, bedrock calls succeeding.

---

### Task 5: Add model redirect for `amazon-bedrock/eu.*` IDs

Users are already requesting `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` — add a redirect so it resolves to `anthropic/claude-sonnet-4.6` (which then goes through Bedrock transparently).

**Files:**
- Modify: `src/app/api/v1/chat/completions/route.ts` (MODEL_REDIRECTS at line ~427)

**Step 1: The test already exists** (written earlier in this session — `redirects amazon-bedrock/eu.anthropic.claude-sonnet-4-6 to anthropic/claude-sonnet-4.6`)

**Step 2: Run to confirm it still fails**

```bash
npx vitest run src/app/api/v1/chat/completions/route.test.ts --reporter=verbose 2>&1 | grep "amazon-bedrock"
```
Expected: FAIL

**Step 3: Add redirects**

In `route.ts` MODEL_REDIRECTS block, add:
```typescript
// Amazon Bedrock regional prefixes → direct Anthropic equivalents
// (Bedrock routing handled transparently via BEDROCK_ENABLED env var)
"amazon-bedrock/eu.anthropic.claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
"amazon-bedrock/eu.anthropic.claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
"amazon-bedrock/eu.anthropic.claude-haiku-4-5":  "anthropic/claude-haiku-4.5",
"amazon-bedrock/eu.anthropic.claude-opus-4":     "anthropic/claude-opus-4.6",
"amazon-bedrock/anthropic.claude-sonnet-4-6":    "anthropic/claude-sonnet-4.6",
"amazon-bedrock/anthropic.claude-sonnet-4-5":    "anthropic/claude-sonnet-4.5",
"amazon-bedrock/anthropic.claude-haiku-4-5":     "anthropic/claude-haiku-4.5",
"amazon-bedrock/anthropic.claude-opus-4":        "anthropic/claude-opus-4.6",
```

**Step 4: Run tests**

```bash
npx vitest run
```
Expected: all pass, including the amazon-bedrock redirect test.

**Step 5: Commit**

```bash
git add src/app/api/v1/chat/completions/route.ts src/app/api/v1/chat/completions/route.test.ts
git commit -m "feat: redirect amazon-bedrock/* model IDs to anthropic/* equivalents"
```

---

## To Enable in Production

Once AWS credentials are ready:

```bash
gcloud run services update blockrun-web \
  --region=us-central1 \
  --project=blockrun-prod-2026 \
  --set-env-vars="BEDROCK_ENABLED=true,AWS_BEDROCK_REGION=us-east-1,AWS_BEDROCK_ACCESS_KEY_ID=YOUR_KEY,AWS_BEDROCK_SECRET_ACCESS_KEY=YOUR_SECRET"
```

## To Disable (credits exhausted)

```bash
gcloud run services update blockrun-web \
  --region=us-central1 \
  --project=blockrun-prod-2026 \
  --remove-env-vars="BEDROCK_ENABLED"
```
Falls back to direct Anthropic API immediately, no redeploy.
