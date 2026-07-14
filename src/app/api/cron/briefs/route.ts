import { generateBrief } from "@/lib/briefs/generate";

// Vercel Cron 调用目标：每日定时生成盘面研报。
// 鉴权用 CRON_SECRET（Vercel Cron 会带 `Authorization: Bearer <CRON_SECRET>` 请求头），
// 而不是走 Supabase 会话——定时任务没有登录用户上下文。
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "未配置 CRON_SECRET，定时任务不可用" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const brief = await generateBrief({ scope: "daily" });
    return Response.json({ ok: true, id: brief.id, title: brief.title });
  } catch (error) {
    console.error("[/api/cron/briefs] 每日研报生成失败:", error);
    const message = error instanceof Error ? error.message : "生成失败";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
