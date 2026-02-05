import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { count, error } = await supabase
      .from("user_notification")
      .select("id", { count: "exact", head: true })
      .eq("user_auth_id", user.id)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json(
        { success: false, message: "알림 카운트를 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { unreadCount: count ?? 0 } });
  } catch (error) {
    console.error("unread-count GET error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
