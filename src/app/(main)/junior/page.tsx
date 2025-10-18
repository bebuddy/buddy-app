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
import { getJuniorPostsByRandom } from "@/actions/post";
import { postJuniorList } from "@/assets/mockdata/postJunior";

const BRAND = "#6163FF";

/////////////////////////post front-end////////////////////////
export type Item = {
  id: string;
  category: string;
  location: string;
  title: string;
  content: string;
  imageUrlM?: string;
};

const MOCKLIST = postJuniorList.map((pj) => {
  return (
    {
      id: pj.id,
      category: pj.category,
      location: '신촌동',
      title: pj.title,
      content: pj.content,
      imageUrlM: pj.image_url_m
    }
  )
})

export function random(list: Item[], count = 4): Item[] {
  // 배열을 복제한 후 섞고, 앞에서 count개만 잘라 반환
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function Page() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); //ssr이면 추후 변경필요

  /** 새로고침 시 refresh */
  async function refreshItemList() {
    setIsLoading(true);
    try {
      // const res = await getJuniorPostsByRandom(4);
      // setItems(res.data);
      setItems(random(MOCKLIST))
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  // 초기 로딩 시 item setting
  useEffect(() => {
    // refreshItemList();
    setItems(random(MOCKLIST))
    setIsLoading(false)
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