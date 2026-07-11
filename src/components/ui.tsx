import * as React from "react";
import { cn } from "@/lib/utils";

// ── Button ──
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted-soft",
  secondary:
    "bg-canvas text-ink border border-hairline hover:bg-surface-card disabled:opacity-50",
  ghost: "text-body hover:bg-surface-card disabled:opacity-50",
  danger: "bg-error text-white hover:brightness-90 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

// ── Input ──
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border border-hairline bg-white px-3 text-sm text-ink outline-none placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
});

// ── Textarea ──
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
});

// ── Select ──
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-9 rounded-md border border-hairline bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

// ── Label ──
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-body-strong", className)}
      {...props}
    />
  );
}

// ── Card ──
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline bg-white p-5",
        className,
      )}
      {...props}
    />
  );
}

// ── StatusPill ──
export function StatusPill({ status }: { status: string | null }) {
  const tone =
    status === "已上架"
      ? "bg-success/15 text-success"
      : status === "已售出"
        ? "bg-teal/15 text-[#2f7a6c]"
        : status === "待拍图" || status === "待上架"
          ? "bg-warning/15 text-[#8a6d10]"
          : "bg-surface-strong text-muted";
  return (
    <span
      className={cn(
        "inline-flex min-h-[22px] items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone,
      )}
    >
      {status || "—"}
    </span>
  );
}
