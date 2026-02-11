import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteSupabaseClient();
    const { id: postId } = await context.params;

    const { data, error } = await supabase
      .from("post_senior")
      .select(
        `
        id,
        category,
        title,
        content,
        level,
        mentoring_way,
        dates_times,
        junior_type,
        junior_gender,
        budget,
        budget_type,
        image_url_l,
        user:user_id (
          auth_id,
          id,
          nick_name,
          name,
          birth_date,
          location
        ),
        files:file (id, key, original_file_name)
      `
      )
      .eq("id", postId)
      .eq("status", "DONE")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 프론트엔드 필드명과 통일
    const dt = data.dates_times as { day?: string | string[]; time?: string | string[] } | null;
    const rawDays = dt?.day ?? [];
    const rawTimes = dt?.time ?? [];
    const transformed = {
      ...data,
      class_type: data.mentoring_way,
      days: Array.isArray(rawDays) ? rawDays : [rawDays],
      times: Array.isArray(rawTimes) ? rawTimes : [rawTimes],
    };

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error("senior post detail error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
