"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import InterestToggle from "@/components/InterestToggle";
import WriteButton from "@/components/WriteButton";
import PostCard from "@/components/PostCard";
import type { FeedItem } from "@/types";
import { getJuniorPostsByRandom } from "@/actions/getJuniorPostsByRandom";
import LoadingSpinner from "@/components/LoadingSpinner";

const BRAND = "#6163FF";

export default function Page() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); //ssr이면 추후 변경필요

  /** 새로고침 시 refresh */
  async function refreshItemList() {
    setIsLoading(true);
    try {
      const res = await getJuniorPostsByRandom(4);
      setItems(res.data);
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
    <div className="relative px-4 pb-28 min-h-screen">
      <TopBar />
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-8">
          <button className="text-[18px] font-semibold">도움</button>
          <button
            className="text-[18px] font-semibold text-neutral-400"
            onClick={() => router.push("/expert")}
          >
            고수
          </button>
        </div>

        <InterestToggle value={interestOn} onChange={setInterestOn} brand={BRAND} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xl font-bold">고수님을 찾고 있어요</span>
        <span className="text-lg">🧐</span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {/* 로딩 스피너 */}
        {isLoading &&
          <LoadingSpinner height={400} />
        }
        {!isLoading && items?.map((post) => (
          <PostCard key={post.id} item={post} brand={BRAND} />
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <div className="mt-4 mb-8">
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

      {/* 글쓰기 버튼 - floating */}
      <div
        className="fixed left-0 right-0 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <div className="mx-auto max-w-[440px] px-4 flex justify-end">
          <div className="pointer-events-auto">
            <WriteButton onClick={() => alert("글쓰기 버튼 클릭")} />
          </div>
        </div>
      </div>
    </div>
  );
}
