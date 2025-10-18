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
import { getSeniorPostsByRandom } from "@/actions/post";
import { ArticleRandomRes } from "@/types/postType";
import RefreshButton from "@/components/RefreshButton";
import WriteButton from "@/components/WriteButton";
import { MOCKSENIORLIST, PostType } from "@/assets/mockdata/postSenior";

const BRAND = "#6163FF";

export function random(list: PostType[], count = 4): PostType[] {
  // 배열을 복제한 후 섞고, 앞에서 count개만 잘라 반환
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}


export default function ExpertPage() {
  const router = useRouter();
  const [interestOn, setInterestOn] = useState(false);
  const [items, setItems] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  async function refreshItemList() {
    setIsLoading(true);
    try {
      // const res = await getSeniorPostsByRandom(3);
      // setItems(res.data);
      setItems(random(MOCKSENIORLIST))
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setItems(random(MOCKSENIORLIST))
    setIsLoading(false)
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
        <RefreshButton onClick={refreshItemList}/>
      </div>

      {/* 등록하기 버튼 - floating */}
      <div
        className="fixed right-0"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 130px)" }}
      >
        <div className="mx-auto max-w-[768px] px-4 flex justify-end">
          <WriteButton onClick={() => router.push("/expert/register")} name={"등록하기"} bgColor={"primary"} />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}