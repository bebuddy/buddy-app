// 새로고침 버튼 

"use client";
import { RefreshCcw } from "lucide-react";

export default function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex items-center gap-2 text-white font-semibold text-[16px] bg-black rounded-full px-4 py-2 shadow"
      onClick={onClick}
      role="button"
      aria-label="새로고침"
    >
      <span>새로고침</span>
      <RefreshCcw width={18} height={18} className="text-white" />
    </div>
  );
}
