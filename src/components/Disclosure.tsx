"use client";

import { useId, useState, type ReactNode } from "react";

type DisclosureProps = {
  title: string;
  summary?: ReactNode;   // ✅ 요약(선택된 칩 등)을 받을 수 있게
  children: ReactNode;
};

export default function Disclosure({ title, summary, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-b border-neutral-200 py-3">
      <button
        className="w-full flex items-center justify-between text-left"
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
      >
        {/* ✅ summary가 있으면 그걸 보여주고, 없으면 title 보여주기 */}
        <div className="flex-1">
          {summary ? (
            <div className="inline-block">{summary}</div>
          ) : (
            <span className="text-[18px] font-semibold">
              {title}
            </span>
          )}
        </div>

        <span className="text-xl leading-none ml-2">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div id={contentId} className="pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
