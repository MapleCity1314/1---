import { generateText, generateImage } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import { GEMINI_TEXT_MODELS } from "@/components/studio/model-catalog";
import type { ModelType, ThinkingLevel, Resolution, Quality } from "@/components/studio/types";

// 同步版本的生成逻辑：原版用 Vercel Workflow 的 "use step"/"use workflow" 做
// 异步编排 + 轮询，这里改成普通 async 函数，由路由 handler 直接 await。

export interface GenerateImageInput {
  mode: "text-to-image" | "image-editing";
  prompt: string;
  aspectRatio: string;
  selectedModel: ModelType;
  thinkingLevel: ThinkingLevel;
  resolution: Resolution;
  quality: Quality;
  useGrounding: boolean;
  apiKey: string;
  image1DataUrl?: string;
  image2DataUrl?: string;
}

export interface GenerateImageResult {
  base64: string;
  mediaType: string;
  description: string;
  durationMs: number;
}

/** 把 AI Gateway 的失败信息转成更直观的错误文案。 */
function mapGatewayError(error: unknown): Error {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("credit card") || msg.includes("payment method") || msg.includes("insufficient credit")) {
    return new Error("AI Gateway 账户余额不足，请检查计费设置");
  }
  if (msg.includes("401") || msg.includes("403") || /unauthori[sz]ed/i.test(msg)) {
    return new Error("AI Gateway 鉴权失败，请检查 AI_GATEWAY_API_KEY");
  }
  if (msg.includes("429") || /rate limit/i.test(msg)) {
    return new Error("请求过于频繁，请稍后再试");
  }
  return error instanceof Error ? error : new Error(msg);
}

/** Gemini 系列图像模型走 generateText + responseModalities。
 *  传入图片 data URL 即为编辑模式，否则为文生图。 */
async function executeGeminiImage(input: {
  apiKey: string;
  modelId: string;
  prompt: string;
  googleOptions: Record<string, unknown>;
  useGrounding: boolean;
  image1DataUrl?: string;
  image2DataUrl?: string;
}): Promise<GenerateImageResult> {
  const startedAt = Date.now();
  const gateway = createGateway({ apiKey: input.apiKey });
  const model = gateway(input.modelId);

  const isEditing = Boolean(input.image1DataUrl);

  let callOptions: { prompt: string } | { messages: Array<{ role: "user"; content: unknown[] }> };
  if (isEditing) {
    const editingPrompt = input.image2DataUrl
      ? `${input.prompt}. Combine these two images creatively while following the instructions.`
      : `${input.prompt}. Edit or transform this image based on the instructions.`;
    const messageParts: Array<{ type: "text" | "image"; text?: string; image?: string }> = [
      { type: "image", image: input.image1DataUrl },
      ...(input.image2DataUrl ? [{ type: "image" as const, image: input.image2DataUrl }] : []),
      { type: "text", text: editingPrompt },
    ];
    callOptions = { messages: [{ role: "user", content: messageParts }] };
  } else {
    callOptions = {
      prompt: `Generate a high-quality image based on this description: ${input.prompt}. The image should be visually appealing and match the description as closely as possible.`,
    };
  }

  let result;
  try {
    // google.tools.googleSearch() 返回的对象里含不可序列化的 inputSchema（函数），
    // 这里直接内联调用，不要存进变量。
    result = await generateText({
      model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(callOptions as any),
      ...(input.useGrounding && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: { google_search: google.tools.googleSearch({ mode: "MODE_DYNAMIC" }) as any },
      }),
      providerOptions: {
        google: input.googleOptions,
      },
    });
  } catch (error) {
    throw mapGatewayError(error);
  }

  const imageFiles = result.files?.filter((f) => f.mediaType?.startsWith("image/")) || [];
  if (imageFiles.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleMeta = (result.providerMetadata as any)?.google;
    const finishReason = result.finishReason;
    const blockReason = googleMeta?.promptFeedback?.blockReason;
    console.error(`[studio] ${isEditing ? "image-editing" : "text-to-image"} 未返回图片`, {
      text: result.text?.slice(0, 500),
      fileCount: result.files?.length ?? 0,
      finishReason,
      blockReason,
      usage: result.usage,
      prompt: input.prompt.slice(0, 200),
    });
    if (blockReason || finishReason === "content-filter") {
      throw new Error(`内容被安全策略拦截（${blockReason ?? finishReason}）。${result.text?.slice(0, 200) ?? ""}`);
    }
    if (finishReason === "length") {
      throw new Error("模型 token 用尽仍未生成图片，请尝试简化提示词");
    }
    throw new Error("模型没有生成图片");
  }

  return {
    base64: imageFiles[0].base64,
    mediaType: imageFiles[0].mediaType || "image/png",
    description: result.text || "",
    durationMs: Date.now() - startedAt,
  };
}

const NATIVE_ASPECT_RATIO_MAP: Record<string, `${number}:${number}`> = {
  portrait: "9:16",
  landscape: "16:9",
  wide: "21:9",
  "4:3": "4:3",
  "3:4": "3:4",
  "3:2": "3:2",
  "2:3": "2:3",
  "5:4": "5:4",
  "4:5": "4:5",
  square: "1:1",
};

// 每个 app 内的比例选项对应的数值宽高比，用来给只支持固定 size 的模型
// （如 OpenAI gpt-image）挑选最接近的档位。
const APP_ASPECT_VALUE: Record<string, number> = {
  square: 1,
  portrait: 9 / 16,
  landscape: 16 / 9,
  wide: 21 / 9,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "5:4": 5 / 4,
  "4:5": 4 / 5,
};

/** gpt-image-1.5 忽略 aspectRatio，只接受三种固定 size（正方形/横向 3:2/纵向 2:3）。 */
function openAiSizeFor(aspectRatio: string): `${number}x${number}` {
  const r = APP_ASPECT_VALUE[aspectRatio] ?? 1;
  if (r > 1.2) return "1536x1024";
  if (r < 0.83) return "1024x1536";
  return "1024x1024";
}

/** gpt-image-2 支持任意 size（比例 1:3–3:1，边长需为 16 的倍数）。
 *  按请求的比例构造 size，短边固定为 1024。 */
function gptImage2SizeFor(aspectRatio: string): `${number}x${number}` {
  const r = Math.max(1 / 3, Math.min(3, APP_ASPECT_VALUE[aspectRatio] ?? 1));
  const round16 = (n: number) => Math.max(16, Math.round(n / 16) * 16);
  const BASE = 1024;
  const [w, h] = r >= 1 ? [round16(BASE * r), BASE] : [BASE, round16(BASE / r)];
  return `${w}x${h}`;
}

/** Recraft 只接受固定的 size 档位，按 app 比例映射到最接近的 Recraft size。 */
const RECRAFT_SIZE_MAP: Record<string, `${number}x${number}`> = {
  square: "1024x1024",
  landscape: "1820x1024",
  portrait: "1024x1820",
  "4:3": "1365x1024",
  "3:4": "1024x1365",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
  "5:4": "1280x1024",
  "4:5": "1024x1280",
};
function recraftSizeFor(aspectRatio: string): `${number}x${number}` {
  return RECRAFT_SIZE_MAP[aspectRatio] || "1024x1024";
}

/** 去掉 data URL 前缀，只留 base64——generateImage 的图片输入直接接受这个。 */
function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

async function executeNativeImage(input: {
  apiKey: string;
  modelId: string;
  prompt: string;
  aspectRatio: string;
  mode: "text-to-image" | "image-editing";
  quality?: string;
  image1DataUrl?: string;
  image2DataUrl?: string;
}): Promise<GenerateImageResult> {
  const startedAt = Date.now();
  const gateway = createGateway({ apiKey: input.apiKey });
  const model = gateway.imageModel(input.modelId);

  const isOpenAI = input.modelId.startsWith("openai/");

  // OpenAI 和 Recraft 用固定 size 档位，其余模型用 aspectRatio。
  const dimensions: { size: `${number}x${number}` } | { aspectRatio: `${number}:${number}` } =
    input.modelId === "openai/gpt-image-2"
      ? { size: gptImage2SizeFor(input.aspectRatio) }
      : isOpenAI
        ? { size: openAiSizeFor(input.aspectRatio) }
        : input.modelId.startsWith("recraft/")
          ? { size: recraftSizeFor(input.aspectRatio) }
          : { aspectRatio: NATIVE_ASPECT_RATIO_MAP[input.aspectRatio] || "1:1" };

  const providerOptions =
    isOpenAI && input.quality && input.quality !== "auto"
      ? { openai: { quality: input.quality } }
      : undefined;

  // 编辑模式下把上传的图片喂给模型，而不是悄悄丢弃它们去做一次无关的文生图。
  const inputImages = [input.image1DataUrl, input.image2DataUrl]
    .filter((u): u is string => Boolean(u))
    .map(dataUrlToBase64);

  const prompt =
    input.mode === "image-editing" && inputImages.length > 0
      ? { images: inputImages, text: input.prompt }
      : input.prompt;

  let result;
  try {
    result = await generateImage({
      model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prompt: prompt as any,
      n: 1,
      ...dimensions,
      ...(providerOptions && { providerOptions }),
    });
  } catch (error) {
    throw mapGatewayError(error);
  }

  const image = result.images?.[0];
  if (!image) {
    throw new Error("模型没有生成图片");
  }

  return {
    base64: image.base64,
    mediaType: image.mediaType || "image/png",
    description: "",
    durationMs: Date.now() - startedAt,
  };
}

export async function runGeneration(input: GenerateImageInput): Promise<GenerateImageResult> {
  const modelId = input.selectedModel;
  const isGeminiTextModel = GEMINI_TEXT_MODELS.has(modelId);

  const googleOptions: Record<string, unknown> = {
    responseModalities: ["IMAGE"],
    imageConfig: { aspectRatio: NATIVE_ASPECT_RATIO_MAP[input.aspectRatio] || "1:1" },
  };

  // 思考深度配置：
  //   gemini-3.1-flash-image-preview 支持 minimal | low | medium | high
  //   gemini-3-pro-image 只支持 low | high
  //   gemini-2.5-flash-image 不支持 thinkingConfig
  if (modelId === "google/gemini-3.1-flash-image-preview") {
    (googleOptions.thinkingConfig as Record<string, string>) = {
      thinkingLevel: input.thinkingLevel === "high" ? "high" : "minimal",
    };
  } else if (modelId === "google/gemini-3-pro-image") {
    (googleOptions.thinkingConfig as Record<string, string>) = {
      thinkingLevel: input.thinkingLevel === "high" ? "high" : "low",
    };
  }

  if (modelId === "google/gemini-3.1-flash-image-preview" && input.resolution !== "1K") {
    (googleOptions.imageConfig as Record<string, string>).imageSize = input.resolution;
  }

  if (isGeminiTextModel) {
    return executeGeminiImage({
      apiKey: input.apiKey,
      modelId,
      prompt: input.prompt,
      googleOptions,
      useGrounding: modelId === "google/gemini-3.1-flash-image-preview" && input.useGrounding,
      image1DataUrl: input.mode === "image-editing" ? input.image1DataUrl : undefined,
      image2DataUrl: input.mode === "image-editing" ? input.image2DataUrl : undefined,
    });
  }

  return executeNativeImage({
    apiKey: input.apiKey,
    modelId,
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
    mode: input.mode,
    quality: input.quality,
    image1DataUrl: input.image1DataUrl,
    image2DataUrl: input.image2DataUrl,
  });
}
