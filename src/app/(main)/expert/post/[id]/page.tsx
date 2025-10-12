// app/(main)/expert/post/[id]/page.tsx
"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// 오렌지 톤 브랜드
const Brand = "#FF883F";

/* ---------- helpers ---------- */
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

type PreviewRecord = {
  id: string;
  title: string;
  category: string | null;
  createdAt?: number;
  imageUrls?: string[];
  priceKRW?: number;
  unit?: string | null;
  timeNote?: string;
  paragraphs?: string[];
  mentorTypes?: string[];
  meetPref?: string | null;
  genderPref?: string | null; // ← 등록 페이지에서 넣으면 표시
};

/* ---------- page ---------- */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Next.js(React 19): params는 Promise, React.use로 언랩
  const { id } = React.use(params);
  const router = useRouter();

  const [post, setPost] = React.useState<PreviewRecord | null>(null);
  const [notFoundMsg, setNotFoundMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (id === "preview") {
      try {
        const raw = localStorage.getItem("postPreview");
        if (raw) {
          const parsed = JSON.parse(raw) as PreviewRecord;
          setPost(parsed);
          setNotFoundMsg(null);
          return;
        }
        setNotFoundMsg("프리뷰 데이터를 찾을 수 없어요.");
        setPost(null);
      } catch {
        setNotFoundMsg("프리뷰 데이터를 불러오는 중 오류가 발생했어요.");
        setPost(null);
      }
      return;
    }

    // 실제 상세(백엔드 연결 후 교체)
    setNotFoundMsg("게시글을 찾을 수 없어요.");
    setPost(null);
  }, [id]);

  if (!post) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[420px] px-5 py-10">
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

  const photos = post.imageUrls ?? [];
  const priceNegotiation = !post.priceKRW || post.priceKRW === 0 || !post.unit;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-white relative">
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

        {/* 등록한 사진 (스냅 캐러셀, 한 장씩 넘기기) */}
        {photos.length > 0 && (
          <div className="relative w-full bg-neutral-100">
            <div className="w-full aspect-[3/2] overflow-x-auto snap-x snap-mandatory scroll-smooth flex no-scrollbar">
              {photos.map((src, i) => (
                <div key={i} className="w-full shrink-0 snap-center snap-always">
                  <img className="w-full h-full object-cover" src={src} alt={`photo-${i + 1}`} />
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
        <div className="px-5 pb-28">
          {/* 이름/나이/위치 (하드코딩) + 관심분야(하드코딩) */}
          <div className="mt-4">
            <div className="text-[18px] font-extrabold text-neutral-900">장미야</div>
            <div className="mt-1 text-[13px] text-neutral-500">57세 / 서울시 서대문구</div>
            <div className="mt-2 flex gap-2">
              <Chip solid>식물</Chip>
              <Chip solid>신</Chip>
            </div>
          </div>

          {/* 제목 */}
          <h1 className="mt-4 text-[20px] leading-[28px] font-extrabold text-neutral-900">
            {post.title}
          </h1>

          {/* 상세 내용 */}
          {(post.paragraphs?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-col gap-3 text-[15px] leading-[24px] text-neutral-900">
              {post.paragraphs!.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}

          {/* 포트폴리오 (하드코딩 박스) */}
          <div className="mt-4">
            <div className="text-[15px] font-bold text-neutral-900 mb-2">포트폴리오</div>
            <div className="w-full h-[64px] rounded-lg border border-neutral-200 bg-neutral-50" />
          </div>

          {/* 지표 (하드코딩) */}
          <div className="mt-5 grid grid-cols-3 text-center">
            <div>
              <div className="text-[18px] font-extrabold text-neutral-900">7회</div>
              <div className="text-[12px] text-neutral-500">수업</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-neutral-900">92%</div>
              <div className="text-[12px] text-neutral-500">응답률</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-neutral-900">3개</div>
              <div className="text-[12px] text-neutral-500">수업 후기</div>
            </div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 후기 (가로 스크롤, 하드코딩) */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-extrabold text-neutral-900">후기 <span className="text-neutral-500 text-[14px]">7</span></div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[260px] rounded-xl border border-neutral-200 p-3 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-200" />
                    <div className="text-[13px] font-bold text-neutral-900">장미티비</div>
                  </div>
                  <div className="mt-2 text-[14px] leading-[22px] text-neutral-900">
                    블라블라 장미 좋아요
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SectionDivider className="mt-6" />

          {/* 가격 & 시간 메모 */}
          <div className="mt-5 space-y-2">
            <div className="text-[17px] leading-[26px]">
              <span className="text-neutral-500 mr-2">가격</span>
              <span className="font-extrabold text-neutral-900">
                {priceNegotiation
                  ? "가격 협의"
                  : `${formatKRW(post.priceKRW!)} 원${post.unit ? ` / ${post.unit}` : ""}`}
              </span>
            </div>
            {post.timeNote && (
              <div className="text-[17px] leading-[26px]">
                <span className="text-neutral-500 mr-2">시간</span>
                <span className="font-extrabold text-neutral-900">{post.timeNote}</span>
              </div>
            )}
          </div>

          <SectionDivider className="mt-6" />

          {/* 어떤 후배를 만나고 싶은지 */}
          {(post.mentorTypes?.length ?? 0) > 0 || post.genderPref ? (
            <div className="mt-5">
              <div className="text-[18px] font-extrabold text-neutral-900">
                어떤 후배를 만나고 싶으신가요?
              </div>
              {!!post.genderPref && (
                <div className="mt-3">
                  <Chip>{post.genderPref}</Chip>
                </div>
              )}
              {!!post.mentorTypes?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.mentorTypes!.map((t, i) => <Chip key={i}>{t}</Chip>)}
                </div>
              )}
            </div>
          ) : null}

          {/* 어떤 수업 방식을 선호하는지 */}
          {post.meetPref && (
            <div className="mt-6">
              <div className="text-[18px] font-extrabold text-neutral-900">
                어떤 수업 방식을 선호하시나요?
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>{post.meetPref}</Chip>
                {/* 필요하면 요일/시간대도 Chip으로 추가 표시 가능 */}
              </div>
            </div>
          )}
        </div>

        {/* 하단 고정 CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-5 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur border-t border-neutral-200">
          <div className="py-3">
            <button
              className="w-full h-[48px] rounded-xl font-bold text-white"
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
