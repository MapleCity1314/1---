"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Send,
  Check,
  X,
  Sparkles,
  Wrench,
  AlertTriangle,
  Trash,
  Paperclip,
  Loader,
} from "@/components/icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, isAcceptedImage, uploadImage } from "@/lib/upload";
import { useSharedChatInstance, clearStoredChat } from "../chat-provider";

const SUGGESTIONS = [
  "利润率最高的 5 个商品",
  "库存少于 3 的有哪些",
  "帮我看看整体经营情况",
  "给编号 A001 写一段爆款文案",
];

// 工具名 → 中文说明
const TOOL_LABELS: Record<string, string> = {
  queryProducts: "查询商品",
  getMetrics: "读取经营指标",
  getProduct: "查询单个商品",
  createProductRecord: "新增商品",
  updateProductRecord: "修改商品",
  deleteProductRecord: "删除商品",
  writeViralCopy: "写爆款文案",
  tavilySearch: "联网搜索",
  tavilyExtract: "抓取网页内容",
  tavilyCrawl: "爬取网站",
  tavilyMap: "获取站点地图",
};

const WRITE_TOOLS = new Set([
  "createProductRecord",
  "updateProductRecord",
  "deleteProductRecord",
]);

const MAX_TEXTAREA_HEIGHT = 200;
const MAX_ATTACHMENTS = 6;

export function Assistant() {
  const chat = useSharedChatInstance();
  const {
    messages,
    sendMessage,
    status,
    addToolApprovalResponse,
    setMessages,
    error,
    clearError,
    regenerate,
  } = useChat({ chat });
  const [input, setInput] = useState("");
  // 已上传的附件图片（public URL），随下一条消息一起发出去。支持多张。
  const [attachments, setAttachments] = useState<string[]>([]);
  // 正在上传的张数（可能并发多张），>0 即为上传中
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = status === "streaming" || status === "submitted";
  const uploading = uploadingCount > 0;

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  // 并发上传多张：逐张校验，超限的挡下，其余同时传，任一失败提示但不影响其它。
  async function handleFiles(list: FileList | File[] | null | undefined) {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setUploadError(`最多上传 ${MAX_ATTACHMENTS} 张图片`);
      return;
    }

    const accepted: File[] = [];
    let rejected = false;
    for (const f of files) {
      if (isAcceptedImage(f)) accepted.push(f);
      else rejected = true;
    }
    const toUpload = accepted.slice(0, remaining);
    const overflow = accepted.length > remaining;

    setUploadError(
      rejected
        ? "已跳过不支持的文件（仅支持 JPG / PNG / WEBP / GIF）"
        : overflow
          ? `最多上传 ${MAX_ATTACHMENTS} 张，多余的已忽略`
          : null,
    );
    if (toUpload.length === 0) return;

    setUploadingCount((n) => n + toUpload.length);
    await Promise.all(
      toUpload.map(async (file) => {
        const res = await uploadImage(file, "chat");
        if (res.ok) setAttachments((prev) => [...prev, res.url]);
        else setUploadError(res.error);
        setUploadingCount((n) => n - 1);
      }),
    );
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((u) => u !== url));
  }

  function submit(text: string) {
    const t = text.trim();
    // 允许只发图片（不带文字），但上传中或既无文字又无图时不发
    if ((!t && attachments.length === 0) || busy || uploading) return;
    sendMessage({
      text: t,
      files: attachments.length
        ? attachments.map((url) => ({
            type: "file" as const,
            mediaType: "image/*",
            url,
          }))
        : undefined,
    });
    setInput("");
    setAttachments([]);
    setUploadError(null);
    requestAnimationFrame(resizeTextarea);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  function clearConversation() {
    if (busy) return;
    if (!confirm("清空当前对话？此操作不可撤销。")) return;
    setMessages([]);
    clearStoredChat();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 消息区 */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearConversation}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted hover:bg-surface-card hover:text-ink disabled:opacity-50"
              >
                <Trash size={13} />
                清空对话
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="rounded-2xl border border-hairline bg-card p-6 card-shadow">
              <div className="mb-3 flex items-center gap-2 text-secondary">
                <Sparkles size={18} />
                <span className="font-medium text-ink">试试这样问我</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-hairline bg-card px-3.5 py-1.5 text-sm text-body transition-colors hover:border-secondary hover:text-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              onApprove={(id, approved) =>
                addToolApprovalResponse({ id, approved })
              }
            />
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              思考中…
            </div>
          )}

          {error && !busy && (
            <div className="rounded-lg border border-error/30 bg-error/5 p-4">
              <div className="mb-2 flex items-center gap-2 font-medium text-error">
                <AlertTriangle size={16} />
                出错了
              </div>
              <p className="mb-3 text-sm text-body break-words">
                {error.message || "请求失败，请稍后重试。"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    clearError();
                    regenerate();
                  }}
                >
                  重试
                </Button>
                <Button variant="secondary" onClick={() => clearError()}>
                  <X size={15} />
                  关闭
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 输入区：复合输入框（ChatGPT/Claude 风格） */}
      <div className="border-t border-hairline bg-canvas px-8 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto max-w-3xl"
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = ""; // 允许连续选同一张
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "rounded-2xl border bg-card p-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
              dragOver ? "border-primary bg-primary/5" : "border-hairline",
            )}
          >
            {/* 附件预览：多张缩略图 + 上传中占位 */}
            {(attachments.length > 0 || uploading) && (
              <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                {attachments.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 用户上传图片，域名随部署环境变化 */}
                    <img
                      src={url}
                      alt="待发送图片"
                      className="h-16 w-16 rounded-md border border-hairline object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(url)}
                      aria-label="移除图片"
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-dark text-on-dark shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {uploading && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-hairline text-muted">
                    <Loader size={16} className="animate-spin" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy || attachments.length >= MAX_ATTACHMENTS}
                aria-label="添加图片"
                title={`添加图片（也可拖拽 / 粘贴，最多 ${MAX_ATTACHMENTS} 张）`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-card hover:text-ink disabled:opacity-50"
              >
                <Paperclip size={18} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  resizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const files = Array.from(e.clipboardData.files);
                  if (files.length) void handleFiles(files);
                }}
                placeholder="问点什么，或让我改商品、写文案、查资料…（Enter 发送，Shift+Enter 换行）"
                disabled={busy}
                style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink outline-none placeholder:text-muted-soft disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={
                  busy || uploading || (!input.trim() && attachments.length === 0)
                }
                className="h-9 w-9 shrink-0 rounded-full p-0"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          {uploadError && (
            <p className="mx-auto mt-1.5 max-w-3xl px-2 text-xs text-error">
              {uploadError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

type ChatMessage = ReturnType<typeof useChat>["messages"][number];

function Message({
  message,
  onApprove,
}: {
  message: ChatMessage;
  onApprove: (id: string, approved: boolean) => void;
}) {
  const isUser = message.role === "user";

  // 图片附件单独收拢成一排（多张时平铺换行，比逐张竖排好看）；
  // 模型侧已在服务端把它们转成文本链接，这里纯展示。
  const imageParts = message.parts.filter(
    (p): p is Extract<typeof p, { type: "file" }> =>
      p.type === "file" && p.mediaType?.startsWith("image/") === true,
  );

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isUser ? "items-end" : "items-start",
        )}
      >
        {imageParts.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            {imageParts.map((part, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- 用户上传图片，域名随部署环境变化
              <img
                key={i}
                src={part.url}
                alt="附件图片"
                className="h-28 w-28 rounded-lg border border-hairline object-cover"
              />
            ))}
          </div>
        )}

        {message.parts.map((part, i) => {
          // 图片已在上面统一渲染，这里跳过
          if (part.type === "file") return null;

          // 文本
          if (part.type === "text") {
            if (!part.text) return null;
            return (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-surface-dark text-on-dark"
                    : "border border-hairline bg-card text-body",
                )}
              >
                {part.text}
              </div>
            );
          }

          // 工具调用（part.type 形如 "tool-queryProducts"）
          if (part.type.startsWith("tool-")) {
            return (
              <ToolPart
                key={i}
                // @ts-expect-error 运行时按 state 收窄
                part={part}
                toolName={part.type.slice("tool-".length)}
                onApprove={onApprove}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

type AnyToolPart = {
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string };
};

function ToolPart({
  part,
  toolName,
  onApprove,
}: {
  part: AnyToolPart;
  toolName: string;
  onApprove: (id: string, approved: boolean) => void;
}) {
  const label = TOOL_LABELS[toolName] ?? toolName;
  const isWrite = WRITE_TOOLS.has(toolName);

  // 需要用户确认的写操作
  if (part.state === "approval-requested" && part.approval) {
    const approvalId = part.approval.id;
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2 font-medium text-primary-active">
          <AlertTriangle size={16} />
          确认操作：{label}
        </div>
        <pre className="mb-3 max-h-56 overflow-auto rounded-md bg-card p-3 text-xs text-body">
          {JSON.stringify(part.input, null, 2)}
        </pre>
        <div className="flex gap-2">
          <Button onClick={() => onApprove(approvalId, true)}>
            <Check size={15} />
            确认执行
          </Button>
          <Button variant="secondary" onClick={() => onApprove(approvalId, false)}>
            <X size={15} />
            取消
          </Button>
        </div>
      </div>
    );
  }

  // 被拒绝
  if (part.state === "output-denied") {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft px-3 py-2 text-xs text-muted">
        已取消：{label}
      </div>
    );
  }

  // 执行出错
  if (part.state === "output-error") {
    return (
      <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-xs text-error">
        {label}失败：{part.errorText}
      </div>
    );
  }

  // 执行中
  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-hairline bg-surface-soft px-3 py-1.5 text-xs text-muted">
        <Wrench size={13} className="animate-pulse" />
        {isWrite ? "准备" : "正在"}
        {label}…
      </div>
    );
  }

  // 有结果（只读工具结果不铺开，只标注调用过；写操作给出结果消息）
  if (part.state === "output-available") {
    const out = part.output as { message?: string } | unknown;
    const msg =
      out && typeof out === "object" && "message" in out
        ? (out as { message: string }).message
        : null;
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-hairline bg-surface-soft px-3 py-1.5 text-xs text-muted">
        <Check size={13} className="text-success" />
        {msg ?? `已${label}`}
      </div>
    );
  }

  return null;
}
