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
import { supabase } from "@/lib/supabase";

const BRAND = "#6163FF";
const FLOATING_BUTTON_OFFSET = "calc(env(safe-area-inset-bottom) + 108px)";

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
      const { data, error } = await supabase.rpc("getseniorpostsbyrandom", { _count: 20 });
      if (error) throw error;
      const mapped: SeniorItem[] = (data ?? []).map((row: SeniorItem) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        location: (row as any).location,
        birth_date: (row as any).birth_date,
        image_url_l: (row as any).image_url_l,
        nick_name: (row as any).nick_name,
        name: (row as any).name,
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
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[768px] px-4 flex justify-end z-[1800] pointer-events-none"
        style={{ bottom: FLOATING_BUTTON_OFFSET }}
      >
        <div className="pointer-events-auto">
          <WriteButton onClick={() => router.push("/expert/register")} name={"등록하기"} bgColor={"primary"} />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
