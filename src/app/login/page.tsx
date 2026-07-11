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
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-primary text-2xl leading-none">✳</span>
            <h1 className="font-display text-3xl text-ink">闲鱼一元小店</h1>
          </div>
          <p className="text-sm text-muted">商品中台 · 请登录</p>
        </div>

        <form
          action={formAction}
          className="rounded-xl border border-hairline bg-white p-6 shadow-[0_1px_3px_rgba(20,20,19,0.05)]"
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
