"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Chat, useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from "ai";

const STORAGE_KEY = "xianyu-chat-messages";

function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function clearStoredChat() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 隐私模式或存储不可用时静默忽略
  }
}

const ChatInstanceContext = createContext<Chat<UIMessage> | null>(null);

/**
 * 把唯一的 Chat 实例挂在 dashboard layout 上（而不是 /assistant 页面内），
 * 这样切换到「商品管理」「观测面板」等页面时，layout 不卸载、Chat 实例不丢，
 * 聊天记录在同一浏览器标签内跨页面保持。同时把每次消息变化落盘到
 * localStorage，刷新页面/重新打开标签后也能恢复。
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chat] = useState(
    () =>
      new Chat<UIMessage>({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        messages: loadStoredMessages(),
        // 写操作（needsApproval）走人工确认：用户点「确认执行」后，approval
        // 只是被写进本地消息里。必须在这里配置——当最后一条 assistant 消息的
        // 待批操作都有了响应时，自动把消息重新提交给 /api/chat，服务端才会真正
        // 执行工具的 execute（如商品入库）并继续流式输出。缺了这一步，点确认后
        // 智能体会静默停下、商品也不会入库。
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
      }),
  );

  // 在 Provider 层订阅一次消息变化并持久化，不依赖 /assistant 页面是否挂载。
  const { messages } = useChat({ chat });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // 存储配额已满或处于隐私模式时静默忽略，不影响聊天功能本身
    }
  }, [messages]);

  return (
    <ChatInstanceContext.Provider value={chat}>
      {children}
    </ChatInstanceContext.Provider>
  );
}

export function useSharedChatInstance() {
  const chat = useContext(ChatInstanceContext);
  if (!chat) {
    throw new Error("useSharedChatInstance 必须在 <ChatProvider> 内使用");
  }
  return chat;
}
