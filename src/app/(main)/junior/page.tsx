"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import InterestToggle from "@/components/InterestToggle";
import RoleTabs from "@/components/RoleTabs";
import WriteButton from "@/components/WriteButton";
import PostCard from "@/components/PostCard";
import RefreshButton from "@/components/RefreshButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
const BRAND = "#6163FF";
const FLOATING_BUTTON_OFFSET = "calc(env(safe-area-inset-bottom) + 108px)";

export type Item = {
  id: string;
  category: string;
  title: string;
  content: string;
  imageUrlM?: string | null;
  updatedAt?: string;
};

export default function Page() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); //ssr이면 추후 변경필요

  /** 새로고침 시 refresh */
  async function refreshItemList() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("getjuniorpostsbyrandom", { _count: 20 });
      if (error) throw error;
      const mapped: Item[] = (data ?? []).map((row: Item & { image_url_m?: string | null; updated_at?: string | null }) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        imageUrlM: (row as any).image_url_m,
        updatedAt: (row as any).updated_at,
      }));
      setItems(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  // 초기 로딩 시 item setting
  useEffect(() => {
    refreshItemList();
  }, []);

  return (
    <div className="relative px-4 min-h-screen"
      style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }} // 하단 네비 대비

    >
      <TopBar />
      <div className="flex items-center justify-between pt-[22px]">
        <RoleTabs />
        <InterestToggle value={interestOn} onChange={setInterestOn} color={"secondary"} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-medium-18">선배님을 찾고 있어요 📚</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {/* 로딩 스피너 */}
        {isLoading &&
          <LoadingSpinner height={400} />
        }
        {!isLoading && items?.map((post) => (
          <PostCard key={post.id} item={post} brand={BRAND} />
        ))}
      </div>

      {/* 새로고침 버튼 (컴포넌트 사용 / 컴팩트) */}
      <div className="mt-4 mb-8 w-fit">
        <RefreshButton onClick={refreshItemList} size="sm" />
      </div>

      {/* 글쓰기 버튼 - floating */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[768px] px-4 flex justify-end z-[1800] pointer-events-none"
        style={{ bottom: FLOATING_BUTTON_OFFSET }}
      >
        <div className="pointer-events-auto">
          <WriteButton onClick={() => router.push("/junior/register")} name={"글쓰기"} bgColor={"secondary"} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
