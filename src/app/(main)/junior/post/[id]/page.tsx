// app/(main)/junior/post/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getPost } from "@/lib/clientRepo";
import { useRouter } from "next/navigation";
import { postJuniorList, PostType } from "@/assets/mockdata/postJunior";
import Image from 'next/image'
import { Chip } from "@/components/common/Chip";
import { UserProfile, userProfiles } from "@/assets/mockdata/user";

const Brand = "#6163FF";

/** 화면에서 쓰는 미니 포스트 타입 (프리뷰/데모 용) */
type Author = { name: string; age: string | number; gender: string };

/* ---------- helpers ---------- */
/* ---------- helpers ---------- */
function formatAgo(createdAt: string) {
  const ts = new Date(createdAt).getTime();
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);

  if (h <= 0) return "방금 전";
  if (h < 24) return `${h}시간 전`;

  const d = Math.floor(h / 24);
  return `${d}일 전`;
}


function formatKRW(n: number) {
  try {
    return new Intl.NumberFormat("ko-KR").format(n);
  } catch {
    return String(n);
  }
}
const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-neutral-200 ${className}`} />
);

/* ---------- page ---------- */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // React 19: params가 Promise — React.use로 언랩
  const { id } = React.use(params);

  const [post, setPost] = React.useState<PostType | null>(null);
  const [notFoundMsg, setNotFoundMsg] = React.useState<string | null>(null);

  type Comment = { name: string; text: string; ts: number };
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [profile, setProfile] = useState<UserProfile>()
  const [cText, setCText] = React.useState("");
  const [meName, setMeName] = React.useState<string>("익명");

  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const foundPost = postJuniorList.find((p) => p.id === id);
    if (foundPost) {
      setPost(foundPost);
      //mockdata로
      setProfile(userProfiles[foundPost?.user_id]);
    }


  }, [id]);

  function addComment() {
    const text = cText.trim();
    if (!text) return;
    setComments((prev) => [{ name: meName, text, ts: Date.now() }, ...prev]);
    setCText("");
  }

  if (!post) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[768px] px-5 py-10">
          <button
            onClick={() => router.back()}
            className="mb-6 p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
          <div className="text-[17px] text-neutral-700">
            {notFoundMsg ?? "게시글을 찾을 수 없어요."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[768px] min-h-screen bg-white">
        {/* 상단: 뒤로 */}
        <div className="h-12 flex items-center px-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
        </div>

        {
          post.image_url_m && post.image_url_m.length > 0 &&
          <div className="relative w-full h-[272px]">
            <Image
              src={post.image_url_m}
              fill
              alt="썸네일"
              className="object-cover"
            />
          </div>
        }

        {/* 본문 */}
        <div className="px-5">
          {!!post.category && (
            <div className="mt-5">
              <div>
              </div>
              <Chip color="secondary">{post.category}</Chip>
            </div>
          )}

          <h1 className="mt-4 font-medium-24 text-black">
            {post.title}
          </h1>

          {!!post?.created_at && (
            <div className="mt-1 font-medium-16 text-neutral-500">{formatAgo(post?.created_at)}</div>
          )}

          <SectionDivider className="mt-5" />

          <div className="mt-5 space-y-2">
            <div className="font-medium-18">
              <span className="text-neutral-900 mr-2">{post.budget_type === "협의" ? "가격 협의" : post.budget_type}</span>
              <span className="font-bold-18 text-neutral-900">
                {post.budget_type === "협의"
                  ? ""
                  : `${formatKRW(post.budget!)}원`}
              </span>
            </div>
          </div>

          <div className="mt-[22px] flex flex-col gap-4  font-regular-16 text-neutral-900">
            <p>
              {post.content}
            </p>
          </div>

          <SectionDivider className="mt-7" />

          {/* 댓글 */}
          <div className="mt-5">
            <div className="font-bold-16 text-neutral-900">댓글</div>

            <div className="mt-3 flex items-stretch gap-2">
              <textarea
                value={cText}
                onChange={(e) => setCText(e.target.value)}
                placeholder="댓글을 입력하세요"
                rows={3}
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 outline-none resize-none"
              />
              <button
                onClick={addComment}
                className="h-[44px] px-4 rounded-lg font-bold text-white self-end"
                style={{ backgroundColor: Brand }}
              >
                등록
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <div className="font-regular-16 text-neutral-500">아직 댓글이 없습니다.</div>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-200 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold-16 text-neutral-900">
                        {c.name}{" "}
                        {/* <span className="ml-2 text-neutral-400 text-[12px]">{formatAgo(c.ts)}</span> */}
                      </div>
                      <div className="mt-1 font-regular-16 text-neutral-900 whitespace-pre-wrap">
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <SectionDivider className="mt-7" />

          {/* 어떤 선배/후배 & 수업 방식 */}
          <div className="mt-6">
            {!!post.senior_type?.length && (
              <>
                <div className="mt-3 flex flex-col gap-2">
                  {post.senior_type.map((t, i) => (
                    <Chip textSize={18} color="primary" key={i}>{t}</Chip>
                  ))}
                </div>
                <div className="font-medium-20 mt-5">
                  선배님을 만나고 싶어요.
                </div>
              </>
            )}
            <SectionDivider className="mt-7" />

            {!!post.class_type && (
              <>
                <div className="font-medium-20 mt-5">
                  수업은...
                </div>
                <div className="mt-3 flex flex-col gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {post.days.map((d) => {
                      return (
                        <Chip textSize={18}>{d}</Chip>
                      )
                    })}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {post.times.map((d) => {
                      return (
                        <Chip textSize={18}>{d}</Chip>
                      )
                    })}
                  </div>

                  <Chip textSize={18}>{post.class_type}</Chip>
                </div>
              </>
            )}
          </div>

          <SectionDivider className="mt-7" />

          {/* 작성자 소개 */}
          {!!post.user_id && (
            <div className="mt-5 flex items-center gap-3">
              <div className="w-[68px] h-[68px] rounded-full bg-neutral-200 overflow-hidden" />
              <div className="flex flex-col">
                <div className="font-medium-20 text-neutral-900">{profile?.name}</div>
                <div className="font-medium-14 text-neutral-700">
                  {profile?.age}세 | {profile?.gender}
                </div>
              </div>
            </div>
          )}

          <div className="h-24" />
        </div>

        <div style={{ height: "calc(16px + env(safe-area-inset-bottom))" }} />
      </div>
    </div>
  );
}
