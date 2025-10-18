// 배움 카드

"use client";

import { Item } from "@/app/(main)/junior/page";
import Image from "next/image"
import { useRouter } from "next/navigation";

export default function PostCard({
  item,
  brand = "#6163FF",
}: {
  item: Item;
  brand?: string;
}) {
  const router = useRouter();
  return (
    <div
      className="card p-4"
      role="button"
      onClick={() => router.push(`/junior/post/${item.id}`)}
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
          className="font-regular-16 flex items-center gap-1"
          style={{ color: "#6b7280" }} // neutral-500
        >
          <span>▼</span>
          <span>{item.location}</span>
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
        <h3 className="font-medium-20">{item.title}</h3>
      </div>

      {/* 본문 */}
      <p className="flex mt-2 font-regular-16 gap-[6px]">
        <p className="font-regular-16 line-clamp-3 flex-1 text-ellipsis overflow-hidden">
          {item.content}
        </p>        {/* 이미지 자리 */}
        {item.imageUrlM && item.imageUrlM?.length !== 0 && (
          <div className="flex shrink-0 relative mt-2 w-[100px] h-[80px] rounded-md bg-neutral-300 overflow-hidden" aria-hidden >
            <Image
              src={item.imageUrlM}
              alt="이미지"
              fill
            />
          </div>
        )}
      </p>

      <div className="mt-2 text-[16px] text-neutral-500">1일 전</div>
    </div>
  );
}
