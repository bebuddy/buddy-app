// src/components/ChatProfileHeader.tsx
"use client";

import { SimpleUserDto } from "@/types/chat.dto";

interface ChatProfileHeaderProps {
  partner: SimpleUserDto;
}

export default function ChatProfileHeader({ partner }: ChatProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center py-8 bg-white border-b border-gray-100">
      {/* 프로필 이미지 (회색 원) */}
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold mb-4">
        {partner.profileImageUrl ? (
          // <Image src={partner.profileImageUrl} alt={partner.name} width={96} height={96} className="rounded-full" />
          // 현재는 profileImageUrl이 null이므로 임시로 첫 글자 사용
          partner.name[0]
        ) : (
          partner.name[0]
        )}
      </div>

      {/* 이름 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{partner.name}</h2>
      
      {/* 나이/지역 (있다면) */}
      {partner.age && partner.region && (
        <p className="text-base text-gray-600 mb-2">
          {partner.age}세 / {partner.region}
        </p>
      )}

      {/* 소개글 (있다면) */}
      {partner.introduction && (
        <p className="text-base text-gray-700 max-w-sm text-center px-4">
          {partner.introduction}
        </p>
      )}

      <div className="w-full border-b border-gray-200 mt-6"></div> {/* 구분선 */}
    </div>
  );
}