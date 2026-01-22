// app/(main)/junior/post/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Chip } from "@/components/common/Chip";

const Brand = "#6163FF";

type FileItem = { id: string; key: string; original_file_name: string };

type JuniorPost = {
  id: string;
  category: string;
  title: string;
  content: string;
  image_url_m?: string | null;
  updated_at?: string | null;
  budget?: number | null;
  budget_type?: string | null;
  senior_type?: string[] | null;
  class_type?: string | null;
  dates_times?: { date?: string; time?: string }[] | null;
  user?: {
    auth_id?: string | null;
    id?: string | null;
    nick_name?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    location?: string | null;
  } | null;
  files?: FileItem[] | null;
};

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

function uniqueDates(arr?: { date?: string; time?: string }[] | null) {
  if (!Array.isArray(arr)) return [];
  const set = new Set<string>();
  arr.forEach((d) => {
    if (d?.date) set.add(d.date);
  });
  return Array.from(set);
}

function uniqueTimes(arr?: { date?: string; time?: string }[] | null) {
  if (!Array.isArray(arr)) return [];
  const set = new Set<string>();
  arr.forEach((d) => {
    if (d?.time) set.add(d.time);
  });
  return Array.from(set);
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

function buildFileUrl(key: string) {
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/files/${encoded}`;
}

function resolveImageUrl(value?: string | null) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  return buildFileUrl(value);
}

/* ---------- page ---------- */
export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [post, setPost] = useState<JuniorPost | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  type Comment = {
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      nick_name: string | null;
      profile_image: string | null;
    } | null;
  };
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [cText, setCText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const router = useRouter();

  useEffect(() => {
    let active = true;
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/junior/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message ?? "게시글을 찾을 수 없습니다.");
        if (!active) return;
        setPost(json.data as JuniorPost);
      } catch (error) {
        console.error(error);
        if (active) setNotFoundMsg(error instanceof Error ? error.message : "게시글을 찾을 수 없습니다.");
      }
    };

    void fetchPost();
    return () => {
      active = false;
    };
  }, [id]);

  // 댓글 불러오기
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?postId=${id}&postType=junior`);
        const json = await res.json();
        if (res.ok && json?.success) {
          setComments(json.data ?? []);
        }
      } catch (error) {
        console.error("댓글 조회 오류:", error);
      }
    };

    fetchComments();
  }, [id]);

  async function addComment() {
    const text = cText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: id,
          postType: "junior",
          content: text,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        alert(json?.message ?? "댓글 작성에 실패했습니다.");
        return;
      }

      setComments((prev) => [json.data, ...prev]);
      setCText("");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartChat() {
    const targetUserId = post?.user?.auth_id ?? post?.user?.id;
    if (!post?.id || !targetUserId) {
      alert("작성자 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      setIsStartingChat(true);
      const res = await fetch("/api/messages/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType: "junior",
          postId: post.id,
          targetUserId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.data?.id) {
        throw new Error(json?.message ?? "채팅을 시작할 수 없습니다.");
      }
      router.push(`/chat/${json.data.id}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "채팅을 시작할 수 없습니다.");
    } finally {
      setIsStartingChat(false);
    }
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

  const heroImage =
    resolveImageUrl(post.image_url_m) ??
    (post.files?.[0]?.key ? buildFileUrl(post.files[0].key) : null);

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

        {heroImage && (
          <div className="relative w-full h-[272px]">
            <img src={heroImage} alt="썸네일" className="h-full w-full object-cover" />
          </div>
        )}

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

          {!!post?.updated_at && (
            <div className="mt-1 font-medium-16 text-neutral-500">{formatAgo(post?.updated_at)}</div>
          )}

          <SectionDivider className="mt-5" />

          <div className="mt-5 space-y-2">
            <div className="font-medium-18">
              <span className="text-neutral-900 mr-2">{post.budget_type === "협의" ? "가격 협의" : post.budget_type}</span>
              <span className="font-bold-18 text-neutral-900">
                {post.budget_type === "협의"
                  ? ""
                  : post.budget != null
                    ? `${formatKRW(post.budget)}원`
                    : ""}
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
            <div className="font-bold-16 text-neutral-900">댓글 {comments.length > 0 && `(${comments.length})`}</div>

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
                disabled={isSubmitting}
                className="h-[44px] px-4 rounded-lg font-bold text-white self-end disabled:opacity-50"
                style={{ backgroundColor: Brand }}
              >
                {isSubmitting ? "..." : "등록"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <div className="font-regular-16 text-neutral-500">아직 댓글이 없습니다.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {c.user?.profile_image ? (
                        <img src={c.user.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold-14 text-neutral-900">
                        {c.user?.nick_name ?? "익명"}
                        <span className="ml-2 font-regular-12 text-neutral-400">{formatAgo(c.created_at)}</span>
                      </div>
                      <div className="mt-1 font-regular-14 text-neutral-900 whitespace-pre-wrap">
                        {c.content}
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
                <div className="mt-3 flex flex-col gap-3">
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
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {uniqueDates(post.dates_times).map((d) => {
                      return (
                        <Chip key={d} textSize={18}>{d}</Chip>
                      )
                    })}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueTimes(post.dates_times).map((d) => {
                      return (
                        <Chip key={d} textSize={18}>{d}</Chip>
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
          {!!post.user && (
            <div className="mt-5 flex items-center gap-3">
              <div className="w-[68px] h-[68px] rounded-full bg-neutral-200 overflow-hidden" />
              <div className="flex flex-col">
                <div className="font-medium-20 text-neutral-900">{post.user?.nick_name ?? "사용자"}</div>
                <div className="font-medium-14 text-neutral-700">
                  {post.user?.gender ?? "정보 없음"}
                </div>
              </div>
            </div>
          )}

          <div className="h-24" />
        </div>

        {/* 하단 채팅 버튼 (expert 상세와 동일 톤) */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] px-5 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur">
          <div className="py-3 pb-8 flex items-center">
            <button
              className="w-full h-[62px] rounded-xl text-white font-bold-20"
              style={{ backgroundColor: Brand }}
              onClick={handleStartChat}
              disabled={isStartingChat}
            >
              {isStartingChat ? "열고 있어요..." : "채팅하기"}
            </button>
          </div>
        </div>

        <div style={{ height: "calc(16px + env(safe-area-inset-bottom))" }} />
      </div>
    </div>
  );
}
