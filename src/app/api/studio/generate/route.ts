import { createClient } from "@/lib/supabase/server";
import { runGeneration } from "@/lib/studio/ai";
import { uploadGeneratedImage } from "@/lib/studio/upload";
import { GEMINI_TEXT_MODELS, MODEL_IDS } from "@/components/studio/model-catalog";
import type { ModelType, Quality, Resolution, ThinkingLevel } from "@/components/studio/types";

export const maxDuration = 60;

interface GenerateBody {
  mode: "text-to-image" | "image-editing";
  prompt: string;
  aspectRatio: string;
  model: ModelType;
  thinkingLevel?: ThinkingLevel;
  resolution?: Resolution;
  quality?: Quality;
  useGrounding?: boolean;
  image1DataUrl?: string;
  image2DataUrl?: string;
}

export async function POST(req: Request) {
  // 鉴权：和 /api/chat 一致，未登录直接拒绝
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json(
      { error: "未配置 AI_GATEWAY_API_KEY，图片生成不可用" },
      { status: 500 },
    );
  }

  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: "请输入提示词" }, { status: 400 });
  }
  if (!body.model || !MODEL_IDS.includes(body.model)) {
    return Response.json({ error: "未知的模型" }, { status: 400 });
  }
  if (body.mode === "image-editing" && !body.image1DataUrl) {
    return Response.json({ error: "编辑模式需要至少一张图片" }, { status: 400 });
  }

  try {
    const result = await runGeneration({
      mode: body.mode,
      prompt,
      aspectRatio: body.aspectRatio || "square",
      selectedModel: body.model,
      thinkingLevel: body.thinkingLevel ?? "minimal",
      resolution: body.resolution ?? "1K",
      quality: body.quality ?? "auto",
      useGrounding: Boolean(body.useGrounding),
      apiKey: process.env.AI_GATEWAY_API_KEY,
      image1DataUrl: body.image1DataUrl,
      image2DataUrl: body.image2DataUrl,
    });

    const prefix = body.mode === "text-to-image" ? "generation" : "editing";
    const url = await uploadGeneratedImage(result.base64, result.mediaType, prefix);

    return Response.json({
      url,
      prompt,
      description: result.description,
      durationMs: result.durationMs,
      isGeminiText: GEMINI_TEXT_MODELS.has(body.model),
    });
  } catch (error) {
    console.error("[/api/studio/generate] 生成失败:", error);
    const message = error instanceof Error ? error.message : "生成失败，请重试";
    return Response.json({ error: message }, { status: 500 });
  }
}
