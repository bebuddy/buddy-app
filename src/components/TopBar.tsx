import Image from "next/image";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between mt-4">
      {/* ✅ SVG 로고 삽입 */}
      <Image
        src="/logo.svg" // public/logo.svg 경로 기준
        alt="벗 로고"
        width={36}      // 기존 ‘벗’ 글자 크기에 맞게 조정 (필요시 변경)
        height={36}
        priority
      />

      <div className="w-8 h-8 bg-gray-200 rounded-full" /> {/* 프로필 자리 */}
    </div>
  );
}
