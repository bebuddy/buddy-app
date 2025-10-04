"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import MasterCard from "@/components/MasterCard";
import { getSeniorPostsByRandom } from "@/actions/getSeniorPostsByRandom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArticleRandomRes } from "@/types";

const BRAND = "#6163FF";

export default function ExpertPage() {
  const [isInterested, setIsInterested] = useState(true);
  const [items, setItems] = useState<ArticleRandomRes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /** 새로고침 시 refresh */
  async function refreshItemList() {
    setIsLoading(true);
    try {
      const res = await getSeniorPostsByRandom(3);
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    refreshItemList()
  }, [])

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
        {/* 로딩 스피너 */}
        {isLoading &&
          <LoadingSpinner height={400} />
        }
        {!isLoading && items.map((it, idx) => (
          <MasterCard key={idx} item={it} brand={BRAND} />
        ))}
      </div>

      {/*  새로고침 버튼 */}
      <div className="mt-4 mb-8 flex justify-start">
        <button
          onClick={refreshItemList}
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
