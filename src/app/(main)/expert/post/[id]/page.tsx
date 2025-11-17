"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCKSENIORLIST, PostType } from "@/assets/mockdata/postSenior";
import { Chip } from "@/components/common/Chip";

const Brand = "#FF883F";

const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-neutral-200 ${className}`} />
);


export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const post = MOCKSENIORLIST.find((p) => p.id === id) as PostType | undefined;

  if (!post) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[768px] px-5 py-10">
          <button
            onClick={() => router.back()}
            className="mb-6 p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
          <div className="text-center text-neutral-500">해당 고수를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  const paragraphs = post.content.split("\n").filter(Boolean);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[768px] min-h-screen bg-white relative">
        {/* 상단: 뒤로 */}
        <div className="h-12 flex items-center px-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
        </div>

        {/* 대표 이미지 */}
        {post.image_url_l && (
          <div className="w-full h-[274px] bg-center bg-cover" style={{ backgroundImage: `url(${post.image_url_l})` }} />
        )}

        {/* 본문 */}
        <div className="px-5 pb-28">
          {/* 이름 / 나이 / 위치 */}
          <div className="mt-4">
            <div className="font-bold-22 text-neutral-900">{post.user.name}</div>
            <div className="mt-1 font-medium-18 text-neutral-500">
              {post.user.age}세 / {post.user.location ?? "위치 미등록"}
            </div>
            <div className="mt-4 flex gap-2">
              <Chip solid>{post.category}</Chip>
              <Chip solid color="primary">{post.level}</Chip>
            </div>
          </div>

          {/* 소개글 */}
          <h1 className="mt-4 font-bold-20 text-neutral-900">
            {post.title ?? `${post.user.name}의 수업`}
          </h1>

          <div className="mt-3 flex flex-col gap-3 font-regular-16 text-neutral-900">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* 지표 */}
          <div className="mt-5 grid grid-cols-3 text-center">
            <div>
              <div className="font-medium-22 text-neutral-900">{post.senior_info.class_num}회</div>
              <div className="font-medium-16 text-neutral-500">수업</div>
            </div>
            <div>
              <div className="font-medium-22 text-neutral-900">{post.senior_info.response_rate}%</div>
              <div className="font-medium-16 text-neutral-500">응답률</div>
            </div>
            <div>
              <div className="font-medium-22 text-neutral-900">{post.senior_info.review_num}개</div>
              <div className="font-medium-16 text-neutral-500">후기</div>
            </div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 후기 리스트 */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="font-bold-22 text-neutral-900">
                후기 <span className="text-neutral-500">{post.reviewList.length}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {post.reviewList.map((review, i) => (
                <div key={i} className="flex-col flex gap-3 shrink-0 w-[260px] rounded-xl border border-neutral-200 p-3 bg-white">
                  <div className="font-medium-20 mb-2">{review.title}</div>
                  {review.content.map((c, idx) => (
                    <div className="font-regular-16">
                      {c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 원하는 후배 스타일 */}
          <div className="mt-6">
            <div className="mt-3 flex flex-col gap-3">
              {post.junior_type.map((j, i) => <Chip textSize={18} key={i}>{j}</Chip>)}
            </div>
            <div className="font-medium-20 text-neutral-900 mt-5">후배님을 만나고 싶어요.</div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 선호하는 수업 방식 */}
          <div className="mt-6">
            <div className="font-medium-20 text-neutral-900">수업은...</div>
            <div className="mt-3 flex flex-col flex-wrap gap-3">
              <div className="flex gap-2">
                {post.days.map((d, i) => <Chip textSize={18} key={i}>{d}</Chip>)}
              </div>
              <div className="flex gap-2 flex-wrap">
                {post.times.map((t, i) => <Chip  textSize={18} key={i}>{t}</Chip>)}
              </div>
              <Chip textSize={18}>{post.class_type}</Chip>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] px-5 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur">
          <div className="py-3 pb-8 flex items-center">
            <button
              className="w-full h-[62px] rounded-xl text-white font-bold-20"
              style={{ backgroundColor: Brand }}
              onClick={() => router.push("/chat")}
            >
              채팅하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
