"use client";

import { useEffect } from "react";
import AppButton from "@/components/a11y/AppButton";

export type AppToastProps = {
  open: boolean;
  message: React.ReactNode;
  onClose?: () => void;
  variant?: "info" | "success" | "error";
  autoCloseMs?: number;
  className?: string;
};

export default function AppToast({
  open,
  message,
  onClose,
  variant = "info",
  autoCloseMs,
  className,
}: AppToastProps) {
  useEffect(() => {
    if (!open || !autoCloseMs) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onClose?.();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [autoCloseMs, onClose, open]);

  if (!open) {
    return null;
  }

  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className={`fixed bottom-6 left-1/2 z-[2100] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 rounded-xl bg-neutral-900 px-4 py-3 text-white shadow-lg ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[14px]">{message}</div>
        {onClose ? (
          <AppButton
            ariaLabel="알림 닫기"
            className="text-white opacity-80 hover:opacity-100"
            minSize={32}
            onClick={onClose}
          >
            닫기
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
