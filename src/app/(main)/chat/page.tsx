// src/app/(main)/chat/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { RoomViewDto } from "@/types/chat.dto";
import TopBar from "@/components/TopBar";

import ChatTabs, { ChatTabType } from "@/components/ChatTabs";
import ChatRoomList from "@/components/ChatRoomList";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<ChatTabType>("ALL");
  const [rooms, setRooms] = useState<RoomViewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data: authData, error: userError } = await supabase.auth.getUser();
        if (userError || !authData.user) {
          setRooms([]);
          setIsLoading(false);
          return;
        }

        const userId = authData.user.id;

        const { data: threads, error: threadsError } = await supabase
          .from("message_thread")
          .select(
            `
            id,
            post_type,
            post_junior_id,
            post_senior_id,
            starter_user_id,
            target_user_id,
            created_at,
            messages:message(id, sender_id, body, is_read, created_at)
          `
          )
          .or(`starter_user_id.eq.${userId},target_user_id.eq.${userId}`)
          .order("created_at", { foreignTable: "messages", ascending: false })
          .limit(1, { foreignTable: "messages" })
          .order("created_at", { ascending: false });

        if (threadsError) throw threadsError;

        const { data: unreadRows, error: unreadError } = await supabase
          .from("message")
          .select("thread_id")
          .eq("is_read", false)
          .neq("sender_id", userId);
        if (unreadError) throw unreadError;

        const unreadMap = new Map<string, number>();
        (unreadRows ?? []).forEach((row) => {
          if (row.thread_id) {
            unreadMap.set(row.thread_id, (unreadMap.get(row.thread_id) ?? 0) + 1);
          }
        });

        const partnerAuthIds = new Set<string>();
        (threads ?? []).forEach((t) => {
          if (t.starter_user_id && t.starter_user_id !== userId) partnerAuthIds.add(t.starter_user_id);
          if (t.target_user_id && t.target_user_id !== userId) partnerAuthIds.add(t.target_user_id);
        });

        const { data: partners, error: partnersError } = partnerAuthIds.size
          ? await supabase
              .from("users")
              .select("auth_id, nick_name, name")
              .in("auth_id", Array.from(partnerAuthIds))
          : { data: [], error: null };
        if (partnersError) throw partnersError;

        const partnerMap = new Map<string, { auth_id?: string | null; nick_name?: string | null; name?: string | null }>();
        (partners ?? []).forEach((p) => {
          if (p.auth_id) partnerMap.set(p.auth_id, p);
        });

        const juniorIds = (threads ?? [])
          .filter((t) => t.post_type === "junior" && t.post_junior_id)
          .map((t) => t.post_junior_id);
        const seniorIds = (threads ?? [])
          .filter((t) => t.post_type === "senior" && t.post_senior_id)
          .map((t) => t.post_senior_id);

        const [juniorPosts, seniorPosts] = await Promise.all([
          juniorIds.length
            ? supabase.from("post_junior").select("id, title, image_url_m").in("id", juniorIds)
            : Promise.resolve({ data: [], error: null }),
          seniorIds.length
            ? supabase.from("post_senior").select("id, title, image_url_l").in("id", seniorIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (juniorPosts.error) throw juniorPosts.error;
        if (seniorPosts.error) throw seniorPosts.error;

        const juniorMap = new Map<string, { id: string; title: string; image_url_m?: string | null }>();
        (juniorPosts.data ?? []).forEach((p) => juniorMap.set(p.id, p));
        const seniorMap = new Map<string, { id: string; title: string; image_url_l?: string | null }>();
        (seniorPosts.data ?? []).forEach((p) => seniorMap.set(p.id, p));

        const mapped: (RoomViewDto & {
          postSummary?: { id: string; title: string; type: "junior" | "senior"; thumbnail?: string | null };
          partner: { auth_id?: string | null; nick_name?: string | null; name?: string | null } & RoomViewDto["partner"];
        })[] = (threads ?? []).map((t: any) => {
          const partnerUuid = t.starter_user_id === userId ? t.target_user_id : t.starter_user_id;
          const partnerName = (() => {
            const p = partnerUuid ? partnerMap.get(partnerUuid) : null;
            return p?.nick_name ?? p?.name ?? "상대방";
          })();

          const last = t.messages?.[0];
          const postSummary =
            t.post_type === "junior"
              ? (() => {
                  const p = t.post_junior_id ? juniorMap.get(t.post_junior_id) : null;
                  return p ? { id: p.id, title: p.title, type: "junior" as const, thumbnail: p.image_url_m } : null;
                })()
              : (() => {
                  const p = t.post_senior_id ? seniorMap.get(t.post_senior_id) : null;
                  return p ? { id: p.id, title: p.title, type: "senior" as const, thumbnail: p.image_url_l } : null;
                })();

          return {
            createdBy: t.starter_user_id,
            createdDate: t.created_at,
            entityStatus: "ACTIVE",
            entityType: "ROOM",
            isAnonymous: false,
            isReportedByMe: false,
            lastMessage: last
              ? {
                  uuid: last.id,
                  message: last.body,
                  sender: {
                    uuid: last.sender_id,
                    name: last.sender_id === userId ? "나" : partnerName,
                    schoolName: "",
                    createdBy: last.sender_id,
                    createdDate: last.created_at,
                    elapsedCreatedDate: "",
                    entityStatus: "ACTIVE",
                    lastModifiedBy: last.sender_id,
                    lastModifiedDate: last.created_at,
                  },
                  receiver: {
                    uuid: last.sender_id === userId ? partnerUuid : userId,
                    name: last.sender_id === userId ? partnerName : "나",
                    schoolName: "",
                    createdBy: last.sender_id === userId ? partnerUuid : userId,
                    createdDate: last.created_at,
                    elapsedCreatedDate: "",
                    entityStatus: "ACTIVE",
                    lastModifiedBy: last.sender_id === userId ? partnerUuid : userId,
                    lastModifiedDate: last.created_at,
                  },
                  roomUuid: t.id,
                  createdDate: last.created_at,
                  elapsedCreatedDate: "",
                  isRead: last.is_read,
                  createdBy: last.sender_id,
                  entityStatus: "ACTIVE",
                  isAnonymous: false,
                  lastModifiedBy: last.sender_id,
                  lastModifiedDate: last.created_at,
                }
              : null,
            lastModifiedBy: t.starter_user_id,
            lastModifiedDate: t.created_at,
            parentEntityType: t.post_type === "senior" ? "SENIOR" : "JUNIOR",
            parentEntityUuid: t.post_type === "senior" ? t.post_senior_id : t.post_junior_id,
            partner: {
              uuid: partnerUuid,
              name: partnerName,
              schoolName: "",
              createdBy: "",
              createdDate: t.created_at,
              elapsedCreatedDate: "",
              entityStatus: "ACTIVE",
              lastModifiedBy: "",
              lastModifiedDate: t.created_at,
            },
            receiverIdExist: 1,
            senderIdExist: 1,
            unreadCount: unreadMap.get(t.id) ?? 0,
            uuid: t.id,
            postSummary: postSummary ?? null,
          } as RoomViewDto;
        });

        setRooms(mapped);
      } catch (error) {
        console.error(error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRooms = useMemo(() => {
    if (activeTab === "ALL") {
      return rooms;
    }
    if (activeTab === "SENIOR") {
      return rooms.filter((room) => room.parentEntityType === "SENIOR");
    }
    if (activeTab === "JUNIOR") {
      return rooms.filter((room) => room.parentEntityType === "JUNIOR");
    }
    return rooms;
  }, [rooms, activeTab]);

  return (
    <>
      <div
        className="px-4 py-6"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        {/* 상단 '대화' 헤더와 오른쪽 아이콘 */}
        <TopBar showLocation={false} />
        
        <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading ? (
          <div className="text-center text-gray-500 mt-20">
            대화 목록을 불러오는 중...
          </div>
        ) : (
          <ChatRoomList rooms={filteredRooms} />
        )}
      </div>

      <BottomNav />
    </>
  );
}
