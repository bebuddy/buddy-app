"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import MasterCard from "@/components/MasterCard";
import WriteButton from "@/components/WriteButton"; // 글쓰기 버튼은 떠있게 유지

const BRAND = "#6163FF";

type ArticleRandomRes = {
  field: string;
  title: string;
  location: string;
  mentorName?: string;
  birthDate?: string;
  imageUrlL?: string;
};

export default function ExpertPage() {
  const [isInterested, setIsInterested] = useState(true);
  const [items, setItems] = useState<ArticleRandomRes[]>([]);

  useEffect(() => {
    fetchRandom({ type: "master", isInterested, count: 3 }, { silent: true });
  }, [isInterested]);

  // ---- 백엔드 자리 ----
  function fetchRandom(
    req: { type: "master"; isInterested: boolean; count: number },
    opts: { silent?: boolean } = {}
  ) {
    if (!opts.silent) {
      alert(`getArticleByRandom 요청:\n${JSON.stringify(req)}`);
    }

    // 데모 데이터 (셔플)
    const seed: ArticleRandomRes[] = [
      {
        field: "건강",
        title: "허리 · 어깨 통증 잡는 생활 스트레칭 전문가",
        location: "대현동",
        mentorName: "메멘토",
        birthDate: "1970-01-01",
        imageUrlL:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
      },
      {
        field: "건강",
        title: "어깨 안정화/거북목 교정 루틴",
        location: "대현동",
        mentorName: "스트엔",
        birthDate: "1968-06-01",
        imageUrlL:
          "https://images.unsplash.com/photo-1546484959-f9a53db89cf1?q=80&w=1200&auto=format&fit=crop",
      },
      {
        field: "건강",
        title: "허리 강화 홈트(체형·나이 맞춤)",
        location: "대현동",
        mentorName: "케어핏",
        birthDate: "1975-09-01",
        imageUrlL:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
      },
    ];
    const arr = [...seed];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setItems(arr.slice(0, req.count));
  }
  // --------------------

  return (
    <div className="px-4 pb-28">
      <TopBar />

      {/* 상단 탭/토글 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-8">
          <button className="text-[18px] font-semibold text-neutral-400" onClick={() => history.back()}>
            도움
          </button>
          <button className="text-[18px] font-semibold">고수</button>
        </div>

        <button
          className="text-[18px] font-semibold"
          onClick={() => setIsInterested(v => !v)}
        >
          관심 분야 <span style={{ color: BRAND }}>{isInterested ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div className="mt-3 text-[18px] text-neutral-700">
        궁금한 거 다! 알려주는 멘토 찾아드려요!
      </div>

      {/* 카드 리스트 */}
      <div className="mt-3 flex flex-col gap-3">
        {items.map((it, idx) => (
          <MasterCard key={idx} item={it} brand={BRAND} />
        ))}
      </div>

      {/*  새로고침 버튼 */}
      <div className="mt-4 mb-8 flex justify-start">
        <button
          onClick={() =>
            fetchRandom({ type: "master", isInterested, count: 3 }, { silent: false })
          }
          className="flex items-center gap-2 text-white font-semibold text-[16px] rounded-full px-4 py-2 shadow"
          style={{ backgroundColor: "#000" }}
        >
          새로고침
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6" stroke="#fff" strokeWidth="2" />
            <path d="M1 20v-6h6" stroke="#fff" strokeWidth="2" />
            <path d="M3.51 9A9 9 0 0 1 20 8" stroke="#fff" strokeWidth="2" />
            <path d="M20.49 15A9 9 0 0 1 4 16" stroke="#fff" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
