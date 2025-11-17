// src/components/ChatHeader.tsx
"use client";

// import { SimpleUserDto } from "@/types/chat.dto"; // 현재 사용되지 않음
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface ChatHeaderProps {
  partnerName: string;
}

export default function ChatHeader({ partnerName }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div
      // sticky 속성 등은 ChatHeader 고유 기능으로 유지
      // p-4, flex, items-center는 AlarmPage의 px-4, pt-4, flex, items-center와 일치
      // gap-2를 추가하여 AlarmPage 디자인과 동일하게 맞춤
      className="flex items-center gap-2 p-4 bg-white sticky top-0 z-10"
    >
      {/* AlarmPage의 뒤로가기 버튼 구조 적용 */}
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => router.back()}
        className="p-1 -ml-1 rounded-full active:scale-95"
      >
        <ChevronLeft size={28} />
      </button>

      {/* AlarmPage의 타이틀 스타일 적용 */}
      <div className="text-[18px] font-semibold">{partnerName}</div>

      {/* 이미지에는 없지만, 나중에 더보기 버튼 등 추가 가능 */}
    </div>
  );
}