import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.delete({ name, ...options, path: "/" });
        },
      },
    }
  );
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseClient();
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
    const dt = data.dates_times as { day?: string[]; time?: string[] } | null;
    const transformed = {
      ...data,
      class_type: data.mentoring_way,
      days: dt?.day ?? [],
      times: dt?.time ?? [],
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
