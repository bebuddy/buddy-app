"use client";
import { Plus } from "lucide-react";

export default function RegisterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-white font-semibold text-[18px] rounded-full px-4 py-2 shadow"
      aria-label="등록하기"
      style={{ backgroundColor: "#FF883F" }} // 이미지의 민트색 계열
    >
      등록하기
      <Plus width={20} height={20} />
    </button>
  );
}
