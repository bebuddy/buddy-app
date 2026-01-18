// app/(main)/junior/post/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Chip } from "@/components/common/Chip";
import { supabase } from "@/lib/supabase";

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

/* ---------- page ---------- */
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [post, setPost] = useState<JuniorPost | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  type Comment = { name: string; text: string; ts: number };
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [cText, setCText] = React.useState("");
  const [meName, setMeName] = React.useState<string>("익명");

  useEffect(() => {
    let active = true;
    if (!id) {
      router.replace("/junior");
      return;
    }

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("post_junior")
          .select(
            `
            id,
            category,
            title,
            content,
            image_url_m,
            image_url_l,
            updated_at,
            budget,
            budget_type,
            senior_type,
            class_type,
            dates_times,
            status,
            user:user_id (
              auth_id,
              id,
              nick_name,
              birth_date,
              gender,
              location
            ),
            files:file (id, key, original_file_name)
          `
          )
          .eq("id", id)
          .eq("status", "DONE")
          .single();

        if (error || !data) throw error ?? new Error("게시글을 찾을 수 없습니다.");
        if (!active) return;
        setPost(data as JuniorPost);
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

  function addComment() {
    const text = cText.trim();
    if (!text) return;
    setComments((prev) => [{ name: meName, text, ts: Date.now() }, ...prev]);
    setCText("");
  }

  async function handleStartChat() {
    const targetUserId = post?.user?.auth_id ?? post?.user?.id;
    if (!post?.id || !targetUserId) {
      alert("작성자 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        alert("로그인이 필요합니다.");
        return;
      }
      const userId = authData.user.id;
      if (targetUserId === userId) {
        alert("본인에게 메시지를 보낼 수 없습니다.");
        return;
      }

      setIsStartingChat(true);
      const { data: existingThreads, error: existingError } = await supabase
        .from("message_thread")
        .select("*")
        .eq("post_type", "junior")
        .eq("post_junior_id", post.id)
        .in("starter_user_id", [userId, targetUserId])
        .in("target_user_id", [userId, targetUserId])
        .limit(1);

      if (existingError) throw existingError;

      const matched = (existingThreads ?? []).find(
        (t) =>
          (t.starter_user_id === userId && t.target_user_id === targetUserId) ||
          (t.starter_user_id === targetUserId && t.target_user_id === userId)
      );

      if (matched?.id) {
        router.push(`/chat/room?roomUuid=${matched.id}`);
        return;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("message_thread")
        .insert({
          post_type: "junior",
          post_junior_id: post.id,
          starter_user_id: userId,
          target_user_id: targetUserId,
        })
        .select()
        .single();

      if (insertError || !inserted) throw insertError ?? new Error("채팅을 시작할 수 없습니다.");
      router.push(`/chat/room?roomUuid=${inserted.id}`);
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
