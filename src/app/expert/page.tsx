// src/app/expert/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import RoleTabs from "@/components/RoleTabs";
import MasterCard from "@/components/MasterCard";
import RegisterButton from "@/components/RegisterButton";
import InterestToggle from "@/components/InterestToggle";
import { getSeniorPostsByRandom } from "@/actions/getSeniorPostsByRandom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArticleRandomRes } from "@/types";
import BottomNav from "@/components/BottomNav";

const BRAND = "#6163FF";

export default function ExpertPage() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [isInterested, setIsInterested] = useState(true);
  const [items, setItems] = useState<ArticleRandomRes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    refreshItemList();
  }, []);

  return (
    <div
      className="px-4"
      style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }} // 하단 네비 대비
    >

      <TopBar />
      <div className="flex items-center justify-between mt-3">
        {/* ✅ 기존 후배/선배 버튼 묶음 → RoleTabs로 교체 */}
        <RoleTabs /> 
        <InterestToggle value={interestOn} onChange={setInterestOn} brand={BRAND} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xl font-bold">궁금한 거 다~ 알려주는 선배를 찾아드려요! 👨🏻‍🏫</span>
      </div>

      {/* 카드 리스트 */}
      <div className="mt-3 flex flex-col gap-3">
        {isLoading && <LoadingSpinner height={400} />}
        {!isLoading &&
          items.map((it, idx) => <MasterCard key={idx} item={it} brand={BRAND} />)}
      </div>

      {/* 새로고침 버튼 (원하면 RefreshButton으로 교체 가능) */}
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

      {/* 지원하기 버튼 - floating */}
      <div
        className="fixed left-0 right-0 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <div className="mx-auto max-w-[440px] px-4 flex justify-end">
          <div className="pointer-events-auto">
            <RegisterButton onClick={() => router.push("/expert/register")} />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
