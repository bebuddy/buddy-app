import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limitParam = Number(searchParams.get("limit") ?? "20");
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;
    const cursor = searchParams.get("cursor"); // ISO timestamp

    let query = supabase
      .from("user_notification")
      .select(
        `
        id,
        is_read,
        created_at,
        notification:notification_id (
          id,
          title,
          content,
          action_url,
          data,
          notification_type,
          created_at
        )
      `
      )
      .eq("user_auth_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, message: "알림을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const hasMore = (data?.length ?? 0) > limit;
    const items = (data ?? []).slice(0, limit).map((row: any) => ({
      id: row.id,
      isRead: row.is_read,
      createdAt: row.created_at,
      notificationId: row.notification?.id,
      title: row.notification?.title,
      content: row.notification?.content,
      actionUrl: row.notification?.action_url,
      data: row.notification?.data,
      type: row.notification?.notification_type,
      sentAt: row.notification?.created_at,
    }));

    const nextCursor = hasMore ? items[items.length - 1]?.createdAt ?? null : null;

    return NextResponse.json({ success: true, data: { items, nextCursor, hasMore } });
  } catch (error) {
    console.error("notifications GET error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
