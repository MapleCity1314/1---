import { createClient } from "@/lib/supabase/server";
import { generateBrief } from "@/lib/briefs/generate";

// 手动生成允许联网调研 + AI 推理多个标的，比 studio 图片生成更久，同样给足超时预算。
export const maxDuration = 60;

interface GenerateBody {
  eventNote?: string;
}

export async function POST(req: Request) {
  // 鉴权：和 /api/chat、/api/studio/generate 一致，未登录直接拒绝
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  let body: GenerateBody = {};
  try {
    body = await req.json();
  } catch {
    // 手动生成允许空 body（不带关键节点说明）
  }

  try {
    const brief = await generateBrief({
      scope: body.eventNote?.trim() ? "event" : "manual",
      eventNote: body.eventNote?.trim() || null,
    });
    return Response.json({ brief });
  } catch (error) {
    console.error("[/api/briefs/generate] 生成失败:", error);
    const message = error instanceof Error ? error.message : "生成失败，请重试";
    return Response.json({ error: message }, { status: 500 });
  }
}
