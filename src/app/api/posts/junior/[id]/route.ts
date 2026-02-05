import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createRouteSupabaseClient();
    const { id: postId } = await context.params;

    const { data, error } = await supabase
      .from("post_junior")
      .select(
        `
        id,
        category,
        title,
        content,
        image_url_m,
        image_url_l,
        updated_at,
        budget,
        budget_type,
        senior_type,
        class_type,
        dates_times,
        status,
        user:user_id (
          auth_id,
          id,
          nick_name,
          birth_date,
          gender,
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("junior post detail error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
