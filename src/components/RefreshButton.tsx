"use client";
import Image from 'next/image'
import RefreshIcon from '@/assets/icon/RefreshIcon.svg';


type Props = {
  onClick: () => void;
  size?: "md" | "sm"; // ✅ 사이즈 옵션 추가
  className?: string;
};

export default function RefreshButton({ onClick, size = "md", className = "" }: Props) {
  const sizeClasses =
    size === "sm"
      ? "font-medium-18 px-4 py-0.5 gap-1"
      : "font-medium-18 px-4 py-0.5 gap-2";

  const iconSize = size === "sm" ? 16 : 18;

  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center ${sizeClasses} text-white font-semibold bg-black rounded-full shadow ${className} hover:opacity-80`}
      aria-label="새로고침"
      type="button"
    >
      <span>새로고침</span>
      <Image
        src={RefreshIcon}
        width={20}
        height={20}
        className="text-white"
        alt="Button"
      />
    </button>
  );
}
