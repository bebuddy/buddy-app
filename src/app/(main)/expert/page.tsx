// src/app/expert/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import RoleTabs from "@/components/RoleTabs";
import MasterCard from "@/components/MasterCard";
import InterestToggle from "@/components/InterestToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import RefreshButton from "@/components/RefreshButton";
import WriteButton from "@/components/WriteButton";
import { apiFetch } from "@/lib/apiFetch";

const BRAND = "#6163FF";

export type SeniorItem = {
  id: string;
  category: string;
  title: string;
  location?: string | null;
  birth_date?: string | null;
  image_url_l?: string | null;
  nick_name?: string | null;
  name?: string | null;
};


export default function ExpertPage() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<SeniorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  async function refreshItemList() {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/posts/senior?count=20", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "게시글을 불러오지 못했습니다.");
      const mapped: SeniorItem[] = (json.data ?? []).map((row: SeniorItem) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        location: row.location,
        birth_date: row.birth_date,
        image_url_l: row.image_url_l,
        nick_name: row.nick_name,
        name: row.name,
      }));
      setItems(mapped);
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
      style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }} // 하단 네비 대비
    >

      <TopBar />
      <div className="flex items-center justify-between pt-[22px]">
        {/* 기존 후배/선배 버튼 묶음 → RoleTabs로 교체 */}
        <RoleTabs />
        <InterestToggle value={interestOn} onChange={setInterestOn} color={"primary"} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-medium-18">궁금한 거 다~ 알려주는 선배를 찾아드려요! 👨🏻‍🏫</span>
      </div>

      {/* 카드 리스트 */}
      <div className="mt-3 flex flex-col gap-3">
        {isLoading && <LoadingSpinner height={400} color="primary" />}
        {!isLoading &&
          items.map((it, idx) => <MasterCard key={idx} item={it} brand={BRAND} />)}
      </div>

      {/* 새로고침 버튼 (컴포넌트 사용 / 컴팩트) */}
      <div className="mt-4 mb-8 w-fit z-[100]">
        <RefreshButton onClick={refreshItemList} />
      </div>

      {/* 등록하기 버튼 - floating */}
      <div
        className="fixed left-0 right-0 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 130px)" }}
      >
        <div className="mx-auto max-w-[768px] px-4 flex justify-end">
          <div className="pointer-events-auto">
            <WriteButton onClick={() => router.push("/expert/register")} name={"등록하기"} bgColor={"primary"} />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
