// top bar

"use client";

export default function TopBar() {
  return (
    <div className="pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-extrabold tracking-tight">벗</div>
      </div>
      {/* 우상단 회색 동그라미 = 내정보 */}
      <button
        aria-label="내 정보"
        className="w-9 h-9 rounded-full bg-neutral-300"
        onClick={() => alert("내 정보로 이동")}
      />
    </div>
  );
}
