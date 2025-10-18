// src/components/TopBar.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useSelectedDong } from "@/lib/locationStore";

export default function TopBar() {
  const router = useRouter();
  const { dong, setDong } = useSelectedDong();

  // 최초 마운트 시, sign-up에서 저장한 로컬 스토리지 값으로 기본 동 세팅
  // localStorage: ob.basic = { dong, age, gender, name, role, ... }
  useEffect(() => {
    if (dong) return;
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("ob.basic");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.dong && typeof parsed.dong === "string") {
        setDong(parsed.dong);
      }
    } catch {
      // 파싱 실패하면 무시
    }
  }, [dong, setDong]);

  return (
    <>
      {/* 고정 헤더 높이만큼 레이아웃 스페이서 */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(73px + env(safe-area-inset-top))" }}
      />

      {/* 상단 고정 헤더 (경계선 없음) */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] z-[100] bg-white"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-[14px] flex items-center justify-between">
          <Image
            src="/logo.svg"
            alt="벗 로고"
            width={40}
            height={40}
            priority
          />

          {/* 가운데: 동 토글 버튼 (누르면 동 검색 화면으로 라우팅) */}
          <button
            type="button"
            onClick={() => console.log("준비중")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 cursor-pointer hover:opacity-80"
            aria-label="행정동 선택"
          >
            <span className="text-lg font-extrabold text-neutral-800">
              {dong ?? "대현동"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-700" />
          </button>

          {/* 오른쪽: 프로필(임시) */}
          <button
            aria-label="내 정보"
            className="w-8 h-8 rounded-full bg-neutral-300"
            onClick={() => router.push('/myPage')}
          />
        </div>
      </div>
    </>
  );
}
