"use client";
import { useState } from "react";

export default function Disclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 py-3">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-[18px] font-semibold">{title}</span>
        <span className="text-xl leading-none">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
}
