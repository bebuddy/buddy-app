// src/components/BottomNav.tsx
"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 경로로 활성 탭 결정
  const active: "recommend" | "chat" = useMemo(
    () => (pathname?.startsWith("/chat") ? "chat" : "recommend"),
    [pathname]
  );

  return (
    // 바깥: 위치 고정 + 기기폭 컨테이너
    <nav
      className="bg-white fixed z-[1900] left-1/2 -translate-x-1/2 w-full max-w-[768px] pointer-events-none py-4"
      style={{ bottom: "env(safe-area-inset-bottom)", boxShadow: '0px -2px 19px rgba(0,0,0,0.04)' }}
      aria-label="하단 내비게이션"
    >
      {/* 안쪽: 실제 바 */}
      <div className="pointer-events-auto h-[64px] bg-white flex items-center justify-around">
        {/* 추천 탭 */}
        <button
          className={`flex flex-col items-center gap-1 ${
            active === "recommend" ? "font-extrabold text-neutral-900" : "text-neutral-500"
          }`}
          aria-current={active === "recommend" ? "page" : undefined}
          type="button"
          onClick={() => router.push("/junior")}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              active === "recommend" ? "bg-black" : "bg-neutral-300"
            }`}
          />
          <span className="font-medium-20">추천</span>
        </button>

        {/* 대화 탭 */}
        <button
          className={`flex flex-col items-center gap-1 ${
            active === "chat" ? "font-extrabold text-neutral-900" : "text-neutral-500"
          }`}
          aria-current={active === "chat" ? "page" : undefined}
          type="button"
          onClick={() => router.push("/chat")}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              active === "chat" ? "bg-black" : "bg-neutral-300"
            }`}
          />
          <span className="font-medium-20">대화</span>
        </button>
      </div>
    </nav>
  );
}
