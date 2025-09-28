// 글쓰기 버튼 

"use client";
import { Plus } from "lucide-react";

export default function WriteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-white font-semibold text-[18px] rounded-full px-4 py-2 shadow"
      aria-label="글쓰기"
      style={{ backgroundColor: "#6163FF" }}
    >
      글쓰기
      <Plus width={20} height={20} />
    </button>
  );
}
