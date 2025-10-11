"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { getPost, PostRecord } from "@/lib/clientRepo";
import { useRouter } from 'next/navigation';

const Brand = "#6163FF";

/* ---------- helpers ---------- */
function formatAgo(ts: number) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h <= 0) return "방금 전";
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
function formatKRW(n: number) {
  try { return new Intl.NumberFormat("ko-KR").format(n); } catch { return String(n); }
}
const SectionDivider = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-neutral-200 ${className}`} />
);
const Chip = ({ children, solid }: React.PropsWithChildren<{ solid?: boolean }>) => (
  <span
    className={[
      "inline-flex items-center px-3 py-1.5 rounded-full text-[12px]",
      solid ? "text-white" : "bg-neutral-100 text-neutral-700",
    ].join(" ")}
    style={solid ? { backgroundColor: Brand } : undefined}
  >
    {children}
  </span>
);

/** 현재 사용자명 얻기: localStorage.meName → 없으면 '익명' */
function getCurrentUserName() {
  if (typeof window === "undefined") return "익명";
  const v = localStorage.getItem("meName");
  return v && v.trim().length ? v.trim() : "익명";
}

/* ---------- page ---------- */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [post, setPost] = React.useState<PostRecord | null>(null);

  // 댓글 로컬 상태
  type Comment = { name: string; text: string; ts: number };
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [cText, setCText] = React.useState("");
  const [meName, setMeName] = React.useState<string>("익명");

  const router = useRouter();

  React.useEffect(() => {
    setPost(getPost(id));
    setMeName(getCurrentUserName());
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
        <div className="w-full max-w-[420px] px-5 py-10">
          <button
            onClick={() => history.back()}
            className="mb-6 p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
          <div className="text-[17px] text-neutral-700">게시글을 찾을 수 없어요.</div>
        </div>
      </div>
    );
  }

  const photos = post.imageUrls ?? [];
  const priceNegotiation = !post.priceKRW || post.priceKRW === 0 || !post.unit;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white">

        {/* 상단: 뒤로 */}
        <div className="h-12 flex items-center px-2">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-full hover:bg-neutral-100 active:bg-neutral-200"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>
        </div>

        {/* 등록한 사진: 오른쪽으로 넘길 수 있음 (없으면 숨김) */}
        {photos.length > 0 && (
          <div className="relative w-full bg-neutral-100">
            <div className="w-full aspect-[390/220] overflow-x-auto snap-x snap-mandatory flex scroll-smooth">
              {photos.map((src, i) => (
                <div key={i} className="min-w-full h-full snap-start">
                  <img className="w-full h-full object-cover" src={src} alt={`photo-${i+1}`} />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <div className="absolute right-3 top-3 rounded-full bg-black/55 text-white text-xs px-2 py-1">
                {photos.length}장
              </div>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="px-5">
          {/* 관심분야 */}
          {post.category && (
            <div className="mt-3">
              <Chip solid>{post.category}</Chip>
            </div>
          )}

          {/* 제목 */}
          <h1 className="mt-3 text-[24px] leading-[32px] font-extrabold text-neutral-900">
            {post.title}
          </h1>

          {/* 작성 시간 */}
          {post.createdAt && (
            <div className="mt-1 text-[14px] text-neutral-500">
              {formatAgo(post.createdAt)}
            </div>
          )}

          {/* 구분선 */}
          <SectionDivider className="mt-5" />

          {/* 가격/시간 블록 */}
          <div className="mt-5 space-y-2">
            <div className="text-[17px] leading-[26px]">
              <span className="text-neutral-500 mr-2">가격</span>
              <span className="font-extrabold text-neutral-900">
                {priceNegotiation
                  ? "가격 협의"
                  : `${formatKRW(post.priceKRW)} 원${post.unit ? ` / ${post.unit}` : ""}`}
              </span>
            </div>
            <div className="text-[17px] leading-[26px]">
              <span className="text-neutral-500 mr-2">시간</span>
              <span className="font-extrabold text-neutral-900">
                {post.timeNote || ""}
              </span>
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="mt-6" />
          <div className="text-[18px] font-extrabold text-neutral-900">상세 내용</div>
          <div className="mt-3 flex flex-col gap-4 text-[16px] leading-[26px] text-neutral-900">
            {(post.paragraphs ?? []).map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* 구분선 */}
          <SectionDivider className="mt-7" />

          {/* 댓글 섹션 */}
          <div className="mt-5">
            <div className="text-[18px] font-extrabold text-neutral-900">댓글</div>

            {/* 자동 사용자명 안내 */}
            <div className="mt-2 text-[13px] text-neutral-500">
              댓글 작성자: <span className="font-bold text-neutral-800">{meName}</span>
            </div>

            {/* 입력창 (내용만) */}
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

            {/* 댓글 리스트 */}
            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-[14px] text-neutral-500">첫 댓글을 남겨보세요.</div>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[14px] font-bold text-neutral-900">
                        {c.name} <span className="ml-2 text-neutral-400 text-[12px]">{formatAgo(c.ts)}</span>
                      </div>
                      <div className="mt-1 text-[15px] text-neutral-900 whitespace-pre-wrap">{c.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 구분선 */}
          <SectionDivider className="mt-7" />

          {/* 어떤 선배/후배 & 수업 방식 섹션 */}
          <div className="mt-5">
            {(post.mentorTypes?.length ?? 0) > 0 && (
              <>
                <div className="text-[18px] font-extrabold text-neutral-900">
                  어떤 선배/후배를 만나고 싶나요?
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.mentorTypes!.map((t, i) => (
                    <Chip key={i}>{t}</Chip>
                  ))}
                </div>
              </>
            )}

            {post.meetPref && (
              <>
                <div className="mt-6 text-[18px] font-extrabold text-neutral-900">
                  어떤 수업 방식을 선호하시나요?
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip>{post.meetPref}</Chip>
                </div>
              </>
            )}
          </div>

          {/* 관심분야 알림 버튼 */}
          <div className="mt-7 flex items-center justify-between gap-3">
            <div className="text-[15px] text-neutral-900">
              <div>{post.category} 관련 소식을</div>
              <div>바로 받아보실래요?</div>
            </div>
            <button
              className="h-[44px] px-5 rounded-full font-bold text-[15px] text-white"
              style={{ backgroundColor: Brand }}
              onClick={() => alert("알림을 설정했습니다. (데모)")}
            >
              알림 받기
            </button>
          </div>

          {/* 구분선 */}
          <SectionDivider className="mt-7" />

          {/* 작성자 소개 */}
          <div className="mt-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden" />
            <div className="flex flex-col">
              <div className="text-[17px] font-bold text-neutral-900">{post.author.name}</div>
              <div className="text-[13px] text-neutral-500">
                {post.author.age}세 | {post.author.gender}
              </div>
            </div>
          </div>

          {/* 하드코딩 후기 3개 */}
          <div className="mt-6 text-[18px] font-extrabold text-neutral-900">후기</div>
          <div className="mt-3 space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-neutral-900">장미티비</div>
                  <div className="mt-1 text-[15px] text-neutral-900">블라블라 장미 좋아요</div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-24" />
        </div>

        <div style={{ height: "calc(16px + env(safe-area-inset-bottom))" }} />
      </div>
    </div>
  );
}
