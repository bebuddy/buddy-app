// 고수 카드

"use client";

import { PostType } from "@/assets/mockdata/postSenior";
import { useRouter } from "next/navigation";
import { Chip } from "./common/Chip";
import SaveButton from "./SaveButton"; // ★ 1. SaveButton 임포트

export default function MasterCard({
  item,
  brand = "#6163FF",
}: {
  item: PostType;
  brand?: string;
}) {
  const router = useRouter();
  const overlay =
    "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 35%, rgba(255,255,255,0.90) 65%, rgba(255,255,255,1) 100%)";
  const bg = item.image_url_l
    ? `${overlay}, url(${item.image_url_l})`
    : `${overlay}, linear-gradient(180deg,#cfcfcf,#9e9e9e)`;

  const ageLabel = getKDecadeLabel(String(item.user.age));

  return (
    <div
      className="rounded-2xl border border-neutral-200 shadow-sm overflow-hidden bg-white"
      onClick={() => router.push(`/expert/post/${item.id}`)}
      role="button"
    >
      {/* 이미지 영역 */}
      <div
        className="relative h-[360px] bg-center bg-cover"
        style={{ backgroundImage: bg }}
        aria-hidden
      >
        {/* ★ 2. 상단 영역 수정 (위치 칩 / 저장 버튼) */}
        <div className="p-3 flex items-center justify-between">
          {/* 위치 칩 (왼쪽) */}
          <div className="px-3 py-1 rounded-full font-regular-16 bg-white/90 text-neutral-900 shadow">
            ▼ {item?.user.location}
          </div>
          
          {/* 저장 버튼 (오른쪽) */}
          <SaveButton itemId={item.id} />
        </div>
        
        {/* 본문 (기존과 동일) */}
        <div className="absolute bottom-16 left-4">
          <div className="font-medium-18 line-clamp-1">
            {item?.title}
          </div>

          <div className="font-medium-22 line-clamp-1">
            {item.user.name}
            {ageLabel ? `, ${ageLabel}` : ""}
          </div>

          {/* 카테고리 칩(보라색 테두리) */}
          <div className="absolute mt-2">
            <Chip color="primary">
              {item.category}
            </Chip>
          </div>
        </div>
      </div>
    </div>
  );
}

// ★ 3. getKDecadeLabel 함수 (기존과 동일)
function getKDecadeLabel(birthOrAge?: string | number) {
  if (!birthOrAge) return "";
  const val = Number(birthOrAge);
  const now = new Date();

  // 1900~2099면 출생연도, 아니면 나이로 인식
  if (val >= 1900 && val <= now.getFullYear()) {
    const age = now.getFullYear() - val;
    const decade = Math.floor(age / 10) * 10;
    const mod = age % 10;
    const part = mod <= 3 ? "초반" : mod <= 6 ? "중반" : "후반";
    return `${decade}대 ${part}`;
  }

  // 나이 기반 계산
  const decade = Math.floor(val / 10) * 10;
  const mod = val % 10;
  const part = mod <= 3 ? "초반" : mod <= 6 ? "중반" : "후반";
  return `${decade}대 ${part}`;
}