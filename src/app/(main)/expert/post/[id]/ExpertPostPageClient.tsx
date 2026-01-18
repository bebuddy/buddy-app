"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/common/Chip";
import { supabase } from "@/lib/supabase";

const Brand = "#FF883F";

const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-neutral-200 ${className}`} />
);


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

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params ?? {};

  const [post, setPost] = useState<SeniorPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("post_senior")
          .select(
            `
            id,
            category,
            title,
            content,
            junior_level,
            mentoring_way,
            dates_times,
            image_url_l,
            user:user_id (
              auth_id,
              id,
              nick_name,
              name,
              birth_date,
              location
            ),
            files:file (id, key, original_file_name)
          `
          )
          .eq("id", id)
          .eq("status", "DONE")
          .single();
        if (error || !data) throw error ?? new Error("게시글을 불러올 수 없습니다.");
        if (!active) return;
        setPost(data as SeniorPost);
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
          <div className="text-center text-neutral-500">
            {error ?? "해당 고수를 찾을 수 없습니다."}
          </div>
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
          <div className="w-full h-[274px] bg-center bg-cover" style={{ backgroundImage: `url(${post.image_url_l})` }} />
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
              <Chip solid color="primary">{post.level}</Chip>
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

          {/* 원하는 후배 스타일 */}
          <div className="mt-6">
            <div className="mt-3 flex flex-col gap-3">
              {(post.junior_type ?? []).map((j, i) => <Chip textSize={18} key={i}>{j}</Chip>)}
            </div>
            <div className="font-medium-20 text-neutral-900 mt-5">후배님을 만나고 싶어요.</div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 선호하는 수업 방식 */}
          <div className="mt-6">
            <div className="font-medium-20 text-neutral-900">수업은...</div>
            <div className="mt-3 flex flex-col flex-wrap gap-3">
              <div className="flex gap-2">
                {(post.days ?? []).map((d, i) => <Chip textSize={18} key={i}>{d}</Chip>)}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(post.times ?? []).map((t, i) => <Chip  textSize={18} key={i}>{t}</Chip>)}
              </div>
              {post.class_type && <Chip textSize={18}>{post.class_type}</Chip>}
            </div>
          </div>
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
                    .eq("post_type", "senior")
                    .eq("post_senior_id", post.id)
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
                    router.push(`/chat/${matched.id}`);
                    return;
                  }

                  const { data: inserted, error: insertError } = await supabase
                    .from("message_thread")
                    .insert({
                      post_type: "senior",
                      post_senior_id: post.id,
                      starter_user_id: userId,
                      target_user_id: targetUserId,
                    })
                    .select()
                    .single();

                  if (insertError || !inserted) throw insertError ?? new Error("채팅을 시작할 수 없습니다.");
                  router.push(`/chat/${inserted.id}`);
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
