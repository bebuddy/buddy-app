// src/components/TopBar.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useSelectedDong } from "@/lib/locationStore";
import { getCurrentDong } from "@/lib/location";

export default function TopBar() {
  const router = useRouter();
  const { dong, setDong } = useSelectedDong();

  // 처음 로드 시 현재 위치로 기본 행정동 설정
  useEffect(() => {
    if (dong) return;
    (async () => {
      try {
        const d = await getCurrentDong();
        if (d) setDong(d);
      } catch {
        // 실패 시 무시 (사용자가 직접 선택 가능)
      }
    })();
  }, [dong, setDong]);

  return (
    <>
      {/* 고정 헤더 높이만큼 레이아웃 스페이서 */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(56px + env(safe-area-inset-top))" }}
      />

      {/* 상단 고정 헤더 (경계선 없음) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-[100] bg-white">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between">
          <Image src="/logo.svg" alt="벗 로고" width={36} height={36} priority />

          {/* 가운데: 동 토글 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/location")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1"
            aria-label="행정동 선택"
          >
            <span className="text-lg font-extrabold text-neutral-800">
              {dong ?? "현재 위치"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-700" />
          </button>

          {/* 오른쪽: 프로필(임시) */}
          <button
            aria-label="내 정보"
            className="w-8 h-8 rounded-full bg-neutral-300"
            onClick={() => alert("내 정보로 이동")}
          />
        </div>
      </div>
    </>
  );
}
