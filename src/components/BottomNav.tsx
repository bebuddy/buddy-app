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
      className="fixed z-50 left-1/2 -translate-x-1/2 w-full max-w-[440px] pointer-events-none"
      style={{ bottom: "env(safe-area-inset-bottom)" }}
    >
      {/* 안쪽: 실제 바 */}
      <div className="pointer-events-auto h-[64px] bg-white border-t border-neutral-200 flex items-center justify-around">
        {/* 추천 탭 */}
        <button
          className={`flex flex-col items-center gap-1 ${
            active === "recommend" ? "font-extrabold text-neutral-900" : "text-neutral-500"
          }`}
          aria-current={active === "recommend" ? "page" : undefined}
          onClick={() => router.push("/")}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              active === "recommend" ? "bg-neutral-800" : "bg-neutral-300"
            }`}
          />
          <span className="text-[18px]">추천</span>
        </button>

        {/* 대화 탭 */}
        <button
          className={`flex flex-col items-center gap-1 ${
            active === "chat" ? "font-extrabold text-neutral-900" : "text-neutral-500"
          }`}
          aria-current={active === "chat" ? "page" : undefined}
          onClick={() => router.push("/chat")}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              active === "chat" ? "bg-neutral-800" : "bg-neutral-300"
            }`}
          />
          <span className="text-[18px]">대화</span>
        </button>
      </div>
    </nav>
  );
}
