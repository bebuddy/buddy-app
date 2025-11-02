"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Vercel 빌드 오류를 해결하기 위한 임시 '알림' 페이지입니다.
 * 'export default'가 있어야 Next.js가 페이지 모듈로 인식합니다.
 */
export default function AlarmPage() {
  const router = useRouter();

  return (
    <div className="p-4">
      {/* 상단 Back (MyPage와 UI 통일) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-[18px] font-semibold">알림</div>
      </div>

      {/* 본문 (준비중) */}
      <div className="pt-20 text-center text-neutral-500">
        알림 기능은 현재 준비중입니다.
      </div>
    </div>
  );
}

