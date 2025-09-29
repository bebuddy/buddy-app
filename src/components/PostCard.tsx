// 배움 카드

"use client";
import type { FeedItem } from "@/types";

export default function PostCard({
  item,
  brand = "#6163FF",
}: {
  item: FeedItem;
  brand?: string;
}) {
  return (
    <div
      className="card p-4"
      role="button"
      onClick={() => alert(`카드 클릭: ${item.title}`)}
    >
      {/* 상단: 카테고리 칩(보라색 테두리) / 지역 버튼 */}
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 rounded-full text-[16px] bg-white"
          style={{ border: `1.5px solid ${brand}`, color: brand }}
        >
          {item.category}
        </span>

        <button
          className="text-[16px] flex items-center gap-1"
          style={{ color: "#6b7280" }} // neutral-500
          onClick={(e) => {
            e.stopPropagation();
            alert("지역 토글 클릭 (대현동)");
          }}
        >
          <span>▼</span>
          <span>{item.dong}</span>
        </button>
      </div>

      {/* 제목: Q(보라색, 원 테두리 제거, 크게) + 타이틀 */}
      <div className="mt-3 flex items-start gap-2">
        <span
          className="font-extrabold leading-7"
          style={{ color: brand, fontSize: "24px" }}
          aria-hidden
        >
          Q
        </span>
        <h3 className="text-2xl font-extrabold leading-7">{item.title}</h3>
      </div>

      {/* 본문 */}
      <p className="mt-2 text-[18px] text-neutral-700">
        {item.body.length > 60 ? item.body.slice(0, 60) + "..." : item.body}
      </p>

      {/* 이미지 자리 */}
      {item.hasImage && (
        <div className="mt-3 w-20 h-20 rounded-md bg-neutral-300" aria-hidden />
      )}

      <div className="mt-2 text-[16px] text-neutral-500">1일 전</div>
    </div>
  );
}
