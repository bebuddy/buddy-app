"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import InterestToggle from "@/components/InterestToggle";
import WriteButton from "@/components/WriteButton";
import PostCard from "@/components/PostCard";
import { getMockFeed } from "@/lib/mock";
import type { FeedItem } from "@/types";

const BRAND = "#6163FF";

export default function Page() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    setItems(getMockFeed({ interestOn }));
  }, [interestOn]);

  function refreshItemList() {
    setItems(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }

  return (
    <div className="px-4 pb-28">
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
        {items.map(post => (
          <PostCard key={post.id} item={post} brand={BRAND} />
        ))}
      </div>

      {/* ✅ 새로고침 버튼 */}
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
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }} // 네비 위 + safe-area
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
