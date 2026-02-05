// src/app/(main)/myPage/alarm/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AlarmItem from "@/components/AlarmItem"; // 방금 만든 컴포넌트
import { apiFetch } from "@/lib/apiFetch";

type NotificationItem = {
  id: string;
  isRead: boolean;
  createdAt: string;
  notificationId?: string;
  title?: string;
  content?: string;
  actionUrl?: string;
  data?: string;
  type?: "COMMENT" | "MESSAGE" | "MESSAGE_UNREAD";
  sentAt?: string;
};

export default function AlarmPage() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function fetchAlarms(initial = false) {
    if (initial) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    try {
      const params = new URLSearchParams();
      if (cursorRef.current) params.set("cursor", cursorRef.current);
      params.set("limit", "20");

      const res = await apiFetch(`/api/notifications?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "알림을 불러오지 못했습니다.");

      const { items, nextCursor, hasMore: more } = json.data as {
        items: NotificationItem[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      setAlarms((prev) => (initial ? items : [...prev, ...items]));
      cursorRef.current = nextCursor;
      setHasMore(Boolean(more));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }

  useEffect(() => {
    fetchAlarms(true);
  }, []);

  // 2. 알림 클릭 시 '읽음' 처리 (상태 업데이트)
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await apiFetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "읽음 처리 실패");
      setAlarms((prevAlarms) =>
        prevAlarms.map((alarm) =>
          alarm.id === id ? { ...alarm, isRead: true } : alarm
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // 무한 스크롤: 하단 근접 시 추가 로드
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!hasMore || isFetchingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 120) {
        fetchAlarms(false);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, isFetchingMore]);
  
  return (
    <div
      className="px-4 pt-4 pb-6"
      style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      {/* 상단 Back */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-[18px] font-semibold">알림</div>
      </div>

      {/* 2. 알림 목록 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          알림을 불러오는 중...
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {alarms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 pt-20">
              표시할 알림이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alarms.map((item) => (
                <AlarmItem
                  key={item.id}
                  item={item}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
              {hasMore && (
                <div className="py-4 text-center text-sm text-gray-500">
                  {isFetchingMore ? "불러오는 중..." : "더 불러오는 중..."}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
