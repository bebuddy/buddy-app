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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setRooms([]);
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/messages/my-threads", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message ?? "대화 목록을 불러오지 못했습니다.");
        }

        const mapped: (RoomViewDto & {
          postSummary?: { id: string; title: string; type: "junior" | "senior"; thumbnail?: string | null };
          partner: { auth_id?: string | null; nick_name?: string | null; name?: string | null } & RoomViewDto["partner"];
        })[] = (json.data ?? []).map((t: any) => {
          const partnerUuid = t.starter_user_id === user.id ? t.target_user_id : t.starter_user_id;
          const partnerName = t.partner?.nick_name ?? t.partner?.name ?? "상대방";

          const last = t.lastMessage;
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
                    name: last.sender_id === user.id ? "나" : partnerName,
                    schoolName: "",
                    createdBy: last.sender_id,
                    createdDate: last.created_at,
                    elapsedCreatedDate: "",
                    entityStatus: "ACTIVE",
                    lastModifiedBy: last.sender_id,
                    lastModifiedDate: last.created_at,
                  },
                  receiver: {
                    uuid: last.sender_id === user.id ? partnerUuid : user.id,
                    name: last.sender_id === user.id ? partnerName : "나",
                    schoolName: "",
                    createdBy: last.sender_id === user.id ? partnerUuid : user.id,
                    createdDate: last.created_at,
                    elapsedCreatedDate: "",
                    entityStatus: "ACTIVE",
                    lastModifiedBy: last.sender_id === user.id ? partnerUuid : user.id,
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
            unreadCount: t.unreadCount ?? 0,
            uuid: t.id,
            postSummary: t.postSummary ?? null,
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
        {/* 상단 헤더 */}
        <TopBar />
        
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
