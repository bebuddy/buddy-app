import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function POST(request: Request) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ success: false, message: "id가 필요합니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_notification")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_auth_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: "읽음 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("mark-read POST error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
