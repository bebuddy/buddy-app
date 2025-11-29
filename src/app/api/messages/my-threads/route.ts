import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET(_request: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
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

  if (threadsError) {
    console.error("message threads list error:", threadsError);
    return NextResponse.json(
      { success: false, message: "스레드 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const { data: unreadRows, error: unreadError } = await supabase
    .from("message")
    .select("thread_id")
    .eq("is_read", false)
    .neq("sender_id", userId);

  if (unreadError) {
    console.error("unread count error:", unreadError);
  }

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

  if (partnersError) {
    console.error("partners fetch error:", partnersError);
  }
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

  if (juniorPosts.error) console.error("junior post summary error:", juniorPosts.error);
  if (seniorPosts.error) console.error("senior post summary error:", seniorPosts.error);

  const juniorMap = new Map<string, { id: string; title: string; image_url_m?: string | null }>();
  (juniorPosts.data ?? []).forEach((p) => juniorMap.set(p.id, p));
  const seniorMap = new Map<string, { id: string; title: string; image_url_l?: string | null }>();
  (seniorPosts.data ?? []).forEach((p) => seniorMap.set(p.id, p));

  const normalized = (threads ?? []).map((thread) => {
    const { messages, ...rest } = thread as {
      id: string;
      messages?: any[];
      starter_user_id: string;
      target_user_id: string;
      post_type: "junior" | "senior";
      post_junior_id?: string | null;
      post_senior_id?: string | null;
    };
    const partnerAuthId = rest.starter_user_id === userId ? rest.target_user_id : rest.starter_user_id;
    const partner = partnerMap.get(partnerAuthId) ?? { auth_id: partnerAuthId, nick_name: "상대방" };

    const postSummary =
      rest.post_type === "junior"
        ? (() => {
            const p = rest.post_junior_id ? juniorMap.get(rest.post_junior_id) : null;
            return p ? { id: p.id, title: p.title, type: "junior" as const, thumbnail: p.image_url_m } : null;
          })()
        : (() => {
            const p = rest.post_senior_id ? seniorMap.get(rest.post_senior_id) : null;
            return p ? { id: p.id, title: p.title, type: "senior" as const, thumbnail: p.image_url_l } : null;
          })();

    return {
      ...rest,
      partner,
      postSummary,
      lastMessage: messages?.[0] ?? null,
      unreadCount: unreadMap.get(rest.id) ?? 0,
    };
  });

  return NextResponse.json({ success: true, data: normalized });
}
