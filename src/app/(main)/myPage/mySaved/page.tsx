"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
// 이 페이지에서 사용할 Item 타입 (PostCard의 Item과 동일해야 함)
// 실제로는 `@/app/(main)/junior/page`에서 import 해야 합니다.
export interface Item {
  id: string;
  category: string;
  location: string;
  title: string;
  content: string;
  imageUrlM?: string;
  type: "궁금해요" | "선배님"; // 탭 구분을 위한 mock 속성
}
// Mock 데이터 (실제로는 API로 모든 데이터를 가져와야 함)
const MOCK_ALL_ITEMS: Item[] = [
  {
    id: "1",
    category: "식물",
    location: "서울",
    title: "장미 가지치기 알려주실 분",
    content: "단독주택 장미 가지치기를 예쁘게 하고 싶은데 혹시 고수..",
    imageUrlM: "https://placehold.co/100x80/e2e8f0/e2e8f0",
    type: "궁금해요",
  },
  {
    id: "2",
    category: "요리",
    location: "부산",
    title: "파스타 맛있게 만드는 법",
    content: "알리오 올리오를 만드는데 자꾸 면이랑 기름이랑 따로 놀아요.",
    imageUrlM: "https://placehold.co/100x80/e2e8f0/e2e8f0",
    type: "궁금해요",
  },
  {
    id: "3",
    category: "개발",
    location: "경기",
    title: "React 상태관리 조언",
    content: "Recoil이랑 Zustand 중에 고민인데, 선배님들 조언 구합니다.",
    imageUrlM: "",
    type: "궁금해요",
  },
  // ... 더 많은 mock 데이터
];

const SAVED_ITEMS_KEY = "savedPostIds";

export default function MySavedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"궁금해요" | "선배님">("궁금해요");
  const [savedItems, setSavedItems] = useState<Item[]>([]);

  // ⭐️ [수정됨] useEffect 로직 변경
  useEffect(() => {
    // localStorage에서 최신 데이터를 불러와 state를 업데이트하는 함수
    const loadSavedItems = () => {
      console.log("Loading saved items from localStorage..."); // 디버깅용
      const savedIds: string[] = JSON.parse(
        localStorage.getItem(SAVED_ITEMS_KEY) || "[]"
      );
      const userSavedItems = MOCK_ALL_ITEMS.filter((item) =>
        savedIds.includes(item.id)
      );
      setSavedItems(userSavedItems);
    };

    // 1. 페이지가 처음 마운트될 때 한 번 실행
    loadSavedItems();

    // 2. 페이지(창)가 다시 포커스될 때마다 실행
    // (다른 탭이나 앱에 갔다가 돌아오거나, 뒤로가기로 이 페이지에 돌아올 때 등)
    window.addEventListener("focus", loadSavedItems);

    // 3. (선택 사항) 다른 탭에서 localStorage가 변경될 때 실행
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SAVED_ITEMS_KEY) {
        loadSavedItems();
      }
    };
    window.addEventListener("storage", handleStorageChange);


    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("focus", loadSavedItems);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // 이 effect 자체는 마운트 시 한 번만 설정합니다.

  // 활성 탭에 따라 필터링된 아이템
  const filteredItems = savedItems.filter((item) => item.type === activeTab);

  const TabButton = ({
    label,
    isActive,
    onClick,
  }: {
    label: "궁금해요" | "선배님";
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-center font-medium ${
        isActive
          ? "text-black border-b-2 border-black"
          : "text-neutral-400"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full h-full bg-white">
      {/* 헤더 */}
      <header className="flex items-center p-4">
        <button onClick={() => router.back()} className="p-2">
          {/* 뒤로가기 아이콘 (SVG) */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold mx-auto -translate-x-6">
          저장했어요
        </h1>
      </header>
      {/* 탭 메뉴 */}
      <nav className="flex border-b border-neutral-200">
        <TabButton
          label="궁금해요"
          isActive={activeTab === "궁금해요"}
          onClick={() => setActiveTab("궁금해요")}
        />
        <TabButton
          label="선배님"
          isActive={activeTab === "선배님"}
          onClick={() => setActiveTab("선배님")}
        />
      </nav>
      {/* 저장된 포스트 목록 */}
      <main className="p-4 space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => <PostCard item={item} key={item.id} />)
        ) : (
          <div className="text-center text-neutral-500 pt-20">
            저장된 항목이 없어요.
          </div>
        )}
      </main>
    </div>
  );
}