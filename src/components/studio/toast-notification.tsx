"use client";

import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "@/components/icons";

interface ToastNotificationProps {
  message: string;
  type: "success" | "error";
}

export function ToastNotification({ message, type }: ToastNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 select-none">
      <div
        className={cn(
          "max-w-sm rounded-lg border bg-card/95 p-4 shadow-lg backdrop-blur-sm",
          type === "success" ? "border-success/30" : "border-error/30",
        )}
      >
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <Check size={18} className="flex-shrink-0 text-success" />
          ) : (
            <AlertTriangle size={18} className="flex-shrink-0 text-error" />
          )}
          <p className="text-sm font-medium text-ink">{message}</p>
        </div>
      </div>
    </div>
  );
}
