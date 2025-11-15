// src/components/ChatHeader.tsx

import { SimpleUserDto } from "@/types/chat.dto";
import Link from "next/link";

interface ChatHeaderProps {
  partnerName: string; // 이제 이름만 받아옵니다.
}

export default function ChatHeader({ partnerName }: ChatHeaderProps) {
  return (
    <div className="flex items-center p-4 bg-white sticky top-0 z-10">
      <Link 
        href="/chat" 
        className="mr-4 text-gray-800 text-xl font-bold" 
      >
        &lt;
      </Link>
      <span className="text-xl font-bold text-gray-800">{partnerName}</span>
      {/* 이미지에는 없지만, 나중에 더보기 버튼 등 추가 가능 */}
    </div>
  );
}