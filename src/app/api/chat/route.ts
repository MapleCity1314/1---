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
- 帮用户撰写闲鱼商品标题和描述文案（虚拟资料类，突出内容价值与交付方式）。写文案时直接输出，不需要调用工具。

规则：
- 修改商品时，先用 getProduct 查出当前完整信息，再把「原值 + 改动」整体传给 updateProductRecord，避免把未提及的字段清空。
- 金额用「元」，利润率用百分比。回答简洁，中文。
- 不确定用户指的是哪个商品时，先查询列出候选让用户确认，不要贸然修改或删除。`;

export async function POST(req: Request) {
  // 鉴权：未登录直接拒绝，工具也受 Supabase RLS 约束
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
