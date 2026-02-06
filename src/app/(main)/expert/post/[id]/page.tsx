"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Chip } from "@/components/common/Chip";
import { track } from "@/lib/mixpanel";

const Brand = "#FF883F";

const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-neutral-200 ${className}`} />
);

function formatAgo(createdAt: string) {
  const ts = new Date(createdAt).getTime();
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h <= 0) return "방금 전";
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}


type SeniorPost = {
  id: string;
  category: string;
  title: string;
  content: string;
  level?: string | null;
  class_type?: string | null;
  days?: string[] | null;
  times?: string[] | null;
  junior_type?: string[] | null;
  junior_gender?: string | null;
  budget?: number | null;
  budget_type?: string | null;
  image_url_l?: string | null;
  senior_info?: {
    class_num?: number | null;
    response_rate?: number | null;
    review_num?: number | null;
  } | null;
  reviewList?: { title: string; content: string[] }[] | null;
  user?: {
    auth_id?: string | null;
    id?: string | null;
    nick_name?: string | null;
    name?: string | null;
    birth_date?: string | null;
    location?: string | null;
  } | null;
  files?: { id: string; key: string; original_file_name: string }[] | null;
};

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { id } = params ?? {};

  const [post, setPost] = useState<SeniorPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Mixpanel: post_viewed & post_exited (체류 시간)
  const hasViewedRef = useRef(false);
  const hasExitedRef = useRef(false);
  const enterTimeRef = useRef<number>(0);

  const sendExit = useCallback(() => {
    if (hasExitedRef.current || !id) return;
    hasExitedRef.current = true;
    const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
    track("post_exited", { post_id: id, post_type: "senior", duration_seconds: duration });
  }, [id]);

  useEffect(() => {
    if (!id || hasViewedRef.current) return;
    hasViewedRef.current = true;
    enterTimeRef.current = Date.now();
    track("post_viewed", { post_id: id, post_type: "senior" });

    const onVisChange = () => {
      if (document.visibilityState === "hidden") sendExit();
    };
    const onBeforeUnload = () => sendExit();

    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      sendExit();
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [id, sendExit]);

  useEffect(() => {
    let active = true;
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/senior/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message ?? "게시글을 불러오지 못했습니다.");
        if (!active) return;
        setPost(json.data as SeniorPost);
      } catch (err) {
        console.error(err);
        if (active) setError(err instanceof Error ? err.message : "게시글을 찾을 수 없습니다.");
      }
    };
    void fetchPost();
    return () => {
      active = false;
    };
  }, [id]);

  // 댓글
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [cText, setCText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?postId=${id}&postType=senior`);
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
          postType: "senior",
          content: text,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        alert(json?.message ?? "댓글 작성에 실패했습니다.");
        return;
      }

      setComments((prev) => {
        const next = [json.data, ...prev];
        track("comment_created", {
          post_id: id,
          post_type: "senior",
          user_comment_count: next.length,
        });
        return next;
      });
      setCText("");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const paragraphs = useMemo(() => (post?.content ? post.content.split("\n").filter(Boolean) : []), [post?.content]);
  const displayName = post?.user?.nick_name ?? post?.user?.name ?? "선배";
  const age = useMemo(() => {
    const birth = post?.user?.birth_date;
    if (!birth) return null;
    const date = new Date(birth);
    if (Number.isNaN(date.getTime())) return null;
    return new Date().getFullYear() - date.getFullYear();
  }, [post?.user?.birth_date]);

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
          {error ? (
            <div className="text-center text-neutral-500">{error}</div>
          ) : (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-neutral-200 border-t-[#FF883F] rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  }

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
          <div className="w-full h-[274px] bg-center bg-cover" style={{ backgroundImage: `url('${post.image_url_l}')` }} />
        )}

        {/* 본문 */}
        <div className="px-5 pb-28">
          {/* 이름 / 나이 / 위치 */}
          <div className="mt-4">
            <div className="font-bold-22 text-neutral-900">{displayName}</div>
            <div className="mt-1 font-medium-18 text-neutral-500">
              {age ? `${age}세` : ""} {post.user?.location ? `/ ${post.user.location}` : ""}
            </div>
            <div className="mt-4 flex gap-2">
              <Chip solid>{post.category}</Chip>
              {post.level && <Chip>{post.level}</Chip>}
            </div>
          </div>

          {/* 소개글 */}
          <h1 className="mt-4 font-bold-20 text-neutral-900">
            {post.title ?? `${displayName}의 수업`}
          </h1>

          <div className="mt-3 flex flex-col gap-3 font-regular-16 text-neutral-900">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* 지표 */}
          <div className="mt-5 grid grid-cols-3 text-center">
            <div>
              <div className="font-medium-22 text-neutral-900">{post?.senior_info?.class_num ?? 0}회</div>
              <div className="font-medium-16 text-neutral-500">수업</div>
            </div>
            <div>
              <div className="font-medium-22 text-neutral-900">{post?.senior_info?.response_rate ?? 0}%</div>
              <div className="font-medium-16 text-neutral-500">응답률</div>
            </div>
            <div>
              <div className="font-medium-22 text-neutral-900">{post?.senior_info?.review_num ?? 0}개</div>
              <div className="font-medium-16 text-neutral-500">후기</div>
            </div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 후기 리스트 */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="font-bold-22 text-neutral-900">
                후기 <span className="text-neutral-500">{post.reviewList?.length ?? 0}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {(post.reviewList ?? []).map((review, i) => (
                <div key={i} className="flex-col flex gap-3 shrink-0 w-[260px] rounded-xl border border-neutral-200 p-3 bg-white">
                  <div className="font-medium-20 mb-2">{review.title}</div>
                  {review.content.map((c, idx) => (
                    <div key={idx} className="font-regular-16">
                      {c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <SectionDivider className="mt-6" />

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

          <SectionDivider className="mt-6" />

          {/* 원하는 후배 스타일 */}
          {(post.junior_type ?? []).filter(Boolean).length > 0 && (
            <div className="mt-6">
              <div className="mt-3 flex flex-col gap-3">
                {(post.junior_type ?? []).filter(Boolean).map((j, i) => <Chip textSize={18} key={i}>{j}</Chip>)}
              </div>
              <div className="font-medium-20 text-neutral-900 mt-5">후배님을 만나고 싶어요.</div>
            </div>
          )}

          <SectionDivider className="mt-6" />

          {/* 선호하는 수업 방식 */}
          <div className="mt-6">
            <div className="font-medium-20 text-neutral-900">수업은...</div>
            <div className="mt-3 flex flex-col flex-wrap gap-3">
              {(post.days ?? []).filter(Boolean).length > 0 && (
                <div className="flex gap-2">
                  {(post.days ?? []).filter(Boolean).map((d, i) => <Chip textSize={18} key={i}>{d}</Chip>)}
                </div>
              )}
              {(post.times ?? []).filter(Boolean).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {(post.times ?? []).filter(Boolean).map((t, i) => <Chip textSize={18} key={i}>{t}</Chip>)}
                </div>
              )}
              {post.class_type && <Chip textSize={18}>{post.class_type}</Chip>}
            </div>
          </div>

          {/* 선호 성별 */}
          {post.junior_gender && post.junior_gender !== "상관없음" && (
            <>
              <SectionDivider className="mt-6" />
              <div className="mt-6">
                <div className="font-medium-20 text-neutral-900">선호하는 후배님</div>
                <div className="mt-3">
                  <Chip textSize={18}>{post.junior_gender}</Chip>
                </div>
              </div>
            </>
          )}

          {/* 과외비 */}
          {(post.budget != null || post.budget_type === "협의") && (
            <>
              <SectionDivider className="mt-6" />
              <div className="mt-6">
                <div className="font-medium-20 text-neutral-900">과외비</div>
                <div className="mt-3">
                  <Chip textSize={18}>
                    {post.budget_type === "협의"
                      ? "협의"
                      : `${Number(post.budget).toLocaleString()}원 / ${post.budget_type ?? "시간"}`}
                  </Chip>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] px-5 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur">
          <div className="py-3 pb-8 flex items-center">
            <button
              className="w-full h-[62px] rounded-xl text-white font-bold-20"
              style={{ backgroundColor: Brand }}
              onClick={async () => {
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
                      postType: "senior",
                      postId: post.id,
                      targetUserId,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok || !json?.success || !json?.data?.id) {
                    throw new Error(json?.message ?? "채팅을 시작할 수 없습니다.");
                  }
                  track("chat_started", { post_id: post.id, post_type: "senior", thread_id: json.data.id });
                  router.push(`/chat/${json.data.id}`);
                } catch (err) {
                  console.error(err);
                  alert(err instanceof Error ? err.message : "채팅을 시작할 수 없습니다.");
                } finally {
                  setIsStartingChat(false);
                }
              }}
              disabled={isStartingChat}
            >
              {isStartingChat ? "열고 있어요..." : "채팅하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
