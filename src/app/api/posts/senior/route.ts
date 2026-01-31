import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";
import { RegisterSeniorReq } from "@/types/postType";

function buildFileUrl(key?: string | null) {
  if (!key) return null;
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/files/${encoded}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Number(searchParams.get("count") ?? "3");

  const { data, error } = await supabase.rpc("getseniorpostsbyrandom", { _count: count });
  if (error) {
    console.error("getseniorpostsbyrandom error:", error);
    return NextResponse.json({ success: false, message: "게시글 조회 오류" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterSeniorReq & { userId?: string };
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId가 필요합니다." }, { status: 400 });
    }

    const supabaseClient = await createRouteSupabaseClient();
    const thumbnailUrl = buildFileUrl(data.fileKeys?.[0]);

    const { data: inserted, error: insertError } = await supabaseClient
      .from("post_senior")
      .insert({
        user_id: userId,
        title: data.title,
        content: data.content,
        category: data.category,
        level: data.level,
        dates_times: data.datesTimes,
        junior_type: data.juniorType,
        mentoring_way: data.classType,
        budget: data.budget,
        budget_type: data.budgetType,
        junior_gender: data.juniorGender,
        status: "DONE",
        image_url_m: thumbnailUrl,
        image_url_l: thumbnailUrl,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("post_senior insert error:", insertError ?? "no data");
      return NextResponse.json(
        { success: false, message: insertError?.message ?? "게시글 생성 오류" },
        { status: 500 }
      );
    }

    if (Array.isArray(data.fileKeys) && data.fileKeys.length > 0) {
      const { error: fileError } = await supabaseClient
        .from("file")
        .update({ post_senior_id: inserted.id })
        .in("key", data.fileKeys);

      if (fileError) {
        console.error("post_senior file update error:", fileError);
        return NextResponse.json(
          { success: false, message: "파일 연결 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, data: inserted, message: "post_senior 생성 완료" });
  } catch (err) {
    console.error("post_senior create error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "알 수 없는 오류 발생" },
      { status: 500 }
    );
  }
}
