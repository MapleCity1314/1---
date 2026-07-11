"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

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
