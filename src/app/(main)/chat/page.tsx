// src/app/chat/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

export default function ChatPage() {
  return (
    <>
      <div
        className="px-4 py-6"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }} // 네비 가림 방지
      >
        <div className="text-[18px] font-semibold">대화</div>
        <p className="mt-2 text-neutral-600">대화 화면은 준비 중입니다.</p>
      </div>

      <BottomNav />
    </>
  );
}
