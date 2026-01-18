// src/app/(main)/chat/room/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { SimpleUserDto, UserMessageViewDto } from "@/types/chat.dto";
import { supabase } from "@/lib/supabase";
import ChatHeader from "@/components/ChatHeader";
import ChatProfileHeader from "@/components/ChatProfileHeader";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<UserMessageViewDto[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<SimpleUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [myUserId, setMyUserId] = useState<string>("");
  const [postSummary, setPostSummary] = useState<PostSummary | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomUuid = searchParams.get("roomUuid") ?? "";

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      try {
        const { data: authData, error: userError } = await supabase.auth.getUser();
        if (userError || !authData.user) {
          router.replace("/sign-in");
          return;
        }
        if (!roomUuid) {
          router.replace("/chat");
          return;
        }
        const myId = authData.user.id;
        setMyUserId(myId);

        const { data: thread, error: threadError } = await supabase
          .from("message_thread")
          .select("id, post_type, post_junior_id, post_senior_id, starter_user_id, target_user_id")
          .eq("id", roomUuid)
          .single();

        if (threadError || !thread) {
          throw new Error("스레드를 찾을 수 없습니다.");
        }

        const userId = myId;
        if (thread.starter_user_id !== userId && thread.target_user_id !== userId) {
          throw new Error("접근 권한이 없습니다.");
        }

        const partnerAuthId = thread.starter_user_id === userId ? thread.target_user_id : thread.starter_user_id;

        const { data: partnerProfile, error: partnerError } = await supabase
          .from("users")
          .select("auth_id, nick_name, gender, location, birth_date, introduction, profile_image")
          .eq("auth_id", partnerAuthId)
          .single();

        if (partnerError && partnerError.code !== "PGRST116") {
          throw partnerError;
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from("message")
          .select("id, thread_id, sender_id, body, is_read, created_at")
          .eq("thread_id", roomUuid)
          .order("created_at", { ascending: true });
        if (messagesError) throw messagesError;

        const postSummaryQuery =
          thread.post_type === "junior"
            ? supabase.from("post_junior").select("id, title, image_url_m").eq("id", thread.post_junior_id).single()
            : supabase.from("post_senior").select("id, title, image_url_l").eq("id", thread.post_senior_id).single();
        const { data: postData, error: postError } = await postSummaryQuery;
        if (postError && postError.code !== "PGRST116") {
          throw postError;
        }

        const partnerUser: SimpleUserDto | null = partnerProfile
          ? {
              uuid: partnerProfile.auth_id ?? "partner",
              name: partnerProfile.nick_name ?? "상대방",
              schoolName: "",
              age: undefined,
              region: partnerProfile.location ?? undefined,
              introduction: partnerProfile.introduction ?? undefined,
              profileImageUrl: partnerProfile.profile_image ?? null,
              createdBy: partnerProfile.auth_id ?? "partner",
              createdDate: new Date().toISOString(),
              elapsedCreatedDate: "",
              entityStatus: "ACTIVE",
              lastModifiedBy: partnerProfile.auth_id ?? "partner",
              lastModifiedDate: new Date().toISOString(),
            }
          : fallbackUser("partner", "상대방");

        setPostSummary(
          postData
            ? {
                id: postData.id,
                title: (postData as any).title,
                type: thread.post_type,
                thumbnail:
                  thread.post_type === "junior"
                    ? (postData as { image_url_m?: string | null }).image_url_m
                    : (postData as { image_url_l?: string | null }).image_url_l,
              }
            : null
        );

        const mapped: UserMessageViewDto[] = (messagesData ?? []).map((row) => {
          const senderIsMe = row.sender_id === myId;
          const sender = senderIsMe ? fallbackUser(myId, "나") : partnerUser;
          const receiver = senderIsMe ? partnerUser : fallbackUser(myId || "me", "나");

          return {
            uuid: row.id,
            message: row.body,
            sender: sender ?? fallbackUser(row.sender_id, "상대방"),
            receiver: receiver ?? fallbackUser(senderIsMe ? "partner" : myId || "me"),
            roomUuid,
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
  }, [roomUuid, router]);

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
      roomUuid,
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
      const { data, error } = await supabase
        .from("message")
        .insert({
          thread_id: roomUuid,
          sender_id: myUserId,
          body: newMessageText,
        })
        .select()
        .single();
      if (error || !data) {
        throw error ?? new Error("메시지 전송 실패");
      }
      setMessages((prev) =>
        prev
          .filter((m) => m.uuid !== optimistic.uuid)
          .concat({
            ...optimistic,
            uuid: data.id,
            createdDate: data.created_at,
            isRead: data.is_read,
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
    return postSummary.type === "senior"
      ? `/expert/post?id=${encodeURIComponent(postSummary.id)}`
      : `/junior/post?id=${encodeURIComponent(postSummary.id)}`;
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
