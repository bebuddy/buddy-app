// src/app/(main)/myPage/alarm/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AlarmItem from "@/components/AlarmItem"; // 방금 만든 컴포넌트
import { supabase } from "@/lib/supabase";

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
  const [userId, setUserId] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function fetchAlarms(initial = false) {
    if (initial) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    try {
      let uid = userId;
      if (!uid) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.replace("/sign-in");
          return;
        }
        uid = authData.user.id;
        setUserId(uid);
      }

      const limit = 20;
      let query = supabase
        .from("user_notification")
        .select(
          `
          id,
          is_read,
          created_at,
          notification:notification_id (
            id,
            title,
            content,
            action_url,
            data,
            notification_type,
            created_at
          )
        `
        )
        .eq("user_auth_id", uid)
        .order("created_at", { ascending: false })
        .limit(limit + 1);

      if (cursorRef.current) {
        query = query.lt("created_at", cursorRef.current);
      }

      const { data, error } = await query;
      if (error) throw error;

      const hasMoreRows = (data?.length ?? 0) > limit;
      const items = (data ?? []).slice(0, limit).map((row: any) => ({
        id: row.id,
        isRead: row.is_read,
        createdAt: row.created_at,
        notificationId: row.notification?.id,
        title: row.notification?.title,
        content: row.notification?.content,
        actionUrl: row.notification?.action_url,
        data: row.notification?.data,
        type: row.notification?.notification_type,
        sentAt: row.notification?.created_at,
      })) as NotificationItem[];

      const nextCursor = hasMoreRows ? items[items.length - 1]?.createdAt ?? null : null;

      setAlarms((prev) => (initial ? items : [...prev, ...items]));
      cursorRef.current = nextCursor;
      setHasMore(Boolean(hasMoreRows));
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
      let uid = userId;
      if (!uid) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw authError ?? new Error("로그인이 필요합니다.");
        uid = authData.user.id;
        setUserId(uid);
      }

      const { error } = await supabase
        .from("user_notification")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_auth_id", uid);
      if (error) throw error;
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
