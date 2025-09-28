// bottom navigation bar 

"use client";
import { useState } from "react";

export default function BottomNav() {
  const [tab, setTab] = useState<"recommend" | "chat">("recommend");
  return (
    <nav className="sticky bottom-0 inset-x-0 bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-[440px] py-3 flex items-center justify-around">
        <button
          className={`flex flex-col items-center gap-1 ${
            tab === "recommend" ? "font-extrabold" : "text-neutral-500"
          }`}
          onClick={() => setTab("recommend")}
        >
          <div className="w-3 h-3 rounded-full bg-neutral-800" />
          <span className="text-[18px]">추천</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 ${
            tab === "chat" ? "font-extrabold" : "text-neutral-500"
          }`}
          onClick={() => setTab("chat")}
        >
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <span className="text-[18px]">대화</span>
        </button>
      </div>
    </nav>
  );
}
