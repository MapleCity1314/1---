"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Button, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dark text-base font-semibold text-on-dark">
              中
            </span>
            <h1 className="font-display text-2xl text-ink">AI 中台</h1>
          </div>
          <p className="text-sm text-muted">一元小店 · 请登录</p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-hairline bg-card p-7 shadow-[0_3px_8px_rgba(0,0,0,0.08)]"
        >
          <div className="mb-4">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-5">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error && (
            <p className="mb-4 rounded-md bg-error/10 px-3 py-2 text-sm text-error">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "登录中…" : "登录"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-soft">
          账号由管理员在 Supabase 控制台创建
        </p>
      </div>
    </div>
  );
}
