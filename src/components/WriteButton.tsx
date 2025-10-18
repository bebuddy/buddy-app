// 글쓰기 버튼 

"use client";
import { Plus } from "lucide-react";

export default function WriteButton({ onClick, name, bgColor }: { onClick: () => void; name: string; bgColor:"primary"| "secondary" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-white font-semibold-18 rounded-full px-4 py-2 ${bgColor=="primary"?'bg-primary-500':'bg-secondary-500'} hover:opacity-80`}
      aria-label={name}
    >
      {name}
      <Plus width={24} height={24} />
    </button>
  );
}
