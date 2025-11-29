import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  const supabase = await createRouteSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { threadId } = await context.params;

  const { data: thread, error: threadError } = await supabase
    .from("message_thread")
    .select("id, post_type, post_junior_id, post_senior_id, starter_user_id, target_user_id")
    .eq("id", threadId)
    .single();

  if (threadError || !thread) {
    return NextResponse.json({ success: false, message: "스레드를 찾을 수 없습니다." }, { status: 404 });
  }

  const userId = authData.user.id;
  if (thread.starter_user_id !== userId && thread.target_user_id !== userId) {
    return NextResponse.json({ success: false, message: "접근 권한이 없습니다." }, { status: 403 });
  }

  const partnerAuthId = thread.starter_user_id === userId ? thread.target_user_id : thread.starter_user_id;

  const { data: partnerProfile, error: partnerError } = await supabase
    .from("users")
    .select("auth_id, nick_name, gender, location, birth_date, introduction, profile_image")
    .eq("auth_id", partnerAuthId)
    .single();

  if (partnerError && partnerError.code !== "PGRST116") {
    console.error("partner profile fetch error:", partnerError);
  }

  const { data: messages, error: messagesError } = await supabase
    .from("message")
    .select("id, thread_id, sender_id, body, is_read, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("message list error:", messagesError);
    return NextResponse.json(
      { success: false, message: "메시지 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const postSummary =
    thread.post_type === "junior"
      ? (() => supabase.from("post_junior").select("id, title, image_url_m").eq("id", thread.post_junior_id).single())()
      : (() => supabase.from("post_senior").select("id, title, image_url_l").eq("id", thread.post_senior_id).single())();

  const { data: postData, error: postError } = await postSummary;
  if (postError && postError.code !== "PGRST116") {
    console.error("post summary error:", postError);
  }

  const thumbnail =
    thread.post_type === "junior"
      ? (postData && "image_url_m" in postData ? (postData as { image_url_m?: string }).image_url_m : undefined)
      : (postData && "image_url_l" in postData ? (postData as { image_url_l?: string }).image_url_l : undefined);

  return NextResponse.json({
    success: true,
    data: {
      thread,
      postSummary: postData
        ? {
            id: postData.id,
            title: postData.title,
            type: thread.post_type,
            thumbnail,
          }
        : null,
      partner: partnerProfile ?? null,
      messages: messages ?? [],
    },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  const supabase = await createRouteSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { body } = (await request.json()) as { body?: string };
  if (!body || body.trim().length === 0) {
    return NextResponse.json({ success: false, message: "메시지 본문이 필요합니다." }, { status: 400 });
  }

  const { threadId } = await context.params;

  const { data: thread, error: threadError } = await supabase
    .from("message_thread")
    .select("id, starter_user_id, target_user_id")
    .eq("id", threadId)
    .single();

  if (threadError || !thread) {
    return NextResponse.json({ success: false, message: "스레드를 찾을 수 없습니다." }, { status: 404 });
  }

  const userId = authData.user.id;
  if (thread.starter_user_id !== userId && thread.target_user_id !== userId) {
    return NextResponse.json({ success: false, message: "접근 권한이 없습니다." }, { status: 403 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("message")
    .insert({
      thread_id: threadId,
      sender_id: userId,
      body,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("message insert error:", insertError);
    return NextResponse.json(
      { success: false, message: "메시지 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: inserted, message: "메시지 전송 완료" });
}
