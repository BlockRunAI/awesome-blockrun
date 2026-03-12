# Image-to-Image (Edit/Inpainting) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/v1/images/image2image` endpoint to BlockRun API and `/img2img` slash command to ClawRouter, enabling users to edit images via local file path + text prompt.

**Architecture:** User gives ClawRouter a local file path → ClawRouter reads file as base64 → POSTs to BlockRun `/v1/images/image2image` (with x402 USDC payment) → BlockRun calls `openai/gpt-image-1` images.edit API → returns edited image.

**Tech Stack:** Next.js 14 (App Router), OpenAI SDK, x402 payment protocol, TypeScript, Zod

---

## Task 1: Add `editImage` to BlockRun `ai-providers.ts`

**Files:**
- Modify: `src/lib/ai-providers.ts` (after the `generateImage` export, end of file)

**Step 1: Add `editOpenAIImage` + `editImage` functions**

Add after the closing `}` of `generateImage` (end of file, ~line 2542):

```typescript
// Image editing (inpainting) — gpt-image-1 only
async function editOpenAIImage(
  model: string,
  prompt: string,
  imageBase64: string,
  maskBase64: string | null,
  size: string,
  n: number
): Promise<{ images: string[]; revisedPrompts?: string[] }> {
  const stripDataUri = (dataUri: string): { mime: string; buffer: Buffer } => {
    const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data URI format");
    return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
  };

  const { mime: imageMime, buffer: imageBuffer } = stripDataUri(imageBase64);
  const imageExt = imageMime === "image/jpeg" ? "jpg" : imageMime.split("/")[1] ?? "png";
  const imageFile = new File([imageBuffer], `image.${imageExt}`, { type: imageMime });

  let maskFile: File | undefined;
  if (maskBase64) {
    const { mime: maskMime, buffer: maskBuffer } = stripDataUri(maskBase64);
    const maskExt = maskMime === "image/jpeg" ? "jpg" : maskMime.split("/")[1] ?? "png";
    maskFile = new File([maskBuffer], `mask.${maskExt}`, { type: maskMime });
  }

  const params: Parameters<typeof getOpenAI().images.edit>[0] = {
    model: "gpt-image-1",
    image: imageFile,
    prompt,
    n,
    size: size as "1024x1024" | "1536x1024" | "1024x1536",
    response_format: "url",
  };
  if (maskFile) params.mask = maskFile;

  const response = await getOpenAI().images.edit(params);

  if (!response.data) {
    throw new Error("No image data returned from OpenAI image edit");
  }

  return {
    images: response.data.map((d) => d.url!),
    revisedPrompts: response.data
      .map((d) => (d as { revised_prompt?: string }).revised_prompt)
      .filter(Boolean) as string[],
  };
}

export async function editImage(
  model: string,
  prompt: string,
  imageBase64: string,
  maskBase64: string | null,
  size: string,
  n: number
): Promise<{ images: string[]; revisedPrompts?: string[] }> {
  const [provider] = model.split("/");
  switch (provider) {
    case "openai":
      return editOpenAIImage(model, prompt, imageBase64, maskBase64, size, n);
    default:
      throw new Error(
        `Image editing not supported for provider: ${provider}. Supported: openai`
      );
  }
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Commit**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img
git add src/lib/ai-providers.ts
git commit -m "feat: add editImage to ai-providers for gpt-image-1 inpainting"
```

---

## Task 2: Create `/v1/images/image2image` route

**Files:**
- Create: `src/app/api/v1/images/image2image/route.ts`

**Step 1: Create the file**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { editImage } from "@/lib/ai-providers";
import { getImageModel, calculateImagePrice } from "@/lib/models";
import {
  buildPaymentRequirements,
  createPaymentRequiredForImages,
  create402Headers,
  verifyPayment,
  settlePaymentWithRetry,
  createPaymentResponseHeader,
  NETWORK,
} from "@/lib/x402";

export const runtime = "nodejs";

const ImageEditSchema = z.object({
  model: z.string().default("openai/gpt-image-1"),
  prompt: z.string(),
  image: z
    .string()
    .regex(/^data:image\//, "image must be a base64 data URI (data:image/...)"),
  mask: z
    .string()
    .regex(/^data:image\//, "mask must be a base64 data URI")
    .optional(),
  size: z.string().optional().default("1024x1024"),
  n: z.number().optional().default(1),
});

const EDIT_SUPPORTED_MODELS = ["openai/gpt-image-1"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = ImageEditSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { model: modelId, prompt, image, mask, size, n } = parseResult.data;

    if (!EDIT_SUPPORTED_MODELS.includes(modelId)) {
      return NextResponse.json(
        {
          error: `Model ${modelId} does not support image editing. Supported: ${EDIT_SUPPORTED_MODELS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const model = getImageModel(modelId);
    if (!model || !model.available) {
      return NextResponse.json(
        { error: `Model ${modelId} is not available` },
        { status: 400 }
      );
    }

    const [width, height] = size.split("x").map(Number);
    const validSize = model.sizes.find((s) => s.width === width && s.height === height);
    if (!validSize) {
      const availableSizes = model.sizes.map((s) => `${s.width}x${s.height}`).join(", ");
      return NextResponse.json(
        { error: `Invalid size for ${modelId}. Available sizes: ${availableSizes}` },
        { status: 400 }
      );
    }

    const priceUsd = calculateImagePrice(modelId, size, n);
    const host = request.headers.get("host") || "blockrun.ai";
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const resourceUrl = `${protocol}://${host}/api/v1/images/image2image`;

    const paymentHeader =
      request.headers.get("x-payment") ||
      request.headers.get("payment-signature") ||
      request.headers.get("X-Payment") ||
      request.headers.get("Payment-Signature");

    if (!paymentHeader) {
      const description = `${model.name} image editing (${size}, ${n} image${n > 1 ? "s" : ""})`;
      const requirements = await buildPaymentRequirements(priceUsd, resourceUrl);
      const paymentRequired = createPaymentRequiredForImages(
        requirements,
        description,
        resourceUrl
      );
      const headers402 = create402Headers(paymentRequired);
      return NextResponse.json(
        {
          error: "Payment Required",
          message: "This endpoint requires x402 payment",
          price: {
            amount: priceUsd.toFixed(6),
            currency: "USD",
            pricePerImage: validSize.price,
            totalImages: n,
          },
          paymentInfo: { network: "base", asset: "USDC", x402Version: 2 },
        },
        { status: 402, headers: headers402 }
      );
    }

    const requirements = await buildPaymentRequirements(priceUsd, resourceUrl);
    const verification = await verifyPayment(paymentHeader, requirements);

    if (!verification.valid) {
      console.error("Payment verification failed:", verification.error);
      return NextResponse.json(
        { error: "Payment verification failed", details: verification.error },
        { status: 402 }
      );
    }

    const result = await editImage(modelId, prompt, image, mask ?? null, size, n);

    const settlement = await settlePaymentWithRetry(paymentHeader, requirements, 3);

    if (!settlement.success) {
      console.error("Settlement failed:", settlement.error);
      const paymentResponseHeader = createPaymentResponseHeader({
        success: false,
        network: NETWORK,
        payer: verification.payer,
        errorReason: settlement.error,
      });
      return NextResponse.json(
        { error: "Payment settlement failed", details: settlement.error },
        { status: 402, headers: { "PAYMENT-RESPONSE": paymentResponseHeader } }
      );
    }

    const paymentResponseHeader = createPaymentResponseHeader({
      success: true,
      transaction: settlement.txHash,
      network: NETWORK,
      payer: verification.payer,
    });

    const responseHeaders: Record<string, string> = {
      "PAYMENT-RESPONSE": paymentResponseHeader,
    };
    if (settlement.txHash) responseHeaders["X-Payment-Receipt"] = settlement.txHash;

    return NextResponse.json(
      {
        created: Math.floor(Date.now() / 1000),
        data: result.images.map((url, i) => ({
          url,
          revised_prompt: result.revisedPrompts?.[i],
        })),
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Image edit error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("API key"))
      return NextResponse.json({ error: "AI provider configuration error" }, { status: 500 });
    if (message.includes("content policy") || message.includes("safety") || message.includes("blocked"))
      return NextResponse.json({ error: "Content policy violation", details: message }, { status: 400 });
    if (message.includes("rate limit") || message.includes("Rate limit") || message.includes("429"))
      return NextResponse.json({ error: "Rate limit exceeded", details: message }, { status: 429 });
    if (message.includes("timeout") || message.includes("Timeout"))
      return NextResponse.json({ error: "Image editing timed out", details: message }, { status: 504 });

    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || "blockrun.ai";
  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const resourceUrl = `${protocol}://${host}/api/v1/images/image2image`;
  const requirements = await buildPaymentRequirements(0.02, resourceUrl);
  const paymentRequired = createPaymentRequiredForImages(
    requirements,
    "AI image editing API - edit images with USDC on Base",
    resourceUrl
  );
  const headers402 = create402Headers(paymentRequired);

  return NextResponse.json(
    {
      error: "Payment Required",
      message: "This endpoint requires x402 payment. Send a POST request with payment header.",
      endpoint: "/v1/images/image2image",
      method: "POST",
      documentation: "https://blockrun.ai/docs",
      paymentInfo: { network: "base", asset: "USDC", x402Version: 2 },
    },
    { status: 402, headers: headers402 }
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Commit**

```bash
git add src/app/api/v1/images/image2image/route.ts
git commit -m "feat: add /v1/images/image2image endpoint with x402 payment"
```

---

## Task 3: Add image2image to x402 discovery

**Files:**
- Modify: `src/app/api/.well-known/x402/route.ts`

**Step 1: Find the Image Generation block**

Search for `name: "Image Generation"` (around line 166). The block ends after the `payment:` section's closing `},`.

**Step 2: Add Image Editing entry after Image Generation block**

After the closing `},` of the Image Generation block, insert:

```typescript
      {
        name: "Image Editing",
        endpoint: "/v1/images/image2image",
        method: "POST",
        description: "Edit existing images with AI inpainting via x402 micropayments",
        models: [
          {
            id: "openai/gpt-image-1",
            name: "GPT Image 1",
            provider: "openai",
            description: "Native image editing in GPT-4o",
          },
        ],
        pricing: {
          "openai/gpt-image-1": { pricePerImage: "0.02", currency: "USD" },
        },
        payment: {
          network: networkConfig.network,
          networkName: networkConfig.networkName,
          chainId: networkConfig.chainId,
          token: "USDC",
          tokenAddress: networkConfig.usdc,
          recipient: PAYMENT_ADDRESS,
          facilitator: "coinbase-cdp+payai",
          markup: `${MARGIN_PERCENT}%`,
          scheme: "exact",
          maxTimeoutSeconds: 300,
        },
      },
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/app/api/.well-known/x402/route.ts
git commit -m "feat: add image2image to x402 discovery endpoint"
```

---

## Task 4: Add `/img2img` slash command to ClawRouter

**Files:**
- Modify: `src/proxy.ts` in `/Users/vickyfu/Documents/blockrun-web/ClawRouter/.worktrees/feat-img2img/`

**Step 1: Check existing imports at top of proxy.ts**

Verify these are already imported (search top ~50 lines):
```
readFileSync, existsSync  — from "fs"
join                       — from "path"
homedir                    — from "os"
```

**Step 2: Add `readImageFileAsDataUri` helper**

Find `async function uploadDataUriToHost` (~line 1201). Add BEFORE it:

```typescript
/**
 * Read a local image file and return it as a base64 data URI.
 * Supports ~/ home directory expansion.
 */
function readImageFileAsDataUri(filePath: string): string {
  const resolved = filePath.startsWith("~/")
    ? join(homedir(), filePath.slice(2))
    : filePath;

  if (!existsSync(resolved)) {
    throw new Error(`Image file not found: ${resolved}`);
  }

  const ext = resolved.split(".").pop()?.toLowerCase() ?? "png";
  const mimeMap: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  const mime = mimeMap[ext] ?? "image/png";
  const data = readFileSync(resolved);
  return `data:${mime};base64,${data.toString("base64")}`;
}
```

**Step 3: Add `/img2img` handler after the `/imagegen` block**

Find the end of the `/imagegen` handler — the last `}` that closes `if (lastContent.startsWith("/imagegen"))` (~line 2430). Add right after it:

```typescript
      // --- /img2img command: edit an image via BlockRun image2image API ---
      if (lastContent.startsWith("/img2img")) {
        const imgArgs = lastContent.slice("/img2img".length).trim();

        let img2imgModel = "openai/gpt-image-1";
        let img2imgSize = "1024x1024";
        let imagePath: string | null = null;
        let maskPath: string | null = null;
        let img2imgPrompt = imgArgs;

        const imageMatch = imgArgs.match(/--image\s+(\S+)/);
        if (imageMatch) {
          imagePath = imageMatch[1];
          img2imgPrompt = img2imgPrompt.replace(/--image\s+\S+/, "").trim();
        }

        const maskMatch = imgArgs.match(/--mask\s+(\S+)/);
        if (maskMatch) {
          maskPath = maskMatch[1];
          img2imgPrompt = img2imgPrompt.replace(/--mask\s+\S+/, "").trim();
        }

        const img2imgSizeMatch = imgArgs.match(/--size\s+(\d+x\d+)/);
        if (img2imgSizeMatch) {
          img2imgSize = img2imgSizeMatch[1];
          img2imgPrompt = img2imgPrompt.replace(/--size\s+\d+x\d+/, "").trim();
        }

        const img2imgModelMatch = imgArgs.match(/--model\s+(\S+)/);
        if (img2imgModelMatch) {
          const raw = img2imgModelMatch[1];
          const IMG2IMG_ALIASES: Record<string, string> = {
            "gpt-image": "openai/gpt-image-1",
            "gpt-image-1": "openai/gpt-image-1",
          };
          img2imgModel = IMG2IMG_ALIASES[raw] ?? raw;
          img2imgPrompt = img2imgPrompt.replace(/--model\s+\S+/, "").trim();
        }

        const usageText = [
          "Usage: /img2img --image <path> <prompt>",
          "",
          "Options:",
          "  --image <path>   Source image path (required)",
          "  --mask <path>    Mask image path (optional, white = area to edit)",
          "  --model <model>  Model (default: gpt-image-1)",
          "  --size <WxH>     Output size (default: 1024x1024)",
          "",
          "Models:",
          "  gpt-image-1      OpenAI GPT Image 1 — $0.02/image",
          "",
          "Examples:",
          "  /img2img --image ~/photo.png 把背景换成星空",
          "  /img2img --image ./cat.jpg --mask ./mask.png remove the background",
          "  /img2img --image /tmp/portrait.png --size 1536x1024 add a hat",
        ].join("\n");

        const sendText = (text: string) => {
          const completionId = `chatcmpl-img2img-${Date.now()}`;
          const timestamp = Math.floor(Date.now() / 1000);
          if (isStreaming) {
            res.writeHead(200, {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            });
            res.write(
              `data: ${JSON.stringify({ id: completionId, object: "chat.completion.chunk", created: timestamp, model: "clawrouter/img2img", choices: [{ index: 0, delta: { role: "assistant", content: text }, finish_reason: null }] })}\n\n`,
            );
            res.write(
              `data: ${JSON.stringify({ id: completionId, object: "chat.completion.chunk", created: timestamp, model: "clawrouter/img2img", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`,
            );
            res.write("data: [DONE]\n\n");
            res.end();
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                id: completionId,
                object: "chat.completion",
                created: timestamp,
                model: "clawrouter/img2img",
                choices: [
                  { index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" },
                ],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
              }),
            );
          }
        };

        if (!imagePath || !img2imgPrompt) {
          sendText(usageText);
          return;
        }

        let imageDataUri: string;
        let maskDataUri: string | undefined;
        try {
          imageDataUri = readImageFileAsDataUri(imagePath);
          if (maskPath) maskDataUri = readImageFileAsDataUri(maskPath);
        } catch (fileErr) {
          const fileErrMsg = fileErr instanceof Error ? fileErr.message : String(fileErr);
          sendText(`Failed to read image file: ${fileErrMsg}`);
          return;
        }

        console.log(
          `[ClawRouter] /img2img → ${img2imgModel} (${img2imgSize}): ${img2imgPrompt.slice(0, 80)}`,
        );

        try {
          const img2imgBody = JSON.stringify({
            model: img2imgModel,
            prompt: img2imgPrompt,
            image: imageDataUri,
            ...(maskDataUri ? { mask: maskDataUri } : {}),
            size: img2imgSize,
            n: 1,
          });

          const img2imgResponse = await payFetch(
            `${apiBase}/v1/images/image2image`,
            {
              method: "POST",
              headers: { "content-type": "application/json", "user-agent": USER_AGENT },
              body: img2imgBody,
            },
          );

          const img2imgResult = (await img2imgResponse.json()) as {
            created?: number;
            data?: Array<{ url?: string; revised_prompt?: string }>;
            error?: string | { message?: string };
          };

          let responseText: string;
          if (!img2imgResponse.ok || img2imgResult.error) {
            const errMsg =
              typeof img2imgResult.error === "string"
                ? img2imgResult.error
                : ((img2imgResult.error as { message?: string })?.message ??
                  `HTTP ${img2imgResponse.status}`);
            responseText = `Image editing failed: ${errMsg}`;
            console.log(`[ClawRouter] /img2img error: ${errMsg}`);
          } else {
            const images = img2imgResult.data ?? [];
            if (images.length === 0) {
              responseText = "Image editing returned no results.";
            } else {
              const lines: string[] = [];
              for (const img of images) {
                if (img.url) {
                  if (img.url.startsWith("data:")) {
                    try {
                      const hostedUrl = await uploadDataUriToHost(img.url);
                      lines.push(hostedUrl);
                    } catch (uploadErr) {
                      console.error(
                        `[ClawRouter] /img2img: failed to upload data URI: ${uploadErr instanceof Error ? uploadErr.message : String(uploadErr)}`,
                      );
                      lines.push("Image edited but upload failed. Try again.");
                    }
                  } else {
                    lines.push(img.url);
                  }
                }
                if (img.revised_prompt) lines.push(`Revised prompt: ${img.revised_prompt}`);
              }
              lines.push("", `Model: ${img2imgModel} | Size: ${img2imgSize}`);
              responseText = lines.join("\n");
            }
            console.log(`[ClawRouter] /img2img success: ${images.length} image(s)`);
          }

          sendText(responseText);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(`[ClawRouter] /img2img error: ${errMsg}`);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: { message: `Image editing failed: ${errMsg}`, type: "img2img_error" },
              }),
            );
          }
        }
        return;
      }
```

**Step 4: Verify TypeScript compiles**

```bash
cd /Users/vickyfu/Documents/blockrun-web/ClawRouter/.worktrees/feat-img2img
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 5: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: add /img2img slash command to ClawRouter"
```

---

## Task 5: Smoke test

**Step 1: Start BlockRun dev server**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img
npm run dev
```

**Step 2: Test 402 response (no payment)**

```bash
curl -s -X POST http://localhost:3000/api/v1/images/image2image \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-image-1",
    "prompt": "add sunglasses",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }' | jq '{error, price}'
```

Expected: `{"error": "Payment Required", "price": {"amount": "0.020000", ...}}`

**Step 3: Test validation — unsupported model**

```bash
curl -s -X POST http://localhost:3000/api/v1/images/image2image \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/dall-e-3","prompt":"test","image":"data:image/png;base64,abc"}' \
  | jq '.error'
```

Expected: `"Model openai/dall-e-3 does not support image editing..."`

**Step 4: Verify x402 discovery**

```bash
curl -s http://localhost:3000/api/.well-known/x402 | jq '.endpoints[] | select(.name == "Image Editing")'
```

Expected: image editing block with gpt-image-1 pricing

**Step 5: Commit plan docs**

```bash
cd /Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img
git add awesome-blockrun/docs/plans/
git commit -m "docs: add img2img implementation plan"
```

---

## Summary

| Task | Repo | Key Files |
|------|------|-----------|
| 1. `editImage` in ai-providers | blockrun | `src/lib/ai-providers.ts` |
| 2. `/v1/images/image2image` route | blockrun | `src/app/api/v1/images/image2image/route.ts` |
| 3. x402 discovery | blockrun | `src/app/api/.well-known/x402/route.ts` |
| 4. `/img2img` slash command | ClawRouter | `src/proxy.ts` |
| 5. Smoke test | both | — |

**Worktrees:**
- blockrun: `/Users/vickyfu/Documents/blockrun-web/blockrun/.worktrees/feat-img2img`
- ClawRouter: `/Users/vickyfu/Documents/blockrun-web/ClawRouter/.worktrees/feat-img2img`
