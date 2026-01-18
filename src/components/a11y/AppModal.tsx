"use client";

import { useEffect, useId, useRef } from "react";
import { applyInert, getFocusableElements } from "@/components/a11y/utils";

export type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  appRootId?: string;
  closeOnBackdrop?: boolean;
  className?: string;
};

export default function AppModal({
  open,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  initialFocusRef,
  appRootId = "__next",
  closeOnBackdrop = true,
  className,
}: AppModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    lastActiveRef.current = document.activeElement as HTMLElement | null;
    const appRoot = document.getElementById(appRootId);
    const removeInert = applyInert(appRoot);
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTarget =
      initialFocusRef?.current ?? getFocusableElements(modalRef.current)[0] ?? modalRef.current;

    if (focusTarget) {
      requestAnimationFrame(() => focusTarget.focus());
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(modalRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      removeInert();
      document.body.style.overflow = previousOverflow;
      lastActiveRef.current?.focus();
    };
  }, [appRootId, initialFocusRef, onClose, open]);

  if (!open) {
    return null;
  }

  const labelledBy = title ? titleId : undefined;
  const describedBy = description ? descriptionId : undefined;
  const computedAriaLabel = ariaLabel ?? (title ? undefined : "대화 상자");

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4 relative"
      role="presentation"
    >
      {closeOnBackdrop ? (
        <button
          type="button"
          aria-label="모달 닫기"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
      ) : null}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={computedAriaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={`relative z-[1] w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-lg ${className ?? ""}`}
        tabIndex={-1}
      >
        {title ? (
          <h2 id={titleId} className="text-[20px] font-semibold text-neutral-900">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id={descriptionId} className="mt-2 text-[16px] text-neutral-600">
            {description}
          </p>
        ) : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
