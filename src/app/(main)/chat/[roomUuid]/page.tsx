// src/app/(main)/chat/[roomUuid]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { SimpleUserDto, UserMessageViewDto } from "@/types/chat.dto";
import { supabase } from "@/lib/supabase";
import ChatHeader from "@/components/ChatHeader";
import ChatProfileHeader from "@/components/ChatProfileHeader";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { useRouter } from "next/navigation";

interface ChatRoomPageProps {
  params: { roomUuid: string };
}

type PostSummary = { id: string; title: string; type: "junior" | "senior"; thumbnail?: string | null };

const fallbackUser = (uuid: string, name = "상대방"): SimpleUserDto => ({
  uuid,
  name,
  schoolName: "",
  age: undefined,
  region: undefined,
  introduction: undefined,
  profileImageUrl: null,
  createdBy: uuid,
  createdDate: new Date().toISOString(),
  elapsedCreatedDate: "방금",
  entityStatus: "ACTIVE",
  lastModifiedBy: uuid,
  lastModifiedDate: new Date().toISOString(),
});

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const [messages, setMessages] = useState<UserMessageViewDto[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<SimpleUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [myUserId, setMyUserId] = useState<string>("");
  const [postSummary, setPostSummary] = useState<PostSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const myId = user?.id ?? "";
      setMyUserId(myId);

      try {
        const res = await fetch(`/api/messages/${params.roomUuid}/messages`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message ?? "메시지를 불러올 수 없습니다.");
        }

        const partner = json.data?.partner as
          | { auth_id?: string | null; nick_name?: string | null; gender?: string | null; location?: string | null; introduction?: string | null; profile_image?: string | null }
          | null;

        const partnerUser: SimpleUserDto | null = partner
          ? {
              uuid: partner.auth_id ?? "partner",
              name: partner.nick_name ?? "상대방",
              schoolName: "",
              age: undefined,
              region: partner.location ?? undefined,
              introduction: partner.introduction ?? undefined,
              profileImageUrl: partner.profile_image ?? null,
              createdBy: partner.auth_id ?? "partner",
              createdDate: new Date().toISOString(),
              elapsedCreatedDate: "",
              entityStatus: "ACTIVE",
              lastModifiedBy: partner.auth_id ?? "partner",
              lastModifiedDate: new Date().toISOString(),
            }
          : fallbackUser("partner", "상대방");

        setPostSummary(json.data?.postSummary ?? null);

        const rows: { id: string; sender_id: string; body: string; is_read: boolean; created_at: string }[] =
          json.data?.messages ?? [];

        const mapped: UserMessageViewDto[] = rows.map((row) => {
          const senderIsMe = row.sender_id === myId;
          const sender = senderIsMe ? fallbackUser(myId, "나") : partnerUser;
          const receiver = senderIsMe ? partnerUser : fallbackUser(myId || "me", "나");

          return {
            uuid: row.id,
            message: row.body,
            sender: sender ?? fallbackUser(row.sender_id, "상대방"),
            receiver: receiver ?? fallbackUser(senderIsMe ? "partner" : myId || "me"),
            roomUuid: params.roomUuid,
            createdDate: row.created_at,
            elapsedCreatedDate: "",
            isRead: row.is_read,
            createdBy: row.sender_id,
            entityStatus: "ACTIVE",
            isAnonymous: false,
            lastModifiedBy: row.sender_id,
            lastModifiedDate: row.created_at,
          };
        });

        setMessages(mapped);
        setPartnerInfo(partnerUser);
        setIsFirstMessage(mapped.length === 0);
      } catch (error) {
        console.error(error);
        setPartnerInfo(fallbackUser("partner", "상대방"));
        setIsFirstMessage(true);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [params.roomUuid]);

  const handleSendMessage = async (newMessageText: string) => {
    if (isFirstMessage) {
      setIsFirstMessage(false);
    }

    const partner = partnerInfo ?? fallbackUser("partner");
    if (!myUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // optimistic append
    const optimistic: UserMessageViewDto = {
      uuid: `msg-${crypto.randomUUID()}`,
      message: newMessageText,
      sender: fallbackUser(myUserId, "나"),
      receiver: partner,
      roomUuid: params.roomUuid,
      createdDate: new Date().toISOString(),
      elapsedCreatedDate: "방금",
      isRead: false,
      createdBy: myUserId,
      entityStatus: "ACTIVE",
      isAnonymous: false,
      lastModifiedBy: myUserId,
      lastModifiedDate: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/messages/${params.roomUuid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessageText }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.data) {
        throw new Error(json?.message ?? "메시지 전송 실패");
      }
      // replace optimistic with real
      setMessages((prev) =>
        prev
          .filter((m) => m.uuid !== optimistic.uuid)
          .concat({
            ...optimistic,
            uuid: json.data.id,
            createdDate: json.data.created_at,
            isRead: json.data.is_read,
          })
      );
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "메시지 전송 실패");
      setMessages((prev) => prev.filter((m) => m.uuid !== optimistic.uuid));
    }
  };

  const partnerName = useMemo(() => partnerInfo?.name ?? "상대방", [partnerInfo]);
  const postUrl = useMemo(() => {
    if (!postSummary) return null;
    return postSummary.type === "senior" ? `/expert/post/${postSummary.id}` : `/junior/post/${postSummary.id}`;
  }, [postSummary]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">채팅방을 불러오는 중...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader partnerName={partnerName} />

      {postSummary && (
        <button
          type="button"
          onClick={() => {
            if (postUrl) router.push(postUrl);
          }}
          className="w-full text-left px-4 py-2 text-xs text-neutral-600 bg-neutral-50 border-b border-neutral-200 hover:bg-neutral-100"
        >
          {postSummary.type === "senior" ? "선배" : "후배"} 게시글 · {postSummary.title}
        </button>
      )}

      {isFirstMessage && partnerInfo && (
        <ChatProfileHeader partner={partnerInfo} />
      )}

      <MessageList messages={messages} myUserId={myUserId || "me"} />

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
