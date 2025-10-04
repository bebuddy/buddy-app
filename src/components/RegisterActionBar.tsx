"use client";
import { useRouter } from "next/navigation";

export default function RegisterActionBar({
  isValid,
  onSubmit,
  brand = "#33AF83",                // ✅ 기본값: 녹색
}: {
  isValid: boolean;
  onSubmit: () => void;
  brand?: string;                   // ✅ 추가
}) {
  const router = useRouter();
  return (
    <div className="pt-4 pb-3 flex items-center justify-between">
      <button
        aria-label="닫기"
        className="w-10 h-10 flex items-center justify-center"
        onClick={() => router.back()}
      >
        <span className="text-2xl leading-none">×</span>
      </button>

      {/* 글자 색만 변화 */}
      <button
        aria-label="등록"
        disabled={!isValid}
        onClick={onSubmit}
        className="text-[18px] font-semibold"
        style={{ color: isValid ? brand : "#9CA3AF", cursor: isValid ? "pointer" : "default" }}
      >
        등록
      </button>
    </div>
  );
}
