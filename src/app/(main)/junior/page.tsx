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
import { apiFetch } from "@/lib/apiFetch";
const BRAND = "#6163FF";

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
      const res = await apiFetch("/api/posts/junior?count=20", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "게시글을 불러오지 못했습니다.");
      const mapped: Item[] = (json.data ?? []).map((row: Item & { image_url_m?: string | null; updated_at?: string | null }) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        imageUrlM: row.image_url_m,
        updatedAt: row.updated_at,
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
        className="fixed left-0 right-0 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 130px)" }}
      >
        <div className="mx-auto max-w-[768px] px-4 flex justify-end">
          <div className="pointer-events-auto">
            <WriteButton onClick={() => router.push("/junior/register")} name={"글쓰기"} bgColor={"secondary"} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
