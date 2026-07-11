import { deepseek } from "@ai-sdk/deepseek";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createClient } from "@/lib/supabase/server";
import { tools } from "./tools";

export const maxDuration = 60;

const SYSTEM = `你是「闲鱼一元小店」商品中台的 AI 助手。这家小店卖的是虚拟资料（网盘/下载链接交付）。

你的能力：
- 用 queryProducts / getProduct / getMetrics 查询商品和经营数据，回答库存、价格、利润、分类等问题。
- 用 createProductRecord / updateProductRecord / deleteProductRecord 增删改商品——这些操作会先弹出确认卡片，等用户点「确认」后才真正执行，你不必也无法跳过确认。
- 用 writeViralCopy 生成闲鱼爆款文案（标题+正文+卖点+标签）。写文案的公式：钩子开头（一句话戳痛点或制造好奇）→ 痛点共鸣 → 价值堆叠（这份资料能带来什么）→ 信任状（真实/持续更新/已交付多少份等）→ 交付说明（怎么拿到资料、提取码等）→ 紧迫感（限时/限量/涨价预告）；emoji 用来分段，不要堆砌。若用户要把生成的文案存到某个商品上，再调用 updateProductRecord（同样会弹确认卡片）。
- 用 tavilySearch 联网搜索最新信息、竞品价格、行业趋势。
- 用 tavilyExtract 抓取指定网页/帖子的完整正文，包括 x.com 帖子详情页（默认 advanced 深度尽力解析 JS 渲染内容；个别需要登录的帖子仍可能抓取失败，失败时如实告知用户，不要编造内容）。
- 用 tavilyCrawl / tavilyMap 批量了解一个网站的页面内容或链接结构。

规则：
- 当用户消息里出现「[用户上传的图片] <链接>」这样的行时，说明用户随消息上传了商品图片。若本次是在新增或修改商品，务必把该链接原样填进 image_url 字段（多张时用第一张，除非用户另有说明）。你看不到图片内容，只需把链接正确带上，不要臆测图里是什么。
- 修改商品时，先用 getProduct 查出当前完整信息，再把「原值 + 改动」整体传给 updateProductRecord，避免把未提及的字段清空。
- 金额用「元」，利润率用百分比。回答简洁，中文。
- 不确定用户指的是哪个商品时，先查询列出候选让用户确认，不要贸然修改或删除。
- 联网工具（tavily 系列）返回失败或部分失败时，直接告知用户失败原因，不要假装成功或编造抓不到的内容。`;

/**
 * deepseek-chat 是纯文本模型，收到 image 类型的 file part 会报错。
 * 前端为了在气泡里显示缩略图，会把上传的图片作为 file part 塞进消息；
 * 这里在喂给模型前，把用户消息里的图片 file part 摘掉，改成一行文本链接
 * （[用户上传的图片] <url>），让模型以文本方式拿到 URL，再由它填进 image_url。
 */
function inlineImagePartsAsText(messages: UIMessage[]): UIMessage[] {
  return messages.map((m) => {
    if (m.role !== "user") return m;
    const imageUrls: string[] = [];
    const rest = m.parts.filter((p) => {
      if (p.type === "file" && p.mediaType?.startsWith("image/")) {
        imageUrls.push(p.url);
        return false;
      }
      return true;
    });
    if (imageUrls.length === 0) return m;
    const note = imageUrls.map((u) => `[用户上传的图片] ${u}`).join("\n");
    return {
      ...m,
      parts: [...rest, { type: "text" as const, text: note }],
    };
  });
}

export async function POST(req: Request) {
  // 鉴权：未登录直接拒绝，工具也受 Supabase RLS 约束
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 缺少 DeepSeek 密钥时，streamText 会在流内部抛错，前端只会看到消息「闪一下就没」。
  // 提前拦一道，给出明确提示。
  if (!process.env.DEEPSEEK_API_KEY) {
    return new Response("未配置 DEEPSEEK_API_KEY，AI 助手不可用", { status: 500 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: SYSTEM,
    messages: await convertToModelMessages(inlineImagePartsAsText(messages)),
    tools,
    stopWhen: stepCountIs(8),
    // 流式过程中的错误（模型调用失败、工具抛错等）记到服务端日志，便于排查。
    onError: ({ error }) => {
      console.error("[/api/chat] streamText error:", error);
    },
  });

  // 默认 SDK 会把错误脱敏成「An error occurred.」并且前端不展示。
  // 这是内部管理台，直接把真实错误透传给前端，方便定位问题。
  return result.toUIMessageStreamResponse({
    onError: (error) =>
      error instanceof Error ? error.message : String(error),
  });
}
