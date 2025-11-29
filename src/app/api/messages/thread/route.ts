import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

type PostType = "junior" | "senior";

export async function POST(request: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as {
    postType?: string;
    postId?: string;
    targetUserId?: string;
  };

  const { postType, postId, targetUserId } = body;

  if (!postType || !["junior", "senior"].includes(postType)) {
    return NextResponse.json({ success: false, message: "postType은 junior | senior 이어야 합니다." }, { status: 400 });
  }

  if (!postId || !targetUserId) {
    return NextResponse.json({ success: false, message: "postId와 targetUserId가 필요합니다." }, { status: 400 });
  }

  const userId = authData.user.id;
  if (targetUserId === userId) {
    return NextResponse.json({ success: false, message: "본인에게 메시지를 보낼 수 없습니다." }, { status: 400 });
  }

  const postIdField = (postType as PostType) === "junior" ? "post_junior_id" : "post_senior_id";

  const { data: existingThreads, error: existingError } = await supabase
    .from("message_thread")
    .select("*")
    .eq("post_type", postType)
    .eq(postIdField, postId)
    .in("starter_user_id", [userId, targetUserId])
    .in("target_user_id", [userId, targetUserId])
    .limit(1);

  if (existingError) {
    console.error("message thread lookup error:", existingError);
    return NextResponse.json(
      { success: false, message: "메시지 스레드 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const matched = (existingThreads ?? []).find(
    (t) =>
      (t.starter_user_id === userId && t.target_user_id === targetUserId) ||
      (t.starter_user_id === targetUserId && t.target_user_id === userId)
  );

  if (matched) {
    return NextResponse.json({ success: true, data: matched, message: "이미 존재하는 스레드입니다." });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("message_thread")
    .insert({
      post_type: postType,
      [postIdField]: postId,
      starter_user_id: userId,
      target_user_id: targetUserId,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("message thread insert error:", insertError);
    return NextResponse.json(
      { success: false, message: "메시지 스레드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: inserted, message: "메시지 스레드 생성 완료" });
}
