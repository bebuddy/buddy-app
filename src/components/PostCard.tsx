// 배움 카드

"use client";

import { Item } from "@/app/(main)/junior/page"; // 기존 경로 유지
import Image from "next/image";
import { useRouter } from "next/navigation";
import SaveButton from "./SaveButton"; // SaveButton 임포트

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
      onClick={() => router.push(`/junior/post/${item.id}`)} // 경로 수정
    >
      {/* 상단: 카테고리 칩 / 저장 버튼 */}
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 rounded-full text-[16px] bg-white"
          style={{ border: `1.5px solid ${brand}`, color: brand }}
        >
          {item.category}
        </span>

        {/* 지역 버튼 제거 -> SaveButton으로 교체 */}
        <SaveButton itemId={item.id} />
      </div>

      {/* 제목: Q + 타이틀 */}
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
      {/* [수정] <p> 태그 안에 <p> 태그가 중첩될 수 없어 Hydration 오류가 발생합니다.
        가장 바깥쪽 태그를 <div>로 변경합니다.
      */}
      <div className="flex mt-2 font-regular-16 gap-[6px]">
        <p className="font-regular-16 line-clamp-3 flex-1 text-ellipsis overflow-hidden">
          {item.content}
        </p>
        {/* 이미지 자리 */}
        {item.imageUrlM && item.imageUrlM?.length !== 0 && (
          <div className="flex shrink-0 relative mt-2 w-[100px] h-[80px] rounded-md bg-neutral-300 overflow-hidden" aria-hidden>
            <Image
              src={item.imageUrlM}
              alt="이미지"
              fill
              style={{ objectFit: "cover" }} // objectFit 추가
            />
          </div>
        )}
      </div>

      <div className="mt-2 text-[16px] text-neutral-500">1일 전</div>
    </div>
  );
}

